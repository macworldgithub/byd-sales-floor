'use client';
import { X, Menu, Users, Car, LayoutDashboard, Calendar } from 'lucide-react';
import { FloorMenu } from './Sidebar';
export function MobileNav({ activeTab, setActiveTab, isOpen, onClose }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
    role?: string;
    setRole?: (role: any) => void;
}) {
    const navigate = (tab: string) => { setActiveTab(tab); onClose(); };
    return <>
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#171b22] px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      {[['today', 'Today', LayoutDashboard], ['leads', 'Leads', Users], ['inventory', 'Stock', Car], ['calendar', 'Showroom', Calendar]].map(([id, label, Icon]: any) => <button key={id} onClick={() => navigate(id)} aria-current={activeTab === id ? 'page' : undefined} className={`flex flex-col items-center gap-1 px-2 text-xs ${activeTab === id ? 'text-white' : 'text-slate-400'}`}>
        <Icon className="h-5 w-5"/>{label}</button>)}
      <button onClick={() => setActiveTab('more')} className="flex flex-col items-center gap-1 px-2 text-xs text-slate-300">
    <Menu className="h-5 w-5"/>More</button>
    </nav>
    {isOpen && <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={onClose}>
        <aside role="dialog" aria-modal="true" aria-label="Navigation" onClick={event => event.stopPropagation()} className="h-full w-[min(88vw,320px)] overflow-y-auto bg-[#171b22] p-4 text-white">
        <div className="mb-5 flex items-center justify-between">
        <strong>BYD Sales Floor</strong>
        <button onClick={onClose} aria-label="Close navigation">
        <X />
        </button>
        </div>
        <FloorMenu activeTab={activeTab} setActiveTab={navigate}/>
        </aside>
        </div>}
  </>;
}
