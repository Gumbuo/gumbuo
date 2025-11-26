"""
Remove references to deleted PixelLab enemy scenes from level files.
"""

import re

# Scene files to fix
scene_files = [
    "scenes/main.tscn",
    "scenes/main_level2.tscn",
    "scenes/main_level3.tscn",
    "scenes/main_level4.tscn",
    "scenes/main_level5.tscn",
    "scenes/main_multiplayer.tscn",
]

# Deleted enemy scenes to remove
deleted_enemies = [
    "enemy_jellyfish.tscn",
    "enemy_jellyfish_new.tscn",
    "enemy_jellyfish_test.tscn",
    "enemy_drone.tscn",
    "enemy_turret_new.tscn",
    "enemy_slug.tscn",
    "enemy_ufo.tscn",
    "enemy_red_soldier.tscn",
    "enemy_blue_warrior.tscn",
    "enemy_purple_mystic.tscn",
]

def fix_scene_file(filepath):
    """Remove ExtResource lines for deleted enemies."""
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()

        # Filter out lines that reference deleted enemies
        new_lines = []
        removed_count = 0

        for line in lines:
            should_keep = True
            for enemy in deleted_enemies:
                if enemy in line and '[ext_resource' in line:
                    should_keep = False
                    removed_count += 1
                    print(f"  Removing: {line.strip()}")
                    break

            if should_keep:
                new_lines.append(line)

        if removed_count > 0:
            # Update load_steps count
            for i, line in enumerate(new_lines):
                if line.startswith('[gd_scene load_steps='):
                    match = re.search(r'load_steps=(\d+)', line)
                    if match:
                        old_steps = int(match.group(1))
                        new_steps = old_steps - removed_count
                        new_lines[i] = line.replace(f'load_steps={old_steps}', f'load_steps={new_steps}')
                        print(f"  Updated load_steps: {old_steps} -> {new_steps}")
                    break

            # Write back
            with open(filepath, 'w') as f:
                f.writelines(new_lines)

            print(f"Fixed {filepath}: removed {removed_count} references\n")
            return True
        else:
            print(f"No changes needed for {filepath}\n")
            return False

    except FileNotFoundError:
        print(f"File not found: {filepath}\n")
        return False

def main():
    print("Fixing level scene files...")
    print("=" * 70)

    fixed_count = 0
    for scene_file in scene_files:
        if fix_scene_file(scene_file):
            fixed_count += 1

    print("=" * 70)
    print(f"Fixed {fixed_count} scene files")
    print("\nYour game should now run without errors!")

if __name__ == "__main__":
    main()
