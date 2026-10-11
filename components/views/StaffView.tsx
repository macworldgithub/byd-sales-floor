'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Building2,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
  Globe,
  RefreshCw,
  UserCheck,
  UserCog,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';
import { staffApi, StaffMember } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function StaffView() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState<boolean>(true);
  const [userSite, setUserSite] = useState<string>('');

  const fetchStaffData = async (siteOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeSiteParam = siteOverride !== undefined ? siteOverride : selectedSite;
      const res = await staffApi.getStaff(activeSiteParam, search);
      if (res && res.data) {
        setStaff(res.data);
        setHasFullAccess(res.userScope?.hasFullAccess ?? true);
        setUserSite(res.userScope?.userSite || user?.locked_site || user?.site || 'All Sites');
        if (res.availableSites && res.availableSites.length > 0) {
          setAvailableSites(res.availableSites);
        }
      }
    } catch (err: any) {
      console.error('Error fetching staff directory:', err);
      setError(err.message || 'Failed to fetch staff directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [selectedSite]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStaffData();
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.site?.toLowerCase().includes(q) ||
        m.locked_site?.toLowerCase().includes(q);

      const matchesRole =
        selectedRole === 'All Roles' ||
        (selectedRole === 'Managers' &&
          ((m.role || '').includes('manager') || (m.position || '').toLowerCase().includes('manager'))) ||
        (selectedRole === 'Consultants' &&
          ((m.role || '').includes('consultant') ||
            (m.role || '').includes('agent') ||
            (m.position || '').toLowerCase().includes('consultant')));

      return matchesSearch && matchesRole;
    });
  }, [staff, search, selectedRole]);

  const stats = useMemo(() => {
    const total = filteredStaff.length;
    const active = filteredStaff.filter((s) => s.active !== false).length;
    const managers = filteredStaff.filter(
      (s) => (s.role || '').includes('manager') || (s.position || '').toLowerCase().includes('manager')
    ).length;
    const consultants = filteredStaff.filter(
      (s) =>
        (s.role || '').includes('consultant') ||
        (s.role || '').includes('agent') ||
        (s.position || '').toLowerCase().includes('consultant')
    ).length;
    return { total, active, managers, consultants };
  }, [filteredStaff]);

  const formatRole = (role: string) => {
    if (!role) return 'Staff Member';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Showroom Staff</h1>
            <span className="bg-red-50 text-[#e60012] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Team Directory
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Sales Floor consultants, delivery specialists, and managers by showroom
          </p>
        </div>

        <button
          onClick={() => fetchStaffData()}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Access Scope Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          hasFullAccess ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/70 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              hasFullAccess ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {hasFullAccess ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span>{hasFullAccess ? 'Cross-Site View · All Showrooms' : `Showroom Locked · ${userSite}`}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  hasFullAccess ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasFullAccess ? 'Network Access' : 'Site Scoped'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasFullAccess
                ? 'You have organizational access across all dealer sites. Use the showroom selector to isolate teams.'
                : `Your account is assigned to ${userSite}. You only see team members belonging to this showroom.`}
            </p>
          </div>
        </div>

        {/* Site Filter for users with full access */}
        {hasFullAccess && availableSites.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-600">Showroom:</span>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#e60012]"
            >
              <option value="All Sites">All Sites ({availableSites.length})</option>
              {availableSites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{stats.total}</div>
            <div className="text-xs text-slate-500">Total Staff</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{stats.active}</div>
            <div className="text-xs text-slate-500">Active Staff</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{stats.managers}</div>
            <div className="text-xs text-slate-500">Sales Managers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">{stats.consultants}</div>
            <div className="text-xs text-slate-500">Consultants</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, showroom or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#e60012] shadow-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#e60012]"
          >
            <option value="All Roles">All Roles</option>
            <option value="Managers">Managers Only</option>
            <option value="Consultants">Consultants Only</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Showroom Site</th>
                <th className="py-3 px-4">Role & Position</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const initial = (member.name || 'U').slice(0, 1).toUpperCase();
                  const siteName = member.locked_site || member.site || 'General Floor';
                  const isManager =
                    (member.role || '').includes('manager') ||
                    (member.position || '').toLowerCase().includes('manager');

                  return (
                    <tr key={member._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Member & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              isManager
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-500">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Site */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{siteName}</span>
                        </span>
                      </td>

                      {/* Position / Role */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {member.position || formatRole(member.role)}
                        </div>
                        {member.team && (
                          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                            {member.team}
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone}`}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{member.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">No phone</span>
                          )}
                          <a
                            href={`mailto:${member.email}`}
                            className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{member.email}</span>
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            member.active !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                            }`}
                          />
                          <span>{member.active !== false ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
