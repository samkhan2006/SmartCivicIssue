import React from 'react';
import { Layers, MapPin, Download, ExternalLink, ShieldCheck, Terminal, Compass, BookOpen } from 'lucide-react';
import { downloadGeoJSON } from '../api';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          College GIS Project Prototype
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          SmartCivic — GIS-Based Civic Issue Reporting and Monitoring System
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          An interactive municipal Geographic Information System (GIS) designed for citizens and municipal administrators of <strong>Chhatrapati Sambhajinagar (Aurangabad), Maharashtra</strong>. Demonstrates spatial geotagging, proximity buffer calculations, spatial clustering, and open GIS data interoperability.
        </p>
      </div>

      {/* GIS Workflow Section (Section 29) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">End-to-End GIS Workflow</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          {[
            { step: '1', title: 'Citizen Report', desc: 'Category & photo selection' },
            { step: '2', title: 'GPS Geotagging', desc: 'Browser GPS / Leaflet picker' },
            { step: '3', title: 'Spatial Database', desc: 'SQLite point storage (WGS 84)' },
            { step: '4', title: 'Interactive Map', desc: 'Dynamic Leaflet vector markers' },
            { step: '5', title: 'Spatial Filtering', desc: 'Multi-criteria GIS queries' },
            { step: '6', title: 'Proximity Analysis', desc: 'Turf.js buffer distance' },
            { step: '7', title: 'Hotspot Analysis', desc: 'Distance clustering (250m-1km)' },
            { step: '8', title: 'Municipal Action', desc: 'Status tracking & QGIS export' },
          ].map((item) => (
            <div key={item.step} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] inline-flex items-center justify-center">
                {item.step}
              </span>
              <div className="font-bold text-slate-800 text-xs mt-1">{item.title}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QGIS Workflow & Compatibility (Section 30 & 31) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">QGIS Interoperability & Workflow</h2>
          </div>
          <button
            onClick={downloadGeoJSON}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download GeoJSON</span>
          </button>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl font-mono text-xs overflow-x-auto">
          Complaint Data (Web GIS) → GeoJSON Export → QGIS Import → Hotspot / Spatial Analysis → Thematic Map
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <h3 className="font-bold text-slate-800 text-sm">How to import into QGIS:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the <strong>Download GeoJSON</strong> button to export <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">smartcivic_complaints.geojson</code>.</li>
            <li>In QGIS Desktop (3.x), navigate to <strong>Layer → Add Layer → Add Vector Layer...</strong></li>
            <li>Select the downloaded <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">.geojson</code> file. QGIS will immediately parse point geometries in EPSG:4326 (WGS 84).</li>
            <li>Right-click the imported layer → <strong>Properties → Symbology</strong>. Select <em>Categorized</em> by <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">issue_type</code> to generate custom civic symbology.</li>
            <li>To generate a continuous raster density map in QGIS, search for <strong>Heatmap (Kernel Density Estimation)</strong> in the Processing Toolbox with a 500m radius.</li>
          </ol>
        </div>
      </div>

      {/* Google Earth Engine (GEE) Compatibility Note (Section 32) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Google Earth Engine (GEE) Compatibility</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          This application maintains strict vector compatibility with Google Earth Engine (GEE). The exported complaints FeatureCollection can be uploaded to GEE Assets as a <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ee.FeatureCollection</code>. This enables prospective overlay analysis with Sentinel-2 satellite imagery, Normalized Difference Vegetation Index (NDVI), urban built-up area rasters, and monsoon surface drainage indices for Chhatrapati Sambhajinagar.
        </p>
      </div>

      {/* Demo Credentials & Academic Notice (Section 2, 25) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Demo Access Credentials</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-emerald-700 block mb-1">Citizen Portal:</strong>
              <div>Email: <code className="font-mono font-bold">citizen@demo.com</code></div>
              <div>Password: <code className="font-mono font-bold">123456</code></div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-blue-700 block mb-1">Municipal Admin Portal:</strong>
              <div>Email: <code className="font-mono font-bold">admin@demo.com</code></div>
              <div>Password: <code className="font-mono font-bold">admin123</code></div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="font-bold text-amber-900 text-sm mb-1">Academic Dataset Notice</div>
            <p className="text-xs text-amber-800 leading-relaxed">
              All complaint records, coordinates, and photo assets provided in this prototype are generated for <strong>academic and educational demonstration purposes</strong>. While locations and road networks reflect real landmarks in Chhatrapati Sambhajinagar, Maharashtra, this data does not represent live operational records of the municipal corporation.
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            SmartCivic Academic GIS v1.0
          </div>
        </div>
      </div>
    </div>
  );
};
