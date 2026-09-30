import L from 'leaflet';
import { IssueType } from '../types';

export const ISSUE_COLORS: Record<string, string> = {
  'Pothole': '#ef4444',            // Red
  'Broken Streetlight': '#f59e0b', // Amber
  'Garbage Accumulation': '#10b981',// Emerald
  'Water Leakage': '#06b6d4',      // Cyan
  'Damaged Road': '#8b5cf6',       // Purple
};

export const ISSUE_ICONS: Record<string, string> = {
  'Pothole': '🕳️',
  'Broken Streetlight': '💡',
  'Garbage Accumulation': '🗑️',
  'Water Leakage': '💧',
  'Damaged Road': '🛣️',
};

export function createComplaintIcon(issueType: IssueType, isSelected = false): L.DivIcon {
  const color = ISSUE_COLORS[issueType] || '#3b82f6';
  const emoji = ISSUE_ICONS[issueType] || '📍';
  const size = isSelected ? 44 : 36;
  const ring = isSelected ? 'box-shadow: 0 0 0 4px #38bdf8, 0 8px 16px rgba(0,0,0,0.3); transform: scale(1.15);' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.25);';

  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffffff;
          ${ring}
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isSelected ? '18px' : '15px'};
            line-height: 1;
            user-select: none;
          ">${emoji}</span>
        </div>
        <div style="
          width: 8px;
          height: 3px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          margin-top: 2px;
        "></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 4)],
  });
}

export function createLocationPickerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: grab;
      ">
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          background: #2563eb;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.5);
        ">
          <span style="transform: rotate(45deg); font-size: 16px; color: white;">📍</span>
        </div>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
  });
}

export function createProximityFocusIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 36px; height: 36px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <span style="font-size: 18px; color: white;">🎯</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}
