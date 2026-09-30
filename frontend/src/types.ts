export type IssueType =
  | 'Pothole'
  | 'Broken Streetlight'
  | 'Garbage Accumulation'
  | 'Water Leakage'
  | 'Damaged Road';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export interface Complaint {
  id: number;
  complaint_number: string;
  issue_type: IssueType;
  description: string;
  photo?: string | null;
  latitude: float;
  longitude: float;
  address: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export type float = number;

export interface AnalyticsData {
  total_complaints: number;
  pending: number;
  under_review: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  high_priority: number;
  active_hotspots: number;
  resolution_rate: number;
  issue_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
}

export interface HotspotCluster {
  id: string;
  center: [number, number]; // [lat, lng]
  radius: number; // in meters
  complaints: Complaint[];
  count: number;
  mainIssue: string;
  highPriorityCount: number;
  densityLevel: 'High' | 'Medium' | 'Low';
  dominantArea: string;
}

export interface User {
  email: string;
  name: string;
  role: 'citizen' | 'admin';
}
