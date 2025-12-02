#!/usr/bin/env python3
"""
Generate Godot 3 SpriteFrames .tres resource files from animation folders
"""

import os
import glob
from pathlib import Path

def get_animation_frames(base_path, animation_name, direction):
    """Get all frame paths for a specific animation and direction"""
    pattern = f"{base_path}/animations/{animation_name}/{direction}/frame_*.png"
    frames = sorted(glob.glob(pattern))

    # Convert to Godot resource paths
    godot_frames = []
    for frame in frames:
        # Convert Windows path to Godot res:// path
        rel_path = os.path.relpath(frame, base_path)
        godot_path = f"res://sprites/{Path(base_path).name}/{rel_path.replace(os.sep, '/')}"
        godot_frames.append(godot_path)

    return godot_frames

def get_frame_count(base_path, animation_name, direction):
    """Count frames for an animation"""
    pattern = f"{base_path}/animations/{animation_name}/{direction}/frame_*.png"
    return len(glob.glob(pattern))

def generate_spriteframes(character_name, base_path, output_file):
    """Generate SpriteFrames .tres file"""

    # Animation configurations
    animations = [
        ("breathing-idle", 8, True),         # name, fps, loop
        ("fight-stance-idle-8-frames", 8, True),
        ("walking-8-frames", 10, True),
        ("jumping-1", 12, False),
        ("cross-punch", 12, False),
        ("lead-jab", 12, False),
        ("surprise-uppercut", 12, False),
        ("high-kick", 12, False),
        ("leg-sweep", 12, False),
        ("roundhouse-kick", 12, False),
        ("flying-kick", 12, False),
        ("fireball", 10, False),
        ("taking-punch", 10, False),
    ]

    directions = ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

    # Start building the .tres file
    tres_content = []
    tres_content.append("[gd_resource type=\"SpriteFrames\" load_steps=1 format=2]")
    tres_content.append("")
    tres_content.append("[resource]")
    tres_content.append("animations = [ {")

    animation_entries = []

    # Special idle animation (use breathing-idle for south direction)
    idle_frames = get_animation_frames(base_path, "breathing-idle", "south")
    if idle_frames:
        frames_str = ", ".join([f'ExtResource( "{frame}" )' for frame in idle_frames])
        animation_entries.append(f'''
"frames": [ {frames_str} ],
"loop": true,
"name": "idle",
"speed": 8.0
''')

    # Generate all directional animations
    for anim_name, fps, loop in animations:
        for direction in directions:
            frames = get_animation_frames(base_path, anim_name, direction)
            if not frames:
                continue

            # Convert direction format (south-east -> south_east)
            dir_suffix = direction.replace("-", "_")
            full_name = f"{anim_name}_{dir_suffix}"

            frames_str = ", ".join([f'ExtResource( "{frame}" )' for frame in frames])
            loop_str = "true" if loop else "false"

            animation_entries.append(f'''
"frames": [ {frames_str} ],
"loop": {loop_str},
"name": "{full_name}",
"speed": {fps}.0
''')

    # Join all animations
    tres_content.append(", ".join(["{" + entry + "}" for entry in animation_entries]))
    tres_content.append(" ]")

    # Write file
    output_path = os.path.join(base_path, output_file)
    with open(output_path, 'w') as f:
        f.write('\n'.join(tres_content))

    print(f"Generated: {output_path}")
    print(f"Total animations: {len(animation_entries)}")

def main():
    script_dir = Path(__file__).parent

    # Generate for Fire Elemental
    fire_path = script_dir / "sprites" / "fire_elemental"
    if fire_path.exists():
        print("Generating Fire Elemental animations...")
        generate_spriteframes("fire_elemental", str(fire_path), "fire_elemental_animations.tres")

    # Generate for Yellow Ghost
    yellow_path = script_dir / "sprites" / "yellow_ghost"
    if yellow_path.exists():
        print("Generating Yellow Ghost animations...")
        generate_spriteframes("yellow_ghost", str(yellow_path), "yellow_ghost_animations.tres")

    print("\nDone! SpriteFrames resources generated.")

if __name__ == "__main__":
    main()
