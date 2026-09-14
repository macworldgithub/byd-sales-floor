'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ConversationThread, Lead } from '@/lib/types';
import { Pagination } from '@/components/ui/Pagination';

interface ConversationsViewProps {
  threads: ConversationThread[];
  onSelectThread: (thread: ConversationThread) => void;
  onOpenNewMessage: () => void;
}

export function ConversationsView({
  threads,
  onSelectThread,
  onOpenNewMessage,
}: ConversationsViewProps) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const filteredThreads = threads.filter(
    (t) =>
      (t.name || t.prospectName || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.model || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.lastMessage || '').toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filteredThreads.length / pageSize);
  const paginatedThreads = filteredThreads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="view-stack">
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Compliant Communication</p>
          <h1 className="page-title">CONVERSATION HUB · LIVE FEED</h1>
          <p className="page-subtitle">
            Direct SMS and WhatsApp customer messaging with verified Australian Spam Act opt-out protection.
          </p>
        </div>

        <button
          onClick={onOpenNewMessage}
          className="signal-button px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Send className="w-4 h-4" />
          <span>✈ Compose message</span>
        </button>
      </div>

      {/* Surface Card Container */}
      <div className="surface-card overflow-hidden">
        {/* Search Field */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="search-field w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter conversations by customer, mobile or model..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Opt-Out Suppression Active</span>
          </div>
        </div>

        {/* Conversation List */}
        <div className="divide-y divide-slate-100">
          {filteredThreads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching conversation threads.
            </div>
          ) : (
            paginatedThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className="conversation-row group text-left w-full"
              >
                <div className="relative">
                  <div className="avatar-initials">{thread.initials}</div>
                  {thread.unreadCount && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e60012] rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#e60012] transition-colors">
                        {thread.name}
                      </strong>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {thread.model}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {thread.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {thread.lastMessage}
                  </p>
                </div>

                {thread.unreadCount && (
                  <div className="unread-count">
                    {thread.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredThreads.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="conversations"
        />
      </div>
    </div>
  );
}
