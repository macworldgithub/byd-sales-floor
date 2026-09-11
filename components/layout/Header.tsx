'use client';

import { useAuth } from '@/lib/auth';
import { Bell, Menu, Radio, Sparkles, User, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  role: 'consultant' | 'manager';
  setRole: (role: 'consultant' | 'manager') => void;
  onOpenMobileNav: () => void;
  onOpenNotifications: () => void;
  unreadNotifications?: boolean;
}

export function Header({
  role,
  setRole,
  onOpenMobileNav,
  onOpenNotifications,
  unreadNotifications = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  
  return (
    <header className="topbar">
      {/* Left Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden icon-button text-slate-700"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <p className="topbar-kicker">BYD Melbourne CBD · Floor OS</p>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {user ? `Good morning, ${user.name.split(' ')[0]}` : 'Floor Manager Console'}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Pulse */}
        <div className="connection-pill online hidden sm:inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live · AEST</span>
        </div>

        {/* Role Switcher */}
        <div className="role-switch">
          <button
            type="button"
            onClick={() => setRole('consultant')}
            className={role === 'consultant' ? 'active' : ''}
          >
            Consultant
          </button>
          <button
            type="button"
            onClick={() => setRole('manager')}
            className={role === 'manager' ? 'active' : ''}
          >
            Floor Manager
          </button>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="top-icon"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications && <span />}
        </button>

        {/* Profile Pill */}
        <div className="profile-button relative group cursor-default">
          <span>{user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AM'}</span>
          <div className="hidden lg:block text-left">
            <strong>{user?.name || 'Alex Morgan'}</strong>
            <small>{user?.role.replace('_', ' ') || 'Senior EV Specialist'}</small>
          </div>
          
          <button 
            onClick={logout}
            className="absolute -bottom-10 right-0 hidden group-hover:flex items-center gap-2 bg-white shadow-lg border border-slate-200 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
