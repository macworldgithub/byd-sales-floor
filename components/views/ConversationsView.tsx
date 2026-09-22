'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { conversationApi } from '@/lib/api';

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
  const [threadsList, setThreadsList] = useState<ConversationThread[]>(threads);
  const [totalItems, setTotalItems] = useState<number>(threads.length || 0);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil((threads.length || 1) / 20));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageSize = 20;

  const fetchThreads = useCallback(async (page: number, q: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };
      if (q.trim()) {
        params.q = q.trim();
      }

      const res = await conversationApi.getConversations(params);
      if (res.success && res.data) {
        setThreadsList(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
          setTotalPages(res.pagination.pages || Math.ceil(res.pagination.total / pageSize) || 1);
        } else {
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      const filtered = threads.filter(
        (t) =>
          (t.name || t.prospectName || '').toLowerCase().includes(q.toLowerCase()) ||
          (t.model || '').toLowerCase().includes(q.toLowerCase()) ||
          (t.lastMessage || '').toLowerCase().includes(q.toLowerCase())
      );
      setThreadsList(filtered.slice((page - 1) * pageSize, page * pageSize));
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    } finally {
      setIsLoading(false);
    }
  }, [threads, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchThreads(currentPage, query);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, query, fetchThreads]);

  useEffect(() => {
    if (threads.length > 0 && !query && currentPage === 1) {
      setThreadsList(threads);
      setTotalItems(threads.length);
      setTotalPages(Math.ceil(threads.length / pageSize) || 1);
    }
  }, [threads, query, currentPage, pageSize]);

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
          <span>Compose message</span>
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
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
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
        <div className="divide-y divide-slate-100 min-h-[250px]">
          {isLoading && threadsList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-[#e60012] animate-spin" />
              <span>Loading messages...</span>
            </div>
          ) : threadsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching conversation threads.
            </div>
          ) : (
            threadsList.map((thread, idx) => {
              const threadId = thread._id || thread.id || `thread-${idx}`;
              const displayName = thread.prospectName || thread.name || 'Prospect';
              const initials =
                thread.initials ||
                displayName
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() ||
                'TH';

              return (
                <button
                  key={threadId}
                  onClick={() => onSelectThread(thread)}
                  className="conversation-row group text-left w-full"
                >
                  <div className="relative">
                    <div className="avatar-initials">{initials}</div>
                    {thread.unreadCount && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e60012] rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#e60012] transition-colors">
                          {displayName}
                        </strong>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {thread.model || 'BYD Range'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (thread.time || 'Recent')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {thread.lastMessage || 'Click to view conversation'}
                    </p>
                  </div>

                  {thread.unreadCount && (
                    <div className="unread-count">
                      {thread.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          itemName="conversations"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

