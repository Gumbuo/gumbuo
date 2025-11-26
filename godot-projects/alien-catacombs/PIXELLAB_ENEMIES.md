# PixelLab Enemy Replacement Guide

All new enemy scenes have been created using PixelLab AI-generated pixel art assets. Each enemy has 8-directional sprites and maintains the same basic behavior as the original enemies.

## Enemy Mapping

### ✅ New Enemies Created

| Enemy Scene | PixelLab Asset | Health | Attack Type | Description |
|-------------|----------------|---------|-------------|-------------|
| `enemy_drone.tscn` | Drone Enemy | 25 HP | **RANGED** | Flying drone - shoots from distance (1.2s cooldown) |
| `enemy_boss_overlord.tscn` | Boss Alien Overlord | 150 HP | **HEAVY_RANGED** | 4-armed boss - slow powerful shots (2.5s, 15 dmg) |
| `enemy_crawler.tscn` | Crawler Alien | 30 HP | **MELEE** | Fast insectoid - bites in close range (12 dmg, 1.2s) |
| `enemy_turret_new.tscn` | Turret Enemy | 40 HP | **RANGED** | Stationary shooter - long range guard (1.5s cooldown) |
| `enemy_slug.tscn` | Slug Alien | 20 HP | **MELEE** | Slow slimy creature - weak melee (8 dmg, 1.5s) |
| `enemy_ufo.tscn` | UFO Enemy | 30 HP | **RANGED** | Flying saucer - agile shooter (1.0s cooldown) |
| `enemy_red_soldier.tscn` | Red Alien Soldier | 35 HP | **RANGED** | Armed warrior - fast shooter (0.9s cooldown) |
| `enemy_blue_warrior.tscn` | Blue Alien Warrior | 35 HP | **MELEE** | Electric fighter - strong melee (15 dmg, 1.0s) |

### Attack Types Explained

- **MELEE**: Chases player and attacks when close (no shooting)
- **RANGED**: Shoots bullets from distance while maintaining spacing
- **HEAVY_RANGED**: Slow but powerful ranged attacks (boss-style)

### ⚠️ Kept Unchanged
- `enemy.tscn` (uses enemy1 assets) - **KEPT AS REQUESTED**

## File Locations

### New Enemy Scenes
```
godot-projects/alien-catacombs/scenes/entity/
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

- All enemies extend the base `Enemy` class (`enemy.gd`) with individual behavior scripts
- Each enemy has a unique attack type configured in their script file
- Sprites are 32×32 pixels (except Boss which is 64×64)
- Each enemy has 8 directional rotations (N, NE, E, SE, S, SW, W, NW)
- Currently using only the "south" facing sprite - can be enhanced with directional logic later
- All enemies have: Health, HealthBar, Hitbox, Hurtbox, CollisionShape, DetectionArea

### Attaching Scripts to Enemy Scenes

**IMPORTANT**: Each enemy scene needs its corresponding script attached:

1. Open the enemy scene (e.g., `enemy_crawler.tscn`)
2. Select the root node
3. In the Inspector, under "Script", attach the corresponding script:
   - `enemy_crawler.tscn` → `enemy_crawler.gd`
   - `enemy_drone.tscn` → `enemy_drone.gd`
   - etc.
4. Save the scene

If scripts are not attached, enemies will use default RANGED behavior.

## Future Enhancements

- Add directional sprite switching based on movement
- Add animations using PixelLab's animation system
- Use Purple Alien Mystic asset (currently created but not assigned)
- Integrate map objects (power-ups, collectibles, decorations, hazards)
- Add themed tilesets once they become available
