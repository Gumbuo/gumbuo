# PixelLab Animation Integration Guide
## Using Pre-Generated Sprite Sheets (FAST METHOD)

All sprite sheets have been pre-generated for you! This method is **much faster** than adding individual frames.

---

## What's Been Done For You

All 1,920 individual animation frames have been combined into **232 sprite sheets** (one per animation). Instead of clicking 1,920 times, you'll only need to import 40 sprite sheets per enemy.

Sprite sheets are located in:
```
res://asset/characters/pixellab/{enemy}/sprite_sheets/
```

---

## Animation Settings Quick Reference

| Animation Name | Sprite Sheet | Frames | FPS | Loop |
|----------------|--------------|--------|-----|------|
| idle_* | breathing-idle_*.png | 4 | 6 | Yes |
| walk_* | walking_*.png | 6 | 10 | Yes |
| attack_* | fireball_*.png | 6 | 12 | No |
| hurt_* | taking-punch_*.png | 6 | 10 | No |
| run_* | running-8-frames_*.png | 8 | 12 | Yes |

Replace `*` with direction: south, south_east, east, north_east, north, north_west, west, south_west

---

## Complete Walkthrough: Creating Turret Animations

### Step 1: Create a New SpriteFrames Resource

1. Open Godot and load the Alien Catacombs project
2. In the **FileSystem** dock, navigate to:
   ```
   res://asset/characters/pixellab/turret/
   ```
3. Right-click in the folder → **New Resource**
4. Search for: `SpriteFrames`
5. Select **SpriteFrames** and click **Create**
6. Save it as: `turret_animations.tres`

### Step 2: Open the SpriteFrames Editor

1. Double-click `turret_animations.tres`
2. The **SpriteFrames** panel appears at the bottom
3. You'll see a default animation called "default"

### Step 3: Create Your First Animation (idle_south)

1. Select the "default" animation
2. Click **Rename** (pencil icon)
3. Rename to: `idle_south`
4. Set animation properties:
   - **Speed (FPS)**: `6`
   - **Loop**: ✓ (checked)

### Step 4: Import the Sprite Sheet

1. With `idle_south` selected, click **Add frames from sprite sheet** (grid icon with +)
2. Navigate to:
   ```
   res://asset/characters/pixellab/turret/sprite_sheets/
   ```
3. Select: `breathing-idle_south.png`
4. Click **Open**
5. In the "Select Frames" dialog you'll see the sprite sheet with 4 frames side-by-side:
   - Set **Horizontal**: `4` (number of frames in the row)
   - Set **Vertical**: `1` (single row)
   - All 4 frames should be highlighted in the preview
   - Click **Add 4 Frame(s)**

That's it! You just imported an entire animation in one step.

### Step 5: Create the Remaining Idle Animations

For each direction, repeat:

1. Click **New Animation** (+)
2. Name it (e.g., `idle_south_east`)
3. Set Speed: `6`, Loop: ✓
4. Add sprite sheet:
   - Click "Add frames from sprite sheet"
   - Select the matching sprite sheet (e.g., `breathing-idle_south_east.png`)
   - Set Horizontal: `4`, Vertical: `1`
   - Add frames

| Animation Name | Sprite Sheet File | H | V |
|----------------|-------------------|---|---|
| idle_south | breathing-idle_south.png | 4 | 1 |
| idle_south_east | breathing-idle_south_east.png | 4 | 1 |
| idle_east | breathing-idle_east.png | 4 | 1 |
| idle_north_east | breathing-idle_north_east.png | 4 | 1 |
| idle_north | breathing-idle_north.png | 4 | 1 |
| idle_north_west | breathing-idle_north_west.png | 4 | 1 |
| idle_west | breathing-idle_west.png | 4 | 1 |
| idle_south_west | breathing-idle_south_west.png | 4 | 1 |

### Step 6: Create Walking Animations

Walking animations have **6 frames** and run at **10 FPS**:

