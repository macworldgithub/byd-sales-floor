'use client';

import { MessageSquare, User } from 'lucide-react';

export function SequencesView() {
  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Staff Follow-up</p>
          <h1 className="page-title">MANUAL SMS FOLLOW-UP</h1>
          <p className="page-subtitle">Your team writes, reviews, and sends each customer message.</p>
        </div>
      </div>
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center gap-2 font-semibold"><User className="w-5 h-5" /> Human-managed conversations</div>
        <p className="text-sm text-slate-600">Open Conversations, choose a customer, write your message, and select Send SMS. You can insert a saved template and review it before sending.</p>
        <div className="flex items-center gap-2 text-sm text-slate-600"><MessageSquare className="w-5 h-5" /> Customer replies and delivery updates appear in the conversation history.</div>
      </div>
    </div>
  );
}
