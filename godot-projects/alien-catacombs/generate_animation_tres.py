#!/usr/bin/env python3
"""
Generate Godot SpriteFrames .tres files for PixelLab character animations
"""

def generate_tres_file(character_name, folder_path, output_file):
    """
    Generate a .tres file for a character's animations

    Args:
        character_name: Name of the character folder (e.g., 'red_soldier')
        folder_path: Relative path from res:// (e.g., 'red_soldier')
        output_file: Output .tres file path
    """

    # Animation types with their configurations
    # Format: (folder_name, animation_prefix, frames_per_direction, fps, loop)
    animations = [
        ('walking', 'walk', 6, 10.0, True),
        ('fireball', 'attack', 6, 12.0, False),
        ('taking-punch', 'hurt', 6, 10.0, False),
        ('running-8-frames', 'run', 8, 12.0, True),
        ('breathing-idle', 'idle', 4, 6.0, True),
    ]

    # 8 directions in order (for animation names)
    directions = ['south', 'south_east', 'east', 'north_east', 'north', 'north_west', 'west', 'south_west']
    # Directory names use hyphens, not underscores
    dir_names = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']

    # Generate ext_resource entries
    ext_resources = []
    resource_id = 1

    for folder, anim_prefix, frame_count, fps, loop in animations:
        for direction, dir_name in zip(directions, dir_names):
            for frame_num in range(frame_count):
                path = f'res://asset/characters/pixellab/{folder_path}/animations/{folder}/{dir_name}/frame_{frame_num:03d}.png'
                ext_resources.append(f'[ext_resource path="{path}" type="Texture" id={resource_id}]')
                resource_id += 1

    # Generate animation definitions
    animation_defs = []
    resource_id = 1

    for folder, anim_prefix, frame_count, fps, loop in animations:
        for direction in directions:
            frame_ids = ', '.join([f'ExtResource( {resource_id + i} )' for i in range(frame_count)])
            loop_str = 'true' if loop else 'false'
            animation_defs.append(f'''{{"
"frames": [ {frame_ids} ],
"loop": {loop_str},
"name": "{anim_prefix}_{direction}",
"speed": {fps}
}}''')
            resource_id += frame_count

    # Write the .tres file
    with open(output_file, 'w') as f:
        f.write('[gd_resource type="SpriteFrames" load_steps=241 format=2]\n\n')

        # Write ext_resources with blank lines between animation types
        current_id = 1
        for i, ext_res in enumerate(ext_resources):
            f.write(ext_res + '\n')
            # Add blank line after each direction within an animation type
            # Pattern: 6 frames per direction for walk/attack/hurt, 8 for run, 4 for idle
            if (current_id <= 48 and current_id % 6 == 0) or \
               (49 <= current_id <= 96 and (current_id - 48) % 6 == 0) or \
               (97 <= current_id <= 144 and (current_id - 96) % 6 == 0) or \
               (145 <= current_id <= 208 and (current_id - 144) % 8 == 0) or \
               (209 <= current_id <= 240 and (current_id - 208) % 4 == 0):
                f.write('\n')
            current_id += 1

        # Write resource section
        f.write('[resource]\n')
        f.write('animations = [ ')
        f.write(', '.join(animation_defs))
        f.write(' ]\n')

if __name__ == '__main__':
    # Generate animation files for remaining characters
    characters = [
        ('red_soldier', 'red_soldier'),
        ('jellyfish_alien', 'jellyfish'),
        ('ufo_enemy', 'ufo'),
        ('drone_enemy', 'drone'),
        ('blue_warrior', 'blue_warrior'),
    ]

    base_path = 'C:/Users/tcmid/gumbuo-site/godot-projects/alien-catacombs/asset/characters/pixellab'

    for char_name, folder_name in characters:
        output_file = f'{base_path}/{folder_name}/{char_name}_animations.tres'
        print(f'Generating {output_file}...')
        generate_tres_file(char_name, folder_name, output_file)
        print(f'Created {char_name}_animations.tres')
