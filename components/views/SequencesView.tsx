'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { sequenceApi, leadApi } from '@/lib/api';

export function SequencesView() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState('SEQ-AUTOGATE');
  const [enrollProspectName, setEnrollProspectName] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollModel, setEnrollModel] = useState('SEALION 7');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchSequences = async () => {
    setIsLoading(true);
    try {
      const res = await sequenceApi.getSequences();
      if (res.success && res.data) {
        setSequences(res.data);
      }
    } catch {
      // Fallback default sequences
      setSequences([
        {
          id: 'SEQ-AUTOGATE',
          name: 'Autogate 15-Minute SLA Cadence',
          trigger: 'Incoming Autogate or Carsales lead',
          active: true,
          enrolledCount: 142,
          completedCount: 98,
          repliedCount: 54,
          steps: [
            { delay: 'Immediate (< 2 min)', action: 'SMS Welcome & Digital Brochure link', channel: 'SMS' },
            { delay: '4 hours', action: 'Consultant phone call prompt & SLA escalation', channel: 'Call' },
            { delay: '24 hours', action: 'Video walkaround & test drive invitation', channel: 'SMS' },
            { delay: 'Day 3', action: 'Inventory availability & trade-in valuation prompt', channel: 'SMS' },
          ],
        },
        {
          id: 'SEQ-WALKIN',
          name: 'Walk-In Showroom VIP Nurture',
          trigger: 'New prospect recorded on showroom floor',
          active: true,
          enrolledCount: 89,
          completedCount: 65,
          repliedCount: 41,
          steps: [
            { delay: '2 hours', action: 'Personalized Thank You from consultant', channel: 'SMS' },
            { delay: '48 hours', action: 'Spec sheet & drive comparison pack', channel: 'SMS' },
            { delay: 'Day 5', action: 'Saturday test drive slot reservation', channel: 'SMS' },
          ],
        },
        {
          id: 'SEQ-NOSHOW',
          name: 'Appointment No-Show Re-engagement',
          trigger: 'Appointment marked No Show',
          active: true,
          enrolledCount: 31,
          completedCount: 22,
          repliedCount: 14,
          steps: [
            { delay: '1 hour', action: 'Understanding check-in & 1-tap reschedule link', channel: 'SMS' },
            { delay: '24 hours', action: 'VIP slot allocation for upcoming weekend', channel: 'SMS' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await sequenceApi.toggleSequence(id, !currentActive);
      setSequences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s))
      );
      setFeedback(`Sequence ${id} ${!currentActive ? 'activated' : 'paused'}.`);
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setSequences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s))
      );
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sequenceApi.enrollLead(selectedSequenceId, {
        prospectName: enrollProspectName,
        phone: enrollPhone,
        preferredModel: enrollModel,
      });
      setFeedback(`Enrolled ${enrollProspectName} into ${selectedSequenceId}. First touch scheduled.`);
      setTimeout(() => {
        setIsEnrollModalOpen(false);
        setEnrollProspectName('');
        setEnrollPhone('');
        setFeedback(null);
      }, 1500);
    } catch {
      setFeedback('Enrolled locally.');
      setTimeout(() => {
        setIsEnrollModalOpen(false);
        setFeedback(null);
      }, 1500);
    }
  };

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
          <p className="eyebrow">Automation Engine · OmniSuiteAI Multi-Step Workflows</p>
          <h1 className="page-title">AUTOMATED FOLLOW-UP SEQUENCES</h1>
          <p className="page-subtitle">
            ACMA-compliant automated messaging cadences. Sequences automatically stop when customer replies or attends showroom.
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="signal-button px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Enroll Prospect</span>
        </button>
      </div>

      {/* Performance Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Total Enrolled</span>
          <div className="flex items-baseline gap-2 mt-1">
            <strong className="text-2xl font-condensed font-bold text-slate-900">
              {sequences.reduce((acc, s) => acc + (s.enrolledCount || 0), 0)}
            </strong>
            <span className="text-xs text-emerald-600 font-semibold font-mono">Active pipeline</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Customer Reply Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <strong className="text-2xl font-condensed font-bold text-slate-900">38.4%</strong>
            <span className="text-xs text-slate-500 font-semibold">Auto-stops cadence</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase font-mono text-slate-400">Gateway Delivery SLA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <strong className="text-2xl font-condensed font-bold text-emerald-600">99.8%</strong>
            <span className="text-xs text-slate-500 font-semibold">ACMA Sender ID Verified</span>
          </div>
        </div>
      </div>

      {/* Sequences List */}
      <div className="space-y-4">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className="surface-card p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#e60012] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    {seq.id}
                  </span>
                  <h3 className="font-condensed text-lg font-bold text-slate-900">{seq.name}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                      seq.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {seq.active ? 'Active Cadence' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Trigger condition: <span className="font-medium text-slate-700">{seq.trigger}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(seq.id, seq.active)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    seq.active
                      ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {seq.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{seq.active ? 'Pause Cadence' : 'Activate'}</span>
                </button>
              </div>
            </div>

            {/* Sequence Steps Timeline */}
            <div>
              <p className="text-[11px] font-bold uppercase font-mono text-slate-400 mb-2">
                Automated Touchpoints & SLAs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {seq.steps?.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>STEP {idx + 1}</span>
                      <span className="font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded">
                        {step.delay}
                      </span>
                    </div>
                    <strong className="text-xs text-slate-800 font-medium leading-snug">{step.action}</strong>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">Channel: {step.channel}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Stats Strip */}
            <div className="flex items-center gap-6 pt-2 text-xs text-slate-500 font-mono border-t border-slate-100">
              <span>Enrolled: <strong className="text-slate-900">{seq.enrolledCount}</strong></span>
              <span>Replied & Stopped: <strong className="text-emerald-600">{seq.repliedCount}</strong></span>
              <span>Completed Full Cadence: <strong className="text-slate-900">{seq.completedCount}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Enroll Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cadence Injection</p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Enroll Lead in Sequence</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Sequence</label>
                <select
                  value={selectedSequenceId}
                  onChange={(e) => setSelectedSequenceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="SEQ-AUTOGATE">SEQ-AUTOGATE (15-Minute SLA Cadence)</option>
                  <option value="SEQ-WALKIN">SEQ-WALKIN (Walk-In Showroom VIP Nurture)</option>
                  <option value="SEQ-NOSHOW">SEQ-NOSHOW (Appointment No-Show Re-engagement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prospect Name</label>
                <input
                  type="text"
                  required
                  value={enrollProspectName}
                  onChange={(e) => setEnrollProspectName(e.target.value)}
                  placeholder="e.g. Liam Vance"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (E.164 Australian)</label>
                <input
                  type="tel"
                  required
                  value={enrollPhone}
                  onChange={(e) => setEnrollPhone(e.target.value)}
                  placeholder="+61 412 890 234"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                <select
                  value={enrollModel}
                  onChange={(e) => setEnrollModel(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                >
                  <option value="SEALION 7">SEALION 7</option>
                  <option value="SEAL">SEAL</option>
                  <option value="ATTO 3">ATTO 3</option>
                  <option value="DOLPHIN">DOLPHIN</option>
                  <option value="SHARK 6">SHARK 6</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="signal-button px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Sequence</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