| Animation Name | Sprite Sheet File | H | V | Speed | Loop |
|----------------|-------------------|---|---|-------|------|
| walk_south | walking_south.png | 6 | 1 | 10 | ✓ |
| walk_south_east | walking_south_east.png | 6 | 1 | 10 | ✓ |
| walk_east | walking_east.png | 6 | 1 | 10 | ✓ |
| walk_north_east | walking_north_east.png | 6 | 1 | 10 | ✓ |
| walk_north | walking_north.png | 6 | 1 | 10 | ✓ |
| walk_north_west | walking_north_west.png | 6 | 1 | 10 | ✓ |
| walk_west | walking_west.png | 6 | 1 | 10 | ✓ |
| walk_south_west | walking_south_west.png | 6 | 1 | 10 | ✓ |

### Step 7: Create Attack Animations

Attack animations have **6 frames**, **12 FPS**, and **DON'T LOOP**:

| Animation Name | Sprite Sheet File | H | V | Speed | Loop |
|----------------|-------------------|---|---|-------|------|
| attack_south | fireball_south.png | 6 | 1 | 12 | ✗ |
| attack_south_east | fireball_south_east.png | 6 | 1 | 12 | ✗ |
| attack_east | fireball_east.png | 6 | 1 | 12 | ✗ |
| attack_north_east | fireball_north_east.png | 6 | 1 | 12 | ✗ |
| attack_north | fireball_north.png | 6 | 1 | 12 | ✗ |
| attack_north_west | fireball_north_west.png | 6 | 1 | 12 | ✗ |
| attack_west | fireball_west.png | 6 | 1 | 12 | ✗ |
| attack_south_west | fireball_south_west.png | 6 | 1 | 12 | ✗ |

### Step 8: Create Hurt Animations

Hurt animations have **6 frames**, **10 FPS**, and **DON'T LOOP**:

| Animation Name | Sprite Sheet File | H | V | Speed | Loop |
|----------------|-------------------|---|---|-------|------|
| hurt_south | taking-punch_south.png | 6 | 1 | 10 | ✗ |
| hurt_south_east | taking-punch_south_east.png | 6 | 1 | 10 | ✗ |
| hurt_east | taking-punch_east.png | 6 | 1 | 10 | ✗ |
| hurt_north_east | taking-punch_north_east.png | 6 | 1 | 10 | ✗ |
| hurt_north | taking-punch_north.png | 6 | 1 | 10 | ✗ |
| hurt_north_west | taking-punch_north_west.png | 6 | 1 | 10 | ✗ |
| hurt_west | taking-punch_west.png | 6 | 1 | 10 | ✗ |
| hurt_south_west | taking-punch_south_west.png | 6 | 1 | 10 | ✗ |

### Step 9: Create Running Animations

Running animations have **8 frames**, **12 FPS**, and **LOOP**:

| Animation Name | Sprite Sheet File | H | V | Speed | Loop |
|----------------|-------------------|---|---|-------|------|
| run_south | running-8-frames_south.png | 8 | 1 | 12 | ✓ |
| run_south_east | running-8-frames_south_east.png | 8 | 1 | 12 | ✓ |
| run_east | running-8-frames_east.png | 8 | 1 | 12 | ✓ |
| run_north_east | running-8-frames_north_east.png | 8 | 1 | 12 | ✓ |
| run_north | running-8-frames_north.png | 8 | 1 | 12 | ✓ |
| run_north_west | running-8-frames_north_west.png | 8 | 1 | 12 | ✓ |
| run_west | running-8-frames_west.png | 8 | 1 | 12 | ✓ |
| run_south_west | running-8-frames_south_west.png | 8 | 1 | 12 | ✓ |

### Step 10: Save the Resource

Press **Ctrl+S** to save. Your Turret animations are complete!

---

## Quick Checklist: All 40 Animations

Track your progress:

### Breathing-Idle (4 frames, 6 FPS, Loop ✓)
- [ ] idle_south → breathing-idle_south.png (H:4)
- [ ] idle_south_east → breathing-idle_south_east.png (H:4)
- [ ] idle_east → breathing-idle_east.png (H:4)
- [ ] idle_north_east → breathing-idle_north_east.png (H:4)
- [ ] idle_north → breathing-idle_north.png (H:4)
- [ ] idle_north_west → breathing-idle_north_west.png (H:4)
- [ ] idle_west → breathing-idle_west.png (H:4)
- [ ] idle_south_west → breathing-idle_south_west.png (H:4)

