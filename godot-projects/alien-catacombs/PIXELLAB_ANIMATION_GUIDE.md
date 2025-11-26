# PixelLab Animation Integration Guide

## Complete Step-by-Step Instructions for Creating SpriteFrames in Godot

This guide will walk you through manually creating SpriteFrames resources for all 8 PixelLab enemies in the Godot editor.

---

## Overview

Each enemy has **40 animations** total:
- 5 animation types
- 8 directions per animation
- Animation naming format: `{type}_{direction}` (e.g., `idle_south`, `walk_north_east`)

### Animation Types and Settings

| Animation Name | Frames | FPS | Looping |
|----------------|--------|-----|---------|
| walking        | 6      | 10  | Yes     |
| fireball       | 6      | 12  | No      |
| taking-punch   | 6      | 10  | No      |
| running-8-frames | 8    | 12  | Yes     |
| breathing-idle | 4      | 6   | Yes     |

### Directions (in order)

1. south
2. south_east
3. east
4. north_east
5. north
6. north_west
7. west
8. south_west

**Note**: Directory names use **hyphens** (south-east), but animation names use **underscores** (south_east).

---

## Complete Walkthrough: Creating Turret SpriteFrames

Let's start with the **Turret** enemy as a complete example.

### Step 1: Create a New SpriteFrames Resource

1. Open Godot and load the Alien Catacombs project
2. In the **FileSystem** dock, navigate to:
   ```
   res://asset/characters/pixellab/turret/
   ```
3. Right-click in the folder → **New Resource**
4. In the search box, type: `SpriteFrames`
5. Select **SpriteFrames** and click **Create**
6. Save it as: `turret_animations_manual.tres`

### Step 2: Open the SpriteFrames Editor

1. Double-click the newly created `turret_animations_manual.tres` file
2. The **SpriteFrames** panel will appear at the bottom of the screen
3. You'll see a default animation called "default" - we'll replace this

### Step 3: Create Your First Animation (idle_south)

1. In the **Animations** list (left side), click the "default" animation
2. Click the **Rename** button (pencil icon)
3. Rename it to: `idle_south`
4. With `idle_south` selected, look at the animation properties on the right:
   - Set **Speed (FPS)**: `6`
   - Check **Loop**: ✓ (enabled)

### Step 4: Add Frames to idle_south

1. Make sure `idle_south` is selected
2. Click the **Add frames from a sprite sheet** button (grid icon with +)
3. Navigate to:
   ```
   res://asset/characters/pixellab/turret/animations/breathing-idle/south/
   ```
4. You'll see 4 PNG files: `frame_000.png` through `frame_003.png`
5. **Select all 4 files** (Ctrl+A or click first, hold Shift, click last)
6. Click **Open**
7. In the "Select Frames" dialog:
   - Set **Horizontal**: `1`
   - Set **Vertical**: `1`
   - Click **Add 4 Frame(s)**
8. You should now see all 4 frames in the animation timeline

### Step 5: Create the Next Animation (idle_south_east)

1. Click the **New Animation** button (+ icon) in the Animations list
2. Name it: `idle_south_east`
3. Set properties:
   - Speed: `6`
   - Loop: ✓
4. Add frames from:
   ```
   res://asset/characters/pixellab/turret/animations/breathing-idle/south-east/
   ```
   (Notice: **south-east** with hyphen in the directory path)
5. Select all 4 frames and add them

### Step 6: Complete All 8 Idle Animations

Repeat Step 5 for the remaining 6 directions:

| Animation Name | Directory Path |
|----------------|----------------|
| idle_east | breathing-idle/east/ |
| idle_north_east | breathing-idle/north-east/ |
| idle_north | breathing-idle/north/ |
| idle_north_west | breathing-idle/north-west/ |
| idle_west | breathing-idle/west/ |
| idle_south_west | breathing-idle/south-west/ |

**Tip**: You can right-click an animation and select "Duplicate" to copy settings, then just rename and change frames.

### Step 7: Create Walking Animations

Now create the walking animations (6 frames, 10 FPS, looping):

1. Click **New Animation** → name: `walk_south`
2. Properties: Speed `10`, Loop ✓
3. Add frames from: `animations/walking/south/` (6 frames: frame_000 to frame_005)
4. Repeat for all 8 directions:
   - walk_south
   - walk_south_east
   - walk_east
   - walk_north_east
   - walk_north
   - walk_north_west
   - walk_west
   - walk_south_west

### Step 8: Create Attack Animations (Fireball)

Attack animations (6 frames, 12 FPS, **NOT** looping):

