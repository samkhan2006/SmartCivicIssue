import random
from datetime import datetime, timedelta
from database import get_db_connection, init_db
from generate_sample_images import generate_all_sample_images

LOCATIONS = [
    # Cluster 1: Kranti Chowk & Station Road Area (~19.8745, 75.3210)
    {"area": "Kranti Chowk Flyover Service Road", "lat": 19.8748, "lng": 75.3212, "type": "Pothole", "prio": "High"},
    {"area": "Kranti Chowk North Junction", "lat": 19.8752, "lng": 75.3208, "type": "Pothole", "prio": "High"},
    {"area": "Opposite District Court, Station Road", "lat": 19.8715, "lng": 75.3180, "type": "Damaged Road", "prio": "High"},
    {"area": "Nirala Bazar Commercial Lane 3", "lat": 19.8790, "lng": 75.3245, "type": "Garbage Accumulation", "prio": "Medium"},
    {"area": "Nirala Bazar Cloth Market Corner", "lat": 19.8785, "lng": 75.3238, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Osmanpura Main Circle", "lat": 19.8710, "lng": 75.3280, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "Osmanpura High School Road", "lat": 19.8702, "lng": 75.3271, "type": "Pothole", "prio": "Low"},
    {"area": "Khadkeshwar Temple Approach Road", "lat": 19.8825, "lng": 75.3220, "type": "Water Leakage", "prio": "High"},
    {"area": "Gulmandi Main Chowk", "lat": 19.8850, "lng": 75.3270, "type": "Garbage Accumulation", "prio": "Medium"},
    {"area": "Aurangpura Central Bus Stop Road", "lat": 19.8810, "lng": 75.3255, "type": "Damaged Road", "prio": "Medium"},
    {"area": "Railway Station Outer Gate Road", "lat": 19.8645, "lng": 75.3115, "type": "Pothole", "prio": "High"},
    {"area": "Station Road Near Hotel Panchavati", "lat": 19.8685, "lng": 75.3150, "type": "Broken Streetlight", "prio": "Low"},
    {"area": "Padampura Old Bridge Entrance", "lat": 19.8730, "lng": 75.3140, "type": "Damaged Road", "prio": "High"},

    # Cluster 2: CIDCO Cannaught Place & Sectors N-1 to N-6 (~19.8778, 75.3550)
    {"area": "Cannaught Place Market Gate 1", "lat": 19.8782, "lng": 75.3552, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Cannaught Place Inner Ring Road", "lat": 19.8775, "lng": 75.3560, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "CIDCO Bus Stand Main Entry", "lat": 19.8765, "lng": 75.3530, "type": "Pothole", "prio": "High"},
    {"area": "CIDCO N-4 Shivshankar Colony Main Lane", "lat": 19.8812, "lng": 75.3525, "type": "Water Leakage", "prio": "High"},
    {"area": "CIDCO N-4 Vegetable Market Road", "lat": 19.8820, "lng": 75.3538, "type": "Garbage Accumulation", "prio": "Medium"},
    {"area": "CIDCO N-5 Town Centre Road", "lat": 19.8740, "lng": 75.3585, "type": "Pothole", "prio": "High"},
    {"area": "CIDCO N-5 Near MGM Hospital Circle", "lat": 19.8728, "lng": 75.3610, "type": "Damaged Road", "prio": "High"},
    {"area": "CIDCO N-6 Avishkar Colony Corner", "lat": 19.8850, "lng": 75.3575, "type": "Broken Streetlight", "prio": "Low"},
    {"area": "CIDCO N-6 Sambhaji Park Perimeter", "lat": 19.8862, "lng": 75.3590, "type": "Pothole", "prio": "Medium"},
    {"area": "CIDCO N-2 Thakre Nagar Near Water Tank", "lat": 19.8795, "lng": 75.3480, "type": "Water Leakage", "prio": "High"},
    {"area": "CIDCO N-1 Near Bajrang Chowk", "lat": 19.8835, "lng": 75.3465, "type": "Damaged Road", "prio": "Medium"},
    {"area": "CIDCO N-3 Sector Road Crossing", "lat": 19.8755, "lng": 75.3505, "type": "Broken Streetlight", "prio": "Low"},

    # Cluster 3: Jalna Road & Seven Hills Corridor (~19.8765, 75.3420)
    {"area": "Seven Hills Flyover Western Incline", "lat": 19.8765, "lng": 75.3415, "type": "Pothole", "prio": "High"},
    {"area": "Seven Hills Service Road Near Hotel Ramgiri", "lat": 19.8770, "lng": 75.3430, "type": "Water Leakage", "prio": "High"},
    {"area": "Akashwani Chowk Traffic Signal", "lat": 19.8755, "lng": 75.3340, "type": "Pothole", "prio": "High"},
    {"area": "Akashwani Prasar Bharati Road", "lat": 19.8748, "lng": 75.3325, "type": "Broken Streetlight", "prio": "Low"},
    {"area": "Mondha Naka Vegetable Yard Entrance", "lat": 19.8735, "lng": 75.3285, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Mondha Naka Flyover Footing", "lat": 19.8740, "lng": 75.3298, "type": "Damaged Road", "prio": "Medium"},
    {"area": "Jalna Road Opp High Court Bench", "lat": 19.8775, "lng": 75.3490, "type": "Damaged Road", "prio": "High"},
    {"area": "Jalna Road Near Cambridge School Cut", "lat": 19.8790, "lng": 75.3670, "type": "Pothole", "prio": "Medium"},
    {"area": "Jalna Road Kalda Corner Junction", "lat": 19.8760, "lng": 75.3380, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "Dhoot Hospital Service Road", "lat": 19.8805, "lng": 75.3740, "type": "Pothole", "prio": "Low"},

    # Cluster 4: Garkheda & Ulkanagri Southern Belt (~19.8520, 75.3380)
    {"area": "Garkheda Parisar Near Sports Complex", "lat": 19.8550, "lng": 75.3410, "type": "Damaged Road", "prio": "High"},
    {"area": "Garkheda Stadium West Gate", "lat": 19.8540, "lng": 75.3395, "type": "Pothole", "prio": "Medium"},
    {"area": "Ulkanagri Main Road Near Dargah", "lat": 19.8580, "lng": 75.3345, "type": "Water Leakage", "prio": "High"},
    {"area": "Ulkanagri Sector 2 Residential Lane", "lat": 19.8592, "lng": 75.3360, "type": "Garbage Accumulation", "prio": "Low"},
    {"area": "Sutgirni Chowk Bus Stop", "lat": 19.8630, "lng": 75.3385, "type": "Pothole", "prio": "High"},
    {"area": "Sutgirni Chowk East Crossing", "lat": 19.8622, "lng": 75.3400, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "Beed Bypass Road Near Mahanagar Gate", "lat": 19.8450, "lng": 75.3420, "type": "Damaged Road", "prio": "High"},
    {"area": "Beed Bypass Service Road Near Mitmita Cut", "lat": 19.8435, "lng": 75.3310, "type": "Pothole", "prio": "High"},
    {"area": "Renuka Mata Temple Approach Road", "lat": 19.8490, "lng": 75.3480, "type": "Water Leakage", "prio": "Medium"},

    # Cluster 5: Begumpura, Historical & University Belt (~19.9020, 75.3180)
    {"area": "Panchakki Heritage Complex Road", "lat": 19.8970, "lng": 75.3160, "type": "Damaged Road", "prio": "Medium"},
    {"area": "Panchakki Riverbed Embankment Road", "lat": 19.8985, "lng": 75.3148, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Begumpura Main Bazaar Road", "lat": 19.9040, "lng": 75.3190, "type": "Pothole", "prio": "High"},
    {"area": "Begumpura Near Makai Gate", "lat": 19.9015, "lng": 75.3210, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "Dr. BAMU University Main Entrance Road", "lat": 19.9030, "lng": 75.3120, "type": "Pothole", "prio": "Low"},
    {"area": "Dr. BAMU Hostel Perimeter Lane", "lat": 19.9065, "lng": 75.3105, "type": "Broken Streetlight", "prio": "Low"},
    {"area": "Bhadkal Gate Chowk", "lat": 19.8910, "lng": 75.3235, "type": "Pothole", "prio": "High"},
    {"area": "Delhi Gate Circular Road", "lat": 19.8995, "lng": 75.3280, "type": "Garbage Accumulation", "prio": "Medium"},

    # Cluster 6: TV Centre & HUDCO Northern Belt (~19.9050, 75.3620)
    {"area": "TV Centre Chowk Near Water Tank", "lat": 19.9050, "lng": 75.3620, "type": "Pothole", "prio": "High"},
    {"area": "TV Centre Vegetable Market", "lat": 19.9062, "lng": 75.3635, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "HUDCO N-11 Sector Corner", "lat": 19.9110, "lng": 75.3680, "type": "Broken Streetlight", "prio": "Medium"},
    {"area": "HUDCO N-9 Housing Colony Road", "lat": 19.9020, "lng": 75.3590, "type": "Water Leakage", "prio": "High"},
    {"area": "Jadhavwadi APMC Mandi Road", "lat": 19.9180, "lng": 75.3720, "type": "Damaged Road", "prio": "High"},
    {"area": "Jadhavwadi Wholesale Market Gate", "lat": 19.9195, "lng": 75.3745, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Harsul T-Point Junction", "lat": 19.9240, "lng": 75.3520, "type": "Pothole", "prio": "Medium"},
    {"area": "Harsul Lake Ring Road", "lat": 19.9270, "lng": 75.3480, "type": "Broken Streetlight", "prio": "Low"},

    # Cluster 7: Chikalthana & Mukundwadi Eastern Belt (~19.8820, 75.3850)
    {"area": "Mukundwadi Railway Crossing Road", "lat": 19.8720, "lng": 75.3790, "type": "Pothole", "prio": "High"},
    {"area": "Mukundwadi Main Market Lane", "lat": 19.8735, "lng": 75.3815, "type": "Garbage Accumulation", "prio": "High"},
    {"area": "Chikalthana MIDC Road No. 4", "lat": 19.8880, "lng": 75.3920, "type": "Damaged Road", "prio": "High"},
    {"area": "Chikalthana Industrial Association Gate", "lat": 19.8895, "lng": 75.3960, "type": "Water Leakage", "prio": "Medium"},
    {"area": "Prozone Mall Rear Service Avenue", "lat": 19.8810, "lng": 75.3695, "type": "Broken Streetlight", "prio": "Low"},
    {"area": "CIDCO N-8 Jai Bhawani Nagar", "lat": 19.8780, "lng": 75.3750, "type": "Pothole", "prio": "Medium"},
    {"area": "Chikalthana Airport Road Flyover", "lat": 19.8680, "lng": 75.3980, "type": "Damaged Road", "prio": "High"}
]

DESCRIPTIONS = {
    "Pothole": [
        "Deep hazardous pothole on the asphalt surface causing sudden vehicular braking and two-wheeler skidding risk.",
        "Cluster of rain-damaged potholes spanning across lane 1. Immediate bituminous patching required.",
        "Sunken crater near manhole frame causing dangerous shocks to vehicles and auto-rickshaws.",
        "Multiple sharp asphalt potholes developing after monsoon runoff, impeding traffic flow.",
        "Deep pothole at road intersection causing severe traffic bottlenecks during peak rush hours."
    ],
    "Broken Streetlight": [
        "Streetlight pole fixture not functioning for over a week, creating dark hazardous patch along pedestrian walkway.",
        "Underground cabling fault leading to complete blackout of 4 consecutive LED street fixtures.",
        "Damaged pole bracket after high winds; exposed wiring hanging dangerously close to pavement.",
        "Street light fixture flickering intermittently and shutting off completely after 9 PM.",
        "Sodium vapor lamp expired and unreplaced, causing security concerns for evening commuters."
    ],
    "Garbage Accumulation": [
        "Community waste dumper overflowing onto carriageway with stray cattle and dog menace.",
        "Commercial vegetable market organic waste accumulating along roadside causing foul odor and disease risk.",
        "Illegal dumping of construction demolition waste blocking pedestrian sidewalk and rainwater drain.",
        "Uncollected domestic solid waste dumped along compound wall for last 5 days.",
        "Plastic packaging waste and open garbage heap choking storm water drain opening."
    ],
    "Water Leakage": [
        "High pressure municipal main pipeline joint ruptured; potable water flowing continuously on road.",
        "Underground distribution pipeline seepage creating waterlogging and softening road sub-base.",
        "Valve chamber leakage flooding carriage lane and reducing water pressure to downstream households.",
        "Drinking water pipeline leaking near water meter installation, wasting thousands of liters daily.",
        "Pipeline burst under newly tarred road causing asphalt swelling and water fountain."
    ],
    "Damaged Road": [
        "Severe surface cracking, alligator cracking and binder erosion along heavy commercial corridor.",
        "Unrestored underground utility trench settlement causing longitudinal dip across road.",
        "Bitumen layer completely peeled off leaving rough subgrade boulders exposed.",
        "Extensive edge breakdown and shoulder erosion posing roll-over hazard to cyclists.",
        "Sunken road section with recurrent drainage ponding undermining road foundation."
    ]
}

PHOTO_MAP = {
    "Pothole": ["/uploads/pothole_1.svg", "/uploads/pothole_2.svg"],
    "Broken Streetlight": ["/uploads/streetlight_1.svg"],
    "Garbage Accumulation": ["/uploads/garbage_1.svg", "/uploads/garbage_2.svg"],
    "Water Leakage": ["/uploads/water_leak_1.svg"],
    "Damaged Road": ["/uploads/road_damage_1.svg", "/uploads/road_damage_2.svg"]
}

STATUSES = [
    ("Submitted", 0.20),
    ("Under Review", 0.22),
    ("In Progress", 0.23),
    ("Resolved", 0.30),
    ("Rejected", 0.05)
]

def seed_complaints():
    init_db()
    generate_all_sample_images()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing complaints
    cursor.execute("DELETE FROM complaints;")

    status_choices = []
    for s, weight in STATUSES:
        status_choices.extend([s] * int(weight * 100))

    base_date = datetime(2026, 9, 15, 9, 30)

    for i, loc in enumerate(LOCATIONS, start=1):
        complaint_no = f"CIV-2026-{i:03d}"
        issue_type = loc["type"]
        desc_list = DESCRIPTIONS[issue_type]
        description = random.choice(desc_list)
        photos = PHOTO_MAP.get(issue_type, ["/uploads/pothole_1.svg"])
        photo = random.choice(photos)
        
        # Determine status
        status = random.choice(status_choices)
        priority = loc["prio"]

        # Timestamps
        day_offset = random.randint(0, 14)
        hour_offset = random.randint(0, 23)
        minute_offset = random.randint(0, 59)
        created_time = base_date + timedelta(days=day_offset, hours=hour_offset, minutes=minute_offset)
        created_at = created_time.isoformat()
        
        updated_time = created_time + timedelta(hours=random.randint(4, 48))
        updated_at = updated_time.isoformat()

        resolved_at = None
        if status == "Resolved":
            resolved_time = updated_time + timedelta(hours=random.randint(6, 72))
            resolved_at = resolved_time.isoformat()

        address = f"{loc['area']}, Chhatrapati Sambhajinagar, Maharashtra"

        cursor.execute("""
            INSERT INTO complaints (
                complaint_number, issue_type, description, photo,
                latitude, longitude, address, status, priority,
                created_at, updated_at, resolved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            complaint_no, issue_type, description, photo,
            loc["lat"], loc["lng"], address, status, priority,
            created_at, updated_at, resolved_at
        ))

    conn.commit()
    count = cursor.execute("SELECT COUNT(*) FROM complaints;").fetchone()[0]
    conn.close()
    print(f"Seeded {count} realistic Chhatrapati Sambhajinagar complaints successfully.")

if __name__ == "__main__":
    seed_complaints()
