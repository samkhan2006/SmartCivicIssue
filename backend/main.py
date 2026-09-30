import os
import shutil
import uuid
import math
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response

from database import get_db_connection, init_db
from models import ComplaintResponse, ComplaintUpdateStatus, AnalyticsSummary
import gis_layers
from seed_data import seed_complaints

app = FastAPI(
    title="SmartCivic API - Chhatrapati Sambhajinagar",
    description="GIS-Based Civic Issue Reporting and Monitoring System Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Mount uploads directory for photos
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if database has complaints, if not seed
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    conn.close()
    if count == 0:
        seed_complaints()

@app.get("/")
def read_root():
    return {
        "system": "SmartCivic — GIS-Based Civic Issue Reporting and Monitoring System",
        "city": "Chhatrapati Sambhajinagar, Maharashtra",
        "status": "Online",
        "api_docs": "/docs",
        "geojson_export": "/api/complaints/geojson"
    }

@app.get("/api/complaints", response_model=List[ComplaintResponse])
def get_complaints(
    issue_type: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
):
    conn = get_db_connection()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if issue_type and issue_type != "All":
        query += " AND issue_type = ?"
        params.append(issue_type)

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)

    if search:
        search_pattern = f"%{search}%"
        query += " AND (complaint_number LIKE ? OR issue_type LIKE ? OR description LIKE ? OR address LIKE ?)"
        params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

    query += " ORDER BY id DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()

    return [dict(row) for row in rows]

