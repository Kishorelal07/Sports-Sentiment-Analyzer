import json
import random
from datetime import datetime, timedelta

def generate_ball_physics_feed():
    events = []
    match_id = "muf-eve-pl-2025-11-24"
    match_start = datetime(2025, 11, 24, 20, 0, 0)  # 20:00 GMT

    # Manchester United players
    mun_players = [
        "onana_a", "dalot_d", "varane_r", "martinez_l", "shaw_l",
        "casemiro", "fernandes_b", "rashford_m", "sancho_j", "ronaldo_c", "martial_a"
    ]

    # Everton players
    eve_players = [
        "pickford_j", "coleman_s", "keane_m", "tarkowski_j", "digne_l",
        "doucouré_a", "davies_t", "iwobi_a", "gray_d", "calvert_lewin_d", "rondon_s"
    ]

    event_id = 1
    current_minute = 0

    # Generate events throughout the match
    while current_minute <= 94:  # 90 + 4 added time
        timestamp = match_start + timedelta(minutes=current_minute, seconds=random.randint(0, 59))

        # Determine possession team
        possession_team = "Manchester United" if random.random() < 0.58 else "Everton"
        possession_players = mun_players if possession_team == "Manchester United" else eve_players

        # Generate different types of ball events
        event_types = ["pass", "shot", "tackle", "save", "clearance", "throw_in", "corner", "free_kick"]
        weights = [0.4, 0.1, 0.15, 0.05, 0.1, 0.08, 0.07, 0.05]
        event_type = random.choices(event_types, weights=weights)[0]

        if event_type == "pass":
            # Pass event with physics data
            passer = random.choice(possession_players)
            receiver_options = [p for p in possession_players if p != passer]
            receiver = random.choice(receiver_options) if receiver_options else passer

            # Generate pass physics
            distance = random.uniform(5, 40)
            speed = random.uniform(15, 35)  # m/s
            accuracy = random.uniform(0.7, 1.0)
            success = random.random() < accuracy

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": "pass",
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "possession_team": possession_team,
                "passer_id": passer,
                "receiver_id": receiver,
                "pass_success": success,
                "physics_data": {
                    "distance_meters": round(distance, 2),
                    "speed_mps": round(speed, 2),
                    "accuracy_percentage": round(accuracy * 100, 1),
                    "launch_angle_degrees": round(random.uniform(0, 15), 1),
                    "spin_rpm": round(random.uniform(-500, 500), 0),
                    "ball_height_max": round(random.uniform(0.5, 3.0), 2)
                }
            })

            if success:
                events.append({
                    "eventId": f"BALL_{event_id}_impact",
                    "event_type": "ball_physics",
                    "sub_type": "pass_impact",
                    "match_id": match_id,
                    "timestamp": (timestamp + timedelta(milliseconds=random.randint(500, 1500))).isoformat() + "Z",
                    "minute": current_minute,
                    "possession_team": possession_team,
                    "receiver_id": receiver,
                    "physics_data": {
                        "impact_force": round(random.uniform(50, 200), 1),
                        "control_quality": round(random.uniform(0.8, 1.0), 2),
                        "first_touch_distance": round(random.uniform(0, 2), 2)
                    }
                })

        elif event_type == "shot":
            # Shot event
            shooter = random.choice(possession_players)
            goalkeeper = "pickford_j" if possession_team == "Everton" else "onana_a"

            # Shot physics
            distance_to_goal = random.uniform(8, 35)
            shot_type = random.choice(["ground_shot", "volley", "header", "curler"])
            speed = random.uniform(25, 45)
            accuracy = random.uniform(0.3, 0.9)
            goal = random.random() < (accuracy * 0.2)  # Lower goal probability

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": "shot",
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "possession_team": possession_team,
                "shooter_id": shooter,
                "goalkeeper_id": goalkeeper,
                "shot_type": shot_type,
                "goal_scored": goal,
                "physics_data": {
                    "distance_to_goal": round(distance_to_goal, 2),
                    "shot_speed_mps": round(speed, 2),
                    "launch_angle_degrees": round(random.uniform(5, 35), 1),
                    "spin_rpm": round(random.uniform(-800, 800), 0),
                    "shot_accuracy": round(accuracy * 100, 1),
                    "ball_trajectory": "parabolic" if shot_type != "header" else "linear"
                }
            })

            if goal:
                events.append({
                    "eventId": f"BALL_{event_id}_goal",
                    "event_type": "ball_physics",
                    "sub_type": "goal_impact",
                    "match_id": match_id,
                    "timestamp": (timestamp + timedelta(milliseconds=200)).isoformat() + "Z",
                    "minute": current_minute,
                    "physics_data": {
                        "net_penetration_force": round(random.uniform(100, 300), 1),
                        "goal_location": random.choice(["top_left", "top_center", "top_right", "bottom_left", "bottom_center", "bottom_right"])
                    }
                })

        elif event_type == "tackle":
            # Tackle event
            tackler_team = "Everton" if possession_team == "Manchester United" else "Manchester United"
            tackler_players = eve_players if tackler_team == "Everton" else mun_players
            tackler = random.choice(tackler_players)
            tackled = random.choice(possession_players)

            tackle_success = random.random() < 0.6
            clean_tackle = random.random() < 0.8

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": "tackle",
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "tackler_team": tackler_team,
                "tackler_id": tackler,
                "tackled_player_id": tackled,
                "tackle_success": tackle_success,
                "clean_tackle": clean_tackle,
                "physics_data": {
                    "tackle_force": round(random.uniform(100, 400), 1),
                    "ball_displacement_meters": round(random.uniform(1, 5), 2),
                    "contact_angle_degrees": round(random.uniform(30, 150), 1),
                    "tackle_type": random.choice(["standing", "sliding", "shoulder_charge"])
                }
            })

        elif event_type == "save":
            # Goalkeeper save
            goalkeeper = "pickford_j" if possession_team == "Everton" else "onana_a"
            shooter_team = "Manchester United" if goalkeeper == "pickford_j" else "Everton"
            shooter = random.choice(mun_players if shooter_team == "Manchester United" else eve_players)

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": "save",
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "goalkeeper_id": goalkeeper,
                "shooter_id": shooter,
                "physics_data": {
                    "dive_distance_meters": round(random.uniform(1, 4), 2),
                    "save_type": random.choice(["one_handed", "two_handed", "foot_save", "tip_over_bar"]),
                    "reaction_time_ms": random.randint(200, 600),
                    "save_force": round(random.uniform(50, 150), 1)
                }
            })

        elif event_type == "clearance":
            # Defensive clearance
            clearer = random.choice(possession_players)
            clearance_type = random.choice(["header", "foot_clearance", "throw_clearance"])

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": "clearance",
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "possession_team": possession_team,
                "clearer_id": clearer,
                "clearance_type": clearance_type,
                "physics_data": {
                    "clearance_distance_meters": round(random.uniform(15, 40), 2),
                    "clearance_height_meters": round(random.uniform(5, 25), 2),
                    "clearance_angle_degrees": round(random.uniform(20, 70), 1)
                }
            })

        elif event_type in ["throw_in", "corner", "free_kick"]:
            # Set piece events
            thrower = random.choice(possession_players)

            events.append({
                "eventId": f"BALL_{event_id}",
                "event_type": "ball_physics",
                "sub_type": event_type,
                "match_id": match_id,
                "timestamp": timestamp.isoformat() + "Z",
                "minute": current_minute,
                "possession_team": possession_team,
                "player_id": thrower,
                "set_piece_type": event_type,
                "physics_data": {
                    "throw_distance_meters": round(random.uniform(10, 25), 2),
                    "throw_height_meters": round(random.uniform(0.5, 3), 2),
                    "throw_accuracy_percentage": round(random.uniform(70, 95), 1)
                }
            })

        event_id += 1
        current_minute += random.uniform(0.5, 3.0)  # Events every 30 seconds to 3 minutes

    return events

if __name__ == "__main__":
    print("Generating ball physics feed...")
    events = generate_ball_physics_feed()

    # Save to file
    with open('soccer-data/ball-physics-feed.json', 'w') as f:
        json.dump(events, f, indent=2)

    print(f"Generated {len(events)} ball physics events")
