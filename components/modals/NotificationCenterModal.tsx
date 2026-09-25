'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellOff,
  Clock,
  Car,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Moon,
  Sun,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'allocation' | 'sms' | 'appointment' | 'delivery' | 'sla';
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionText?: string;
  priority?: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'allocation',
    title: 'New Lead Allocated · Carsales Connect',
    body: 'Marcus Vance allocated to your floor book (SEALION 7 Premium). SLA clock active (14m remaining).',
    time: '2 mins ago',
    read: false,
    priority: true,
    actionText: 'Make First Touch',
  },
  {
    id: 'notif-2',
    type: 'sms',
    title: 'Inbound SMS · Sarah Mitchell',
    body: '"Can we do the test drive on Saturday at 10:30am instead?"',
    time: '18 mins ago',
    read: false,
    actionText: 'Reply via SMS',
  },
  {
    id: 'notif-3',
    type: 'appointment',
    title: 'Test Drive in 60 Minutes',
    body: 'David Chen scheduled for SEAL Performance test drive loop at 10:00 AM (Showroom Bay 1).',
    time: '35 mins ago',
    read: false,
    actionText: 'Pre-Stage Demo Vehicle',
  },
  {
    id: 'notif-4',
    type: 'delivery',
    title: 'Delivery Tomorrow · Priya Nair',
    body: 'SEALION 7 Atlantis Grey handover scheduled for tomorrow at 10:30 AM. Paperwork verified.',
    time: '1 hr ago',
    read: true,
    actionText: 'View Delivery Card',
  },
  {
    id: 'notif-5',
    type: 'sla',
    title: 'First-Touch SLA Met',
    body: 'Your response time for Liam O\'Connor was 6.4 minutes. Excellent speed-to-lead.',
    time: '3 hrs ago',
    read: true,
  },
];

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotificationAction?: (item: NotificationItem) => void;
}

export function NotificationCenterModal({
  isOpen,
  onClose,
  onSelectNotificationAction,
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [webPushEnabled, setWebPushEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('20:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setFeedback('All notifications marked as read.');
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleTogglePush = () => {
    const next = !webPushEnabled;
    setWebPushEnabled(next);
    setFeedback(next ? 'Web Push Notifications Enabled.' : 'Web Push Muted.');
    setTimeout(() => setFeedback(null), 1500);
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] mt-12 sm:mt-14 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-[#e60012] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Floor Pulse & Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#e60012] text-white text-[10px] font-mono font-bold">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Real-time allocations, SMS replies & SLA reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet Hours Banner (§5.10) */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <div>
              <span className="font-semibold text-slate-800">Quiet Hours (20:00–08:00 AEST)</span>
              <p className="text-[10px] text-slate-500">Inbound SMS badges silently · No audio alerts</p>
            </div>
          </div>
          <button
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
              quietHoursEnabled
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {quietHoursEnabled ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={handleTogglePush}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title={webPushEnabled ? 'Mute Web Push' : 'Enable Web Push'}
            >
              {webPushEnabled ? <Bell className="w-3.5 h-3.5 text-emerald-600" /> : <BellOff className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {feedback && (
          <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border-b border-emerald-200 animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto" />
              <p>You are all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-200/70 text-slate-600'
                    : 'bg-red-50/40 border-red-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'allocation' && <Zap className="w-3.5 h-3.5 text-red-600" />}
                    {item.type === 'sms' && <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />}
                    {item.type === 'appointment' && <Calendar className="w-3.5 h-3.5 text-amber-600" />}
                    {item.type === 'delivery' && <Car className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.type === 'sla' && <Clock className="w-3.5 h-3.5 text-purple-600" />}
                    <strong className="text-xs font-bold">{item.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-snug">{item.body}</p>

                {item.actionText && (
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectNotificationAction) onSelectNotificationAction(item);
                      }}
                      className="text-[11px] font-bold text-[#e60012] hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>{item.actionText}</span>
                      <span>→</span>
                    </button>
                    {!item.read && (
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                          )
                        }
                        className="text-[10px] text-slate-400 hover:text-slate-700"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
