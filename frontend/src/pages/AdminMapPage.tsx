import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Complaint, IssueType, ComplaintStatus, ComplaintPriority } from '../types';
import { createComplaintIcon, ISSUE_COLORS, ISSUE_ICONS } from '../utils/leafletIcons';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import {
  Search,
  Filter,
  Layers,
  MapPin,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { fetchComplaints, fetchGisLayers, getMediaUrl } from '../api';

interface AdminMapPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
}

// Controller component to zoom to a target complaint when searched
function FlyToLocation({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 16, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export const AdminMapPage: React.FC<AdminMapPageProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [selectedIssueType, setSelectedIssueType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Layer toggle states
  const [showComplaintsLayer, setShowComplaintsLayer] = useState(true);
  const [showRoadsLayer, setShowRoadsLayer] = useState(true);
  const [showBoundaryLayer, setShowBoundaryLayer] = useState(true);
  const [showZonesLayer, setShowZonesLayer] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Focus location
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const [activeComplaintId, setActiveComplaintId] = useState<number | null>(null);

  // GIS layers from backend
  const [gisLayers, setGisLayers] = useState<{
    boundary: any;
    major_roads: any;
    zones: any;
  } | null>(null);

  useEffect(() => {
    fetchGisLayers()
      .then(setGisLayers)
      .catch((err) => console.error('Failed to load GIS layers:', err));
  }, []);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchType = selectedIssueType === 'All' || c.issue_type === selectedIssueType;
      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchPriority = selectedPriority === 'All' || c.priority === selectedPriority;
      const matchSearch =
        searchTerm === '' ||
        c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.issue_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchStatus && matchPriority && matchSearch;
    });
  }, [complaints, selectedIssueType, selectedStatus, selectedPriority, searchTerm]);

  // Dynamic summary counters based on current filters
  const mapStats = useMemo(() => {
    const total = filteredComplaints.length;
    const pending = filteredComplaints.filter((c) => c.status === 'Submitted').length;
    const inProgress = filteredComplaints.filter((c) => c.status === 'In Progress').length;
    const resolved = filteredComplaints.filter((c) => c.status === 'Resolved').length;
    const highPriority = filteredComplaints.filter((c) => c.priority === 'High').length;
    return { total, pending, inProgress, resolved, highPriority };
  }, [filteredComplaints]);

  const handleSearchSelect = (c: Complaint) => {
    setFocusTarget([c.latitude, c.longitude]);
    setActiveComplaintId(c.id);
  };

  const handleResetFilters = () => {
    setSelectedIssueType('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSearchTerm('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Map Summary Bar (Section 34) */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>{mapStats.total}</span>
            <span className="font-normal text-slate-500">Filtered Reports</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-bold">{mapStats.pending}</span>
            <span className="text-slate-500">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="font-bold">{mapStats.inProgress}</span>
            <span className="text-slate-500">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold">{mapStats.resolved}</span>
            <span className="text-slate-500">Resolved</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="font-bold">{mapStats.highPriority}</span>
            <span className="text-slate-500">High Priority</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showFilterPanel
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ID, issue or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Issue Type Filter */}
          <div>
            <select
              value={selectedIssueType}
              onChange={(e) => setSelectedIssueType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Issue Types</option>
              <option value="Pothole">🕳️ Pothole</option>
              <option value="Broken Streetlight">💡 Broken Streetlight</option>
              <option value="Garbage Accumulation">🗑️ Garbage Accumulation</option>
              <option value="Water Leakage">💧 Water Leakage</option>
              <option value="Damaged Road">🛣️ Damaged Road</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted (Pending)</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟠 Medium Priority</option>
              <option value="Low">⚪ Low Priority</option>
            </select>

            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layer Controls Bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>GIS Map Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showComplaintsLayer}
                onChange={(e) => setShowComplaintsLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Complaints Points ({filteredComplaints.length})</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoadsLayer}
                onChange={(e) => setShowRoadsLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 rounded"></span>
                <span>Major Roads (Jalna Rd, Bypass)</span>
              </span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showBoundaryLayer}
                onChange={(e) => setShowBoundaryLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-indigo-600 bg-indigo-50 rounded-xs"></span>
                <span>CSMC Municipal Boundary</span>
              </span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showZonesLayer}
                onChange={(e) => setShowZonesLayer(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Administrative Wards (Zones 1-4)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Large GIS Map */}
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <MapContainer
          center={[19.8762, 75.3433]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToLocation target={focusTarget} />

          {/* CSMC Municipal Boundary Polygon */}
          {showBoundaryLayer && gisLayers?.boundary && (
            <GeoJSON
              data={gisLayers.boundary}
              style={{
                color: '#4f46e5',
                weight: 2.5,
                dashArray: '6, 6',
                fillColor: '#6366f1',
                fillOpacity: 0.05,
              }}
            />
          )}

          {/* Administrative Zones */}
          {showZonesLayer && gisLayers?.zones && (
            <GeoJSON
              data={gisLayers.zones}
              style={(feature) => {
                const zoneColors: Record<string, string> = {
                  'ZONE-1': '#3b82f6',
                  'ZONE-2': '#10b981',
                  'ZONE-3': '#f59e0b',
                  'ZONE-4': '#8b5cf6',
                };
                const color = zoneColors[feature?.properties?.zone_id] || '#64748b';
                return {
                  color,
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 0.12,
                };
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <div style="font-family: system-ui; font-size: 12px; padding: 4px;">
                    <strong style="color: #1e293b;">${feature.properties.name}</strong><br/>
                    <span style="color: #64748b;">Key Areas: ${feature.properties.key_areas}</span><br/>
                    <span style="color: #059669; font-weight: 600;">Officer: ${feature.properties.ward_officer}</span>
                  </div>
                `);
              }}
            />
          )}

          {/* Major Transport Roads */}
          {showRoadsLayer && gisLayers?.major_roads && (
            <GeoJSON
              data={gisLayers.major_roads}
              style={{
                color: '#f59e0b',
                weight: 4,
                opacity: 0.85,
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <div style="font-family: system-ui; font-size: 12px; padding: 4px;">
                    <strong style="color: #b45309;">${feature.properties.name}</strong><br/>
                    <span>Classification: ${feature.properties.category}</span><br/>
                    <span>Lanes: ${feature.properties.lanes}</span>
                  </div>
                `);
              }}
            />
          )}

          {/* Complaint Point Markers */}
          {showComplaintsLayer &&
            filteredComplaints.map((c) => {
              const isSelected = activeComplaintId === c.id;
              return (
                <Marker
                  key={c.id}
                  position={[c.latitude, c.longitude]}
                  icon={createComplaintIcon(c.issue_type, isSelected)}
                >
                  <Popup>
                    <div className="p-1 min-w-[210px] space-y-2 text-xs">
                      {/* Photo Thumbnail */}
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <img
                          src={getMediaUrl(c.photo)}
                          alt={c.issue_type}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getMediaUrl('/uploads/pothole_1.svg');
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{c.complaint_number}</span>
                          <span className="font-semibold text-slate-700">{c.issue_type}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.address}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Status: <strong>{c.status}</strong></span>
                        <span className="text-slate-500 font-medium">Priority: <strong>{c.priority}</strong></span>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Reported: {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>

                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-center text-xs transition cursor-pointer"
                      >
                        View Full Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-lg border border-slate-200 text-xs space-y-2 pointer-events-auto max-w-[220px]">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>Map Symbology</span>
            <span className="text-[10px] font-normal text-slate-400">CSMC GIS</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white shadow-xs"></span>
              <span className="text-slate-700">🕳️ Pothole</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white shadow-xs"></span>
              <span className="text-slate-700">💡 Broken Streetlight</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981] border border-white shadow-xs"></span>
              <span className="text-slate-700">🗑️ Garbage Accumulation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06b6d4] border border-white shadow-xs"></span>
              <span className="text-slate-700">💧 Water Leakage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8b5cf6] border border-white shadow-xs"></span>
              <span className="text-slate-700">🛣️ Damaged Road</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
