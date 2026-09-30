import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import { MapPin, Calendar, Clock, AlertCircle, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { updateComplaintStatus } from '../api';
import { getMediaUrl } from '../api';

interface ComplaintModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusUpdated?: (updated: Complaint) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  complaint,
  onClose,
  isAdmin = false,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(
    complaint?.status || 'Submitted'
  );

  if (!complaint) return null;

  const color = ISSUE_COLORS[complaint.issue_type] || '#2563eb';
  const icon = ISSUE_ICONS[complaint.issue_type] || '📍';

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    try {
      setUpdating(true);
      const updated = await updateComplaintStatus(complaint.id, newStatus);
      setSelectedStatus(newStatus);
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const steps: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
  const currentStepIndex = steps.indexOf(selectedStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
              style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}` }}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">{complaint.complaint_number}</h3>
                <PriorityBadge priority={complaint.priority} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{complaint.issue_type} Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Status Timeline */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Resolution Lifecycle
            </h4>
            <div className="flex items-center justify-between">
              {steps.map((st, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <React.Fragment key={st}>
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-1 font-medium ${
                          isCurrent ? 'text-blue-700 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          currentStepIndex > idx ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Photo and Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Photo Evidence
              </span>
              <div className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center relative group">
                <img
                  src={getMediaUrl(complaint.photo)}
                  alt={complaint.issue_type}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if not loaded
                    (e.target as HTMLImageElement).src = getMediaUrl('/uploads/pothole_1.svg');
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-xs rounded text-[11px] text-white font-mono flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  CSMC Geotagged
                </div>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </span>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {complaint.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Location:</span> {complaint.address}
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      Lat: {complaint.latitude.toFixed(5)}° N, Long: {complaint.longitude.toFixed(5)}° E
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    <span className="font-semibold text-slate-700">Reported On:</span>{' '}
                    {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {complaint.resolved_at && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <span className="font-semibold">Resolved On:</span>{' '}
                      {new Date(complaint.resolved_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Status Updater */}
          {isAdmin && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Municipal Admin Action — Update Status
                </span>
                {updating && <span className="text-xs text-blue-600 animate-pulse">Saving...</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'] as ComplaintStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      disabled={updating}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedStatus === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Chhatrapati Sambhajinagar Municipal GIS
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
