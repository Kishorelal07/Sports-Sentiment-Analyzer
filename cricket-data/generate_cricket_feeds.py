#!/usr/bin/env python3
"""Generate mock cricket feed data for H-Sports platform."""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

MATCH_ID = "eng-aus-t20-2025-11-24"
MATCH_START = datetime(2025, 11, 24, 19, 0, 0)
OUTPUT_DIR = Path(__file__).parent

ENG_PLAYERS = [
    {"name": "Jos Buttler", "id": "buttler_j", "role": "Wicketkeeper-Batter"},
    {"name": "Dawid Malan", "id": "malan_d", "role": "Batter"},
    {"name": "Ben Stokes", "id": "stokes_b", "role": "All-rounder"},
    {"name": "Harry Brook", "id": "brook_h", "role": "Batter"},
    {"name": "Moeen Ali", "id": "moeen_a", "role": "All-rounder"},
    {"name": "Chris Woakes", "id": "woakes_c", "role": "Bowler"},
    {"name": "Mark Wood", "id": "wood_m", "role": "Bowler"},
    {"name": "Adil Rashid", "id": "rashid_a", "role": "Bowler"},
    {"name": "Jofra Archer", "id": "archer_j", "role": "Bowler"},
    {"name": "Sam Curran", "id": "curran_s", "role": "All-rounder"},
    {"name": "Jonny Bairstow", "id": "bairstow_j", "role": "Batter"},
]

AUS_PLAYERS = [
    {"name": "David Warner", "id": "warner_d", "role": "Batter"},
    {"name": "Aaron Finch", "id": "finch_a", "role": "Batter"},
    {"name": "Steve Smith", "id": "smith_s", "role": "Batter"},
    {"name": "Glenn Maxwell", "id": "maxwell_g", "role": "All-rounder"},
    {"name": "Marcus Stoinis", "id": "stoinis_m", "role": "All-rounder"},
    {"name": "Mitchell Marsh", "id": "marsh_m", "role": "All-rounder"},
    {"name": "Pat Cummins", "id": "cummins_p", "role": "Bowler"},
    {"name": "Mitchell Starc", "id": "starc_m", "role": "Bowler"},
    {"name": "Adam Zampa", "id": "zampa_a", "role": "Bowler"},
    {"name": "Josh Hazlewood", "id": "hazlewood_j", "role": "Bowler"},
    {"name": "Matthew Wade", "id": "wade_m", "role": "Wicketkeeper-Batter"},
]

COMMENTARY_LINES = [
    "Driven through covers for a boundary!",
    "Dot ball — good line and length from the bowler.",
    "Pulled away to the leg side, one run.",
    "Massive six over long-on! The crowd erupts.",
    "Appeal for LBW — turned down by the umpire.",
    "Quick single stolen, excellent running between the wickets.",
    "Edged and taken at slip! WICKET!",
    "Slower ball deceives the batter, bowled him!",
    "Full toss punished — four runs to deep midwicket.",
    "Yorker at the base of off stump, well dug out.",
    "Flighted delivery, beaten in the air but lands safe.",
    "Short ball hooked for six! Incredible power.",
    "Maiden over — pressure building on the batting side.",
    "Reverse sweep finds the gap, two runs.",
    "Caught at deep midwicket — a crucial breakthrough!",
]


def ts(minutes_offset: float) -> str:
    return (MATCH_START + timedelta(minutes=minutes_offset)).strftime("%Y-%m-%dT%H:%M:%S")


def write_json(name: str, data) -> None:
    path = OUTPUT_DIR / name
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"  wrote {name} ({len(data) if isinstance(data, list) else 1} records)")


