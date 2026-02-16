def route_ticket(location: str) -> str:
    location = location.lower()

    # All hostel related locations go to HOSTEL_OFFICE
    if "hostel" in location:
        return "HOSTEL_OFFICE"

    # Academic areas
    if "tb" in location or "library" in location or "class" in location or "lab" in location:
        return "ACADEMIC_OFFICE"

    # Everything else
    return "CAMPUS_FACILITIES"
