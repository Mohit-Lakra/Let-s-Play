def build_squads(players):
    """
    Splits a list of players into two balanced teams based on their overall rating.
    This uses a greedy 'snake draft' algorithm.
    
    players: list of dicts [{"player_id": "123", "overall": 85}, ...]
    """
    # 1. Sort players descending by their overall rating
    sorted_players = sorted(players, key=lambda x: x['overall'], reverse=True)
    
    team_a = []
    team_b = []
    sum_a = 0
    sum_b = 0
    
    # 2. Iterate through the sorted list and assign the next best player 
    # to the team that currently has the lowest total rating.
    for player in sorted_players:
        if sum_a <= sum_b:
            team_a.append(player['player_id'])
            sum_a += player['overall']
        else:
            team_b.append(player['player_id'])
            sum_b += player['overall']
            
    return {
        "team_a": team_a,
        "team_b": team_b,
        "team_a_avg": sum_a / len(team_a) if team_a else 0,
        "team_b_avg": sum_b / len(team_b) if team_b else 0
    }

if __name__ == "__main__":
    # Test the squad builder
    test_players = [
        {"player_id": "p1", "overall": 90},
        {"player_id": "p2", "overall": 85},
        {"player_id": "p3", "overall": 80},
        {"player_id": "p4", "overall": 75},
        {"player_id": "p5", "overall": 60},
        {"player_id": "p6", "overall": 50},
    ]
    
    squads = build_squads(test_players)
    print("Squads Built:")
    print(f"Team A (Avg {squads['team_a_avg']}): {squads['team_a']}")
    print(f"Team B (Avg {squads['team_b_avg']}): {squads['team_b']}")
