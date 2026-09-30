import React from 'react';
import { AnalyticsData, Complaint } from '../types';
import { ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import { Printer, Download, BarChart2, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { downloadGeoJSON } from '../api';

interface ReportsPageProps {
  analytics: AnalyticsData | null;
  complaints: Complaint[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ analytics, complaints }) => {
  const issueDistribution = analytics?.issue_distribution || {};
  const statusDistribution = analytics?.status_distribution || {};
  const total = analytics?.total_complaints || 1;

  // Find most frequently reported issue
  let mostFrequentIssue = 'Pothole';
  let maxCount = 0;
  Object.entries(issueDistribution).forEach(([iss, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      mostFrequentIssue = iss;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Print and GeoJSON Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Municipal GIS Analytics & Reports</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official infrastructure report for Chhatrapati Sambhajinagar Municipal Corporation (CSMC).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={downloadGeoJSON}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export QGIS GeoJSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Formal Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Government of Maharashtra — Municipal Administration
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Chhatrapati Sambhajinagar Smart Civic GIS Report
            </h2>
            <p className="text-xs text-slate-500">
              Generated On: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-right sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dataset Status</span>
            <span className="text-xs font-bold text-slate-800">Academic GIS Prototype</span>
            <span className="text-[10px] text-slate-500 block">CRS: EPSG:4326 (WGS 84)</span>
          </div>
        </div>

        {/* Executive Key Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Grievances</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.total_complaints ?? 0}</div>
            <span className="text-[11px] text-slate-400">100% Geotagged</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-700">Resolution Rate</span>
            <div className="text-2xl font-black text-emerald-900 mt-1">{analytics?.resolution_rate ?? 0}%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">{analytics?.resolved} Issues Fixed</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <span className="text-xs font-semibold text-rose-700">Top Problem Type</span>
            <div className="text-lg font-black text-rose-900 mt-1 truncate">{mostFrequentIssue}</div>
            <span className="text-[11px] text-rose-600 font-semibold">{maxCount} Incidents Logged</span>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="text-xs font-semibold text-amber-700">High Density Hotspots</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{analytics?.active_hotspots ?? 7}</div>
            <span className="text-[11px] text-amber-600 font-semibold">Turf.js Clusters</span>
          </div>
        </div>

        {/* Two Columns: Category Breakdown & Resolution Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issue Categories Table */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>Complaints by Issue Category</span>
              <span className="text-xs text-slate-400 font-normal">Count & Share</span>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(issueDistribution).map(([issue, cnt]) => {
                const pct = Math.round((cnt / total) * 100);
                return (
                  <div key={issue} className="py-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700 font-semibold">
                      <span>{ISSUE_ICONS[issue as any]}</span>
                      <span>{issue}</span>
                    </span>
                    <span className="font-mono text-slate-600">
                      <strong>{cnt}</strong> ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>Resolution Pipeline Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">Status Count</span>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(statusDistribution).map(([st, cnt]) => {
                const pct = Math.round((cnt / total) * 100);
                return (
                  <div key={st} className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-700 font-semibold">{st}</span>
                    <span className="font-mono text-slate-600">
                      <strong>{cnt}</strong> ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* QGIS Integration Verification Note */}
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>QGIS Export Specifications</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The exported GeoJSON file contains complete vector point geometries in standard WGS 84 (EPSG:4326) CRS with all attributes (<code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">complaint_id</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">issue_type</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">status</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">priority</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">address</code>). This data can be directly imported into QGIS via <span className="font-semibold text-blue-900">Layer → Add Layer → Add Vector Layer</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
