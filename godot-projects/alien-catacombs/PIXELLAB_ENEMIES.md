# PixelLab Enemy Replacement Guide

All new enemy scenes have been created using PixelLab AI-generated pixel art assets. Each enemy has 8-directional sprites and maintains the same basic behavior as the original enemies.

## Enemy Mapping

### ✅ New Enemies Created

| Old Enemy | New Enemy Scene | PixelLab Asset | Health | Description |
|-----------|----------------|----------------|---------|-------------|
| `enemy_phantom.tscn` | `enemy_jellyfish.tscn` | Jellyfish Alien | 35 HP | Floating purple translucent creature |
| `enemy_lurker.tscn` | `enemy_drone.tscn` | Drone Enemy | 25 HP | Mechanical flying drone with red scanner |
| `enemy_hulk.tscn` | `enemy_boss_overlord.tscn` | Boss Alien Overlord | 150 HP | Large 4-armed boss (64×64) |
| `enemy_worm.tscn` | `enemy_crawler.tscn` | Crawler Alien | 30 HP | Insectoid 6-legged ground enemy |
| `enemy_turret.tscn` | `enemy_turret_new.tscn` | Turret Enemy | 40 HP | Biomechanical stationary turret |
| `enemy_zombie_green.tscn` | `enemy_slug.tscn` | Slug Alien | 20 HP | Slimy slow-moving ground creature |
| `enemy_zombie_orange.tscn` | `enemy_ufo.tscn` | UFO Enemy | 30 HP | Small flying saucer with blue lights |
| `enemy_klackon_b.tscn` | `enemy_red_soldier.tscn` | Red Alien Soldier | 35 HP | Crimson armored warrior |
| `enemy_klackon_c.tscn` | `enemy_blue_warrior.tscn` | Blue Alien Warrior | 35 HP | Electric blue bioluminescent fighter |

### ⚠️ Kept Unchanged
- `enemy.tscn` (uses enemy1 assets) - **KEPT AS REQUESTED**

## File Locations

### New Enemy Scenes
```
godot-projects/alien-catacombs/scenes/entity/
├── enemy_jellyfish.tscn
├── enemy_drone.tscn
├── enemy_boss_overlord.tscn
├── enemy_crawler.tscn
├── enemy_turret_new.tscn
├── enemy_slug.tscn
├── enemy_ufo.tscn
├── enemy_red_soldier.tscn
└── enemy_blue_warrior.tscn
```

### PixelLab Assets
```
godot-projects/alien-catacombs/asset/characters/pixellab/
├── jellyfish_alien/rotations/
├── drone_enemy/rotations/
├── boss_alien_overlord/rotations/
├── crawler_alien/rotations/
├── turret_enemy/rotations/
├── slug_alien/rotations/
├── ufo_enemy/rotations/
├── red_alien_soldier/rotations/
├── blue_alien_warrior/rotations/
└── purple_alien_mystic/rotations/ (not yet used)
```

## How to Use

1. **Open your level scene** in Godot
2. **Replace old enemy instances** with new enemy scenes:
   - Delete old enemy node
   - Instance new enemy scene from `res://scenes/entity/`
   - Position as needed
3. **Adjust properties** if needed (health, detection range, etc.)

## Notes

- All enemies use the `enemy_phantom_simple.gd` script for basic AI behavior
- Sprites are 32×32 pixels (except Boss which is 64×64)
- Each enemy has 8 directional rotations (N, NE, E, SE, S, SW, W, NW)
- Currently using only the "south" facing sprite - can be enhanced with directional logic later
- All enemies have: Health, HealthBar, Hitbox, Hurtbox, CollisionShape, DetectionArea

## Future Enhancements

- Add directional sprite switching based on movement
- Add animations using PixelLab's animation system
- Use Purple Alien Mystic asset (currently created but not assigned)
- Integrate map objects (power-ups, collectibles, decorations, hazards)
- Add themed tilesets once they become available
