'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Car,
  Target,
  Users,
  CheckCircle2,
  Sparkles,
  Download,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PERFORMANCE_CHART_DATA, PERFORMANCE_CHART_LABELS } from '@/lib/data';
import { crmApi } from '@/lib/api';

interface LeaderboardMember {
  rank: number;
  name: string;
  role: string;
  unitsSold: number;
  monthlyTarget: number;
  slaCompliance: number;
  testDrivesDone: number;
  csiRating: number;
  status: string;
}

const DEFAULT_LEADERBOARD: LeaderboardMember[] = [
  {
    rank: 1,
    name: 'Alex Rivers',
    role: 'Senior EV Specialist',
    unitsSold: 14,
    monthlyTarget: 16,
    slaCompliance: 96,
    testDrivesDone: 28,
    csiRating: 4.95,
    status: 'Top Performer',
  },
  {
    rank: 2,
    name: 'Jordan Lee',
    role: 'EV Consultant',
    unitsSold: 11,
    monthlyTarget: 14,
    slaCompliance: 91,
    testDrivesDone: 22,
    csiRating: 4.88,
    status: 'On Target',
  },
  {
    rank: 3,
    name: 'Samira Patel',
    role: 'Fleet & Novated Specialist',
    unitsSold: 9,
    monthlyTarget: 12,
    slaCompliance: 88,
    testDrivesDone: 19,
    csiRating: 4.92,
    status: 'On Target',
  },
  {
    rank: 4,
    name: 'Liam Chen',
    role: 'EV Specialist',
    unitsSold: 7,
    monthlyTarget: 12,
    slaCompliance: 78,
    testDrivesDone: 15,
    csiRating: 4.75,
    status: 'Coaching Focus',
  },
];

export function PerformanceView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>(DEFAULT_LEADERBOARD);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchTeamBoard = async () => {
      try {
        const res = await crmApi.getBoardTeam();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: LeaderboardMember[] = res.data.map((m: any, idx: number) => ({
            rank: idx + 1,
            name: m.consultant_name || m.name || `Consultant ${idx + 1}`,
            role: m.role || 'EV Specialist',
            unitsSold: m.deals_sold_mtd || m.unitsSold || 0,
            monthlyTarget: m.target || 15,
            slaCompliance: m.sla_percent || 90,
            testDrivesDone: m.test_drives || 20,
            csiRating: m.csi_score || 4.9,
            status: m.deals_sold_mtd >= 12 ? 'Top Performer' : 'On Target',
          }));
          setLeaderboard(mapped);
        }
      } catch {
        // Keep default leaderboard
      }
    };

    fetchTeamBoard();
  }, []);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = ['Rank', 'Consultant Name', 'Role', 'Units Sold (MTD)', 'Monthly Target', 'Target %', 'SLA Compliance %', 'Test Drives Done', 'CSI Rating', 'Status'];
      const rows = leaderboard.map((m) => [
        m.rank,
        `"${m.name}"`,
        `"${m.role}"`,
        m.unitsSold,
        m.monthlyTarget,
        `${Math.round((m.unitsSold / (m.monthlyTarget || 1)) * 100)}%`,
        `${m.slaCompliance}%`,
        m.testDrivesDone,
        m.csiRating.toFixed(2),
        `"${m.status}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BYD_Melbourne_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="view-stack">
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Executive Overview · Harmony Auto</p>
          <h1 className="page-title">FLOOR PERFORMANCE & VELOCITY</h1>
          <p className="page-subtitle">
            Speed-to-lead metrics, conversion funnels, consultant scoreboards, and test-drive completion rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV Pack'}</span>
          </button>

          <div className="connection-pill online hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Melbourne CBD: 100% On-Track</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Median first touch"
          value="11 min"
          change="Target: <15m SLA"
          icon={Clock}
          tone="green"
        />
        <MetricCard
          label="Test-drive show rate"
          value="84%"
          change="+6% vs prior month"
          icon={Car}
          tone="cyan"
        />
        <MetricCard
          label="Lead to committed"
          value="18.6%"
          change="National avg: 14.2%"
          icon={TrendingUp}
          tone="neutral"
        />
        <MetricCard
          label="Sold to delivered"
          value="12 days"
          change="PDI turnaround optimal"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      {/* 7-Day Velocity Chart Card */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="eyebrow">Velocity Tracking</p>
            <h2 className="section-title">7-Day First-Touch SLA Compliance (%)</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-900 rounded" />
              <span>Weekday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#e60012] rounded" />
              <span>Weekend Peak</span>
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="report-chart min-w-[320px]">
            {PERFORMANCE_CHART_DATA.map((val, idx) => (
              <div key={idx} className="bar-column">
                <span className="bar-value font-mono font-bold">{val}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${val}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {PERFORMANCE_CHART_LABELS[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 pt-2 font-mono">
          <span>* SLA benchmark: 100% enquiries responded within 15 minutes</span>
          <span className="text-emerald-600 font-bold">Week-to-date average: 66.5%</span>
        </div>
      </div>

      {/* Live Floor Consultant Leaderboard Table (§3.2, §5.10) */}
      <div className="surface-card overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                Consultant Velocity & Quota Scoreboard
              </h3>
              <p className="text-xs text-slate-500">
                Live rankings across SLA response speed, test-drive conversions, and monthly vehicle volume.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            Current Period: September 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase font-mono">
              <tr>
                <th className="p-3.5 pl-5">Rank</th>
                <th className="p-3.5">Consultant</th>
                <th className="p-3.5 text-center">Units Sold (MTD)</th>
                <th className="p-3.5 text-center">Quota Progress</th>
                <th className="p-3.5 text-center">15m SLA %</th>
                <th className="p-3.5 text-center">Drives Done</th>
                <th className="p-3.5 text-center">CSI Score</th>
                <th className="p-3.5 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((m) => {
                const targetPct = Math.round((m.unitsSold / (m.monthlyTarget || 1)) * 100);
                return (
                  <tr key={m.rank} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                        m.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        m.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        m.rank === 3 ? 'bg-amber-50 text-amber-800' : 'text-slate-400'
                      }`}>
                        #{m.rank}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 block font-semibold">{m.name}</strong>
                      <span className="text-[11px] text-slate-500">{m.role}</span>
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono text-slate-900">
                      {m.unitsSold} <span className="text-slate-400 font-normal">/ {m.monthlyTarget}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="w-24 mx-auto space-y-1">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${targetPct >= 100 ? 'bg-emerald-500' : targetPct >= 70 ? 'bg-[#e60012]' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(targetPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 block">{targetPct}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                      <span className={m.slaCompliance >= 90 ? 'text-emerald-600' : 'text-amber-600'}>
                        {m.slaCompliance}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-700">
                      {m.testDrivesDone}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-800">
                      ★ {m.csiRating.toFixed(2)}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                        m.status === 'Top Performer' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'On Target' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coaching Focus Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-cyan-300">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-condensed text-lg font-semibold tracking-wide uppercase">
            Manager Coaching Insights · Harmony Auto
          </h3>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Carsales enquiry volume peaks on Saturday between 11:00 AM and 2:00 PM. High-intent scores on SEALION 7 and SEAL Premium indicate strong interest in Novated Lease options. Ensure finance calculators and demo loops are pre-staged before midday.
        </p>
      </div>
    </div>
  );
}

