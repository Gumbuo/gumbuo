#!/usr/bin/env python3
"""
Add character sprites to GDevelop project with full animations
"""
import json
import os
from pathlib import Path

# Characters to add
PLAYER = "green_alien_player"
ENEMIES = [
    "fire_elemental",
    "boss_alien_overlord",
    "yellow_ghost",
    "orange_ghost",
    "red_ghost",
    "green_ghost"
]

# Animation mappings - GDevelop animation name -> folder name
ANIMATIONS = {
    "idle": "breathing-idle",
    "walk": "walking-8-frames",
    "run": "running-8-frames",
    "jump": "jumping-1",
    "punch": "cross-punch",
    "kick": "high-kick",
    "hurt": "taking-punch",
    "attack": "fireball"
}

DIRECTIONS = ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

def create_sprite_object(character_name, is_player=False):
    """Create a GDevelop sprite object with animations"""

    obj = {
        "assetStoreId": "",
        "name": "Player" if is_player else character_name.replace("_", " ").title(),
        "tags": "player" if is_player else "enemy",
        "type": "Sprite",
        "updateIfNotVisible": False,
        "variables": [],
        "effects": [],
        "behaviors": [],
        "animations": []
    }

    # Add animations
    char_path = Path(f"assets/image/characters/{character_name}")

    for anim_name, folder_name in ANIMATIONS.items():
        anim_path = char_path / "animations" / folder_name

        # Check if animation exists
        if not (Path("IDEAS ONLY") / anim_path / "south").exists():
            continue

        animation = {
            "name": anim_name,
            "useMultipleDirections": True,
            "directions": []
        }

        # Add all 8 directions
        for direction in DIRECTIONS:
            dir_path = anim_path / direction
            full_dir_path = Path("IDEAS ONLY") / dir_path

            if not full_dir_path.exists():
                continue

            # Get all frames
            frames = sorted(full_dir_path.glob("frame_*.png"))

            if not frames:
                continue

            direction_data = {
                "looping": True if anim_name in ["idle", "walk", "run"] else False,
                "timeBetweenFrames": 0.08,
                "sprites": []
            }

            for frame in frames:
                sprite_data = {
                    "hasCustomCollisionMask": False,
                    "image": str(dir_path / frame.name).replace("\\", "/"),
                    "points": [],
                    "originPoint": {"name": "origine", "x": 0, "y": 0},
                    "centerPoint": {"automatic": True, "name": "centre", "x": 0, "y": 0},
                    "customCollisionMask": []
                }
                direction_data["sprites"].append(sprite_data)

            animation["directions"].append(direction_data)

        if animation["directions"]:
            obj["animations"].append(animation)

    return obj

def main():
    # Load existing game.json
    print("Loading game.json...")
    with open("IDEAS ONLY/game.json", "r", encoding="utf-8") as f:
        game_data = json.load(f)

    # Find the Game layout
    game_layout = None
    for layout in game_data.get("layouts", []):
        if layout["name"] == "Game":
            game_layout = layout
            break

    if not game_layout:
        print("ERROR: Could not find 'Game' layout!")
        return

    print(f"Found Game layout with {len(game_layout.get('objects', []))} existing objects")

    # Create player object
    print(f"\nAdding player: {PLAYER}")
    player_obj = create_sprite_object(PLAYER, is_player=True)
    print(f"  - Added {len(player_obj['animations'])} animations")

    # Create enemy objects
    enemy_objects = []
    for enemy in ENEMIES:
        print(f"\nAdding enemy: {enemy}")
        enemy_obj = create_sprite_object(enemy, is_player=False)
        print(f"  - Added {len(enemy_obj['animations'])} animations")
        enemy_objects.append(enemy_obj)

    # Add to layout
    if "objects" not in game_layout:
        game_layout["objects"] = []

    game_layout["objects"].append(player_obj)
    game_layout["objects"].extend(enemy_objects)

    print(f"\nTotal objects in Game layout: {len(game_layout['objects'])}")

    # Save updated game.json
    backup_path = "IDEAS ONLY/game.json.backup"
    print(f"\nCreating backup: {backup_path}")
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(game_data, f)

    print("Saving updated game.json...")
    with open("IDEAS ONLY/game.json", "w", encoding="utf-8") as f:
        json.dump(game_data, f, indent=2)

    print("\n✓ Successfully added characters to GDevelop project!")
    print(f"  - 1 Player: {PLAYER}")
    print(f"  - {len(ENEMIES)} Enemies: {', '.join(ENEMIES)}")
    print("\nOpen 'IDEAS ONLY/game.json' in GDevelop to use these characters!")

if __name__ == "__main__":
    main()
