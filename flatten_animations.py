#!/usr/bin/env python3
"""
Flatten character animations to simple structure and update GDevelop project
"""
import json
import shutil
from pathlib import Path

PLAYER = "green_alien_player"
ENEMIES = ["fire_elemental", "boss_alien_overlord", "yellow_ghost", "orange_ghost", "red_ghost", "green_ghost"]

def flatten_animations():
    """Copy animations to flatter structure with simpler names"""

    dest_dir = Path("IDEAS ONLY/assets/image")
    dest_dir.mkdir(parents=True, exist_ok=True)

    file_mappings = {}  # old_path -> new_path mapping

    for character in [PLAYER] + ENEMIES:
        char_path = Path(f"IDEAS ONLY/assets/image/characters/{character}/animations")

        if not char_path.exists():
            print(f"Skipping {character} - no animations folder")
            continue

        print(f"Processing {character}...")
        count = 0

        # Process each animation type
        for anim_dir in char_path.iterdir():
            if not anim_dir.is_dir():
                continue

            anim_name = anim_dir.name

            # Process each direction
            for direction_dir in anim_dir.iterdir():
                if not direction_dir.is_dir():
                    continue

                direction = direction_dir.name

                # Copy frames with simpler names
                for frame_file in sorted(direction_dir.glob("frame_*.png")):
                    frame_num = frame_file.stem.split("_")[-1]

                    # New flattened name: character_animation_direction_frameXX.png
                    new_name = f"{character}_{anim_name}_{direction}_{frame_num}.png"
                    new_path = dest_dir / new_name

                    # Copy file
                    shutil.copy2(frame_file, new_path)

                    # Track mapping
                    old_rel = f"assets/image/characters/{character}/animations/{anim_name}/{direction}/{frame_file.name}"
                    new_rel = f"{new_name}"
                    file_mappings[old_rel] = new_rel

                    count += 1

        print(f"  Copied {count} frames")

    return file_mappings

def update_sprite_paths(file_mappings):
    """Update sprite animation paths in game.json"""

    print("\nUpdating game.json sprite paths...")
    with open("IDEAS ONLY/game.json", "r", encoding="utf-8") as f:
        game_data = json.load(f)

    updates = 0

    for layout in game_data.get('layouts', []):
        for obj in layout['objects']:
            if obj['name'] in ['Player', 'Fire Elemental', 'Boss Alien Overlord', 'Yellow Ghost', 'Orange Ghost', 'Red Ghost', 'Green Ghost']:
                for anim in obj.get('animations', []):
                    for direction in anim.get('directions', []):
                        for sprite in direction.get('sprites', []):
                            old_path = sprite.get('image', '')
                            if old_path in file_mappings:
                                sprite['image'] = file_mappings[old_path]
                                updates += 1

    print(f"Updated {updates} sprite paths")

    # Update resources
    resources = game_data.get('resources', {}).get('resources', [])
    new_resources = []

    for resource in resources:
        if resource['file'] in file_mappings:
            resource['file'] = file_mappings[resource['file']]
        new_resources.append(resource)

    game_data['resources']['resources'] = new_resources

    # Save
    print("Saving game.json...")
    with open("IDEAS ONLY/game.json", "w", encoding="utf-8") as f:
        json.dump(game_data, f, indent=2)

    print("Done!")

if __name__ == "__main__":
    print("Flattening character animations...")
    mappings = flatten_animations()
    print(f"\nProcessed {len(mappings)} files")

    update_sprite_paths(mappings)

    print("\n✓ Animations flattened successfully!")
    print("Close and reopen GDevelop to see the changes.")
