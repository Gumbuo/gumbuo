"""
Create sprite sheets from individual animation frames for PixelLab enemies.
This combines all frames for each animation into a single horizontal sprite sheet.
"""

from PIL import Image
import os

# Base path for all character assets
base_path = "asset/characters/pixellab"

# All enemies to process
enemies = [
    ("turret", "turret"),
    ("slug_alien", "slug_alien"),
    ("purple_mystic", "purple_mystic"),
    ("red_soldier", "red_soldier"),
    ("ufo", "ufo"),
    ("drone", "drone"),
    ("blue_warrior", "blue_warrior"),
]

# Animation types with their folder names and frame counts
animations = [
    ("breathing-idle", 4),
    ("walking", 6),
    ("fireball", 6),
    ("taking-punch", 6),
    ("running-8-frames", 8),
]

# Directions - note: directory names use hyphens
directions = [
    ("south", "south"),
    ("south_east", "south-east"),
    ("east", "east"),
    ("north_east", "north-east"),
    ("north", "north"),
    ("north_west", "north-west"),
    ("west", "west"),
    ("south_west", "south-west"),
]

def create_sprite_sheet(enemy_folder, animation_folder, direction_name, direction_folder, frame_count):
    """Create a horizontal sprite sheet from individual frames."""

    # Path to the animation frames
    frames_path = os.path.join(base_path, enemy_folder, "animations", animation_folder, direction_folder)

    # Check if directory exists
    if not os.path.exists(frames_path):
        print(f"WARNING: Skipping {frames_path} (not found)")
        return False

    # Load all frames
    frames = []
    for i in range(frame_count):
        frame_file = os.path.join(frames_path, f"frame_{i:03d}.png")
        if not os.path.exists(frame_file):
            print(f"WARNING: Missing frame: {frame_file}")
            return False
        frames.append(Image.open(frame_file))

    # Get dimensions from first frame (all should be the same size)
    frame_width, frame_height = frames[0].size

    # Create new image for sprite sheet (horizontal layout)
    sheet_width = frame_width * frame_count
    sheet_height = frame_height
    sprite_sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))

    # Paste each frame horizontally
    for i, frame in enumerate(frames):
        x_position = i * frame_width
        sprite_sheet.paste(frame, (x_position, 0))

    # Create sprite_sheets directory if it doesn't exist
    output_dir = os.path.join(base_path, enemy_folder, "sprite_sheets")
    os.makedirs(output_dir, exist_ok=True)

    # Save sprite sheet
    output_file = os.path.join(output_dir, f"{animation_folder}_{direction_name}.png")
    sprite_sheet.save(output_file)

    print(f"Created: {output_file} ({frame_count} frames, {sheet_width}x{sheet_height})")
    return True

def main():
    print("Creating sprite sheets for PixelLab enemies...")
    print("=" * 70)

    total_created = 0
    total_failed = 0

    for enemy_name, enemy_folder in enemies:
        print(f"\nProcessing {enemy_name.upper()}...")
        enemy_created = 0

        for animation_folder, frame_count in animations:
            for direction_name, direction_folder in directions:
                success = create_sprite_sheet(
                    enemy_folder,
                    animation_folder,
                    direction_name,
                    direction_folder,
                    frame_count
                )
                if success:
                    enemy_created += 1
                    total_created += 1
                else:
                    total_failed += 1

        print(f"  Created {enemy_created}/40 sprite sheets for {enemy_name}")

    print("\n" + "=" * 70)
    print(f"COMPLETE: Created {total_created} sprite sheets")
    if total_failed > 0:
        print(f"WARNING: Failed: {total_failed} sprite sheets")
    print("\nSprite sheets saved in: asset/characters/pixellab/*/sprite_sheets/")
    print("\nNow you can import entire animations at once in Godot!")

if __name__ == "__main__":
    main()
