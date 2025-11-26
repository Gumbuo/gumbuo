# Alien Terrain Game - Driving Game Assets

## Project Status
Godot 4.5.1 project ready for top-down driving game development with character enter/exit vehicle mechanics.

## Characters (Ready to Use)
Location: `characters/`

### 5 Ghost Specters
- Blue-Ghost-Specter
- Green-Ghost-Specter
- Orange-Ghost-Specter
- Red-Ghost-Specter
- Yellow-Ghost-Specter

### 24 Elementals
1. Acid-Elemental
2. Blood-Elemental
3. Crystal-Elemental
4. Earth-Elemental
5. Fire-Elemental
6. Frost-Elemental
7. Ice-Golem
8. Lava-Creature
9. Light-Elemental
10. Lightning-Being
11. Magma-Elemental
12. Metal-Elemental
13. Nature-Elemental
14. Ocean-Elemental
15. Plasma-Elemental
16. Poison-Elemental
17. Sand-Elemental
18. Shadow-Being
19. Smoke-Elemental
20. Steam-Elemental
21. Storm-Elemental
22. Void-Elemental
23. Water-Elemental
24. Wind-Elemental

### Character Structure
Each character includes:
- `animations/` - 4 core animations (breathing-idle, fireball, running-8-frames, walking-8-frames)
- `rotations/` - 8 directional static images
- `metadata.json` - Character configuration

All animations have 8 directions: south, south-west, west, north-west, north, north-east, east, south-east

## Tilesets (Available)
Location: Root directory (metadata.json + image.png files)

### Racing/Driving Tilesets
- **asphalt** - Smooth road surface
- **highway** - Highway/freeway tiles
- **racing_track** - Racing circuit tiles
- **dirt_road** - Off-road terrain
- **cobblestone** - Classic street surface
- **concrete_sidewalk** - Urban sidewalks

### Environment Tilesets
- **water_ocean** - Water tiles
- **lava_rock** - Volcanic terrain
- **ice_walls** - Frozen terrain
- **ruins_sandstone** - Desert ruins
- **spaceship_metal** - Sci-fi metal
- **tech_corridor** - Tech facility
- **control_console_blue** - Tech consoles

### Wall Tilesets
- **wall_brick** - Brick walls
- **wall_cave** - Cave walls
- **wall_metal_barrier** - Metal barriers
- **wall_stone_dungeon** - Stone walls
- **wall_wood_fence** - Wooden fences

### Terrain Resources
- `combined_terrain.tres` - Pre-configured Godot terrain resource
- `pixellab_tileset_converter.gd` - Tileset conversion script

## UI Assets (Ready to Use)
Location: `ui/`

### Menu System
- Menu system.png - Complete start menu buttons (PLAY, OPTIONS, EXIT)
- Basic Buttons (multiple versions 1.0, 2.0, 2.1, 2.2, 3.0)
- Console buttons.png

### Button Types
- button_arrow/
- button_big/
- button_check/
- button_checkbox/
- button_long/
- button_nine_patch/
- button_normal/
- button_skewed/
- button_tab/
- button_tabs/

### HUD/Health Systems
**Lifebar System** (Recommended for driving game):
- lifebar system.png - Simple horizontal progress bars
- 10+ color variations
- No character portraits (perfect for vehicle health)

**Other Health Systems**:
- Health HUD system.png - Full system with character portraits
- Mini Health HUD system.png - Compact version
- Hearts (7 colors: Black, Blue, Green, Pink, Red, White, Yellow)

### Pre-configured Godot Resources
- healthbar_background.tres
- healthbar_progress.tres
- player_healthbar_background.tres
- player_healthbar_progress.tres

### Fonts
- DobleHex.ttf - Hexagonal pixel font
- HexFont16.ttf - 16px hex font
- TeamSnow.ttf - Display font

### Other UI Elements
- Dialogue system.png
- Health Characters Portraits.png
- fx/ - UI effects folder

## Game Objects
Location: `objects/`

Available decorative objects (from previous project):
- obelisk.png
- fountain.png
- statue.png

## Existing Scripts
Location: Root directory

### Player Controllers
- `player1_controller.gd` - Player 1 controls
- `player2_controller.gd` - Player 2 controls
- `terrain_painter.gd` - Terrain painting tool

### Character Scripts
Location: `characters/`
- `player.gd` + `player.tscn` - Player character system
- `enemy.gd` + `enemy.tscn` - Enemy system

### Scenes
- `pvp_arena.tscn` - PvP arena scene
- `terrain_painter.tscn` - Terrain editor (68KB)

## Next Steps for Driving Game

### 1. Start Menu
- Create main menu scene using Menu system.png assets
- Use pre-configured fonts (DobleHex.ttf, HexFont16.ttf)
- Add PLAY, OPTIONS, EXIT buttons

### 2. Driving Scene
- Create top-down driving scene
- Use asphalt/highway/racing_track tilesets
- Add boundaries with wall tilesets

### 3. Vehicle System
- Generate vehicle sprite (top-down, 8 directions) via PixelLab
- Create vehicle controller script
- Implement enter/exit vehicle mechanics

### 4. Character Integration
- Use existing character animations (walking-8-frames, running-8-frames)
- Connect to vehicle enter/exit system
- Add breathing-idle for stationary state

### 5. HUD Setup
- Implement lifebar system for vehicle health
- Add speed indicator
- Optional: Character portrait when outside vehicle

## Credits
- UI Assets: DG UI-HUD Exp pack (see ui/DG UI-HUD Exp.rar for credits)
- Characters: Generated via PixelLab AI
- Tilesets: Generated via PixelLab AI
