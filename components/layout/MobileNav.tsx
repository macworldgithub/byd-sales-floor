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
  MoreHorizontal,
  X,
  MapPin,
} from 'lucide-react';
import { ASSET_PATHS } from '@/lib/data';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  role: 'consultant' | 'manager' | 'principal' | 'super_admin';
  setRole: (role: 'consultant' | 'manager' | 'principal' | 'super_admin') => void;
}

export function MobileNav({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  role,
  setRole,
}: MobileNavProps) {
  const bottomNavItems = [
    { id: 'today', label: 'Today', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'deliveries', label: 'Deliveries', icon: Car },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171b22] border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setActiveTab('more');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
                isActive ? 'text-[#e60012]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#171b22] text-white p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="mobile-brand">
                  <img
                    src={ASSET_PATHS.officialBrand}
                    alt="BYD Melbourne CBD"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Switcher in Mobile Drawer */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Active Role
                </p>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setRole('consultant')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-semibold ${
                      role === 'consultant' ? 'bg-white text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Consultant
                  </button>
                  <button
                    onClick={() => setRole('manager')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-semibold ${
                      role === 'manager' ? 'bg-white text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Manager
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Workspace
                </p>
                {[
                  { id: 'today', label: 'Today', icon: LayoutDashboard },
                  { id: 'calendar', label: 'Calendar', icon: Calendar },
                  { id: 'leads', label: 'My Leads', icon: Users },
                  { id: 'deliveries', label: 'Deliveries', icon: Car },
                  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
                  ...(role === 'manager'
                    ? [
                        { id: 'allocation', label: 'Allocation', icon: GitBranch },
                        { id: 'reports', label: 'Performance', icon: BarChart3 },
                      ]
                    : []),
                  { id: 'more', label: 'Floor Tools', icon: MoreHorizontal },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white border-l-2 border-[#e60012]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-2 mb-1 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#e60012]" />
                <span>360 Elizabeth St, Melbourne</span>
              </div>
              <p className="text-[10px] text-slate-500">Operated by Harmony Auto Group</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
