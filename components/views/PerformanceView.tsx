'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Car,
  Target,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PERFORMANCE_CHART_DATA, PERFORMANCE_CHART_LABELS } from '@/lib/data';

export function PerformanceView() {
  return (
    <div className="view-stack">
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Executive Overview</p>
          <h1 className="page-title">FLOOR PERFORMANCE & VELOCITY</h1>
          <p className="page-subtitle">
            Speed-to-lead metrics, conversion funnels, and test-drive completion rates for Melbourne CBD showroom.
          </p>
        </div>

        <div className="connection-pill online">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Melbourne CBD Target: 100% On-Track</span>
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
        <div className="report-chart">
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

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-mono">
          <span>* SLA benchmark: 100% enquiries responded within 15 minutes</span>
          <span className="text-emerald-600 font-bold">Week-to-date average: 66.5%</span>
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
