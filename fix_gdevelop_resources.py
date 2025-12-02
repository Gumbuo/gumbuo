#!/usr/bin/env python3
"""
Add animation image resources to GDevelop project resources list
"""
import json
from pathlib import Path

def add_resources_to_project():
    print("Loading game.json...")
    with open("IDEAS ONLY/game.json", "r", encoding="utf-8") as f:
        game_data = json.load(f)

    # Get existing resources
    existing_resources = {r["file"] for r in game_data.get("resources", {}).get("resources", [])}
    print(f"Existing resources: {len(existing_resources)}")

    # Find all animation images
    characters_path = Path("IDEAS ONLY/assets/image/characters")
    new_resources = []

    for character_dir in characters_path.iterdir():
        if not character_dir.is_dir():
            continue

        animations_dir = character_dir / "animations"
        if not animations_dir.exists():
            continue

        # Find all PNG files in animations
        for png_file in animations_dir.rglob("*.png"):
            # Get relative path from IDEAS ONLY directory
            relative_path = png_file.relative_to(Path("IDEAS ONLY"))
            path_str = str(relative_path).replace("\\", "/")

            if path_str not in existing_resources:
                resource = {
                    "file": path_str,
                    "kind": "image",
                    "metadata": "",
                    "name": png_file.stem,
                    "smoothed": False,
                    "userAdded": False
                }
                new_resources.append(resource)

    print(f"Found {len(new_resources)} new animation frames to add")

    # Add to resources
    if "resources" not in game_data:
        game_data["resources"] = {"resources": []}

    game_data["resources"]["resources"].extend(new_resources)

    print(f"Total resources: {len(game_data['resources']['resources'])}")

    # Save
    print("Saving updated game.json...")
    with open("IDEAS ONLY/game.json", "w", encoding="utf-8") as f:
        json.dump(game_data, f, indent=2)

    print("Done! Resources added successfully.")
    print("\nNext steps:")
    print("1. Close and reopen the project in GDevelop")
    print("2. The animations should now render properly!")

if __name__ == "__main__":
    add_resources_to_project()
