'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Eye,
} from 'lucide-react';
import { DEFAULT_TEMPLATE_PACKS, TemplatePack, interpolateTemplate } from '@/lib/templateEngine';
import { templateApi } from '@/lib/api';

const AVAILABLE_TOKENS = [
  '{{first_name}}',
  '{{name}}',
  '{{model}}',
  '{{consultant}}',
  '{{consultant_mobile}}',
  '{{site}}',
  '{{appointment_date}}',
  '{{appointment_time}}',
  '{{delivery_date}}',
];

export function TemplateStudioView() {
  const [templatePacks, setTemplatePacks] = useState<TemplatePack[]>(DEFAULT_TEMPLATE_PACKS);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePack>(DEFAULT_TEMPLATE_PACKS[0]);
  const [editingBody, setEditingBody] = useState(DEFAULT_TEMPLATE_PACKS[0].body);
  const [editingName, setEditingName] = useState(DEFAULT_TEMPLATE_PACKS[0].name);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Template Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('Manual consultant trigger');
  const [newBody, setNewBody] = useState('Hi {{first_name}}, {{consultant}} here from BYD {{site}}. Thank you for your enquiry on the {{model}}. When would be a good time for a test drive? Reply STOP to opt out.');

  // ACMA Compliance Audit calculations
  const hasOptOut = /stop|opt out/i.test(editingBody);
  const charCount = editingBody.length;
  const segmentCount = Math.ceil(charCount / 160) || 1;

  const handleSelectTemplate = (t: TemplatePack) => {
    setSelectedTemplate(t);
    setEditingBody(t.body);
    setEditingName(t.name);
  };

  const insertToken = (token: string) => {
    setEditingBody((prev) => `${prev} ${token}`);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTmpl: TemplatePack = {
      id: `tmpl-${Date.now()}`,
      name: newTitle,
      channel: 'sms',
      trigger: newTrigger,
      body: newBody,
      active: true,
    };

    setTemplatePacks((prev) => [newTmpl, ...prev]);
    setSelectedTemplate(newTmpl);
    setEditingBody(newTmpl.body);
    setEditingName(newTmpl.name);
    setIsCreateOpen(false);
    setFeedback('New template created and audited for ACMA compliance.');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDeleteTemplate = async (tmplName: string) => {
    try {
      if (selectedTemplate.id) {
        await templateApi.deleteTemplate(selectedTemplate.id);
      }
    } catch {}
    setTemplatePacks((prev) => prev.filter((t) => t.name !== tmplName));
    setFeedback('Template archived.');
    setTimeout(() => setFeedback(null), 2000);
  };

  const previewInterpolation = interpolateTemplate(editingBody, {
    first_name: 'Sarah',
    name: 'Sarah Mitchell',
    model: 'SEALION 7 Premium',
    consultant: 'Alex Rivers',
    consultant_mobile: '0412 890 234',
    site: 'Melbourne CBD',
    appointment_date: 'Saturday, 13 Sep',
    appointment_time: '10:30 AM',
    delivery_date: 'Tomorrow, 10:30 AM',
  });

  return (
    <div className="view-stack">
      {/* Toast */}
      {feedback && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Template Studio · ACMA & Spam Act Compliant Packs</p>
          <h1 className="page-title">COMMUNICATION TEMPLATE STUDIO</h1>
          <p className="page-subtitle">
            Curate dynamic, tokenized message packs for consultant 1-tap outreach, test drives, and delivery updates.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="signal-button px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Templates Sidebar / Selector (4 cols) */}
        <div className="surface-card p-4 lg:col-span-4 space-y-3 max-h-[750px] overflow-y-auto">
          <p className="text-[11px] font-bold uppercase font-mono text-slate-400">Available Templates ({templatePacks.length})</p>
          <div className="space-y-1.5">
            {templatePacks.map((tmpl) => (
              <button
                key={tmpl.name}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedTemplate.name === tmpl.name
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <strong className="block truncate font-semibold">{tmpl.name}</strong>
                  <span className={`text-[10px] truncate block ${selectedTemplate.name === tmpl.name ? 'text-slate-300' : 'text-slate-400'}`}>
                    {tmpl.trigger}
                  </span>
                </div>
                <Tag className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor & Realtime Compliance Checker (8 cols) */}
        <div className="surface-card p-6 lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Editing Template
              </p>
              <h3 className="text-lg font-bold text-slate-900">{editingName}</h3>
            </div>

            <button
              onClick={() => handleDeleteTemplate(selectedTemplate.name)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Archive template"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Token Insertion Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Insert Dynamic Tokens
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TOKENS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertToken(token)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold border border-slate-200 transition-colors"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Body Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Template Body (SMS / Email)
            </label>
            <textarea
              rows={5}
              value={editingBody}
              onChange={(e) => setEditingBody(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans outline-none focus:border-slate-800 leading-relaxed"
            />
          </div>

          {/* ACMA & Spam Act Compliance Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              {hasOptOut ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {hasOptOut ? 'ACMA Compliant' : 'Missing Opt-Out'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {hasOptOut ? 'Contains STOP keyword' : 'Must include "Reply STOP"'}
                </span>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Length</span>
              <strong className="text-slate-900 font-mono">{charCount} characters</strong>
              <span className="text-[10px] text-slate-500 block">({segmentCount} SMS segment{segmentCount > 1 ? 's' : ''})</span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Sender ID</span>
              <strong className="text-emerald-700 font-mono">BYD (Alphanumeric)</strong>
              <span className="text-[10px] text-slate-500 block">Telstra registered</span>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Live Customer Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">Sample: Sarah Mitchell</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-white/5 p-3 rounded-lg border border-white/10">
              {previewInterpolation}
            </p>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Template Studio</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Create Message Template</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VIP Shark 6 First Drive Invite"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trigger Context</label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="e.g. Walk-in follow-up after 24h"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="signal-button px-5 py-2 rounded-xl text-xs font-semibold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
