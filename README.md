# SmartCivic — GIS-Based Civic Issue Reporting and Monitoring System

### Urban Study Area: Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India

A simple, functional, and presentation-ready GIS web application developed for a college Geographic Information System (GIS) project. The application empowers citizens to report civic and infrastructure problems with GPS geotagging and photo evidence, while providing municipal administrators with interactive GIS spatial analysis tools including hotspot clustering, proximity buffers, repeated problem corridor detection, and one-click QGIS GeoJSON export.

---

## 1. Project Title
**SmartCivic — GIS-Based Civic Issue Reporting and Monitoring System**  
*College Geographic Information System (GIS) Academic Prototype*

---

## 2. Problem Statement
Urban municipal corporations frequently face delays in identifying, verifying, and prioritizing infrastructure failures such as potholes, non-functional streetlights, illegal garbage dumping, water pipe bursts, and asphalt degradation. Traditional complaint portals often lack precise geographic coordinates, resulting in misallocated maintenance crews, inability to detect recurring infrastructure failure zones, and lack of spatial interoperability with municipal GIS software like QGIS.

**SmartCivic** resolves this challenge by establishing an end-to-end spatial workflow: capturing high-accuracy geographic coordinates via browser GPS geotagging, visualizing grievances on interactive web maps, calculating spatial clusters and proximity buffers with Turf.js, and enabling direct export to desktop GIS environments.

---

## 3. Objectives
1. **Accurate Geotagging:** Enable citizens to report civic grievances with GPS coordinates and interactive map coordinate adjustments.
2. **Interactive Web GIS Cartography:** Render complaints with distinct thematic symbology and interactive attribute popups over OpenStreetMap tiles.
3. **Spatial Clustering & Hotspot Identification:** Automatically group nearby complaints within configurable distance thresholds (250m, 500m, 1 km) using Turf.js geodesic algorithms.
4. **Proximity Buffer Queries:** Provide municipal engineers with radial buffer analysis tools to locate surrounding infrastructure defects within 100m to 1 km.
5. **Detection of Recurrent Problem Corridors:** Identify persistent infrastructure failure zones across major transit corridors in Chhatrapati Sambhajinagar (e.g., Jalna Road, Kranti Chowk, CIDCO, Beed Bypass).
6. **Desktop GIS Interoperability:** Support seamless export of the municipal complaint database to standard WGS 84 GeoJSON for desktop cartography in QGIS.

---

## 4. Key Features

### Citizen Capabilities
* **Civic Reporting:** Submit reports across 5 categories:
  * 🕳️ Pothole
  * 💡 Broken Streetlight
  * 🗑️ Garbage Accumulation
  * 💧 Water Leakage
  * 🛣️ Damaged Road
