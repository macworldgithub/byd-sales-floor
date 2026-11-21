'use client';
import { Car, Calendar, Users, LayoutDashboard, BarChart3, GitBranch, MessageSquare, FileText, MapPin } from 'lucide-react';
import { ASSET_PATHS } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { floorNavigation, canOpenTab } from '@/lib/navigation';
const icons: Record<string, typeof Users> = { today: LayoutDashboard, inventory: Car, deliveries: Car, calendar: Calendar, pipeline: GitBranch, pulse: BarChart3, reports: BarChart3, conversations: MessageSquare, 'sales-log': FileText };
export function FloorMenu({ activeTab, setActiveTab }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) {
    const { user } = useAuth();
    return <>{['Floor Operations', 'Group Management'].map(group => {
            const items = floorNavigation.filter(item => item.group === group && canOpenTab(item.id, user?.role) && (item.id !== 'users' || user?.email === 'devs@omnisuiteai.com'));
            return !!items.length && <section key={group} className="mb-6">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">{group}</p>
            <nav className="space-y-1">{items.map(item => {
                    const Icon = icons[item.id] || Users;
                    return <button key={item.id} onClick={() => setActiveTab(item.id)} aria-current={activeTab === item.id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${activeTab === item.id ? 'bg-red-600 text-white shadow-md shadow-red-900/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                    <Icon className="h-4 w-4 shrink-0"/>{item.label}</button>;
                })}</nav>
            </section>;
        })}</>;
}
export function Sidebar({ activeTab, setActiveTab }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role?: string;
    unreadConversationsCount?: number;
    unassignedLeadsCount?: number;
}) {
    const { activeSite } = useAuth();
    return <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-[#171b22] text-slate-200 md:flex">
    <div className="border-b border-white/10 bg-[#12161c] p-4">
    <div className="rounded-lg bg-white p-3">
    <img src={ASSET_PATHS.officialBrand} alt="BYD Harmony" className="h-8 w-full object-contain"/>
    </div>
    <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">Sales Floor OS · Harmony Auto</p>
    </div>
    <div className="flex-1 overflow-y-auto px-3 py-5">
    <FloorMenu activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
    <div className="border-t border-white/10 bg-[#12161c] p-4">
    <p className="flex items-center gap-2 text-sm font-semibold">
    <MapPin className="h-4 w-4"/>{activeSite || 'BYD Harmony'}</p>
    <p className="mt-2 text-xs text-slate-400">Lead Centre · Sales · Delivery Centre</p>
    </div>
  </aside>;
}
