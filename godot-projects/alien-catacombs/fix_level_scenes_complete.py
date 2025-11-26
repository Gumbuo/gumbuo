"""
Remove both ExtResource declarations AND node instances for deleted PixelLab enemies.
"""

import re

scene_files = [
    "scenes/main.tscn",
    "scenes/main_level2.tscn",
    "scenes/main_level3.tscn",
    "scenes/main_level4.tscn",
    "scenes/main_level5.tscn",
    "scenes/main_multiplayer.tscn",
]

# Enemy names to look for in node names
deleted_enemy_names = [
    "EnemyJellyfish",
    "EnemyDrone",
    "EnemyTurret",
    "EnemySlug",
    "EnemyUFO",
    "EnemyRedSoldier",
    "EnemyBlueWarrior",
    "EnemyPurpleMystic",
]

def fix_scene_file(filepath):
    """Remove enemy node instances from scene file."""
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()

        new_lines = []
        skip_until_next_node = False
        removed_nodes = 0

        for i, line in enumerate(lines):
            # Check if this is a node declaration for a deleted enemy
            if line.startswith('[node name="'):
                skip_until_next_node = False
                for enemy_name in deleted_enemy_names:
                    if f'name="{enemy_name}' in line:
                        skip_until_next_node = True
                        removed_nodes += 1
                        print(f"  Removing node: {line.strip()}")
                        break

            # If we're skipping, continue until we hit the next node or resource
            if skip_until_next_node:
                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    # Stop skipping when we hit another node or section
                    if next_line.startswith('[node ') or next_line.startswith('[sub_resource') or next_line.startswith('[ext_resource'):
                        skip_until_next_node = False
                continue

            new_lines.append(line)

        if removed_nodes > 0:
            with open(filepath, 'w') as f:
                f.writelines(new_lines)
            print(f"Fixed {filepath}: removed {removed_nodes} enemy nodes\n")
            return True
        else:
            print(f"No enemy nodes found in {filepath}\n")
            return False

    except FileNotFoundError:
        print(f"File not found: {filepath}\n")
        return False

def main():
    print("Removing enemy node instances from scenes...")
    print("=" * 70)

    fixed_count = 0
    for scene_file in scene_files:
        if fix_scene_file(scene_file):
            fixed_count += 1

    print("=" * 70)
    print(f"Fixed {fixed_count} scene files")

if __name__ == "__main__":
    main()
