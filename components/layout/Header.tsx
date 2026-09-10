'use client';

import React from 'react';
import { Bell, Menu, Radio, Sparkles, User, ShieldCheck } from 'lucide-react';

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
            {role === 'consultant' ? 'Good morning, Alex' : 'Floor Manager Console'}
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
        <div className="profile-button">
          <span>{role === 'consultant' ? 'AM' : 'FM'}</span>
          <div className="hidden lg:block text-left">
            <strong>{role === 'consultant' ? 'Alex Morgan' : 'Marcus Vance'}</strong>
            <small>{role === 'consultant' ? 'Senior EV Specialist' : 'Floor Director'}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
