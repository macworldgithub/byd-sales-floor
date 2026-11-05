import type { Lead, TimelineEvent } from './types';

export const isFloorAdmin = (role?: string) => ['super_admin', 'admin', 'site_admin'].includes(role || '');
export function melbourneDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export const addDays = (day: string, count: number) => new Date(Date.parse(`${day}T12:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
export function melbourneDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Select a valid date and time.');
  const [year, month, day] = date.split('-').map(Number), [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59) throw new Error('Select a valid time.');
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(wall).toISOString().slice(0, 10) !== date) throw new Error('Select a valid date.');
  let instant = wall;
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  for (let index = 0; index < 3; index++) {
    const p = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(part => [part.type, part.value]));
    const delta = wall - Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
    if (!delta) return new Date(instant).toISOString();
    instant += delta;
  }
  throw new Error('This local time does not exist because of daylight saving. Select another time.');
}
export type CalendarMode = 'day' | 'week' | 'month' | 'team';
export function calendarRange(day: string, mode: CalendarMode) {
  let from = day, to = addDays(day, 1);
  if (mode === 'week') {
    const weekday = new Date(day + 'T12:00:00Z').getUTCDay();
    from = addDays(day, -((weekday + 6) % 7));
    to = addDays(from, 7);
  } else if (mode === 'month') {
    from = day.slice(0, 7) + '-01';
    const date = new Date(from + 'T12:00:00Z');
    date.setUTCMonth(date.getUTCMonth() + 1);
    to = date.toISOString().slice(0, 10);
  }
  return { from, to };
}
export function navigateCalendar(day: string, mode: CalendarMode, direction: number) {
  if (mode !== 'month') return addDays(day, direction * (mode === 'week' ? 7 : 1));
  const date = new Date(day.slice(0, 7) + '-01T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 10);
}
export function normalizeLead(lead: any): Lead {
  const vehicle = typeof lead.vehicle === 'object' && lead.vehicle ? lead.vehicle.raw || lead.vehicle.model || '' : lead.vehicle || '';
  return { ...lead, id: lead._id || lead.id || lead.leadId,
    initials: String(lead.name || '').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    vehicle, model: lead.model || vehicle, consultant: lead.allocatedPersonFullName || lead.assignedTo || '',
  };
}
export interface FloorEvent {
  id: string; type: 'drive' | 'delivery' | 'followup' | 'hold'; title: string; subtitle: string;
  date: string; endsAt: string; dateStr: string; timeStr: string; endTimeStr: string;
  customer_name: string; customer_id: string; vehicle: string; site: string; consultant: string; status: string;
  rawSource: string; rawObject?: { appointment_id: string }; phone?: string;
}
export interface PageInfo { total: number; page: number; limit: number; pages: number }
export interface FloorToday {
  date: string; site: string;
  stats: { totalLeads: number; needsMe: number; appointmentsToday: number; conversationPulse: number; deliveriesThisWeek: number };
  leads: Lead[]; events: FloorEvent[]; eventPagination: PageInfo; nextDelivery: FloorEvent | null; nextEvent: FloorEvent | null;
}
export const toTimeline = (event: FloorEvent): TimelineEvent => ({
  id: event.id, date: event.dateStr, time: event.timeStr, end: event.endTimeStr, title: event.title, detail: event.subtitle, type: event.type,
});
