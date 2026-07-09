import Dexie, { Table } from 'dexie';
import { Ticket, ScanLog, Event, TicketType } from '../types';

export class ValticketDB extends Dexie {
  tickets!: Table<Ticket & { sv_ticket_types?: TicketType }, string>;
  scanLogs!: Table<ScanLog, string>;
  events!: Table<Event, string>;
  ticketTypes!: Table<TicketType, string>;

  constructor() {
    super('ValticketOfflineDB');
    this.version(2).stores({
      tickets: 'id, event_id, qr_code, status',
      scanLogs: 'id, purchase_id, event_id, agent_id, scanned_at, synced',
      events: 'id',
      ticketTypes: 'id, event_id'
    });
  }
}

export const db = new ValticketDB();
