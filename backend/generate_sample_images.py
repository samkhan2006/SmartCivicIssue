import os
from pathlib import Path

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"

def create_svg(path: Path, title: str, subtitle: str, color: str, icon_markup: str, badge: str):
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{color}"/>
      <stop offset="100%" stop-color="{color}99"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="600" height="400" fill="url(#bg)"/>
  
  <!-- Subtle Grid -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="50" x2="600" y2="50"/>
    <line x1="0" y1="100" x2="600" y2="100"/>
    <line x1="0" y1="150" x2="600" y2="150"/>
    <line x1="0" y1="200" x2="600" y2="200"/>
    <line x1="0" y1="250" x2="600" y2="250"/>
    <line x1="0" y1="300" x2="600" y2="300"/>
    <line x1="0" y1="350" x2="600" y2="350"/>
    <line x1="100" y1="0" x2="100" y2="400"/>
    <line x1="200" y1="0" x2="200" y2="400"/>
    <line x1="300" y1="0" x2="300" y2="400"/>
    <line x1="400" y1="0" x2="400" y2="400"/>
    <line x1="500" y1="0" x2="500" y2="400"/>
  </g>

  <!-- Ground / Road Base Simulation -->
  <path d="M0,280 Q300,240 600,280 L600,400 L0,400 Z" fill="#334155" opacity="0.6"/>
  <path d="M0,320 L600,320 L600,400 L0,400 Z" fill="#1e293b" opacity="0.8"/>
  
  <!-- Municipal Geotag Badge -->
  <rect x="24" y="24" width="230" height="32" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="40" cy="40" r="5" fill="#38bdf8"/>
  <text x="54" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#e2e8f0">Chhatrapati Sambhajinagar</text>
  
  <!-- Priority / Category Badge -->
  <rect x="440" y="24" width="136" height="32" rx="16" fill="{color}22" stroke="{color}" stroke-width="1.5"/>
  <text x="508" y="45" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="{color}" text-anchor="middle">{badge}</text>

  <!-- Center Graphic Card -->
  <g filter="url(#shadow)">
    <circle cx="300" cy="180" r="72" fill="#0f172a" stroke="{color}" stroke-width="3"/>
    <g transform="translate(260, 140) scale(1.6)">
      {icon_markup}
    </g>
  </g>

  <!-- Titles -->
  <text x="300" y="295" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#f8fafc" text-anchor="middle">{title}</text>
  <text x="300" y="325" font-family="system-ui, sans-serif" font-size="14" font-weight="400" fill="#94a3b8" text-anchor="middle">{subtitle}</text>

  <!-- Footer GPS Overlay Simulation -->
  <rect x="24" y="354" width="552" height="26" rx="6" fill="#0f172a" opacity="0.85"/>
  <text x="36" y="371" font-family="monospace" font-size="11" fill="#38bdf8">LAT: 19.8762° N | LON: 75.3433° E | CSMC SMART CIVIC SURVEILLANCE</text>
  <text x="564" y="371" font-family="monospace" font-size="11" fill="#10b981" text-anchor="end">GEOTAGGED VERIFIED</text>
</svg>"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_content)

