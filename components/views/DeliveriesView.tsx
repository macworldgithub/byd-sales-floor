'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Search,
} from 'lucide-react';
import { Delivery, Lead } from '@/lib/types';
import { ASSET_PATHS } from '@/lib/data';
import { Pagination } from '@/components/ui/Pagination';
import { deliveryApi } from '@/lib/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deliveriesList, setDeliveriesList] = useState<Delivery[]>(deliveries);
  const [totalItems, setTotalItems] = useState<number>(deliveries.length || 0);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil((deliveries.length || 1) / 30));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageSize = 30;

  const stageOptions = ['All', 'Scheduled', 'Delivered', 'Ready for Pickup', 'PDI', 'In Transit'];

  const fetchDeliveries = useCallback(async (page: number, stage: string, query: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };
      if (stage && stage !== 'All') {
        params.stage = stage;
      }
      if (query.trim()) {
        params.q = query.trim();
      }

      const res = await deliveryApi.getClients(params);
      if (res.success && res.data) {
        setDeliveriesList(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
          setTotalPages(res.pagination.pages || Math.ceil(res.pagination.total / pageSize) || 1);
        } else {
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch deliveries page:', err);
      // Fallback
      const filtered = deliveries.filter((d) => {
        const matchStage = stage === 'All' || d.stage === stage;
        const matchQ =
          !query ||
          (d.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (d.vehicle || '').toLowerCase().includes(query.toLowerCase()) ||
          (d.rego && d.rego.toLowerCase().includes(query.toLowerCase())) ||
          (d.vin && d.vin.toLowerCase().includes(query.toLowerCase()));
        return matchStage && matchQ;
      });
      setDeliveriesList(filtered.slice((page - 1) * pageSize, page * pageSize));
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    } finally {
      setIsLoading(false);
    }
  }, [deliveries, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeliveries(currentPage, selectedStage, searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, selectedStage, searchQuery, fetchDeliveries]);

  useEffect(() => {
    if (deliveries.length > 0 && !searchQuery && selectedStage === 'All' && currentPage === 1) {
      setDeliveriesList(deliveries);
      setTotalItems(deliveries.length);
      setTotalPages(Math.ceil(deliveries.length / pageSize) || 1);
    }
  }, [deliveries, searchQuery, selectedStage, currentPage, pageSize]);

  const featured = deliveriesList[0];

  const getStageBadgeColor = (stage?: string) => {
    switch (stage) {
      case 'Ready for Pickup':
        return 'bg-emerald-500 text-white';
      case 'Delivered':
        return 'bg-blue-600 text-white';
      case 'PDI':
        return 'bg-amber-500 text-white';
      case 'In Transit':
        return 'bg-cyan-600 text-white';
      case 'Scheduled':
        return 'bg-purple-600 text-white';
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
          <span>{totalItems.toLocaleString()} Deliveries registered</span>
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
              {featured.stage || 'Scheduled'} · {featured.delivery_date || featured.date || 'Upcoming'}
            </span>

            <h2>{(featured.name || 'CUSTOMER').toUpperCase()} · {(featured.vehicle || 'BYD VEHICLE').toUpperCase()}</h2>

            <p>
              Melbourne CBD Delivery Bay 2 · Rego: {featured.rego || 'TBA'} · VIN: {featured.vin || 'Pending'} · Handover Specialist: {featured.salesperson || featured.agent || 'Delivery Team'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() =>
                  onOpenMessage({
                    id: featured._id || featured.id,
                    name: featured.name,
                    initials: 'PN',
                    model: featured.vehicle,
                    score: 95,
                    stage: 'Committed',
                    source: 'Showroom',
                    lastTouch: 'Today',
                    action: 'Message',
                    phone: featured.phone || '+61 401 552 901',
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
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-field">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter deliveries by client, rego, VIN, or salesperson..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="filter-scroll">
            {stageOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedStage(st);
                  setCurrentPage(1);
                }}
                className={`filter-chip ${selectedStage === st ? 'active' : ''}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="card-header-row !p-0 !pb-2">
            <div>
              <p className="eyebrow">Upcoming Schedule</p>
              <h2 className="section-title">Delivery pipeline & stage tracking</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {isLoading && deliveriesList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-[#e60012] animate-spin" />
              <span>Loading deliveries from Delivery Centre...</span>
            </div>
          ) : deliveriesList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching delivery records found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              {deliveriesList.map((del, idx) => {
                const delId = del._id || del.id || `delivery-${idx}`;
                return (
                  <div
                    key={delId}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-xs flex flex-col justify-between space-y-3 min-w-0 overflow-hidden"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                        <span className={`stage-pill ${getStageBadgeColor(del.stage)} text-[9px] shrink-0`}>
                          {del.stage || 'Scheduled'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono truncate">
                          {del.delivery_date || del.date || 'Pending'}
                        </span>
                      </div>

                      <h3 className="font-condensed text-lg font-semibold text-slate-900 truncate" title={del.name}>
                        {del.name}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium truncate" title={del.vehicle}>
                        {del.vehicle || 'BYD Vehicle'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 min-w-0">
                      <div className="detail-cell min-w-0 overflow-hidden" title={del.rego || ''}>
                        <span>Rego</span>
                        <strong className="truncate font-mono">{del.rego || '—'}</strong>
                      </div>
                      <div className="detail-cell min-w-0 overflow-hidden" title={del.vin || ''}>
                        <span>VIN</span>
                        <strong className="truncate font-mono">{del.vin || '—'}</strong>
                      </div>
                      <div className="detail-cell min-w-0 overflow-hidden" title={del.contact_status || del.status || ''}>
                        <span>Contact</span>
                        <strong className="truncate">{del.contact_status || del.status || 'Pending'}</strong>
                      </div>
                      <div className="detail-cell min-w-0 overflow-hidden" title={del.salesperson || del.agent || ''}>
                        <span>Specialist</span>
                        <strong className="truncate">{del.salesperson || del.agent || '—'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
          itemName="deliveries"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