1. New Animation → name: `attack_south`
2. Properties: Speed `12`, Loop ✗ (unchecked)
3. Add frames from: `animations/fireball/south/` (6 frames)
4. Repeat for all 8 directions:
   - attack_south
   - attack_south_east
   - attack_east
   - attack_north_east
   - attack_north
   - attack_north_west
   - attack_west
   - attack_south_west

### Step 9: Create Hurt Animations (Taking-Punch)

Hurt animations (6 frames, 10 FPS, **NOT** looping):

1. New Animation → name: `hurt_south`
2. Properties: Speed `10`, Loop ✗
3. Add frames from: `animations/taking-punch/south/` (6 frames)
4. Repeat for all 8 directions

### Step 10: Create Running Animations

Running animations (8 frames, 12 FPS, looping):

1. New Animation → name: `run_south`
2. Properties: Speed `12`, Loop ✓
3. Add frames from: `animations/running-8-frames/south/` (8 frames: frame_000 to frame_007)
4. Repeat for all 8 directions

### Step 11: Save the SpriteFrames Resource

1. Press **Ctrl+S** or click **File → Save**
2. The resource is now saved at: `res://asset/characters/pixellab/turret/turret_animations_manual.tres`

### Step 12: Verify Your Work

In the Animations list, you should now have **40 animations**:
- 8 idle animations
- 8 walk animations
- 8 attack animations
- 8 hurt animations
- 8 run animations

---

## Checklist for All 40 Animations

Use this checklist as you work:

### Breathing-Idle (4 frames, 6 FPS, Loop ✓)
- [ ] idle_south
- [ ] idle_south_east
- [ ] idle_east
- [ ] idle_north_east
- [ ] idle_north
- [ ] idle_north_west
- [ ] idle_west
- [ ] idle_south_west

### Walking (6 frames, 10 FPS, Loop ✓)
- [ ] walk_south
- [ ] walk_south_east
- [ ] walk_east
- [ ] walk_north_east
- [ ] walk_north
- [ ] walk_north_west
- [ ] walk_west
- [ ] walk_south_west

### Fireball/Attack (6 frames, 12 FPS, Loop ✗)
- [ ] attack_south
- [ ] attack_south_east
- [ ] attack_east
- [ ] attack_north_east
- [ ] attack_north
- [ ] attack_north_west
- [ ] attack_west
- [ ] attack_south_west

### Taking-Punch/Hurt (6 frames, 10 FPS, Loop ✗)
- [ ] hurt_south
- [ ] hurt_south_east
- [ ] hurt_east
- [ ] hurt_north_east
- [ ] hurt_north
- [ ] hurt_north_west
- [ ] hurt_west
- [ ] hurt_south_west

### Running-8-frames (8 frames, 12 FPS, Loop ✓)
- [ ] run_south
- [ ] run_south_east
- [ ] run_east
- [ ] run_north_east
- [ ] run_north
- [ ] run_north_west
- [ ] run_west
- [ ] run_south_west

---

## Quick Reference: All 8 Enemies

After completing Turret, repeat the process for:

1. **Turret** ✓ (completed above)
   - Path: `res://asset/characters/pixellab/turret/`
   - Save as: `turret_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/turret_bullet.png`

2. **Slug Alien**
   - Path: `res://asset/characters/pixellab/slug_alien/`
   - Save as: `slug_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/slug_bullet.png`

3. **Purple Mystic**
   - Path: `res://asset/characters/pixellab/purple_mystic/`
   - Save as: `mystic_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/mystic_bullet.png`

4. **Red Soldier**
   - Path: `res://asset/characters/pixellab/red_soldier/`
   - Save as: `red_soldier_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/soldier_bullet.png`

5. **UFO**
   - Path: `res://asset/characters/pixellab/ufo/`
   - Save as: `ufo_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/ufo_bullet.png`

6. **Drone**
   - Path: `res://asset/characters/pixellab/drone/`
   - Save as: `drone_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/drone_bullet.png`

7. **Blue Warrior**
   - Path: `res://asset/characters/pixellab/blue_warrior/`
   - Save as: `blue_warrior_animations_manual.tres`
   - Bullet: `res://asset/projectiles/pixellab/warrior_bullet.png`

---

## Using the SpriteFrames in Enemy Scenes

Once you've created a SpriteFrames resource, here's how to use it:

### Option 1: Update Existing Scene File

1. Open the enemy scene (e.g., `enemy_turret_new.tscn`)
2. Select the **sprite** node (AnimatedSprite)
3. In the Inspector, find the **Frames** property
4. Click the dropdown → **Load**
5. Navigate to your `turret_animations_manual.tres` file
6. Select it and click **Open**
7. Set **Animation** property to: `idle_south`
8. Check **Playing**: ✓
9. Save the scene (Ctrl+S)

### Option 2: Create New Enemy Scene from Scratch