### Walking (6 frames, 10 FPS, Loop ✓)
- [ ] walk_south → walking_south.png (H:6)
- [ ] walk_south_east → walking_south_east.png (H:6)
- [ ] walk_east → walking_east.png (H:6)
- [ ] walk_north_east → walking_north_east.png (H:6)
- [ ] walk_north → walking_north.png (H:6)
- [ ] walk_north_west → walking_north_west.png (H:6)
- [ ] walk_west → walking_west.png (H:6)
- [ ] walk_south_west → walking_south_west.png (H:6)

### Fireball/Attack (6 frames, 12 FPS, Loop ✗)
- [ ] attack_south → fireball_south.png (H:6)
- [ ] attack_south_east → fireball_south_east.png (H:6)
- [ ] attack_east → fireball_east.png (H:6)
- [ ] attack_north_east → fireball_north_east.png (H:6)
- [ ] attack_north → fireball_north.png (H:6)
- [ ] attack_north_west → fireball_north_west.png (H:6)
- [ ] attack_west → fireball_west.png (H:6)
- [ ] attack_south_west → fireball_south_west.png (H:6)

### Taking-Punch/Hurt (6 frames, 10 FPS, Loop ✗)
- [ ] hurt_south → taking-punch_south.png (H:6)
- [ ] hurt_south_east → taking-punch_south_east.png (H:6)
- [ ] hurt_east → taking-punch_east.png (H:6)
- [ ] hurt_north_east → taking-punch_north_east.png (H:6)
- [ ] hurt_north → taking-punch_north.png (H:6)
- [ ] hurt_north_west → taking-punch_north_west.png (H:6)
- [ ] hurt_west → taking-punch_west.png (H:6)
- [ ] hurt_south_west → taking-punch_south_west.png (H:6)

### Running-8-frames (8 frames, 12 FPS, Loop ✓)
- [ ] run_south → running-8-frames_south.png (H:8)
- [ ] run_south_east → running-8-frames_south_east.png (H:8)
- [ ] run_east → running-8-frames_east.png (H:8)
- [ ] run_north_east → running-8-frames_north_east.png (H:8)
- [ ] run_north → running-8-frames_north.png (H:8)
- [ ] run_north_west → running-8-frames_north_west.png (H:8)
- [ ] run_west → running-8-frames_west.png (H:8)
- [ ] run_south_west → running-8-frames_south_west.png (H:8)

---

## All 6 Complete Enemies Ready to Import

After completing Turret, repeat the same process for:

### 1. Turret ✓
- Path: `res://asset/characters/pixellab/turret/sprite_sheets/`
- Save as: `turret_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/turret_bullet.png`
- **Status**: 40/40 sprite sheets ready

### 2. Purple Mystic
- Path: `res://asset/characters/pixellab/purple_mystic/sprite_sheets/`
- Save as: `mystic_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/mystic_bullet.png`
- **Status**: 40/40 sprite sheets ready

### 3. Red Soldier
- Path: `res://asset/characters/pixellab/red_soldier/sprite_sheets/`
- Save as: `soldier_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/soldier_bullet.png`
- **Status**: 40/40 sprite sheets ready

### 4. UFO
- Path: `res://asset/characters/pixellab/ufo/sprite_sheets/`
- Save as: `ufo_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/ufo_bullet.png`
- **Status**: 40/40 sprite sheets ready

### 5. Drone
- Path: `res://asset/characters/pixellab/drone/sprite_sheets/`
- Save as: `drone_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/drone_bullet.png`
- **Status**: 40/40 sprite sheets ready

### 6. Blue Warrior (Partial)
- Path: `res://asset/characters/pixellab/blue_warrior/sprite_sheets/`
- Save as: `warrior_animations.tres`
- Bullet: `res://asset/projectiles/pixellab/warrior_bullet.png`
- **Status**: 32/40 sprite sheets (missing walking animations)
- Note: You can create this enemy without walking animations, or use idle/run animations instead