def generate_match_metadata() -> dict:
    return {
        "match_id": MATCH_ID,
        "series": "England vs Australia T20 Series 2025",
        "match_number": 3,
        "format": "T20",
        "date": "2025-11-24",
        "venue": "Melbourne Cricket Ground",
        "city": "Melbourne",
        "country": "Australia",
        "toss": {"winner": "England", "decision": "bat"},
        "teams": {
            "team1": {
                "name": "England",
                "captain": "Jos Buttler",
                "wicketkeeper": "Jos Buttler",
                "players": ENG_PLAYERS,
            },
            "team2": {
                "name": "Australia",
                "captain": "Aaron Finch",
                "wicketkeeper": "Matthew Wade",
                "players": AUS_PLAYERS,
            },
        },
        "umpires": [
            {"name": "Kumar Dharmasena", "role": "On-field"},
            {"name": "Marais Erasmus", "role": "On-field"},
            {"name": "Richard Kettleborough", "role": "TV"},
        ],
        "innings": [
            {
                "number": 2,
                "batting_team": "Australia",
                "bowling_team": "England",
                "total_runs": 142,
                "total_wickets": 4,
                "total_overs": 17.3,
                "target": 180,
                "extras": 8,
                "boundaries": {"fours": 12, "sixes": 5},
                "note": "Australia chasing 180 in a tense run chase",
            }
        ],
        "result": {
            "status": "live",
            "note": "Australia need 38 runs from 15 balls",
            "projected_winner": "Australia",
            "projected_margin": "narrow",
        },
        "player_of_match": None,
        "data_source": "mock",
    }


def generate_sentiment() -> list:
    players = [p["id"] for p in ENG_PLAYERS + AUS_PLAYERS]
    sentiments = []
    for i in range(80):
        score = round(random.uniform(-1, 1), 3)
        if score > 0.3:
            label = "positive"
        elif score < -0.3:
            label = "negative"
        else:
            label = "neutral"
        player = players[i % len(players)]
        team = "England" if player in [p["id"] for p in ENG_PLAYERS] else "Australia"
        sentiments.append(
            {
                "match_id": MATCH_ID,
                "player_id": player,
                "team_id": team.lower(),
                "timestamp": ts(i * 1.5),
                "sentiment_score": score,
                "sentiment_label": label,
                "mention_count": random.randint(20, 500),
                "source": "twitter",
            }
        )
    return sentiments


def simulate_innings() -> tuple[list, list, list, list, list]:
    """Simulate Australia chase — returns stats, commentary, wickets, physics, bowler stats."""
    stats_events = []
    commentary_events = []
    wicket_events = []
    physics_events = []
    bowler_stats = []

    runs = 0
    wickets = 0
    ball_index = 0
    wicket_overs = {5: "caught", 10: "bowled", 14: "lbw"}

    for over in range(1, 18):
        for ball in range(1, 7):
            if over == 17 and ball > 3:
                break

            ball_index += 1
            minutes = 90 + over * 3 + ball * 0.4

            runs_this_ball = random.choices([0, 1, 2, 4, 6], weights=[30, 35, 15, 15, 5])[0]
            if over in wicket_overs and ball == 3 and wickets < 4:
                runs_this_ball = 0
                wickets += 1
                wicket_events.append(
                    {
                        "event_id": f"WKT_{wicket_events.__len__() + 1}",
                        "event_type": "wicket",
                        "sub_type": wicket_overs[over],
                        "match_id": MATCH_ID,
                        "innings": 2,
                        "over_number": over,
                        "ball_number": ball,
                        "timestamp": ts(minutes),
                        "batter_id": random.choice([p["id"] for p in AUS_PLAYERS[:6]]),
                        "bowler_id": random.choice([p["id"] for p in ENG_PLAYERS if "Bowler" in p["role"] or "All-rounder" in p["role"]]),
                        "dismissal_type": wicket_overs[over],
                        "runs": runs,
                        "wickets": wickets,
                    }
                )
            else:
                runs += runs_this_ball

            overs_float = over + (ball / 10.0)
            stats_events.append(
                {
                    "event_id": f"STAT_{ball_index}",
                    "event_type": "match_statistics",
                    "sub_type": "over_summary",
                    "match_id": MATCH_ID,
                    "innings": 2,
                    "over_number": over,
                    "ball_number": ball,
                    "timestamp": ts(minutes),
                    "team_stats": {
                        "australia": {"runs": runs, "wickets": wickets, "overs": round(overs_float, 1)},
                        "england": {"runs": 179, "wickets": 6, "overs": 20.0},
                    },
                    "run_rate": round(runs / max(overs_float, 0.1), 2),
                    "required_run_rate": round((180 - runs) / max(20 - overs_float, 0.1), 2),
                }
            )

            if ball_index % 3 == 0:
                line = random.choice(COMMENTARY_LINES)
                commentary_events.append(
                    {
                        "event_id": f"COMM_{len(commentary_events) + 1}",
                        "event_type": "commentary",
                        "sub_type": "ball_commentary",
                        "match_id": MATCH_ID,
                        "innings": 2,
                        "over_number": over,
                        "ball_number": ball,
                        "timestamp": ts(minutes),
                        "commentary_text": f"Over {over}.{ball}: {line}",
                        "commentator": random.choice(["Ian Smith", "Michael Slater", "Isa Guha"]),
                    }
                )

            if ball_index % 4 == 0:
                bowler_id = random.choice(["wood_m", "archer_j", "rashid_a", "woakes_c"])
                physics_events.append(
                    {
                        "event_id": f"PHYS_{len(physics_events) + 1}",
                        "event_type": "physics",
                        "sub_type": "ball_release",
                        "match_id": MATCH_ID,
                        "innings": 2,
                        "over_number": over,
                        "ball_number": ball,
                        "timestamp": ts(minutes),
                        "bowler_id": bowler_id,
                        "release_speed_kmh": round(random.uniform(125, 150), 1),
                        "spin_rpm": round(random.uniform(800, 2800), 0),
                    }
                )
                bowler_stats.append(
                    {
                        "event_id": f"BOWL_{len(bowler_stats) + 1}",
                        "event_type": "bowler_stats",
                        "match_id": MATCH_ID,
                        "timestamp": ts(minutes),
                        "bowler_id": bowler_id,
                        "bowler_name": next(p["name"] for p in ENG_PLAYERS if p["id"] == bowler_id),
                        "release_speed_kmh": round(random.uniform(125, 150), 1),
                        "spin_rpm": round(random.uniform(800, 2800), 0),
                        "fatigue_level": round(random.uniform(0.2, 0.8), 2),
                        "accuracy_score": round(random.uniform(0.6, 0.95), 2),
                    }
                )

    return stats_events, commentary_events, wicket_events, physics_events, bowler_stats