* **GPS Geotagging & Interactive Map Picker:** One-click "Use My Current Location" using the HTML5 Geolocation API, with fallback interactive Leaflet map dragging and pinpointing.
* **Photo Attachment:** Upload photo evidence with instant client-side preview (automatic standardized SVG graphic fallback provided).
* **Complaint Tracking:** Generates sequential complaint tracking numbers (`CIV-2026-XXX`) with full resolution lifecycle timeline tracking.
* **My Complaints View:** Filter submitted complaints by status (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Rejected`).

### Municipal Administrator Capabilities
* **Real-Time Telemetry Dashboard:** Live dynamic KPI metrics calculated directly from the database (Total Complaints, Pending, In Progress, Resolved, High Priority, Active Hotspots).
* **Interactive Issue Map:** Full-viewport Leaflet map with custom SVG pins for each issue category, interactive popups with photo thumbnails, and full-text search.
* **Multi-Criteria GIS Filters:** Filter markers dynamically by Issue Type, Resolution Status, and Urgency Priority.
* **GIS Layer Toggles:** Layer control panel to toggle Complaints points, Major Roads (Jalna Road NH-753F, Beed Bypass), CSMC Municipal Boundary, and Administrative Wards.
* **Hotspot Analysis Tool:** Spatial clustering based on Turf.js with user-selectable radius (250m, 500m, 1 km), visual density circles (High 10+, Medium 5–9, Low 3–4), and click-to-zoom hotspot table.
* **Proximity Buffer Tool ("Nearby Complaints"):** Select any complaint, pick buffer radius (100m, 250m, 500m, 1 km), calculate pairwise geodesic distances, and draw buffer circles.
* **Repeated Problem Area Analysis:** Corridor defect analysis tracking persistent issues along Jalna Road, Kranti Chowk, CIDCO N-1 to N-6, Garkheda, TV Centre, and Begumpura.
* **Municipal Reports & Print View:** Executive summary report with resolution rate KPI and browser print formatting.
* **QGIS GeoJSON Export:** Instant download of `smartcivic_complaints.geojson` formatted in EPSG:4326 (WGS 84).

---

## 5. Technology Stack

### Frontend
* **React 19** with **TypeScript**
* **Vite** (Next-generation lightning-fast bundler)
* **Tailwind CSS v4** (Modern municipal civic UI styling)
* **Leaflet & React-Leaflet** (Open-source interactive Web GIS map engine)
* **OpenStreetMap** (Free base map tiles without paid API keys)
* **Turf.js (`@turf/turf`)** (Client-side geospatial vector analysis)
* **Lucide React** (Clean civic iconography)

### Backend
* **Python 3.11**
* **FastAPI** (High-performance asynchronous Python REST API framework)
* **Uvicorn** (ASGI production server)
* **Python-Multipart** (Local file uploads for complaint photos)

### Database & Storage
* **SQLite (`smartcivic.db`)** (Lightweight, portable relational database)
* **Local File Storage (`backend/uploads/`)** (Serves uploaded citizen photos and sample civic issue SVG graphics)

---

## 6. GIS Concepts Demonstrated
* **Geotagging:** Association of real-world latitude and longitude coordinates (WGS 84 / EPSG:4326) with non-spatial attributes (problem type, photo, description).
* **Vector GIS Primitives:**
  * **Points:** Individual complaint locations with attributes.
  * **Lines (LineStrings):** Major transport corridors (Jalna Road, Beed Bypass, Station Road).
  * **Polygons:** CSMC municipal administrative boundary and ward divisions.
* **Thematic Cartography:** Color-coded categorical symbology representing issue types and priority levels.
* **Spatial Clustering (Hotspot Analysis):** Geodesic distance grouping using Turf.js to identify dense clusters of citizen reports.
* **Proximity Buffer Analysis:** Generation of circular radial buffer zones (100m–1 km) and Euclidean/Haversine distance calculation to quantify local issue density.
* **GIS Interoperability:** Translation between Web GIS relational rows and standard OGC GeoJSON FeatureCollections.

---

## 7. Installation Instructions

### Prerequisites
* **Node.js** (v18 or higher recommended; v24 verified)
* **Python** (v3.10 or higher; v3.11 verified)
* **Git** (optional)

### Clone / Navigate to Project Directory
```powershell
cd D:\Smart_Civic_Issue
```

### Backend Setup
1. Activate the Python virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
2. Install Python packages:
   ```powershell
   pip install fastapi uvicorn python-multipart pydantic
   ```
3. Initialize and seed the demo database (populates 67 realistic complaints in Chhatrapati Sambhajinagar):
   ```powershell
   python backend\seed_data.py
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```
2. Install Node dependencies:
   ```powershell
   npm install
   ```

---

## 8. How to Run Frontend
From the `frontend` directory:
```powershell
npm run dev
```
The frontend will start at: **`http://localhost:5173`**

---

## 9. How to Run Backend
From the project root (`D:\Smart_Civic_Issue`):
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend --reload
```
The backend API and interactive documentation will be accessible at:
* API Root: **`http://127.0.0.1:8000`**
* Interactive Swagger Docs: **`http://127.0.0.1:8000/docs`**
* Direct GeoJSON Feed: **`http://127.0.0.1:8000/api/complaints/geojson`**

> **Quick Launch:** Double-click **`start_all.bat`** in the project root to start both backend and frontend simultaneously in separate windows!

---

## 10. Demo Credentials
The application includes a built-in one-click role switcher in the navigation bar, as well as a dedicated login page:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@demo.com` | `123456` | Report issues, capture GPS, view personal submissions, track lifecycle |
| **Municipal Admin** | `admin@demo.com` | `admin123` | Dashboard, GIS map, change status, hotspots, proximity analysis, reports |

*(Clicking "Citizen" or "Admin" in the top navbar toggles between modes instantly during presentations).*

---

## 11. Database Structure

The SQLite database (`backend/smartcivic.db`) stores complaints in a single normalized table:

```sql
CREATE TABLE complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_number TEXT UNIQUE NOT NULL,      -- e.g. 'CIV-2026-001'
    issue_type TEXT NOT NULL,                   -- 'Pothole', 'Broken Streetlight', etc.
    description TEXT NOT NULL,                  -- Citizen problem description
    photo TEXT,                                 -- Relative file path in /uploads/
    latitude REAL NOT NULL,                     -- WGS84 Latitude (e.g. 19.8748)
    longitude REAL NOT NULL,                    -- WGS84 Longitude (e.g. 75.3212)
    address TEXT NOT NULL,                      -- Locality & Street name
    status TEXT NOT NULL DEFAULT 'Submitted',   -- 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'
    priority TEXT NOT NULL DEFAULT 'Medium',    -- 'Low', 'Medium', 'High'
    created_at TEXT NOT NULL,                   -- ISO 8601 timestamp
    updated_at TEXT NOT NULL,                   -- ISO 8601 timestamp
    resolved_at TEXT                            -- ISO 8601 timestamp when resolved
);
```

---

## 12. GIS Analysis Explanation

### Spatial Clustering (Hotspot Analysis)
Hotspot analysis identifies spatial concentrations of civic defects:
1. Every complaint is transformed into a Turf.js vector point: `turf.point([lng, lat])`.
2. Pairwise geodesic distances are calculated using `turf.distance(p1, p2, { units: 'kilometers' })`.
3. Points situated within the user-specified distance radius ($R = 250\text{m}$, $500\text{m}$, or $1000\text{m}$) are grouped into spatial clusters.
4. Density classification rule:
   * **High Density Hotspot (Red):** $\ge 10$ complaints in cluster.
   * **Medium Density Hotspot (Orange):** $5 \text{ to } 9$ complaints in cluster.
   * **Low Density Hotspot (Yellow):** $3 \text{ to } 4$ complaints in cluster.
5. Cluster centers are calculated with `turf.center()` and rendered as semi-transparent overlay circles on Leaflet.

### Proximity Buffer Analysis
Proximity analysis measures local defect density surrounding a focal complaint:
1. The user selects a focal complaint $P_0$ and a buffer radius $r \in \{100\text{m}, 250\text{m}, 500\text{m}, 1000\text{m}\}$.
2. The distance $d(P_0, P_i)$ to every other complaint $P_i$ in the database is evaluated.
3. Points satisfying $d(P_0, P_i) \le r$ are identified, highlighted with opaque markers, and listed in an ordered proximity table sorted by distance in meters.
4. A dashed radial buffer circle is drawn on the map to visualize the geographical sphere of influence.

---

## 13. QGIS Workflow Documentation

SmartCivic demonstrates interoperability between lightweight Web GIS and desktop GIS environments:

```text
Citizen / Web GIS
      ↓