---

## Using Animations in Enemy Scenes

Once you've created a SpriteFrames resource, here's how to use it:

### Method 1: Update Existing Enemy Scene

1. Open `scenes/entity/enemy_turret_new.tscn` (or create a new scene)
2. Select the **sprite** node (should be AnimatedSprite type)
3. In Inspector → **Frames** property → Click dropdown → **Load**
4. Select your `turret_animations.tres` file
5. Set **Animation**: `idle_south`
6. Set **Playing**: ✓
7. Make sure **Scale** is set to: `Vector2(2, 2)`
8. Save scene (Ctrl+S)

### Method 2: Create New Enemy Scene

1. **Scene → New Scene**
2. Add root: **KinematicBody2D** → rename to `EnemyTurret`
3. Add child: **AnimatedSprite** → rename to `sprite`
4. Select sprite:
   - Frames → Load → `turret_animations.tres`
   - Animation: `idle_south`
   - Playing: ✓
   - Scale: `Vector2(2, 2)`
5. Add other nodes: CollisionShape2D, Health, HealthBar, Hitbox, Hurtbox, DetectionArea
6. Attach script: `res://scenes/entity/enemy.gd`
7. Set script parameters:
   - `bullet_texture_path = "res://asset/projectiles/pixellab/turret_bullet.png"`
8. **Save as**: `res://scenes/entity/enemy_turret.tscn`

---

## Adding to main.gd

After creating enemy scenes, update your enemy pool in `scenes/main.gd`:

```gdscript
var enemy_scenes = [
	preload("res://scenes/entity/enemy.tscn"), // Keep enemy1 as requested
	preload("res://scenes/entity/enemy_crawler.tscn"),
	preload("res://scenes/entity/enemy_drone.tscn"),
	preload("res://scenes/entity/enemy_turret_new.tscn"),
	preload("res://scenes/entity/enemy_slug.tscn"),
	preload("res://scenes/entity/enemy_ufo.tscn"),
	preload("res://scenes/entity/enemy_red_soldier.tscn"),
	preload("res://scenes/entity/enemy_blue_warrior.tscn")
]
```

---

## Time Estimates

With sprite sheets, the workflow is **much faster**:

- **First enemy (Turret)**: 30-45 minutes (learning the workflow)
- **Subsequent enemies**: 15-20 minutes each (just importing sprite sheets)
- **Total for 6 enemies**: 2-3 hours

This is **50-70% faster** than adding individual frames!

---

## Tips for Speed

1. **Use a pattern**: Do all idle animations, then all walking, then all attacks, etc.
2. **Double-check settings**: Idle=6fps, Walk=10fps, Attack=12fps, Hurt=10fps, Run=12fps
3. **Loop settings**: Only attack and hurt animations don't loop
4. **Horizontal count**: Idle=4, Walk=6, Attack=6, Hurt=6, Run=8
5. **Vertical always = 1** (all sprite sheets are single rows)
6. **Save frequently** (Ctrl+S after completing each animation type)

---

## Troubleshooting

### Sprite sheet looks correct but frames aren't selected
- Make sure Horizontal matches the frame count (4, 6, or 8)
- Vertical should always be 1
- Check that the grid lines in the preview align with frames

### Animation plays at wrong speed
- Double-check the FPS setting for that animation type
- Idle: 6, Walk: 10, Attack: 12, Hurt: 10, Run: 12

### Attack/hurt animations loop forever
- Uncheck the "Loop" checkbox for attack and hurt animations

### Sprite appears too small in game
- Set AnimatedSprite Scale to Vector2(2, 2) in the scene

### Can't find sprite sheet files
- All sheets are in: `asset/characters/pixellab/{enemy}/sprite_sheets/`
- If missing, you may need to re-run `create_sprite_sheets.py`

---

## What's Ready

- ✓ 232 sprite sheets created and ready to import
- ✓ 7 custom bullet sprites created
- ✓ 6 enemies with complete animations (40 each)
- ✓ 1 enemy with partial animations (32)
- ✓ All existing enemy scene templates available

You're all set to start creating animations! Begin with Turret, test it in the game, then move on to the others.
