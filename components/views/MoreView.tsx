'use client';

import React from 'react';
import {
  Car,
  Calculator,
  Compass,
  FileText,
  MapPin,
  Settings,
  HelpCircle,
  ExternalLink,
  Zap,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { ASSET_PATHS } from '@/lib/data';

interface MoreViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenBookDrive: () => void;
  onOpenAddProspect: () => void;
}

export function MoreView({
  onNavigateTab,
  onOpenBookDrive,
  onOpenAddProspect,
}: MoreViewProps) {
  const tools = [
    {
      title: 'Automated Sequences',
      desc: 'Autogate 15m SLA, Walk-in nurture and No-Show cadences',
      icon: Zap,
      action: () => onNavigateTab('sequences'),
    },
    {
      title: 'Template Studio',
      desc: 'Tokenized message packs with ACMA opt-out compliance validator',
      icon: FileText,
      action: () => onNavigateTab('templates'),
    },
    {
      title: 'Test Drive Staging',
      desc: 'Book and allocate vehicle demo loops with conflict detection',
      icon: Compass,
      action: onOpenBookDrive,
    },
    {
      title: 'Prospect Entry',
      desc: 'Showroom floor intake, business card scan, and duplicate guard',
      icon: MessageSquare,
      action: onOpenAddProspect,
    },
    {
      title: 'Allocation Engine',
      desc: 'Manage sales consultant load distribution and round-robin',
      icon: Car,
      action: () => onNavigateTab('allocation'),
    },
    {
      title: 'Performance KPIs',
      desc: 'View showroom response velocity, conversion, and SLA tracking',
      icon: Calculator,
      action: () => onNavigateTab('reports'),
    },
  ];

  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Sales Floor OS · Extended Operations</p>
          <h1 className="page-title">FLOOR TOOLS & AUTOMATIONS</h1>
          <p className="page-subtitle">
            Sequences engine, template studio, inventory soft-holds, and consultant allocation for Melbourne CBD.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={tool.action}
              className="more-tile group cursor-pointer p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#e60012] group-hover:text-white transition-colors shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-[#e60012] transition-colors truncate">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tool.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Showroom Facility Information */}
      <div className="surface-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={ASSET_PATHS.consultant}
            alt="Showroom"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <span className="stage-pill bg-slate-900 text-white">Melbourne CBD Flagship</span>
          <h3 className="font-condensed text-xl font-bold text-slate-900">
            BYD Harmony Flagship Operations
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
            Tenancy operational under dual MongoDB Atlas architecture. Inbound leads from Autogate, Carsales, and Web automatically routed to consultant active queue within 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
