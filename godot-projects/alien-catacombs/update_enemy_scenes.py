#!/usr/bin/env python3
"""
Update enemy .tscn files to use AnimatedSprite with PixelLab animations
"""

import re

# Enemy configurations
# Format: (scene_file, animation_tres_path, bullet_texture_path, script_path)
enemies = [
    (
        'scenes/entity/enemy_turret_new.tscn',
        'res://asset/characters/pixellab/turret/turret_animations.tres',
        'res://asset/projectiles/pixellab/turret_bullet.png',
        'res://scenes/entity/enemy.gd'  # Changed from enemy_phantom_simple.gd
    ),
    (
        'scenes/entity/enemy_slug.tscn',
        'res://asset/characters/pixellab/slug_alien/slug_animations.tres',
        'res://asset/projectiles/pixellab/slug_bullet.png',
        None  # Keep existing script
    ),
    (
        'scenes/entity/enemy_red_soldier.tscn',
        'res://asset/characters/pixellab/red_soldier/red_soldier_animations.tres',
        'res://asset/projectiles/pixellab/soldier_bullet.png',
        None  # Keep existing script
    ),
    (
        'scenes/entity/enemy_jellyfish.tscn',
        'res://asset/characters/pixellab/jellyfish/jellyfish_alien_animations.tres',
        'res://asset/projectiles/pixellab/jellyfish_bullet.png',
        None  # Keep existing script
    ),
    (
        'scenes/entity/enemy_ufo.tscn',
        'res://asset/characters/pixellab/ufo/ufo_enemy_animations.tres',
        'res://asset/projectiles/pixellab/ufo_bullet.png',
        None  # Keep existing script
    ),
    (
        'scenes/entity/enemy_drone.tscn',
        'res://asset/characters/pixellab/drone/drone_enemy_animations.tres',
        'res://asset/projectiles/pixellab/drone_bullet.png',
        None  # Keep existing script
    ),
    # (
    #     'scenes/entity/enemy_blue_warrior.tscn',
    #     'res://asset/characters/pixellab/blue_warrior/blue_warrior_animations.tres',
    #     'res://asset/projectiles/pixellab/warrior_bullet.png',  # Generating via PixelLab
    #     None  # Keep existing script
    # ),
]

# Note: Blue warrior will be updated separately once warrior_bullet.png is ready

def update_enemy_scene(scene_path, animation_tres_path, bullet_texture_path, new_script_path=None):
    """Update a single enemy scene file"""

    base_path = 'C:/Users/tcmid/gumbuo-site/godot-projects/alien-catacombs'
    full_path = f'{base_path}/{scene_path}'

    print(f'Updating {scene_path}...')

    try:
        with open(full_path, 'r') as f:
            content = f.read()

        # Step 1: Update the ext_resource for texture to point to animation .tres
        # Find the texture ExtResource line and replace with SpriteFrames
        texture_pattern = r'\[ext_resource path="res://asset/characters/pixellab/[^"]+/rotations/[^"]+" type="Texture" id=(\d+)\]'
        match = re.search(texture_pattern, content)

        if match:
            old_id = match.group(1)
            new_resource = f'[ext_resource path="{animation_tres_path}" type="SpriteFrames" id={old_id}]'
            content = re.sub(texture_pattern, new_resource, content)
            print(f'  - Replaced texture ExtResource (id={old_id}) with SpriteFrames')

        # Step 2: Change sprite node from Sprite to AnimatedSprite
        sprite_pattern = r'\[node name="sprite" type="Sprite" parent="\."]\nscale = Vector2\( 2, 2 \)\ntexture = ExtResource\( (\d+) \)'
        sprite_replacement = r'[node name="sprite" type="AnimatedSprite" parent="."]\nscale = Vector2( 2, 2 )\nframes = ExtResource( \1 )\nanimation = "idle_south"\nplaying = true'

        if re.search(sprite_pattern, content):
            content = re.sub(sprite_pattern, sprite_replacement, content)
            print(f'  - Changed Sprite to AnimatedSprite with animation')

        # Step 3: Update script if specified
        if new_script_path:
            script_pattern = r'\[ext_resource path="res://scenes/entity/[^"]+" type="Script" id=3\]'
            script_replacement = f'[ext_resource path="{new_script_path}" type="Script" id=3]'
            if re.search(script_pattern, content):
                content = re.sub(script_pattern, script_replacement, content)
                print(f'  - Updated script to {new_script_path}')

        # Step 4: Add bullet_texture_path to the root node (KinematicBody2D)
        # Find the root node and add the export variable
        root_pattern = r'(\[node name="[^"]+EnemyTurretNew|EnemySlug|EnemyRedSoldier|EnemyJellyfish|EnemyUfo|EnemyDrone|EnemyBlueWarrior[^"]*" type="KinematicBody2D"\]\nscript = ExtResource\( 3 \))'

        # More flexible pattern
        root_pattern = r'(\[node name="[^"]+" type="KinematicBody2D"\]\nscript = ExtResource\( 3 \))'

        if re.search(root_pattern, content):
            root_replacement = r'\1\nbullet_texture_path = "' + bullet_texture_path + '"'
            content = re.sub(root_pattern, root_replacement, content)
            print(f'  - Added bullet_texture_path export variable')

        # Write the updated content
        with open(full_path, 'w') as f:
            f.write(content)

        print(f'  Successfully updated {scene_path}')
        return True

    except Exception as e:
        print(f'  ERROR updating {scene_path}: {e}')
        return False

if __name__ == '__main__':
    print('Updating enemy scene files with AnimatedSprite and bullets...\n')

    success_count = 0
    for scene_path, anim_path, bullet_path, script_path in enemies:
        if update_enemy_scene(scene_path, anim_path, bullet_path, script_path):
            success_count += 1
        print()

    print(f'Updated {success_count}/{len(enemies)} enemy scenes successfully!')