def generate_all_sample_images():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Pothole 1
    create_svg(
        UPLOADS_DIR / "pothole_1.svg",
        title="Deep Asphalt Pothole",
        subtitle="Crater on Jalna Road near Kranti Chowk flyover pillar",
        color="#ef4444",
        icon_markup='<circle cx="25" cy="25" r="16" fill="#ef4444" opacity="0.3"/><ellipse cx="25" cy="28" rx="14" ry="8" fill="#ef4444"/><path d="M12,24 Q25,36 38,24" stroke="#ffffff" stroke-width="2" fill="none"/>',
        badge="CRITICAL POTHOLE"
    )

    # Pothole 2
    create_svg(
        UPLOADS_DIR / "pothole_2.svg",
        title="Severe Surface Pit",
        subtitle="Dangerous cavity posing hazard to two-wheelers on Cidco N-4 Road",
        color="#f97316",
        icon_markup='<circle cx="25" cy="25" r="16" fill="#f97316" opacity="0.3"/><ellipse cx="25" cy="27" rx="12" ry="7" fill="#f97316"/><path d="M15,22 Q25,32 35,22" stroke="#ffffff" stroke-width="2" fill="none"/>',
        badge="ROAD HAZARD"
    )

    # Streetlight 1
    create_svg(
        UPLOADS_DIR / "streetlight_1.svg",
        title="Extinguished LED Pole",
        subtitle="Dark stretch causing safety concerns near Cannaught Garden",
        color="#eab308",
        icon_markup='<line x1="25" y1="42" x2="25" y2="12" stroke="#ffffff" stroke-width="3"/><path d="M15,12 C15,6 35,6 35,12 Z" fill="#eab308"/><line x1="10" y1="8" x2="40" y2="8" stroke="#eab308" stroke-width="2" stroke-dasharray="2,2"/>',
        badge="OUTAGE DETECTED"
    )

    # Garbage 1
    create_svg(
        UPLOADS_DIR / "garbage_1.svg",
        title="Solid Waste Accumulation",
        subtitle="Overflowing community dumper near Nirala Bazar vegetable market",
        color="#84cc16",
        icon_markup='<path d="M14,14 L36,14 L33,40 L17,40 Z" fill="#84cc16" opacity="0.8"/><rect x="11" y="10" width="28" height="4" rx="2" fill="#ffffff"/><path d="M22,6 L28,6 L28,10 L22,10 Z" fill="#ffffff"/>',
        badge="SANITATION ALERT"
    )

    # Garbage 2
    create_svg(
        UPLOADS_DIR / "garbage_2.svg",
        title="Illegal Debris Dumping",
        subtitle="Construction waste & plastic dump on Garkheda ring road",
        color="#10b981",
        icon_markup='<path d="M12,38 L38,38 L32,20 L22,25 L18,20 Z" fill="#10b981"/><circle cx="25" cy="14" r="3" fill="#ffffff"/>',
        badge="MUNICIPAL SOLID WASTE"
    )

    # Water Leakage 1
    create_svg(
        UPLOADS_DIR / "water_leak_1.svg",
        title="High Pressure Pipeline Burst",
        subtitle="Potable water pooling across carriageway near Seven Hills",
        color="#06b6d4",
        icon_markup='<path d="M25,8 C25,8 14,24 14,31 C14,37 19,42 25,42 C31,42 36,37 36,31 C36,24 25,8 25,8 Z" fill="#06b6d4"/><path d="M20,30 C20,34 23,37 27,37" stroke="#ffffff" stroke-width="2" fill="none"/>',
        badge="WATER LOSS SEVERE"
    )

    # Damaged Road 1
    create_svg(
        UPLOADS_DIR / "road_damage_1.svg",
        title="Crumbling Bitumen Surface",
        subtitle="Extensive cracking and subgrade erosion on Beed Bypass stretch",
        color="#f43f5e",
        icon_markup='<path d="M10,38 L22,12 L38,38 Z" fill="none" stroke="#f43f5e" stroke-width="3"/><path d="M20,38 L25,28 L30,38" stroke="#ffffff" stroke-width="2"/><line x1="16" y1="26" x2="34" y2="26" stroke="#f43f5e" stroke-width="2"/>',
        badge="ASPHALT EROSION"
    )

    # Damaged Road 2
    create_svg(
        UPLOADS_DIR / "road_damage_2.svg",
        title="Structural Trench Settlement",
        subtitle="Unrestored utility digging near TV Centre Chowk",
        color="#ec4899",
        icon_markup='<rect x="10" y="22" width="30" height="14" fill="#ec4899" opacity="0.7"/><line x1="8" y1="18" x2="42" y2="18" stroke="#ffffff" stroke-width="3"/><line x1="15" y1="24" x2="35" y2="34" stroke="#ffffff" stroke-width="2"/>',
        badge="UTILITY TRENCH"
    )

if __name__ == "__main__":
    generate_all_sample_images()
    print("Sample images generated in backend/uploads/")
