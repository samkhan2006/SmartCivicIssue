import React from 'react';
import { AnalyticsData, Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import {
  Layers,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  Download,
  Target
} from 'lucide-react';
import { downloadGeoJSON } from '../api';

interface AdminDashboardPageProps {
  analytics: AnalyticsData | null;
  complaints: Complaint[];
  onNavigate: (tab: string) => void;
  onSelectComplaint: (c: Complaint) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  analytics,
  complaints,
  onNavigate,
  onSelectComplaint,
}) => {
  const recentComplaints = complaints.slice(0, 6);

  // Issue distribution stats
  const issueDistribution = analytics?.issue_distribution || {
    Pothole: 0,
    'Broken Streetlight': 0,
    'Garbage Accumulation': 0,
    'Water Leakage': 0,
    'Damaged Road': 0,
  };

  const total = analytics?.total_complaints || 1;

  const statusDistribution = analytics?.status_distribution || {
    Submitted: 0,
    'Under Review': 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header with City Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Municipal Admin Dashboard</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Live GIS Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chhatrapati Sambhajinagar Municipal Corporation — Civic Infrastructure Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('map')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Open GIS Map</span>
          </button>
          <button
            onClick={downloadGeoJSON}
            title="Download GeoJSON for QGIS"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export QGIS GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Six Live KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Complaints */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.total_complaints ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            All categories
          </div>
        </div>

        {/* Pending (Submitted) */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Pending</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{analytics?.pending ?? 0}</div>
          <div className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
            <span>Awaiting triage</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-700">In Progress</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{analytics?.in_progress ?? 0}</div>
          <div className="text-[11px] text-purple-600 mt-1">Field teams active</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Resolved</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{analytics?.resolved ?? 0}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {analytics?.resolution_rate ?? 0}% Rate
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">High Priority</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{analytics?.high_priority ?? 0}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-semibold">Requires urgency</div>
        </div>

        {/* Active Hotspots */}
        <div
          onClick={() => onNavigate('hotspots')}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs cursor-pointer hover:border-amber-400 transition group"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center justify-between">
            <span>Hotspots</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 group-hover:scale-125 transition" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{analytics?.active_hotspots ?? 7}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium underline">Inspect spatial hubs</div>
        </div>
      </div>

      {/* Charts Grid: Issue Distribution & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Issue Category Distribution</h3>
              <p className="text-xs text-slate-500">Live breakdown of problems across 5 civic domains</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">N={analytics?.total_complaints ?? 0}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(issueDistribution).map(([issue, count]) => {
              const percentage = Math.round((count / total) * 100);
              const color = ISSUE_COLORS[issue as any] || '#3b82f6';
              const icon = ISSUE_ICONS[issue as any] || '📍';
              return (
                <div key={issue} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span>{icon}</span>
                      <span className="font-semibold">{issue}</span>
                    </span>
                    <span className="text-slate-500 font-mono">
                      <strong>{count}</strong> ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Status Workflow Pipeline</h3>
              <p className="text-xs text-slate-500">Complaints progress across municipal resolution stages</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {analytics?.resolution_rate}% Resolved
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Submitted (New)', key: 'Submitted', color: '#3b82f6' },
              { label: 'Under Review', key: 'Under Review', color: '#f59e0b' },
              { label: 'In Progress', key: 'In Progress', color: '#a855f7' },
              { label: 'Resolved (Fixed)', key: 'Resolved', color: '#10b981' },
              { label: 'Rejected', key: 'Rejected', color: '#f43f5e' },
            ].map((st) => {
              const count = statusDistribution[st.key] || 0;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={st.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{st.label}</span>
                    <span className="text-slate-500 font-mono">
                      <strong>{count}</strong> ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor: st.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Issues Table & Quick GIS Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Geotagged Complaints</h3>
            <p className="text-xs text-slate-500">Latest civic reports recorded across Chhatrapati Sambhajinagar</p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Complaints</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-3">Complaint ID</th>
                <th className="py-3 px-3">Issue Type</th>
                <th className="py-3 px-3">Location Area</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{c.complaint_number}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <span>{ISSUE_ICONS[c.issue_type]}</span>
                      <span>{c.issue_type}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{c.address}</td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