1. Scene → New Scene
2. Add root node: **KinematicBody2D**
3. Rename to: `EnemyTurret`
4. Add child node: **AnimatedSprite**
5. Rename to: `sprite`
6. Select sprite node → Inspector → Frames → Load → `turret_animations_manual.tres`
7. Set Animation: `idle_south`
8. Set Playing: ✓
9. Set Scale: `Vector2(2, 2)` (to match your other enemies)
10. Add remaining child nodes: CollisionShape2D, Health, HealthBar, Hitbox, Hurtbox, DetectionArea
11. Attach script: `res://scenes/entity/enemy.gd`
12. Set bullet_texture_path: `res://asset/projectiles/pixellab/turret_bullet.png`
13. Save scene as: `res://scenes/entity/enemy_turret.tscn`

---

## Tips & Shortcuts

### Speed Tips

1. **Duplicate Animations**: Right-click an animation → Duplicate → Rename → Change frames only
2. **Multi-select Files**: Use Ctrl+Click or Shift+Click when adding frames
3. **Copy Settings**: Create one complete set for one direction, then duplicate and swap frames
4. **Keyboard Navigation**: Use arrow keys to navigate between animations

### Common Mistakes to Avoid

1. ❌ **Wrong Loop Setting**: Attack and hurt animations should NOT loop
2. ❌ **Wrong FPS**: Idle is 6 FPS, not 10
3. ❌ **Hyphen vs Underscore**:
   - Directory names: `south-east` (hyphen)
   - Animation names: `south_east` (underscore)
4. ❌ **Missing Frames**: Running has 8 frames, others have 4 or 6
5. ❌ **Wrong Scale**: Set sprite scale to `Vector2(2, 2)` in scenes

### Testing Individual Animations

To preview an animation:

1. Open the SpriteFrames resource
2. Select an animation from the list
3. Click the **Play** button (▶) at the bottom
4. Watch the animation preview

Or in a scene:

1. Select the AnimatedSprite node
2. Set the Animation property to the one you want to test
3. Press **Play Scene** (F6) or use the animation preview in the editor toolbar

---

## Updating main.gd

After creating all SpriteFrames and enemy scenes, update `main.gd`:

```gdscript
var enemy_scenes = [
	preload("res://scenes/entity/enemy.tscn"), // Keep enemy1 as requested
	preload("res://scenes/entity/enemy_crawler.tscn"),
	preload("res://scenes/entity/enemy_jellyfish.tscn"),
	preload("res://scenes/entity/enemy_drone.tscn"),
	preload("res://scenes/entity/enemy_turret_new.tscn"),
	preload("res://scenes/entity/enemy_slug.tscn"),
	preload("res://scenes/entity/enemy_ufo.tscn"),
	preload("res://scenes/entity/enemy_red_soldier.tscn"),
	preload("res://scenes/entity/enemy_blue_warrior.tscn")
]
```

---

## Troubleshooting

### Problem: Animations play too fast/slow
**Solution**: Check the Speed (FPS) setting for each animation type

### Problem: Attack animation keeps looping
**Solution**: Uncheck the "Loop" checkbox for attack and hurt animations

### Problem: Wrong direction showing
**Solution**: Check that you're adding frames from the correct directory (watch for hyphens)

### Problem: Sprite appears tiny
**Solution**: Set AnimatedSprite scale to `Vector2(2, 2)` in the scene

### Problem: Frames out of order
**Solution**: When adding frames, make sure they're sorted by filename (frame_000, frame_001, etc.)

---

## Estimated Time

- First enemy (learning process): **60-90 minutes**
- Subsequent enemies (with practice): **30-40 minutes each**
- Total for all 7 enemies: **4-6 hours**

You can do one enemy at a time and test it in the game before moving to the next.

---

## Files Ready to Use

All custom bullet sprites have already been created and are ready:

- ✓ `asset/projectiles/pixellab/turret_bullet.png`
- ✓ `asset/projectiles/pixellab/slug_bullet.png`
- ✓ `asset/projectiles/pixellab/mystic_bullet.png`
- ✓ `asset/projectiles/pixellab/soldier_bullet.png`
- ✓ `asset/projectiles/pixellab/ufo_bullet.png`
- ✓ `asset/projectiles/pixellab/drone_bullet.png`
- ✓ `asset/projectiles/pixellab/warrior_bullet.png`

All 1,920 animation PNG frames (240 per enemy × 8 enemies) are downloaded and ready to import.

---

## Need Help?

If you get stuck or want to verify your work:
1. Start with just one complete enemy (Turret recommended)
2. Test it in the game before moving to the next
3. The existing enemy scenes can serve as templates for node structure

Good luck! The animations look great and will really enhance your game once integrated.
