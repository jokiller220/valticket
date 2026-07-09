import { supabase } from './supabase';
import { db } from './db';
import { Event, Ticket, ScanLog } from '../types';

export async function syncDown(eventId: string) {
  // Fetch tickets for event
  const { data: tickets } = await supabase
    .from('sv_purchases')
    .select('*, sv_ticket_types(*)')
    .eq('event_id', eventId);
    
  if (tickets) {
    await db.tickets.bulkPut(tickets);
  }
}

export async function syncUp() {
  // Get unsynced logs
  const unsyncedLogs = await db.scanLogs.where('synced').equals('false').toArray();
  
  if (unsyncedLogs.length === 0) return;

  for (const log of unsyncedLogs) {
    const { id, synced, ...logData } = log;
    
    // Check for conflicts
    const { data: existingLog } = await supabase
      .from('sv_scan_logs')
      .select('*')
      .eq('purchase_id', log.purchase_id)
      .eq('result', 'valid')
      .neq('agent_id', log.agent_id)
      .limit(1)
      .maybeSingle();

    if (existingLog && log.result === 'valid') {
      // Conflict: double scan! Both were offline.
      logData.result = 'already_scanned';
    } else if (log.result === 'valid') {
      // Update ticket status in supabase
      await supabase.from('sv_purchases').update({ status: 'scanned', scanned_at: new Date().toISOString() }).eq('id', log.purchase_id);
    }
    
    await supabase.from('sv_scan_logs').insert({ ...logData, synced: true });
    await db.scanLogs.update(id, { synced: true, result: logData.result });
  }
}

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeToRealtime(eventId: string) {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase.channel(`event_${eventId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sv_purchases', filter: `event_id=eq.${eventId}` },
      async (payload) => {
        // Update local ticket if it's in our DB
        const updatedTicket = payload.new as Ticket;
        const local = await db.tickets.get(updatedTicket.id);
        if (local) {
          await db.tickets.put({ ...local, ...updatedTicket });
        } else {
          await db.tickets.put(updatedTicket);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sv_scan_logs', filter: `event_id=eq.${eventId}` },
      async (payload) => {
        // Insert remote log locally if not exists
        const newLog = payload.new as ScanLog;
        const exists = await db.scanLogs.get(newLog.id);
        if (!exists) {
          await db.scanLogs.put({ ...newLog, synced: true });
        }
      }
    )
    .subscribe();
}

export function unsubscribeRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
