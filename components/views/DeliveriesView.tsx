'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Car,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Sparkles,
  FileCheck,
  Key,
} from 'lucide-react';
import { Delivery, Lead } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';
import { Pagination } from '@/components/ui/Pagination';

interface DeliveriesViewProps {
  deliveries: Delivery[];
  onOpenMessage: (lead: Lead) => void;
  onCompleteHandover?: (delivery: Delivery) => void;
}

export function DeliveriesView({
  deliveries,
  onOpenMessage,
  onCompleteHandover,
}: DeliveriesViewProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const featured = deliveries[0];

  const totalPages = Math.ceil(deliveries.length / pageSize);
  const paginatedDeliveries = deliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStageBadgeColor = (stage: Delivery['stage']) => {
    switch (stage) {
      case 'Ready for Pickup':
        return 'bg-emerald-500 text-white';
      case 'PDI':
        return 'bg-amber-500 text-white';
      case 'In Transit':
        return 'bg-cyan-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="view-stack">
      {/* Page Intro Banner */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Vehicle Handovers</p>
          <h1 className="page-title">DELIVERY CENTRE · MATCHED RECORDS</h1>
          <p className="page-subtitle">
            Coordinate vehicle readiness, PDI tracking, customer documentation and bay staging for Melbourne CBD.
          </p>
        </div>

        <div className="connection-pill online">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{deliveries.length} Deliveries scheduled this week</span>
        </div>
      </div>

      {/* Featured Handover Hero Card */}
      {featured && (
        <div className="delivery-feature">
          <img
            src={ASSET_PATHS.delivery}
            alt="BYD Handover Bay"
            className="w-full h-full object-cover"
          />
          <div className="delivery-feature-shade" />

          {/* Handover Details */}
          <div className="delivery-feature-copy">
            <span className="stage-pill bg-emerald-500 text-white shadow-md">
              Ready for Pickup · {featured.date}
            </span>

            <h2>{(featured.name || '').toUpperCase()} · {(featured.vehicle || '').toUpperCase()}</h2>

            <p>
              Melbourne CBD Delivery Bay 2 · Rego: {featured.rego} · VIN: {featured.vin} · Handover Specialist: {featured.agent}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() =>
                  onOpenMessage({
                    id: featured.id,
                    name: featured.name,
                    initials: 'PN',
                    model: featured.vehicle,
                    score: 95,
                    stage: 'Committed',
                    source: 'Showroom',
                    lastTouch: 'Today',
                    action: 'Message',
                    phone: '+61 401 552 901',
                  })
                }
                className="signal-button px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message customer</span>
              </button>

              <button
                onClick={() => onCompleteHandover?.(featured)}
                className="hero-secondary px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark handover complete</span>
              </button>
            </div>
          </div>

          {/* Delivery Readiness Checklist (Desktop Right Card) */}
          <div className="delivery-checklist">
            <p className="eyebrow text-slate-300">Readiness Audit</p>
            <strong className="text-sm font-semibold text-white block mt-0.5">
              Bay 2 Handover Checklist
            </strong>

            <div className="space-y-2 mt-3">
              <div className="check-row">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Contract & cleared funds verified</span>
              </div>
              <div className="check-row">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PDI & ceramic detail complete</span>
              </div>
              <div className="check-row">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>BYD App paired & primary key linked</span>
              </div>
              <div className="check-row">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2x NFC key cards staged with welcome pack</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deliveries List Surface */}
      <div className="surface-card overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="card-header-row !p-0 !pb-4">
            <div>
              <p className="eyebrow">Upcoming Schedule</p>
              <h2 className="section-title">Delivery pipeline & stage tracking</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              SYNCED TO DMS · LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
            {paginatedDeliveries.map((del) => (
              <div
                key={del.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-xs flex flex-col justify-between space-y-3 min-w-0 overflow-hidden"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                    <span className={`stage-pill ${getStageBadgeColor(del.stage)} text-[9px] shrink-0`}>
                      {del.stage}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono truncate">{del.date}</span>
                  </div>

                  <h3 className="font-condensed text-lg font-semibold text-slate-900 truncate" title={del.name}>
                    {del.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium truncate" title={del.vehicle}>
                    {del.vehicle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 min-w-0">
                  <div className="detail-cell min-w-0 overflow-hidden" title={del.rego}>
                    <span>Rego</span>
                    <strong className="truncate font-mono">{del.rego || '—'}</strong>
                  </div>
                  <div className="detail-cell min-w-0 overflow-hidden" title={del.vin}>
                    <span>VIN</span>
                    <strong className="truncate font-mono">{del.vin || '—'}</strong>
                  </div>
                  <div className="detail-cell min-w-0 overflow-hidden" title={del.status}>
                    <span>Status</span>
                    <strong className="truncate">{del.status || '—'}</strong>
                  </div>
                  <div className="detail-cell min-w-0 overflow-hidden" title={del.agent}>
                    <span>Specialist</span>
                    <strong className="truncate">{del.agent || '—'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={deliveries.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="deliveries"
        />
      </div>
    </div>
  );
}
