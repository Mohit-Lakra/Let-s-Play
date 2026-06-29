def update_player_rating(current_stats, peer_scores):
    """
    Updates a player's skill, reliability, and behavior using a decaying-learning-rate EMA.
    
    current_stats: dict with {skill, reliability, behavior, matchesPlayed}
    peer_scores: dict with list of 1-5 ratings for each axis, e.g. {"skill": [4, 5], "reliability": [5, 5]}
    """
    matches_played = current_stats.get('matchesPlayed', 0)
    
    # Calculate learning rate (alpha). 
    # It starts high (0.5 for the first match) and shrinks as the player plays more games.
    # This means early ratings change your score a lot, but later ratings change it less.
    alpha = max(0.05, 1.0 / (matches_played + 2))
    
    updated_stats = {"matchesPlayed": matches_played + 1}
    
    axes = ['skill', 'reliability', 'behavior']
    
    for axis in axes:
        current_val = current_stats.get(axis, 70)
        scores = peer_scores.get(axis, [])
        
        if not scores:
            updated_stats[axis] = current_val
            continue
            
        # Calculate the average rating given by peers in this match (1-5 scale)
        avg_score = sum(scores) / len(scores)
        
        # Rescale the 1-5 score to a 0-100 scale
        scaled_score = ((avg_score - 1) / 4) * 100
        
        # Apply the Exponential Moving Average formula
        new_val = ((1 - alpha) * current_val) + (alpha * scaled_score)
        
        # Ensure it stays within 0-100 boundaries
        updated_stats[axis] = max(0.0, min(100.0, new_val))
        
    # Calculate the new 'overall' rating based on weighted combination
    overall = (0.4 * updated_stats.get('skill', 70)) + \
              (0.3 * updated_stats.get('reliability', 70)) + \
              (0.3 * updated_stats.get('behavior', 70))
              
    updated_stats['overall'] = overall
    
    return updated_stats

if __name__ == "__main__":
    # Test the rating update
    current = {"skill": 70, "reliability": 70, "behavior": 70, "matchesPlayed": 0}
    # Peers rated this player highly
    peers = {"skill": [4, 5], "reliability": [5, 5], "behavior": [4, 4]}
    
    new_rating = update_player_rating(current, peers)
    print(f"Old Rating: {current}")
    print(f"New Rating: {new_rating}")
