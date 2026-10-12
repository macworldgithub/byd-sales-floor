import type { ConversationThread, Lead } from './types';

const phoneKey = (value?: string) => {
  let digits = (value || '').replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) digits = '61' + digits.slice(1);
  if (/^4\d{8}$/.test(digits)) digits = '61' + digits;
  return digits;
};
const siteKey = (value?: string) => (value || '').toLowerCase()
  .replace(/^byd\s+/, '').replace(/[^a-z0-9]/g, '').replace(/vic$/, '')
  .replace(/^melbourne(cbd|city)$/, 'melbourne');

export function messageRecipient(selected: Lead | ConversationThread, leads: Lead[]): Lead {
  if ('stage' in selected && selected.stage) return selected as Lead;
  const thread = selected as ConversationThread;
  const site = siteKey(thread.dealer);
  const phone = phoneKey(thread.phone);
  const candidates = leads.filter(lead => !!phone && phoneKey(lead.phone) === phone
    && !!site && siteKey(lead.dealer || lead.dealerName) === site);
  const found = candidates.find(lead => lead._id === thread.leadId) || candidates[0];
  if (found && !thread.client_id) return found;

  // A delivery thread can share a phone with a lead at another site. Send using
  // its own client identity, or let the API resolve its verified phone and site.
  return {
    name: thread.prospectName || thread.name || thread.phone || 'Customer',
    initials: thread.initials || 'CU',
    vehicle: thread.model,
    model: thread.model,
    stage: 'Engaged',
    source: 'Chat',
    phone: thread.phone || '',
    dealer: thread.dealer,
    client_id: thread.client_id,
  };
}
