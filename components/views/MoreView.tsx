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
      title: 'Test Drive Staging',
      desc: 'Book and allocate vehicle demo loops',
      icon: Compass,
      action: onOpenBookDrive,
    },
    {
      title: 'Prospect Entry',
      desc: 'Create new lead card with intent score',
      icon: FileText,
      action: onOpenAddProspect,
    },
    {
      title: 'Allocation Engine',
      desc: 'Manage sales consultant load distribution',
      icon: Car,
      action: () => onNavigateTab('allocation'),
    },
    {
      title: 'Performance KPIs',
      desc: 'View showroom response velocity and SLA tracking',
      icon: Calculator,
      action: () => onNavigateTab('reports'),
    },
  ];

  return (
    <div className="view-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Sales Floor OS</p>
          <h1 className="page-title">FLOOR TOOLS & RESOURCES</h1>
          <p className="page-subtitle">
            Quick utilities, inventory management and operational shortcuts for BYD Melbourne CBD.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={tool.action}
              className="more-tile group cursor-pointer"
            >
              <div className="more-icon group-hover:bg-[#e60012] group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-[#e60012] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Showroom Info Card */}
      <div className="surface-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={ASSET_PATHS.consultant}
            alt="Showroom"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <span className="stage-pill bg-slate-900 text-white">Showroom Facility</span>
          <h3 className="font-condensed text-xl font-semibold text-slate-900">
            BYD Melbourne CBD Flagship
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            360 Elizabeth St, Melbourne VIC 3000. Features 8 vehicle display bays, 2 dedicated customer handover suites, and 4 ultra-fast charging points.
          </p>
        </div>
      </div>
    </div>
  );
}
