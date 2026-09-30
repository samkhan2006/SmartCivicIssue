import React, { useState } from 'react';
import { IssueType, ComplaintPriority, Complaint } from '../types';
import { createComplaint } from '../api';
import { createLocationPickerIcon } from '../utils/leafletIcons';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Camera,
  Upload,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface ReportIssuePageProps {
  onSuccess: (newComplaint: Complaint) => void;
  onTrackComplaint: (complaint: Complaint) => void;
}

// Subcomponent to handle clicking on the Leaflet map to adjust location
function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
      icon={createLocationPickerIcon()}
    />
  );
}

// Controller to fly map to new position when GPS triggers
function MapCenterController({ position }: { position: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(position, 16);
  }, [position, map]);
  return null;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onSuccess,
  onTrackComplaint,
}) => {
  // Chhatrapati Sambhajinagar default center
  const DEFAULT_LAT = 19.8762;
  const DEFAULT_LNG = 75.3433;

  const [issueType, setIssueType] = useState<IssueType>('Pothole');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [address, setAddress] = useState('Kranti Chowk, Chhatrapati Sambhajinagar');
  const [position, setPosition] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [isGpsCaptured, setIsGpsCaptured] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset locations in Chhatrapati Sambhajinagar
  const quickLocalities = [
    { name: 'Kranti Chowk', lat: 19.8748, lng: 75.3212 },
    { name: 'CIDCO Cannaught', lat: 19.8782, lng: 75.3552 },
    { name: 'Seven Hills', lat: 19.8765, lng: 75.3415 },
    { name: 'Nirala Bazar', lat: 19.8790, lng: 75.3245 },
    { name: 'Garkheda Parisar', lat: 19.8550, lng: 75.3410 },
    { name: 'TV Centre HUDCO', lat: 19.9050, lng: 75.3620 },
  ];

  // Geolocation capture
  const handleUseCurrentLocation = () => {
    setGpsLoading(true);
    setGpsMessage(null);

    if (!('geolocation' in navigator)) {
      setGpsMessage('Geolocation is not supported by your browser. Please click on the map.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setIsGpsCaptured(true);
        setGpsLoading(false);
        setGpsMessage(`GPS coordinates captured! Accuracy: ±${Math.round(pos.coords.accuracy)}m`);
        setAddress(`GPS Location near Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}, Chhatrapati Sambhajinagar`);
      },
      (err) => {
        setGpsLoading(false);
        setIsGpsCaptured(false);
        let msg = 'Location permission was not granted. Please select the issue location manually on the map.';
        if (err.code === err.TIMEOUT) {
          msg = 'GPS request timed out. Please select the issue location manually on the map.';
        }
        setGpsMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoPreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the civic problem.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('issue_type', issueType);
      formData.append('description', description.trim());
      formData.append('latitude', position[0].toString());
      formData.append('longitude', position[1].toString());
      formData.append('address', address.trim());
      formData.append('priority', priority);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const created = await createComplaint(formData);
      setSubmittedComplaint(created);
      onSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // If complaint submitted successfully, show confirmation screen
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-200" />
            </div>
            <h2 className="text-2xl font-black">Complaint Submitted Successfully</h2>
            <p className="text-emerald-100 text-sm">
              Your report has been geotagged and forwarded to Chhatrapati Sambhajinagar Municipal Corporation.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Complaint ID:</span>
                <span className="font-bold text-blue-700 text-base">{submittedComplaint.complaint_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Issue Category:</span>
                <span className="font-semibold text-slate-800">{submittedComplaint.issue_type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Status:</span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {submittedComplaint.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">GPS Geotag:</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {submittedComplaint.latitude.toFixed(4)}° N, {submittedComplaint.longitude.toFixed(4)}° E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Location:</span>
                <span className="text-xs text-slate-700 font-sans text-right max-w-xs">{submittedComplaint.address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onTrackComplaint(submittedComplaint)}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setDescription('');
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Report a Civic Problem</h1>
        <p className="text-sm text-slate-500">
          Geotag and submit potholes, streetlights, garbage, water leaks or road damages in Chhatrapati Sambhajinagar.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Issue Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
            >
              <option value="Pothole">🕳️ Pothole</option>
              <option value="Broken Streetlight">💡 Broken Streetlight</option>
              <option value="Garbage Accumulation">🗑️ Garbage Accumulation</option>
              <option value="Water Leakage">💧 Water Leakage</option>
              <option value="Damaged Road">🛣️ Damaged Road</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Urgency / Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
            >
              <option value="High">🔴 High Priority (Safety Hazard)</option>
              <option value="Medium">🟠 Medium Priority (Normal)</option>
              <option value="Low">⚪ Low Priority (Minor Inconvenience)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Description of Problem <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Large pothole near the main road causing difficulty for vehicles."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Photo Upload with Preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Complaint Photo Evidence</span>
            <span className="text-[11px] text-slate-400 font-normal">Optional (auto-placeholder provided if omitted)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/20">
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
              <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP from camera or gallery</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-16/9 bg-slate-100 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  📷
                </div>
                <span>If no photo is selected, a standardized municipal issue graphic will be attached automatically.</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Geotagged Location <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500">Capture using GPS or adjust directly by clicking on the map</p>
            </div>

            {/* Use My Current Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Capturing GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {/* GPS Feedback Message */}
          {gpsMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                isGpsCaptured
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{gpsMessage}</span>
            </div>
          )}

          {/* Quick Locality Jump Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] shrink-0">Study Localities:</span>
            {quickLocalities.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  setPosition([loc.lat, loc.lng]);
                  setAddress(`${loc.name}, Chhatrapati Sambhajinagar`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Interactive Leaflet Location Picker Map */}
          <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner">
            <MapContainer
              center={position}
              zoom={14}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterController position={position} />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>

            <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg shadow-sm text-[11px] font-medium text-slate-700 pointer-events-none border border-slate-200">
              💡 Tip: Click or drag marker on map to adjust coordinates
            </div>
          </div>

          {/* Coordinate Readout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-500 font-sans">Captured Coordinates:</span>
              <span className="font-bold text-slate-800">
                Lat: {position[0].toFixed(5)}, Long: {position[1].toFixed(5)}
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Locality / Landmark Name"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Geotagging & Submitting to Municipal DB...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
