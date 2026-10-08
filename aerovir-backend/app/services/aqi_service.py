"""
AQI calculation module — isolated so the official formula (e.g. CPCB India,
US EPA, or your project's own spec) can be swapped in without touching the
rest of the backend.

Placeholder implementation below uses the CPCB (India) sub-index breakpoint
method, the most common standard for PM2.5/PM10/NO2/SO2/CO/O3/NH3 in Indian
AQI projects. Replace BREAKPOINTS with your project's official table if
different.
"""

BREAKPOINTS = {
    "pm25": [(0,30,0,50),(31,60,51,100),(61,90,101,200),(91,120,201,300),(121,250,301,400),(251,500,401,500)],
    "pm10": [(0,50,0,50),(51,100,51,100),(101,250,101,200),(251,350,201,300),(351,430,301,400),(431,600,401,500)],
    "no2": [(0,40,0,50),(41,80,51,100),(81,180,101,200),(181,280,201,300),(281,400,301,400),(401,1000,401,500)],
    "so2": [(0,40,0,50),(41,80,51,100),(81,380,101,200),(381,800,201,300),(801,1600,301,400),(1601,2000,401,500)],
    "co": [(0,1,0,50),(1.1,2,51,100),(2.1,10,101,200),(10.1,17,201,300),(17.1,34,301,400),(34.1,50,401,500)],
    "o3": [(0,50,0,50),(51,100,51,100),(101,168,101,200),(169,208,201,300),(209,748,301,400),(749,1000,401,500)],
    "nh3": [(0,200,0,50),(201,400,51,100),(401,800,101,200),(801,1200,201,300),(1201,1800,301,400),(1801,2400,401,500)],
}

CATEGORIES = [
    (0, 50, "Good"),
    (51, 100, "Satisfactory"),
    (101, 200, "Moderate"),
    (201, 300, "Poor"),
    (301, 400, "Very Poor"),
    (401, 500, "Severe"),
]


def _sub_index(concentration: float, table: list[tuple]) -> float | None:
    for c_lo, c_hi, i_lo, i_hi in table:
        if c_lo <= concentration <= c_hi:
            return round(i_lo + (i_hi - i_lo) / (c_hi - c_lo) * (concentration - c_lo), 1)
    # above the highest breakpoint band
    c_lo, c_hi, i_lo, i_hi = table[-1]
    if concentration > c_hi:
        return round(i_hi + (concentration - c_hi), 1)
    return None


def _category(aqi: float) -> str:
    for lo, hi, name in CATEGORIES:
        if lo <= aqi <= hi:
            return name
    return "Severe"


def calculate_aqi(predictions: dict) -> tuple[int, str]:
    """Overall AQI = max of available pollutant sub-indices (standard method).
    benzene has no CPCB sub-index table — excluded from the AQI aggregate,
    still returned in `predictions`."""
    sub_indices = []
    for pollutant, table in BREAKPOINTS.items():
        if pollutant in predictions and predictions[pollutant] is not None:
            si = _sub_index(predictions[pollutant], table)
            if si is not None:
                sub_indices.append(si)

    if not sub_indices:
        return 0, "Unknown"

    overall = round(max(sub_indices))
    return overall, _category(overall)
