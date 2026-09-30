import { Complaint, AnalyticsData } from './types';

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API_BASE = `${BACKEND_URL}/api`;

export function getMediaUrl(path?: string | null): string {
  if (!path) {
    return `${BACKEND_URL}/uploads/pothole_1.svg`;
  }

  // Already an absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Handle paths such as /uploads/pothole_1.svg
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function fetchComplaints(filters?: {
  issue_type?: string;
  status?: string;
  priority?: string;
  search?: string;
}): Promise<Complaint[]> {
  const params = new URLSearchParams();
  if (filters?.issue_type && filters.issue_type !== 'All') {
    params.append('issue_type', filters.issue_type);
  }
  if (filters?.status && filters.status !== 'All') {
    params.append('status', filters.status);
  }
  if (filters?.priority && filters.priority !== 'All') {
    params.append('priority', filters.priority);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch complaints');
  }
  return res.json();
}

export async function fetchComplaintById(idOrNumber: string | number): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${idOrNumber}`);
  if (!res.ok) {
    throw new Error('Failed to fetch complaint details');
  }
  return res.json();
}

export async function createComplaint(formData: FormData): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit complaint');
  }
  return res.json();
}

export async function updateComplaintStatus(
  id: number,
  status: string
): Promise<Complaint> {
  const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update status');
  }
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}

export async function fetchGisLayers(): Promise<{
  boundary: any;
  major_roads: any;
  zones: any;
}> {
  const res = await fetch(`${API_BASE}/gis/layers`);
  if (!res.ok) {
    throw new Error('Failed to fetch GIS layers');
  }
  return res.json();
}

export async function resetDemoDatabase(): Promise<void> {
  const res = await fetch(`${API_BASE}/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to reset demo database');
  }
}

export function downloadGeoJSON(): void {
  window.open(`${API_BASE}/complaints/geojson`, '_blank');
}