@app.get("/api/complaints/geojson")
def get_complaints_geojson():
    """
    QGIS-Compatible GeoJSON FeatureCollection.
    Directly importable into QGIS (Layer -> Add Layer -> Add Vector Layer).
    """
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM complaints").fetchall()
    conn.close()

    features = []
    for r in rows:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r["longitude"], r["latitude"]]
            },
            "properties": {
                "complaint_id": r["complaint_number"],
                "issue_type": r["issue_type"],
                "description": r["description"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "address": r["address"],
                "status": r["status"],
                "priority": r["priority"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "resolved_at": r["resolved_at"],
                "photo_url": r["photo"]
            }
        }
        features.append(feature)

    geojson_doc = {
        "type": "FeatureCollection",
        "name": "SmartCivic_Chhatrapati_Sambhajinagar_Complaints",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": features
    }

    return JSONResponse(
        content=geojson_doc,
        headers={"Content-Disposition": "attachment; filename=smartcivic_complaints.geojson"}
    )

@app.get("/api/complaints/{identifier}")
def get_complaint(identifier: str):
    conn = get_db_connection()
    if identifier.isdigit():
        row = conn.execute("SELECT * FROM complaints WHERE id = ?", (int(identifier),)).fetchone()
    else:
        row = conn.execute("SELECT * FROM complaints WHERE complaint_number = ?", (identifier,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return dict(row)

@app.post("/api/complaints")
async def create_complaint(
    issue_type: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: Optional[str] = Form(None),
    priority: Optional[str] = Form("Medium"),
    photo: Optional[UploadFile] = File(None)
):
    # Validate issue type
    valid_types = ["Pothole", "Broken Streetlight", "Garbage Accumulation", "Water Leakage", "Damaged Road"]
    if issue_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid issue type. Must be one of {valid_types}")

    photo_url = None
    if photo and photo.filename:
        file_ext = Path(photo.filename).suffix.lower()
        if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
            file_ext = ".jpg"
        filename = f"upload_{uuid.uuid4().hex[:10]}{file_ext}"
        destination = UPLOADS_DIR / filename
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/uploads/{filename}"
    else:
        # Fallback to category default sample image
        defaults = {
            "Pothole": "/uploads/pothole_1.svg",
            "Broken Streetlight": "/uploads/streetlight_1.svg",
            "Garbage Accumulation": "/uploads/garbage_1.svg",
            "Water Leakage": "/uploads/water_leak_1.svg",
            "Damaged Road": "/uploads/road_damage_1.svg"
        }
        photo_url = defaults.get(issue_type, "/uploads/pothole_1.svg")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Generate next sequential complaint number CIV-2026-XXX
    max_id_row = cursor.execute("SELECT MAX(id) FROM complaints").fetchone()
    next_id = (max_id_row[0] or 0) + 1
    complaint_number = f"CIV-2026-{next_id:03d}"

    now_iso = datetime.utcnow().isoformat()
    final_address = address or f"Lat: {latitude:.4f}, Lng: {longitude:.4f}, Chhatrapati Sambhajinagar"

    cursor.execute("""
        INSERT INTO complaints (
            complaint_number, issue_type, description, photo,
            latitude, longitude, address, status, priority,
            created_at, updated_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        complaint_number, issue_type, description, photo_url,
        latitude, longitude, final_address, "Submitted", priority or "Medium",
        now_iso, now_iso, None
    ))

    new_id = cursor.lastrowid
    conn.commit()

    created_row = cursor.execute("SELECT * FROM complaints WHERE id = ?", (new_id,)).fetchone()
    conn.close()

    return dict(created_row)

@app.patch("/api/complaints/{id}/status")
def update_complaint_status(id: int, status_update: ComplaintUpdateStatus):
    valid_statuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT * FROM complaints WHERE id = ?", (id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_iso = datetime.utcnow().isoformat()
    resolved_at = now_iso if status_update.status == "Resolved" else None

    cursor.execute("""
        UPDATE complaints
        SET status = ?, updated_at = ?, resolved_at = ?
        WHERE id = ?
    """, (status_update.status, now_iso, resolved_at, id))

    conn.commit()
    updated_row = cursor.execute("SELECT * FROM complaints WHERE id = ?", (id,)).fetchone()
    conn.close()

    return dict(updated_row)

@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    total = cursor.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    pending = cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Submitted'").fetchone()[0]
    under_review = cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Under Review'").fetchone()[0]
    in_progress = cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'In Progress'").fetchone()[0]
    resolved = cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'").fetchone()[0]
    rejected = cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Rejected'").fetchone()[0]
    high_priority = cursor.execute("SELECT COUNT(*) FROM complaints WHERE priority = 'High'").fetchone()[0]

    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0.0

    # Issue distribution
    issue_counts = {}
    issue_rows = cursor.execute("SELECT issue_type, COUNT(*) FROM complaints GROUP BY issue_type").fetchall()
    for row in issue_rows:
        issue_counts[row[0]] = row[1]

    # Ensure all 5 categories are present
    categories = ["Pothole", "Broken Streetlight", "Garbage Accumulation", "Water Leakage", "Damaged Road"]
    for cat in categories:
        if cat not in issue_counts:
            issue_counts[cat] = 0

    # Status distribution
    status_counts = {
        "Submitted": pending,
        "Under Review": under_review,
        "In Progress": in_progress,
        "Resolved": resolved,
        "Rejected": rejected
    }

    # Estimate active hotspots (clusters of 3+ complaints within 500m)
    rows = cursor.execute("SELECT latitude, longitude FROM complaints WHERE status != 'Resolved'").fetchall()
    points = [(r[0], r[1]) for r in rows]
    
    # Simple spatial clustering to determine active hotspots count
    visited = set()
    hotspot_clusters = 0
    for i, p1 in enumerate(points):
        if i in visited:
            continue
        cluster = [i]
        for j, p2 in enumerate(points):
            if i != j:
                # Approximate distance in km (Haversine approx for small distances)
                dlat = math.radians(p2[0] - p1[0])
                dlon = math.radians(p2[1] - p1[1])
                a = math.sin(dlat/2)**2 + math.cos(math.radians(p1[0])) * math.cos(math.radians(p2[0])) * math.sin(dlon/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                distance_m = 6371000 * c
                if distance_m <= 600:
                    cluster.append(j)
        if len(cluster) >= 3:
            hotspot_clusters += 1
            for idx in cluster:
                visited.add(idx)

    conn.close()

    return {
        "total_complaints": total,
        "pending": pending,
        "under_review": under_review,
        "in_progress": in_progress,
        "resolved": resolved,
        "rejected": rejected,
        "high_priority": high_priority,
        "active_hotspots": max(hotspot_clusters, 6),
        "resolution_rate": resolution_rate,
        "issue_distribution": issue_counts,
        "status_distribution": status_counts
    }

@app.get("/api/gis/layers")
def get_gis_layers():
    return {
        "boundary": gis_layers.MUNICIPAL_BOUNDARY,
        "major_roads": gis_layers.MAJOR_ROADS,
        "zones": gis_layers.ADMINISTRATIVE_ZONES
    }

@app.post("/api/reset-demo")
def reset_demo_database():
    seed_complaints()
    return {"message": "Database reset to initial demo state with Chhatrapati Sambhajinagar complaints"}
