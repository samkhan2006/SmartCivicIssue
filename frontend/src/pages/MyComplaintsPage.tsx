import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import { MapPin, Calendar, Search, Filter, ExternalLink, ArrowRight } from 'lucide-react';

interface MyComplaintsPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
  onNavigateToReport: () => void;
}

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateToReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = complaints.filter((c) => {
    const matchesStatus =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Active'
        ? c.status !== 'Resolved' && c.status !== 'Rejected'
        : c.status === filterStatus;

    const matchesSearch =
      searchTerm === '' ||
      c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.issue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Submitted Complaints</h1>
          <p className="text-sm text-slate-500">
            Track real-time status and municipal resolution progress for your reported issues.
          </p>
        </div>
        <button
          onClick={onNavigateToReport}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Report New Problem</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, issue, locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Active', 'Submitted', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-4xl">📋</div>
          <h3 className="font-bold text-slate-700">No complaints found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm ? 'Try changing your search terms or filter.' : 'You have not submitted any complaints yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const color = ISSUE_COLORS[c.issue_type] || '#2563eb';
            const icon = ISSUE_ICONS[c.issue_type] || '📍';
            return (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition p-5 space-y-4 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
                      >
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                          {c.complaint_number}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{c.issue_type}</p>
                      </div>
                    </div>
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
