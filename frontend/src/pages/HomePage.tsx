import React from 'react';
import { Complaint, AnalyticsData } from '../types';
import { ISSUE_COLORS, ISSUE_ICONS, createComplaintIcon } from '../utils/leafletIcons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface HomePageProps {
  analytics: AnalyticsData | null;
  complaints: Complaint[];
  onNavigate: (tab: string) => void;
  onSelectComplaint: (c: Complaint) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  analytics,
  complaints,
  onNavigate,
  onSelectComplaint,
}) => {
  const categories = [
    { type: 'Pothole', title: 'Pothole', emoji: '🕳️', desc: 'Asphalt craters, potholes & surface cavities' },
    { type: 'Broken Streetlight', title: 'Broken Streetlight', emoji: '💡', desc: 'Extinguished poles, wiring faults & blackouts' },
    { type: 'Garbage Accumulation', title: 'Garbage Accumulation', emoji: '🗑️', desc: 'Overflowing dumpers & uncollected solid waste' },
    { type: 'Water Leakage', title: 'Water Leakage', emoji: '💧', desc: 'Municipal pipeline bursts & water pooling' },
    { type: 'Damaged Road', title: 'Damaged Road', emoji: '🛣️', desc: 'Cracked bitumen & utility excavation trenches' },
  ];

  // Pick up to 15 sample complaints for the mini map
  const previewComplaints = complaints.slice(0, 15);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Chhatrapati Sambhajinagar Smart City GIS Portal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Smart Civic Issue Reporting
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Report civic problems in your area and help improve your city. Empowering citizens with GPS-geotagged reporting and enabling municipal administrators with spatial hotspot analytics.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Explore City Map</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid and circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
          <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      </div>

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 font-bold">
            📊
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</p>
            <h3 className="text-2xl font-black text-slate-800">{analytics?.total_complaints ?? '...'}</h3>
            <p className="text-[11px] text-slate-500">Live in Database</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 font-bold">
            ✅
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved Reports</p>
            <h3 className="text-2xl font-black text-slate-800">{analytics?.resolved ?? '...'}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {analytics?.resolution_rate ?? 0}% Resolution Rate
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 font-bold">
            ⏳
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending & Review</p>
            <h3 className="text-2xl font-black text-slate-800">
              {(analytics?.pending ?? 0) + (analytics?.under_review ?? 0)}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold">Under Processing</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0 font-bold">
            🔥
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Hotspots</p>
            <h3 className="text-2xl font-black text-slate-800">{analytics?.active_hotspots ?? '7'}</h3>
            <p className="text-[11px] text-rose-600 font-semibold">Clusters Detected</p>
          </div>
        </div>
      </div>

      {/* Five Civic Issue Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Civic Issue Categories</h2>
            <p className="text-xs text-slate-500">Report problems across 5 municipal infrastructure domains</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const count = analytics?.issue_distribution?.[cat.type] ?? 0;
            return (
              <div
                key={cat.type}
                onClick={() => onNavigate('report')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">
                    {cat.emoji}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Logged:</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Map Preview & Project Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chhatrapati Sambhajinagar Issue Map Preview</h3>
                <p className="text-[11px] text-slate-500">Live geotagged complaints in study area</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 relative">
            <MapContainer
              center={[19.8762, 75.3433]}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {previewComplaints.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.latitude, c.longitude]}
                  icon={createComplaintIcon(c.issue_type)}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-slate-800">{c.complaint_number}</div>
                      <div className="text-slate-600">{c.issue_type}</div>
                      <div className="text-[11px] text-slate-500">{c.address}</div>
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="mt-1 text-emerald-700 font-semibold underline block cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* GIS Academic Concepts Sidebar Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              GIS Concepts Implemented
            </div>
            <h3 className="font-bold text-lg text-white">Spatial Analysis Prototype</h3>
            <ul className="mt-4 space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Geotagging:</strong> High-precision browser GPS + interactive Leaflet coordinate capture.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>Spatial Clustering:</strong> Turf.js distance grouping (250m, 500m, 1km) to locate problem hubs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">✓</span>
                <span><strong>Proximity Analysis:</strong> Dynamic radial buffer query to inspect nearby complaints.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">✓</span>
                <span><strong>QGIS Interoperability:</strong> One-click GeoJSON export for professional spatial cartography.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('about')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer"
          >
            Learn About GIS Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
