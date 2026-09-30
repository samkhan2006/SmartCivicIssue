import React, { useState } from 'react';
import { Complaint, ComplaintStatus, IssueType, ComplaintPriority } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import { updateComplaintStatus } from '../api';
import { Search, Filter, Eye, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface ComplaintManagementPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
  onStatusUpdated: (updated: Complaint) => void;
}

export const ComplaintManagementPage: React.FC<ComplaintManagementPageProps> = ({
  complaints,
  onSelectComplaint,
  onStatusUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = complaints.filter((c) => {
    const matchType = filterType === 'All' || c.issue_type === filterType;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchSearch =
      searchTerm === '' ||
      c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.issue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchType && matchStatus && matchSearch;
  });

  const handleStatusChange = async (complaintId: number, newStatus: string) => {
    try {
      setUpdatingId(complaintId);
      const updated = await updateComplaintStatus(complaintId, newStatus);
      onStatusUpdated(updated);
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Complaint Management</h1>
          <p className="text-sm text-slate-500">
            Review citizen submissions, assign triage priority, and update resolution lifecycle.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          Showing {filtered.length} of {complaints.length} Records
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, issue, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="All">All Issue Types</option>
            <option value="Pothole">🕳️ Pothole</option>
            <option value="Broken Streetlight">💡 Broken Streetlight</option>
            <option value="Garbage Accumulation">🗑️ Garbage Accumulation</option>
            <option value="Water Leakage">💧 Water Leakage</option>
            <option value="Damaged Road">🛣️ Damaged Road</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Issue Type</th>
                <th className="py-3.5 px-4">Location / Address</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Update Status</th>
                <th className="py-3.5 px-4">Reported Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((c) => {
                const isBusy = updatingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.complaint_number}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span>{ISSUE_ICONS[c.issue_type]}</span>
                        <span className="font-semibold">{c.issue_type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={c.address}>
                      {c.address}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        disabled={isBusy}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isBusy ? 'opacity-50' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
