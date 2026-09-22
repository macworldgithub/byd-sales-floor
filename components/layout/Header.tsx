'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Bell,
  Menu,
  Radio,
  Sparkles,
  User,
  ShieldCheck,
  LogOut,
  Search,
  Users,
  Car,
  Calendar,
  X,
} from 'lucide-react';
import { searchApi } from '@/lib/api';
import { Lead, Delivery, Appointment } from '@/lib/types';

interface HeaderProps {
  role: 'consultant' | 'manager';
  setRole: (role: 'consultant' | 'manager') => void;
  onOpenMobileNav: () => void;
  onOpenNotifications: () => void;
  onSelectLead?: (lead: Lead) => void;
  unreadNotifications?: boolean;
  isOnline?: boolean;
}

export function Header({
  role,
  setRole,
  onOpenMobileNav,
  onOpenNotifications,
  onSelectLead,
  unreadNotifications = true,
  isOnline = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    leads: Lead[];
    clients: Delivery[];
    appointments: Appointment[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchApi.search(searchQuery.trim());
        if (res.success && res.data) {
          setSearchResults(res.data);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(evt.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar relative z-30">
      {/* Left Greeting & Mobile Hamburger */}
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
            {user ? `Good morning, ${user.name.split(' ')[0]}` : 'Manager Console'}
          </h2>
        </div>
      </div>

      {/* Center Global Search Bar (§5.11) */}
      <div ref={searchRef} className="hidden lg:block relative flex-1 max-w-md mx-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 focus-within:bg-white focus-within:border-slate-400 focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults && setIsSearchOpen(true)}
            placeholder="Search name, mobile, email, VIN last-6..."
            className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
                setIsSearchOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto space-y-3 animate-in fade-in">
            {/* Leads Section */}
            {searchResults.leads && searchResults.leads.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono px-2 block mb-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#e60012]" />
                  <span>Leads ({searchResults.leads.length})</span>
                </span>
                <div className="space-y-1">
                  {searchResults.leads.map((l) => (
                    <div
                      key={l._id || l.id}
                      onClick={() => {
                        onSelectLead?.(l);
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <strong className="text-slate-900 font-semibold block">{l.name}</strong>
                        <span className="text-[11px] text-slate-500">
                          {l.model || l.vehicle} · {l.stage} · {l.phone}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {l.score || 70} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Clients Section */}
            {searchResults.clients && searchResults.clients.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono px-2 block mb-1 flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-emerald-600" />
                  <span>Deliveries ({searchResults.clients.length})</span>
                </span>
                <div className="space-y-1">
                  {searchResults.clients.map((c) => (
                    <div
                      key={c._id || c.id}
                      className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <strong className="text-slate-900 font-semibold block">{c.name}</strong>
                        <span className="text-[11px] text-slate-500">
                          {c.vehicle} · Rego: {c.rego || '—'} · VIN: {c.vin || '—'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                        {c.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.leads.length === 0 && searchResults.clients.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching leads or deliveries found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Network & Live Status Indicator */}
        <div
          className={`connection-pill hidden sm:inline-flex ${
            isOnline ? 'online' : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isOnline ? 'Live · AEST' : 'Offline Queue'}</span>
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
            Manager
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
            <small>{user?.role?.replace('_', ' ') || 'Senior EV Specialist'}</small>
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

