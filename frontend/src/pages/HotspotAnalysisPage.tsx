import React, { useState, useMemo, useEffect } from 'react';
import { Complaint, HotspotCluster } from '../types';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { Flame, Layers, Sliders, MapPin, AlertCircle, ArrowUpRight } from 'lucide-react';
import { createComplaintIcon } from '../utils/leafletIcons';

interface HotspotAnalysisPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
}

// Controller to zoom to selected hotspot
function ZoomToHotspot({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export const HotspotAnalysisPage: React.FC<HotspotAnalysisPageProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  // Radius options in meters: 250m, 500m, 1000m (1km)
  const [radiusMeters, setRadiusMeters] = useState<number>(500);
  const [selectedClusterTarget, setSelectedClusterTarget] = useState<[number, number] | null>(null);

  // Compute Turf.js spatial clustering
  const clusters: HotspotCluster[] = useMemo(() => {
    if (complaints.length === 0) return [];

    const radiusKm = radiusMeters / 1000;
    const visited = new Set<number>();
    const resultClusters: HotspotCluster[] = [];

    // Convert complaints to turf points
    const features = complaints.map((c) =>
      turf.point([c.longitude, c.latitude], { complaint: c })
    );

    for (let i = 0; i < features.length; i++) {
      if (visited.has(i)) continue;

      const seedPoint = features[i];
      const memberIndices: number[] = [i];

      for (let j = 0; j < features.length; j++) {
        if (i !== j && !visited.has(j)) {
          const targetPoint = features[j];
          const distKm = turf.distance(seedPoint, targetPoint, { units: 'kilometers' });
          if (distKm <= radiusKm) {
            memberIndices.push(j);
          }
        }
      }

      // Hotspot threshold rule (Section 18):
      // Low Hotspot: 3–4 complaints
      // Medium Hotspot: 5–9 complaints
      // High Hotspot: 10+ complaints
      if (memberIndices.length >= 3) {
        memberIndices.forEach((idx) => visited.add(idx));

        const clusterComplaints = memberIndices.map((idx) => complaints[idx]);

        // Calculate center using Turf
        const clusterFeatureCollection = turf.featureCollection(
          memberIndices.map((idx) => features[idx])
        );
        const centerPoint = turf.center(clusterFeatureCollection);
        const centerCoords: [number, number] = [
          centerPoint.geometry.coordinates[1],
          centerPoint.geometry.coordinates[0],
        ];

        // Determine dominant issue type
        const issueCounts: Record<string, number> = {};
        let highPriorityCount = 0;
        clusterComplaints.forEach((c) => {
          issueCounts[c.issue_type] = (issueCounts[c.issue_type] || 0) + 1;
          if (c.priority === 'High') highPriorityCount++;
        });

        let mainIssue = 'Pothole';
        let maxCount = 0;
        Object.entries(issueCounts).forEach(([iss, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            mainIssue = iss;
          }
        });

        // Determine dominant locality name
        const localityTokens: Record<string, number> = {};
        clusterComplaints.forEach((c) => {
          const part = c.address.split(',')[0].trim();
          localityTokens[part] = (localityTokens[part] || 0) + 1;
        });
        const dominantArea = Object.keys(localityTokens).reduce((a, b) =>
          localityTokens[a] > localityTokens[b] ? a : b
        );

        const count = clusterComplaints.length;
        let densityLevel: 'High' | 'Medium' | 'Low' = 'Low';
        if (count >= 10) densityLevel = 'High';
        else if (count >= 5) densityLevel = 'Medium';

        resultClusters.push({
          id: `hotspot-${i}`,
          center: centerCoords,
          radius: radiusMeters,
          complaints: clusterComplaints,
          count,
          mainIssue,
          highPriorityCount,
          densityLevel,
          dominantArea,
        });
      }
    }

    // Sort by count descending
    return resultClusters.sort((a, b) => b.count - a.count);
  }, [complaints, radiusMeters]);

  const highHotspots = clusters.filter((c) => c.densityLevel === 'High');
  const mediumHotspots = clusters.filter((c) => c.densityLevel === 'Medium');
  const lowHotspots = clusters.filter((c) => c.densityLevel === 'Low');

  const getHotspotColor = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High':
        return '#ef4444'; // Red
      case 'Medium':
        return '#f97316'; // Orange
      case 'Low':
        return '#eab308'; // Yellow
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-black text-slate-900">GIS Hotspot Analysis</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Turf.js Spatial Clustering
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identify municipal areas where civic complaints are heavily concentrated within distance thresholds.
          </p>
        </div>

        {/* Radius selector (250m, 500m, 1km) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Analysis Radius:</span>
          </span>
          {[250, 500, 1000].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusMeters(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                radiusMeters === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspot Threshold Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">🔴 High Hotspot (10+)</div>
            <div className="text-2xl font-black text-red-900 mt-1">{highHotspots.length} Clusters</div>
            <div className="text-[11px] text-red-600">Dense concentrations</div>
          </div>
          <div className="text-3xl">🚨</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-700">🟠 Medium Hotspot (5–9)</div>
            <div className="text-2xl font-black text-orange-900 mt-1">{mediumHotspots.length} Clusters</div>
            <div className="text-[11px] text-orange-600">Moderate clusters</div>
          </div>
          <div className="text-3xl">⚠️</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">🟡 Low Hotspot (3–4)</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{lowHotspots.length} Clusters</div>
            <div className="text-[11px] text-amber-600">Emerging problem sites</div>
          </div>
          <div className="text-3xl">📍</div>
        </div>
      </div>

      {/* Map Display of Hotspots */}
      <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <MapContainer
          center={[19.8762, 75.3433]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomToHotspot target={selectedClusterTarget} />

          {/* Hotspot Circles */}
          {clusters.map((cluster) => {
            const color = getHotspotColor(cluster.densityLevel);
            return (
              <Circle
                key={cluster.id}
                center={cluster.center}
                radius={cluster.radius}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: cluster.densityLevel === 'High' ? 0.35 : cluster.densityLevel === 'Medium' ? 0.25 : 0.18,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs font-sans min-w-[200px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <Flame className="w-4 h-4 text-rose-600" />
                      <span>Civic Issue Hotspot</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Area:</span>
                        <strong className="text-slate-800 text-right truncate max-w-[130px]">
                          {cluster.dominantArea}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Complaints:</span>
                        <strong className="text-slate-900 font-mono text-sm">{cluster.count}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Main Issue:</span>
                        <strong className="text-blue-700">{cluster.mainIssue}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">High Priority:</span>
                        <strong className="text-rose-600">{cluster.highPriorityCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Clustering Radius:</span>
                        <span className="font-mono text-slate-700">{cluster.radius}m</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Density Level: <strong>{cluster.densityLevel}</strong>
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Markers inside the hotspots */}
          {complaints.map((c) => (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={createComplaintIcon(c.issue_type)}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold text-slate-800">{c.complaint_number}</div>
                  <div className="text-slate-600">{c.issue_type}</div>
                  <div className="text-[11px] text-slate-500">{c.address}</div>
                  <button
                    onClick={() => onSelectComplaint(c)}
                    className="mt-1 text-blue-600 font-semibold underline block cursor-pointer"
                  >
                    View Complaint
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl shadow-lg border border-slate-200 text-xs space-y-2 pointer-events-auto">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            Hotspot Density Index
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/40 border-2 border-red-500"></span>
              <span className="text-slate-700 font-medium">🔴 High Hotspot (10+ reports)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500/40 border-2 border-orange-500"></span>
              <span className="text-slate-700 font-medium">🟠 Medium Hotspot (5–9 reports)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/40 border-2 border-yellow-500"></span>
              <span className="text-slate-700 font-medium">🟡 Low Hotspot (3–4 reports)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Hotspot Table (Section 23) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">Issue Hotspot Summary Table</h3>
            <p className="text-xs text-slate-500">
              Ranked concentration zones in Chhatrapati Sambhajinagar (Click any row to zoom map)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Radius: {radiusMeters}m</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">Area / Locality</th>
                <th className="py-3 px-4 text-center">Complaints Count</th>
                <th className="py-3 px-4">Main Issue</th>
                <th className="py-3 px-4 text-center">High Priority</th>
                <th className="py-3 px-4">Density Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {clusters.map((cluster) => (
                <tr
                  key={cluster.id}
                  onClick={() => setSelectedClusterTarget(cluster.center)}
                  className="hover:bg-slate-50 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-rose-700">
                    {cluster.dominantArea}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-sm bg-slate-100 px-2 py-0.5 rounded-full text-slate-800">
                      {cluster.count}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{cluster.mainIssue}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {cluster.highPriorityCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        cluster.densityLevel === 'High'
                          ? 'bg-red-100 text-red-800'
                          : cluster.densityLevel === 'Medium'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {cluster.densityLevel} Density
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClusterTarget(cluster.center);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Zoom Map</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
