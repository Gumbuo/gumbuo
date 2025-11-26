"""
Generate SpriteFrames .tres files using sprite sheets.
This creates the animation resources automatically so you don't have to do it manually in Godot.
"""

import os

# Enemies with complete sprite sheets
enemies = [
    ("turret", "turret"),
    ("purple_mystic", "purple_mystic"),
    ("red_soldier", "red_soldier"),
    ("ufo", "ufo"),
    ("drone", "drone"),
    ("blue_warrior", "blue_warrior"),  # Has 32/40 (missing walking)
]

# Animation configurations: (folder_name, anim_prefix, frame_count, fps, loop)
animations = [
    ("breathing-idle", "idle", 4, 6, True),
    ("walking", "walk", 6, 10, True),
    ("fireball", "attack", 6, 12, False),
    ("taking-punch", "hurt", 6, 10, False),
    ("running-8-frames", "run", 8, 12, True),
]

# Directions
directions = [
    'south', 'south_east', 'east', 'north_east',
    'north', 'north_west', 'west', 'south_west'
]

def generate_tres_file(enemy_name, enemy_folder):
    """Generate a SpriteFrames .tres file for an enemy using sprite sheets."""

    base_path = f"asset/characters/pixellab/{enemy_folder}"
    sprite_sheet_path = os.path.join(base_path, "sprite_sheets")

    # Check if sprite sheets exist
    if not os.path.exists(sprite_sheet_path):
        print(f"WARNING: No sprite sheets found for {enemy_name}")
        return False

    # Start building the .tres file content
    tres_content = "[gd_resource type=\"SpriteFrames\" load_steps=1 format=2]\n\n"

    # We'll track which sprite sheets actually exist
    existing_sheets = []
    ext_resource_id = 1

    # First pass: check which sprite sheets exist and build ExtResource entries
    ext_resources = ""
    sheet_to_id = {}

    for folder, anim_prefix, frame_count, fps, loop in animations:
        for direction in directions:
            sheet_filename = f"{folder}_{direction}.png"
            sheet_file_path = os.path.join(sprite_sheet_path, sheet_filename)

            if os.path.exists(sheet_file_path):
                res_path = f"res://{base_path}/sprite_sheets/{sheet_filename}"
                ext_resources += f'[ext_resource path="{res_path}" type="Texture" id={ext_resource_id}]\n'
                sheet_to_id[f"{folder}_{direction}"] = ext_resource_id
                ext_resource_id += 1

    # Update load_steps
    tres_content = f"[gd_resource type=\"SpriteFrames\" load_steps={ext_resource_id} format=2]\n\n"
    tres_content += ext_resources + "\n"

    # Start the SpriteFrames resource
    tres_content += "[resource]\n"

    # Build animations array
    animation_names = []

    for folder, anim_prefix, frame_count, fps, loop in animations:
        for direction in directions:
            sheet_key = f"{folder}_{direction}"
            if sheet_key in sheet_to_id:
                anim_name = f"{anim_prefix}_{direction}"
                animation_names.append(anim_name)

    # Add animations list
    tres_content += f'animations = [ {{\n'

    first_anim = True
    for folder, anim_prefix, frame_count, fps, loop in animations:
        for direction in directions:
            sheet_key = f"{folder}_{direction}"
            if sheet_key not in sheet_to_id:
                continue

            anim_name = f"{anim_prefix}_{direction}"
            resource_id = sheet_to_id[sheet_key]

            if not first_anim:
                tres_content += "}, {\n"
            first_anim = False

            tres_content += f'"frames": [ {{\n'
            tres_content += f'"duration": 1.0,\n'
            tres_content += f'"texture": ExtResource( {resource_id} ),\n'
            tres_content += f'"region": Rect2( 0, 0, 32, 32 )\n'  # First frame
            tres_content += "}"

            # Add remaining frames
            for i in range(1, frame_count):
                x_offset = i * 32
                tres_content += f', {{\n'
                tres_content += f'"duration": 1.0,\n'
                tres_content += f'"texture": ExtResource( {resource_id} ),\n'
                tres_content += f'"region": Rect2( {x_offset}, 0, 32, 32 )\n'
                tres_content += "}"

            tres_content += f' ],\n'
            tres_content += f'"loop": {"true" if loop else "false"},\n'
            tres_content += f'"name": "{anim_name}",\n'
            tres_content += f'"speed": {fps}.0\n'

    tres_content += "} ]\n"

    # Write the file
    output_file = os.path.join(base_path, f"{enemy_folder}_animations.tres")
    with open(output_file, 'w') as f:
        f.write(tres_content)

    anim_count = len([key for key in sheet_to_id.keys()])
    print(f"Created: {output_file} ({anim_count} animations)")
    return True

def main():
    print("Generating SpriteFrames .tres files from sprite sheets...")
    print("=" * 70)

    success_count = 0

    for enemy_name, enemy_folder in enemies:
        print(f"\nProcessing {enemy_name.upper()}...")
        if generate_tres_file(enemy_name, enemy_folder):
            success_count += 1

    print("\n" + "=" * 70)
    print(f"Generated {success_count}/{len(enemies)} SpriteFrames files")
    print("\nNext step: Test in Godot to see if they load without parser errors!")

if __name__ == "__main__":
    main()
