import { useEffect, useRef, useState } from 'react';
import { RotateCcw, X, Keyboard, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { ScanResult } from '../types';
import BottomNav from '../components/BottomNav';

export default function ScannerScreen() {
  const { currentEvent, currentAgent, navigate, setLastScanResult } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          scanLoop();
        };
      }
    } catch {
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function tick() {
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx!.drawImage(video, 0, 0);
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        processQR(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function processQR(rawData: string) {
    if (scanning) return;
    setScanning(true);
    stopCamera();
    await validateTicket(rawData);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setScanning(true);
    await validateTicket(manualInput.trim());
  }

  async function validateTicket(rawData: string) {
    if (!currentEvent || !currentAgent) return;
    try {
      let ticketId: string | null = null;
      let ticketNumber: string = rawData;
      try {
        const parsed = JSON.parse(rawData);
        ticketId = parsed.id || null;
        ticketNumber = parsed.ticket_number || parsed.qr_code || rawData;
      } catch { /* raw data is ticket number */ }

      // Try local DB first (exact qr_code match)
      let ticket = ticketId 
        ? await db.tickets.get(ticketId)
        : await db.tickets.where('qr_code').equals(ticketNumber.toLowerCase()).first() 
          || await db.tickets.where('qr_code').equals(ticketNumber.toUpperCase()).first()
          || await db.tickets.where('qr_code').equalsIgnoreCase(ticketNumber).first();

      // Fallback to Supabase if not found locally
      if (!ticket) {
        const { data, error } = ticketId
          ? await supabase.from('sv_purchases').select('*, sv_ticket_types(*)').eq('id', ticketId).eq('event_id', currentEvent.id).maybeSingle()
          : await supabase.from('sv_purchases').select('*, sv_ticket_types(*)').ilike('qr_code', ticketNumber.trim()).eq('event_id', currentEvent.id).maybeSingle();
          
        if (error) console.error('Supabase query error:', error);
        if (data) {
          // Normalize: map sv_ticket_types → ticket_types for compatibility
          ticket = { ...data, ticket_types: (data as any).sv_ticket_types };
        }
      }

      let result: ScanResult;
      const scanLogId = crypto.randomUUID();

      if (!ticket) {
        result = { result: 'invalid', reason: 'QR code non reconnu' };
        const logData = {
          id: scanLogId, purchase_id: null, event_id: currentEvent.id, agent_id: currentAgent.id,
          result: 'invalid' as const, ticket_number_attempted: ticketNumber, agent_name: currentAgent.full_name, synced: navigator.onLine,
          scanned_at: new Date().toISOString()
        };
        await db.scanLogs.put({ ...logData, created_at: logData.scanned_at });
        if (navigator.onLine) await supabase.from('sv_scan_logs').insert(logData);
      } else if (ticket.status === 'used' || ticket.status === 'scanned') {
        const prevLog = await db.scanLogs.where('purchase_id').equals(ticket.id).and(l => l.result === 'valid').first();
        result = { result: 'already_scanned', ticket, scanLog: prevLog || undefined };
        
        const logData = {
          id: scanLogId, purchase_id: ticket.id, event_id: currentEvent.id, agent_id: currentAgent.id,
          result: 'already_scanned' as const, ticket_number_attempted: ticket.qr_code || ticketNumber, agent_name: currentAgent.full_name, synced: navigator.onLine,
          scanned_at: new Date().toISOString()
        };
        await db.scanLogs.put({ ...logData, created_at: logData.scanned_at });
        if (navigator.onLine) await supabase.from('sv_scan_logs').insert(logData);
      } else if (ticket.status === 'cancelled') {
        result = { result: 'invalid', ticket, reason: 'Billet annulé' };
        
        const logData = {
          id: scanLogId, purchase_id: ticket.id, event_id: currentEvent.id, agent_id: currentAgent.id,
          result: 'invalid' as const, ticket_number_attempted: ticket.qr_code || ticketNumber, agent_name: currentAgent.full_name, synced: navigator.onLine,
          scanned_at: new Date().toISOString()
        };
        await db.scanLogs.put({ ...logData, created_at: logData.scanned_at });
        if (navigator.onLine) await supabase.from('sv_scan_logs').insert(logData);
      } else {
        // Valid
        const logData = {
          id: scanLogId, purchase_id: ticket.id, event_id: currentEvent.id, agent_id: currentAgent.id,
          result: 'valid' as const, ticket_number_attempted: ticket.qr_code || ticketNumber, agent_name: currentAgent.full_name, synced: navigator.onLine,
          scanned_at: new Date().toISOString()
        };
        
        // Update local status
        ticket.status = 'scanned';
        await db.tickets.put(ticket);
        await db.scanLogs.put({ ...logData, created_at: logData.scanned_at });
        
        // Update remote status
        if (navigator.onLine) {
          await supabase.from('sv_purchases').update({ status: 'scanned', scanned_at: logData.scanned_at }).eq('id', ticket.id);
          await supabase.from('sv_scan_logs').insert(logData);
        }
        
        result = { result: 'valid', ticket, scanLog: { ...logData, created_at: logData.scanned_at } };
      }

      if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(result.result === 'valid' ? [100] : [100, 100, 100]);
      }
      
      if (settings.scanSound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          if (result.result === 'valid') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
          } else {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
          }
        } catch {}
      }

      setLastScanResult(result);
      navigate('scan-result');
    } catch (err) {
      console.error(err);
      
      if (settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate([100, 100, 100]);
      }
      if (settings.scanSound) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3);
        } catch {}
      }
      
      setLastScanResult({ result: 'invalid', reason: 'Erreur de validation' });
      navigate('scan-result');
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-full bg-[#0a0810]">
      {/* Header (desktop only) */}
      <div className="hidden md:flex items-center gap-3 px-8 pt-8 pb-4 border-b border-white/[0.06]">
        <h2 className="text-xl font-bold text-white">Scanner QR</h2>
        <span className="text-gray-500 text-sm">— Pointez la caméra vers un billet</span>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-black">
        {!cameraError ? (
          <div className="relative w-full h-full md:max-w-2xl md:mx-auto md:rounded-2xl md:overflow-hidden md:my-6 md:shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-56 h-56 md:w-64 md:h-64">
                <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-purple-400 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-purple-400 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-purple-400 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-purple-400 rounded-br-2xl" />
                {cameraActive && !scanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                )}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                    <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-white/80 text-sm mt-6 font-medium">Placez le QR code dans le cadre</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
              <Camera size={36} className="text-gray-500" />
            </div>
            <div>
              <p className="text-gray-200 font-medium mb-1">Caméra inaccessible</p>
              <p className="text-gray-400 text-sm">{cameraError}</p>
            </div>
            <button onClick={startCamera} className="px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium">
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#0d0a1a] border-t border-white/[0.06] px-6 py-4">
        {showManual && (
          <form onSubmit={handleManualSubmit} className="flex gap-2 mb-4 max-w-lg mx-auto md:mx-0">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Numéro de billet (ex: SUIV-34MAI-567890)"
              className="flex-1 px-4 py-3 rounded-xl bg-[#1e1640] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors">
              Valider
            </button>
          </form>
        )}

        <div className="flex items-center justify-around md:justify-start md:gap-4">
          <button
            onClick={() => { setScanning(false); stopCamera(); startCamera(); }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
              <RotateCcw size={20} className="text-gray-300" />
            </div>
            <span className="text-xs text-gray-500">Relancer</span>
          </button>

          <button
            onClick={() => setShowManual(!showManual)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${showManual ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/15'}`}>
              <Keyboard size={20} className={showManual ? 'text-white' : 'text-gray-300'} />
            </div>
            <span className="text-xs text-gray-500">Manuel</span>
          </button>

          <button onClick={() => navigate('dashboard')} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
              <X size={20} className="text-gray-300" />
            </div>
            <span className="text-xs text-gray-500">Fermer</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
