import math

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Computes the Haversine distance between two points in kilometers.
    """
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def rank_candidates(requester, candidates):
    """
    Ranks candidates based on a weighted similarity algorithm.
    
    requester: dict containing overall rating and location
    candidates: list of dicts containing candidate features
    """
    ranked_list = []
    
    for candidate in candidates:
        # 1. Proximity Score (0 to 100)
        # Drops to 0 if distance is 10km or more
        distance_km = candidate['distance_km']
        proximity_score = max(0, 100 - (distance_km * 10))
        
        # 2. Rating Closeness Score (0 to 100)
        # 100 means identical rating, drops as the difference grows
        rating_closeness = 100 - abs(requester['overall'] - candidate['overall'])
        
        # 3. Availability Score (0 to 100)
        # availability_overlap is a fraction (0.0 to 1.0)
        availability_score = candidate['availability_overlap'] * 100
        
        # 4. Reliability Score (already 0 to 100)
        reliability_score = candidate['reliability']
        
        # Calculate final weighted score
        final_score = (0.30 * proximity_score) + \
                      (0.25 * rating_closeness) + \
                      (0.25 * availability_score) + \
                      (0.20 * reliability_score)
                      
        # Determine the top factors for the GenAI explanation
        factors = {
            "proximity": proximity_score,
            "skill closeness": rating_closeness,
            "availability match": availability_score,
            "reliability": reliability_score
        }
        # Sort factors by score and take top 2
        top_factors = sorted(factors.items(), key=lambda item: item[1], reverse=True)[:2]
        top_factor_names = [f[0] for f in top_factors]
        
        ranked_list.append({
            "candidate_id": candidate['candidate_id'],
            "score": final_score,
            "top_factors": top_factor_names
        })
        
    # Sort candidates descending by score
    ranked_list.sort(key=lambda x: x['score'], reverse=True)
    return ranked_list
