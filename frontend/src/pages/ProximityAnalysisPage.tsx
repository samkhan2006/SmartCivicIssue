import React, { useState, useMemo, useEffect } from 'react';
import { Complaint } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { Target, Search, MapPin, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import { createComplaintIcon, createProximityFocusIcon, ISSUE_ICONS } from '../utils/leafletIcons';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface ProximityAnalysisPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
}

function ZoomToSelected({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 16, { duration: 1 });
    }
  }, [target, map]);
  return null;
}

export const ProximityAnalysisPage: React.FC<ProximityAnalysisPageProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  // Selected focal complaint
  const [selectedId, setSelectedId] = useState<number>(complaints[0]?.id || 1);
  // Radius in meters: 100m, 250m, 500m, 1000m (1km)
  const [radiusMeters, setRadiusMeters] = useState<number>(500);

  const focalComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedId) || complaints[0];
  }, [complaints, selectedId]);

  // Compute nearby complaints using Turf.js distance
  const nearbyComplaintsWithDistance = useMemo(() => {
    if (!focalComplaint) return [];

    const focalPoint = turf.point([focalComplaint.longitude, focalComplaint.latitude]);

    const results: { complaint: Complaint; distanceMeters: number }[] = [];

    complaints.forEach((c) => {
      if (c.id !== focalComplaint.id) {
        const candidatePoint = turf.point([c.longitude, c.latitude]);
        const distKm = turf.distance(focalPoint, candidatePoint, { units: 'kilometers' });
        const distM = Math.round(distKm * 1000);

        if (distM <= radiusMeters) {
          results.push({ complaint: c, distanceMeters: distM });
        }
      }
    });

    // Sort by nearest first
    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [complaints, focalComplaint, radiusMeters]);

  const nearbyIds = useMemo(() => {
    return new Set(nearbyComplaintsWithDistance.map((r) => r.complaint.id));
  }, [nearbyComplaintsWithDistance]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900">Proximity Buffer Analysis</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Turf.js Geodesic Distance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze spatial correlation by discovering civic issues occurring within a specified radius of any complaint.
          </p>
        </div>

        {/* Radius buffer selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 px-2">Proximity Radius:</span>
          {[100, 250, 500, 1000].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusMeters(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                radiusMeters === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </button>
          ))}
        </div>
      </div>

      {/* Selector & Result Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropdown to pick focal complaint */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Focal Complaint
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {complaints.map((c) => (
              <option key={c.id} value={c.id}>
                {c.complaint_number} - {c.issue_type} ({c.address.split(',')[0]})
              </option>
            ))}
          </select>
          {focalComplaint && (
            <div className="text-[11px] text-slate-500 pt-1">
              📍 {focalComplaint.address}
            </div>
          )}
        </div>

        {/* Proximity Metrics Banner */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Proximity Query Output
              </span>
              <h3 className="text-xl font-black mt-0.5">
                {focalComplaint?.complaint_number} ({focalComplaint?.issue_type})
              </h3>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-white/20">
              Radius: {radiusMeters} meters
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/15">
            <div>
              <span className="text-[11px] text-blue-200 block">Nearby Complaints</span>
              <span className="text-2xl font-black">{nearbyComplaintsWithDistance.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-blue-200 block">Immediate Buffer</span>
              <span className="text-sm font-bold">{radiusMeters} meters</span>
            </div>
            <div>
              <span className="text-[11px] text-blue-200 block">Focal Coordinates</span>
              <span className="text-xs font-mono">
                {focalComplaint?.latitude.toFixed(4)}°, {focalComplaint?.longitude.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Showing Buffer Circle and Highlighted Nearby Points */}
      <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        {focalComplaint && (
          <MapContainer
            center={[focalComplaint.latitude, focalComplaint.longitude]}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomToSelected target={[focalComplaint.latitude, focalComplaint.longitude]} />

            {/* Proximity Buffer Circle (Turf / Leaflet Circle) */}
            <Circle
              center={[focalComplaint.latitude, focalComplaint.longitude]}
              radius={radiusMeters}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.16,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong>Proximity Zone</strong><br />
                  Radius: {radiusMeters}m around {focalComplaint.complaint_number}
                </div>
              </Popup>
            </Circle>

            {/* Focal Point Marker */}
            <Marker
              position={[focalComplaint.latitude, focalComplaint.longitude]}
              icon={createProximityFocusIcon()}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-blue-700">FOCAL COMPLAINT: {focalComplaint.complaint_number}</strong><br />
                  <span>{focalComplaint.issue_type}</span><br />
                  <span className="text-slate-500">{focalComplaint.address}</span>
                </div>
              </Popup>
            </Marker>

            {/* All other complaints, highlighting those within proximity */}
            {complaints.map((c) => {
              if (c.id === focalComplaint.id) return null;
              const isNearby = nearbyIds.has(c.id);

              return (
                <Marker
                  key={c.id}
                  position={[c.latitude, c.longitude]}
                  icon={createComplaintIcon(c.issue_type, isNearby)}
                  opacity={isNearby ? 1.0 : 0.4}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-slate-800">{c.complaint_number}</div>
                      <div className="text-slate-600">{c.issue_type}</div>
                      <div className="text-[11px] text-slate-500">{c.address}</div>
                      {isNearby && (
                        <div className="text-xs text-blue-700 font-bold bg-blue-50 p-1 rounded">
                          🎯 In Buffer: ~{nearbyComplaintsWithDistance.find((r) => r.complaint.id === c.id)?.distanceMeters}m away
                        </div>
                      )}
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="mt-1 text-blue-600 underline block cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-lg border border-slate-200 text-xs space-y-1">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Proximity Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-300"></span>
            <span className="text-slate-700">🎯 Focal Subject Complaint</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></span>
            <span className="text-slate-700">Highlighted Markers: Inside {radiusMeters}m Buffer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">Dimmed: Outside Selected Buffer</span>
          </div>
        </div>
      </div>

      {/* Nearby Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Complaints within {radiusMeters} meters ({nearbyComplaintsWithDistance.length})
            </h3>
            <p className="text-xs text-slate-500">
              Calculated using Turf.js spherical geodesic distance from {focalComplaint?.complaint_number}
            </p>
          </div>
        </div>

        {nearbyComplaintsWithDistance.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No other complaints found within {radiusMeters}m of this location. Try expanding the radius to 500m or 1km.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Address / Locality</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {nearbyComplaintsWithDistance.map(({ complaint: c, distanceMeters }) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {distanceMeters} m
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.complaint_number}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5">
                        <span>{ISSUE_ICONS[c.issue_type]}</span>
                        <span>{c.issue_type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{c.address}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
