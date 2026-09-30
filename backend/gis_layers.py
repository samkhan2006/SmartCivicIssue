"""
Chhatrapati Sambhajinagar GIS Layers
Includes:
- Municipal Study Area Boundary (Polygon)
- Major Road Network (LineStrings)
- Municipal Administrative Zones (Polygons)
"""

MUNICIPAL_BOUNDARY = {
    "type": "Feature",
    "properties": {
        "name": "Chhatrapati Sambhajinagar Municipal Corporation Boundary",
        "type": "Administrative Boundary",
        "city": "Chhatrapati Sambhajinagar",
        "state": "Maharashtra",
        "area_sq_km": 168.4
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [75.2850, 19.8700],
            [75.2920, 19.9050],
            [75.3150, 19.9250],
            [75.3450, 19.9320],
            [75.3780, 19.9200],
            [75.4050, 19.8950],
            [75.4120, 19.8650],
            [75.3850, 19.8380],
            [75.3500, 19.8320],
            [75.3120, 19.8420],
            [75.2850, 19.8700]
        ]]
    }
}

MAJOR_ROADS = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Jalna Road (NH-753F Arterial)",
                "category": "Primary Arterial",
                "lanes": 4,
                "importance": "High"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [75.3050, 19.8720],
                    [75.3210, 19.8745],
                    [75.3350, 19.8762],
                    [75.3550, 19.8778],
                    [75.3780, 19.8805],
                    [75.4050, 19.8835]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Beed Bypass Road (Southern Ring)",
                "category": "Arterial Bypass",
                "lanes": 4,
                "importance": "High"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [75.3080, 19.8450],
                    [75.3320, 19.8420],
                    [75.3600, 19.8440],
                    [75.3850, 19.8490],
                    [75.4080, 19.8560]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Station Road to Kranti Chowk Corridor",
                "category": "City Commercial Corridor",
                "lanes": 2,
                "importance": "Medium"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [75.3100, 19.8640],
                    [75.3160, 19.8680],
                    [75.3210, 19.8745],
                    [75.3250, 19.8820],
                    [75.3300, 19.8910]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "CIDCO - TV Centre Avenue",
                "category": "Connecting Sector Road",
                "lanes": 2,
                "importance": "Medium"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [75.3550, 19.8778],
                    [75.3580, 19.8920],
                    [75.3620, 19.9050],
                    [75.3660, 19.9180]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Paithan Road",
                "category": "Radial Highway",
                "lanes": 2,
                "importance": "Medium"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [75.3210, 19.8745],
                    [75.3140, 19.8580],
                    [75.3050, 19.8390],
                    [75.2950, 19.8220]
                ]
            }
        }
    ]
}

ADMINISTRATIVE_ZONES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "zone_id": "ZONE-1",
                "name": "Zone 1: Central Heritage & Old City",
                "key_areas": "Kranti Chowk, Gulmandi, Nirala Bazar, Begumpura",
                "ward_officer": "D. S. Kulkarni"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [75.2950, 19.8700],
                    [75.3350, 19.8700],
                    [75.3350, 19.9080],
                    [75.3050, 19.9080],
                    [75.2950, 19.8700]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "ZONE-2",
                "name": "Zone 2: CIDCO & HUDCO North",
                "key_areas": "CIDCO N-1 to N-7, Cannaught Place, TV Centre",
                "ward_officer": "R. M. Shinde"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [75.3350, 19.8700],
                    [75.3850, 19.8700],
                    [75.3850, 19.9200],
                    [75.3350, 19.9200],
                    [75.3350, 19.8700]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "ZONE-3",
                "name": "Zone 3: Garkheda & Southern Suburbs",
                "key_areas": "Garkheda, Ulkanagri, Beed Bypass South",
                "ward_officer": "S. V. Patil"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [75.3100, 19.8350],
                    [75.3650, 19.8350],
                    [75.3650, 19.8700],
                    [75.3100, 19.8700],
                    [75.3100, 19.8350]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "zone_id": "ZONE-4",
                "name": "Zone 4: Chikalthana & Eastern Suburbs",
                "key_areas": "Chikalthana, Mukundwadi, CIDCO N-8 to N-12",
                "ward_officer": "A. P. Deshmukh"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [75.3650, 19.8350],
                    [75.4080, 19.8350],
                    [75.4080, 19.8850],
                    [75.3650, 19.8850],
                    [75.3650, 19.8350]
                ]]
            }
        }
    ]
}