def generate_biometrics() -> list:
    bios = []
    for i, player in enumerate(ENG_PLAYERS + AUS_PLAYERS):
        bios.append(
            {
                "event_id": f"BIO_{i + 1}",
                "event_type": "player_biometric",
                "match_id": MATCH_ID,
                "timestamp": ts(30 + i * 2),
                "player_id": player["id"],
                "player_role": player["role"],
                "heart_rate_bpm": random.randint(110, 175),
                "energy_level": round(random.uniform(0.4, 0.95), 2),
                "muscle_fatigue_index": round(random.uniform(0.1, 0.7), 2),
            }
        )
    return bios


def generate_minimal_feed(event_type: str, sub_type: str, count: int = 15) -> list:
    events = []
    for i in range(count):
        events.append(
            {
                "event_id": f"{event_type.upper()}_{i + 1}",
                "event_type": event_type,
                "sub_type": sub_type,
                "match_id": MATCH_ID,
                "innings": 2,
                "over_number": (i % 17) + 1,
                "ball_number": (i % 6) + 1,
                "timestamp": ts(60 + i * 3),
            }
        )
    return events


def main() -> None:
    print(f"Generating cricket mock data in {OUTPUT_DIR}...")
    random.seed(42)

    write_json("match-metadata.json", generate_match_metadata())
    write_json("sentiment-mock.json", generate_sentiment())

    stats, commentary, wickets, physics, bowler_stats = simulate_innings()
    write_json("match-statistics-feed.json", stats)
    write_json("commentary-feed.json", commentary)
    write_json("wicket-feed.json", wickets)
    write_json("physics-feed.json", physics)
    write_json("bowler-stats-feed.json", bowler_stats)
    write_json("player-biometric-feed.json", generate_biometrics())
    write_json("fielder-feed.json", generate_minimal_feed("fielder", "catch_attempt"))
    write_json("umpire-decisions-feed.json", generate_minimal_feed("umpire_decision", "lbw_review"))
    write_json("crowd-reactions-feed.json", generate_minimal_feed("crowd_reaction", "cheer"))
    write_json("equipment-sensor-feed.json", generate_minimal_feed("equipment_sensor", "bat_impact"))

    media_dir = OUTPUT_DIR / "media"
    media_dir.mkdir(exist_ok=True)
    print(f"  media/ directory ready (add images optional)")
    print("Done!")


if __name__ == "__main__":
    main()
