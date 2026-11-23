export const MANAGEMENT = ['super_admin', 'admin', 'site_admin', 'manager', 'sales_manager', 'principal', 'bdc'];
export const isManager = (role?: string) => MANAGEMENT.includes(role || '');
export const floorNavigation = [
    { id: 'today', label: 'Today', group: 'Floor Operations' },
    { id: 'leads', label: 'Customer 360', group: 'Floor Operations' },
    { id: 'inventory', label: 'Live Inventory', group: 'Floor Operations' },
    { id: 'calendar', label: 'Showroom Floor', group: 'Floor Operations' },
    { id: 'customers', label: 'Customers & Merge', group: 'Floor Operations' },
    { id: 'pipeline', label: 'Sales Pipeline', group: 'Floor Operations' },
    { id: 'conversations', label: 'Conversations', group: 'Floor Operations' },
    { id: 'deliveries', label: 'Delivery Centre', group: 'Floor Operations' },
    { id: 'appraisals', label: 'Appraisals & Wholesale', group: 'Floor Operations' },
    { id: 'pulse', label: 'PULSE Dashboard', group: 'Group Management', manager: true },
    { id: 'allocation', label: 'Staff & Allocation', group: 'Group Management', manager: true },
    { id: 'inbox', label: 'Allocation Inbox', group: 'Floor Operations' },
    { id: 'sales-log', label: 'Sales Log', group: 'Group Management', manager: true },
    { id: 'reports', label: 'Performance & Reports', group: 'Group Management', manager: true },
    { id: 'tasks', label: 'Actions & Follow-up', group: 'Floor Operations' },
    { id: 'staff', label: 'Staff Directory', group: 'Group Management', manager: true },
    { id: 'audit', label: 'Activity & Audit', group: 'Group Management', manager: true },
    { id: 'users', label: 'User Accounts', group: 'Group Management', manager: true },
    { id: 'settings', label: 'Settings', group: 'Group Management', manager: true },
];
export function canOpenTab(tab: string, role?: string) {
    if (role === 'contractor')
        return tab === 'deliveries';
    const entry = floorNavigation.find(item => item.id === tab);
    return !!entry && (!entry.manager || isManager(role));
}
export function resolveFloorTab(search: string, role?: string) {
    const params = new URLSearchParams(search);
    const tab = params.get('tab') || (params.get('customer_id') ? 'customers' : params.get('lead_id') || params.get('search') ? 'leads' : 'today');
    return canOpenTab(tab, role) ? tab : role === 'contractor' ? 'deliveries' : 'today';
}