GPS Geotagging & SQLite DB
      ↓
GET /api/complaints/geojson
      ↓
QGIS Desktop (Layer -> Add Vector Layer)
      ↓
Categorized Thematic Symbology
      ↓
Kernel Density Estimation (Heatmap)
      ↓
Cartographic Publication
```

### Steps for Evaluator / Viva Demonstration:
1. Open the SmartCivic Admin Portal → navigate to **Reports** or **Admin Dashboard**.
2. Click **Export QGIS GeoJSON** (or navigate to `http://127.0.0.1:8000/api/complaints/geojson`).
3. Open **QGIS Desktop** (3.x).
4. Go to **Layer → Add Layer → Add Vector Layer...** and choose `smartcivic_complaints.geojson`.
5. In QGIS layer properties, select **Symbology → Categorized** and choose column `issue_type` to assign distinct colors.
6. Open the Processing Toolbox in QGIS and search for **Heatmap (Kernel Density Estimation)**. Set the radius to 500 meters to generate a continuous raster heatmap matching the web application's hotspot clusters.

---

## 14. Future Scope
* **Google Earth Engine (GEE) Integration:** Ingest GEE satellite layers (Sentinel-2, Landsat) to correlate road damage with monsoon vegetation indices and runoff flow paths.
* **Automated Routing for Maintenance Teams:** Implement Dijkstra/pgRouting shortest-path dispatch for municipal maintenance vehicles.
* **Citizen Feedback & Re-inspection:** Allow citizens to vote on verified fixes and attach post-resolution photographs.
* **SMS & WhatsApp Municipal Notifications:** Automated notification gateway for citizens when complaint status shifts to *In Progress* or *Resolved*.

---

### Academic Disclaimer
*This application is an educational prototype developed for a college Geographic Information System project. All complaint records, coordinates, and photo assets are synthesized for academic demonstration within Chhatrapati Sambhajinagar, Maharashtra, and do not represent official operational records of the municipal corporation.*
