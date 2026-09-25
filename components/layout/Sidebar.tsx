'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Car,
  MessageSquare,
  GitBranch,
  BarChart3,
  MapPin,
  Sparkles,
  Zap,
  FileText,
} from 'lucide-react';
import { ASSET_PATHS } from '@/lib/data';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'consultant' | 'manager' | 'principal' | 'super_admin';
  unreadConversationsCount?: number;
  unassignedLeadsCount?: number;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  role,
  unreadConversationsCount = 2,
  unassignedLeadsCount = 1,
}: SidebarProps) {
  const mainNavItems = [
    { id: 'today', label: 'Today', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leads', label: 'My Leads', icon: Users },
    { id: 'deliveries', label: 'Deliveries', icon: Car },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: MessageSquare,
      badge: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
    },
  ];

  const managerNavItems = [
    {
      id: 'allocation',
      label: 'Allocation',
      icon: GitBranch,
      badge: unassignedLeadsCount > 0 ? unassignedLeadsCount : undefined,
    },
    { id: 'sequences', label: 'Sequences', icon: Zap },
    { id: 'templates', label: 'Template Studio', icon: FileText },
    { id: 'reports', label: 'Performance', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#171b22] text-slate-200 h-screen sticky top-0 shrink-0 border-r border-white/10 z-40">
      {/* Brand Header */}
      <div className="p-4 pb-2 border-b border-white/10">
        <div className="brand-lockup">
          <div className="brand-plate">
            <img
              src={ASSET_PATHS.officialBrand}
              alt="BYD Melbourne CBD"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="mt-1 pl-1">
            <strong>BYD MELBOURNE CBD</strong>
            <span> · </span>
            <span>Harmony</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Workspace Menu */}
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2 font-mono">
            Workspace
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  data-active={isActive}
                  className="sidebar-link w-full text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Manager Console Section */}
        {role === 'manager' && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                Manager Console
              </p>
              <span className="text-[9px] font-bold text-[#e60012] bg-red-950/60 border border-red-900 px-1.5 py-0.2 rounded uppercase">
                Active
              </span>
            </div>
            <nav className="space-y-1">
              {managerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    data-active={isActive}
                    className="sidebar-link w-full text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Showroom Location Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="site-card">
          <div className="site-mark">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="truncate">BYD Melbourne CBD</strong>
            <span className="truncate">360 Elizabeth St, Melbourne</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>
        <p className="demo-caption">Interactive Sales Floor OS · Harmony Auto</p>
      </div>
    </aside>
  );
}
