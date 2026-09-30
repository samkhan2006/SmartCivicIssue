import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  const getStyle = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-300/40';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-300/40';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/40';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300/40';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDot = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500';
      case 'Under Review':
        return 'bg-amber-500';
      case 'In Progress':
        return 'bg-purple-500 animate-pulse';
      case 'Resolved':
        return 'bg-emerald-500';
      case 'Rejected':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-xs ${sizeClasses[size]} ${getStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDot()}`}></span>
      {status}
    </span>
  );
};
