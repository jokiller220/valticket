export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  city: string | null;
  date: string;
  end_date: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  total_capacity: number;
  created_at: string;
  // Aliases for compatibility
  name?: string;
  venue?: string;
  capacity?: number;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  description: string | null;
  created_at: string;
  // Aliases for compatibility
  quota?: number;
  color?: string;
}

export interface Agent {
  id: string;
  full_name: string;
  login_code: string;
  temp_password: string;
  event_id: string | null;
  role: string;
  is_active: boolean;
  avatar_initials: string | null;
  member_since: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  total_amount: number;
  payment_method: string | null;
  qr_code: string;
  status: string;
  scanned_at: string | null;
  created_at: string;
  // Aliases for compatibility
  ticket_number?: string;
  purchased_at?: string;
  qr_payload?: string;
  ticket_types?: TicketType;
}

export interface ScanLog {
  id: string;
  purchase_id: string | null;
  event_id: string;
  agent_id: string;
  scanned_at: string;
  result: 'valid' | 'already_scanned' | 'invalid';
  ticket_number_attempted: string | null;
  agent_name: string | null;
  synced: boolean;
  created_at: string;
  tickets?: Ticket & { sv_ticket_types?: TicketType };
}

export type Screen =
  | 'splash'
  | 'login'
  | 'events'
  | 'dashboard'
  | 'scanner'
  | 'scan-result'
  | 'history'
  | 'scan-detail'
  | 'agents'
  | 'add-agent'
  | 'profile'
  | 'statistics'
  | 'settings'
  | 'offline'
  | 'sync'
  | 'report'
  | 'export-report'
  | 'help'
  | 'temp-code';

export interface ScanResult {
  result: 'valid' | 'already_scanned' | 'invalid';
  ticket?: Ticket & { sv_ticket_types?: TicketType };
  scanLog?: ScanLog;
  reason?: string;
}

export interface AppState {
  currentAgent: Agent | null;
  currentEvent: Event | null;
  isOffline: boolean;
  pendingSyncs: number;
}
