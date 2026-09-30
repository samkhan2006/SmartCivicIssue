import React, { useState, useMemo } from 'react';
import { Complaint } from '../types';
import { MapContainer, TileLayer, Circle, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, MapPin, Layers, ArrowUpRight, TrendingUp, ShieldAlert } from 'lucide-react';
import { createComplaintIcon, ISSUE_ICONS } from '../utils/leafletIcons';

interface RepeatedProblemsPageProps {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
}

function ZoomToCorridor({ target }: { target: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1 });
    }
  }, [target, map]);
  return null;
}

interface CorridorAnalysis {
  name: string;
  keyLocality: string;
  center: [number, number];
  bounds: [[number, number], [number, number], [number, number], [number, number]];
  complaints: Complaint[];
  total: number;
  issueCounts: Record<string, number>;
  primaryProblem: string;
  recurrenceScore: 'Critical' | 'Severe' | 'Moderate';
  wardZone: string;
}

export const RepeatedProblemsPage: React.FC<RepeatedProblemsPageProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);

  // Key civic corridors in Chhatrapati Sambhajinagar
  const corridors = useMemo(() => {
    const definitions = [
      {
        name: 'Kranti Chowk & Station Road Commercial Corridor',
        keyLocality: 'Kranti Chowk',
        center: [19.8745, 75.3210] as [number, number],
        wardZone: 'Zone 1: Central Heritage',
        bounds: [
          [19.8630, 75.3100],
          [19.8860, 75.3100],
          [19.8860, 75.3300],
          [19.8630, 75.3300],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('Kranti Chowk') ||
          c.address.includes('Station Road') ||
          c.address.includes('Nirala Bazar') ||
          c.address.includes('Osmanpura') ||
          c.address.includes('Gulmandi') ||
          c.address.includes('Padampura'),
      },
      {
        name: 'CIDCO Cannaught Place & Sectors N-1 to N-6',
        keyLocality: 'CIDCO Town Centre',
        center: [19.8778, 75.3550] as [number, number],
        wardZone: 'Zone 2: CIDCO & HUDCO North',
        bounds: [
          [19.8700, 75.3440],
          [19.8880, 75.3440],
          [19.8880, 75.3640],
          [19.8700, 75.3640],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('CIDCO') ||
          c.address.includes('Cannaught') ||
          c.address.includes('MGM Hospital'),
      },
      {
        name: 'Jalna Road Arterial Highway (Seven Hills to Mondha Naka)',
        keyLocality: 'Seven Hills',
        center: [19.8765, 75.3420] as [number, number],
        wardZone: 'Central Arterial Trunk',
        bounds: [
          [19.8710, 75.3260],
          [19.8820, 75.3260],
          [19.8820, 75.3700],
          [19.8710, 75.3700],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('Jalna Road') ||
          c.address.includes('Seven Hills') ||
          c.address.includes('Akashwani') ||
          c.address.includes('Mondha Naka'),
      },
      {
        name: 'Garkheda Stadium & Beed Bypass Southern Belt',
        keyLocality: 'Garkheda Parisar',
        center: [19.8520, 75.3380] as [number, number],
        wardZone: 'Zone 3: Garkheda & South Suburbs',
        bounds: [
          [19.8400, 75.3280],
          [19.8650, 75.3280],
          [19.8650, 75.3500],
          [19.8400, 75.3500],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('Garkheda') ||
          c.address.includes('Ulkanagri') ||
          c.address.includes('Sutgirni') ||
          c.address.includes('Beed Bypass') ||
          c.address.includes('Renuka Mata'),
      },
      {
        name: 'Begumpura, Panchakki & University Campus Road',
        keyLocality: 'Begumpura',
        center: [19.9020, 75.3180] as [number, number],
        wardZone: 'Zone 1: North Heritage',
        bounds: [
          [19.8900, 75.3080],
          [19.9100, 75.3080],
          [19.9100, 75.3300],
          [19.8900, 75.3300],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('Panchakki') ||
          c.address.includes('Begumpura') ||
          c.address.includes('BAMU') ||
          c.address.includes('Bhadkal') ||
          c.address.includes('Delhi Gate'),
      },
      {
        name: 'TV Centre Chowk & HUDCO Northern Sector',
        keyLocality: 'TV Centre',
        center: [19.9050, 75.3620] as [number, number],
        wardZone: 'Zone 2: HUDCO North',
        bounds: [
          [19.8980, 75.3500],
          [19.9280, 75.3500],
          [19.9280, 75.3780],
          [19.8980, 75.3780],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('TV Centre') ||
          c.address.includes('HUDCO') ||
          c.address.includes('Jadhavwadi') ||
          c.address.includes('Harsul'),
      },
      {
        name: 'Chikalthana MIDC & Mukundwadi Industrial Corridor',
        keyLocality: 'Mukundwadi / Chikalthana',
        center: [19.8820, 75.3850] as [number, number],
        wardZone: 'Zone 4: Eastern Corridor',
        bounds: [
          [19.8650, 75.3680],
          [19.8950, 75.3680],
          [19.8950, 75.4050],
          [19.8650, 75.4050],
        ] as [[number, number], [number, number], [number, number], [number, number]],
        matchPattern: (c: Complaint) =>
          c.address.includes('Mukundwadi') ||
          c.address.includes('Chikalthana') ||
          c.address.includes('Prozone'),
      },
    ];

    return definitions.map((def) => {
      const matched = complaints.filter(def.matchPattern);
      const issueCounts: Record<string, number> = {};
      matched.forEach((c) => {
        issueCounts[c.issue_type] = (issueCounts[c.issue_type] || 0) + 1;
      });

      let primaryProblem = 'Potholes';
      let maxCnt = 0;
      Object.entries(issueCounts).forEach(([iss, cnt]) => {
        if (cnt > maxCnt) {
          maxCnt = cnt;
          primaryProblem = iss;
        }
      });

      const total = matched.length;
      let recurrenceScore: 'Critical' | 'Severe' | 'Moderate' = 'Moderate';
      if (total >= 10) recurrenceScore = 'Critical';
      else if (total >= 6) recurrenceScore = 'Severe';

      return {
        ...def,
        complaints: matched,
        total,
        issueCounts,
        primaryProblem,
        recurrenceScore,
      } as CorridorAnalysis;
    }).sort((a, b) => b.total - a.total);
  }, [complaints]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-black text-slate-900">Repeated Infrastructure Problem Areas</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Spatial Recurrence Detection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identifies specific road networks and municipal wards in Chhatrapati Sambhajinagar with persistent, recurring defects.
          </p>
        </div>
      </div>

      {/* Corridor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {corridors.slice(0, 6).map((corridor) => (
          <div
            key={corridor.name}
            onClick={() => setTargetCenter(corridor.center)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {corridor.wardZone}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition leading-snug">
                    {corridor.name}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    corridor.recurrenceScore === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : corridor.recurrenceScore === 'Severe'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {corridor.recurrenceScore} Recurrence
                </span>
              </div>

              {/* Issue breakdown counts */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <span>Total Recurring Issues:</span>
                  <span className="font-mono text-blue-700 text-sm">{corridor.total}</span>
                </div>
                {Object.entries(corridor.issueCounts).map(([issue, cnt]) => (
                  <div key={issue} className="flex justify-between text-slate-600 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span>{ISSUE_ICONS[issue as any]}</span>
                      <span>{issue}:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-700">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Primary: {corridor.primaryProblem}</span>
              <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                <span>Zoom on Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Map Showing Corridors and Polygons */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
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

          <ZoomToCorridor target={targetCenter} />

          {/* Draw Polygon for each recurring problem corridor */}
          {corridors.map((corridor) => (
            <Polygon
              key={corridor.name}
              positions={corridor.bounds}
              pathOptions={{
                color: corridor.recurrenceScore === 'Critical' ? '#ef4444' : '#f59e0b',
                fillColor: corridor.recurrenceScore === 'Critical' ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-slate-900">{corridor.name}</div>
                  <div className="text-slate-600">Total Recurring Complaints: <strong>{corridor.total}</strong></div>
                  <div className="text-blue-700">Primary Problem: {corridor.primaryProblem}</div>
                  <div className="text-rose-600 font-semibold">{corridor.recurrenceScore} Priority</div>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Complaint markers */}
          {complaints.map((c) => (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={createComplaintIcon(c.issue_type)}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold">{c.complaint_number}</div>
                  <div>{c.issue_type}</div>
                  <div className="text-slate-500 text-[11px]">{c.address}</div>
                  <button
                    onClick={() => onSelectComplaint(c)}
                    className="mt-1 text-blue-600 underline block cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl shadow-lg border border-slate-200 text-xs space-y-1.5">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Corridor Boundary Index</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-red-500/20 border-2 border-red-500 rounded"></span>
            <span className="text-slate-700">Critical Recurring Zone (10+ reports)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-amber-500/20 border-2 border-amber-500 rounded"></span>
            <span className="text-slate-700">Severe Recurring Zone (6–9 reports)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
