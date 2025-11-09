# Alien Catacombs - Multiplayer PvP Setup

## Features
- Up to 8 players can join the same map
- All players can see each other in real-time
- PvP combat - shoot and damage other players
- Color-coded players for easy distinction
- Network-synced movement, shooting, and damage

## How to Test Multiplayer

### Option 1: Local Testing (Same Computer)
1. Open Godot Editor
2. Run the game (F5)
3. Click **"Multiplayer"** button
4. Click **"Host Game"**
5. Click **"Start Game"** when ready

6. Open a second instance:
   - Go to Debug menu → Run Multiple Instances → Run 2 Instances
   - OR export the game and run the exported version separately

7. In the second instance:
   - Click **"Multiplayer"**
   - Enter IP: `127.0.0.1` (localhost)
   - Click **"Join Game"**

8. Both players will spawn in the map and can:
   - Move around (WASD)
   - Shoot each other (Mouse Click)
   - Switch weapons (1, 2, 3 keys)

### Option 2: Network Testing (Different Computers)
1. **Host player:**
   - Click "Multiplayer" → "Host Game" → "Start Game"
   - Find your local IP address (ipconfig on Windows, ifconfig on Linux/Mac)

2. **Joining players:**
   - Click "Multiplayer"
   - Enter the host's IP address
   - Click "Join Game"

## Network Settings

**Default Port:** 7777
**Max Players:** 8

To change these, edit `scripts/NetworkManager.gd`:
```gdscript
const DEFAULT_PORT = 7777
const MAX_PLAYERS = 8
```

## Player Features

### Spawn Points
Players spawn at different positions:
- Player 1: (512, 512)
- Player 2: (612, 512)
- Player 3: (512, 612)
- ... and so on

### Player Colors
Each player gets a unique color:
1. Red
2. Green
3. Blue
4. Yellow
5. Magenta
6. Cyan
7. Orange
8. Purple

### PvP Mechanics
- Bullets damage OTHER players (not yourself)
- Same health system as single player
- All 3 weapons work in multiplayer:
  - Pistol (1 key)
  - Rifle (2 key)
  - Shotgun (3 key)

## Files Modified/Created

### New Files:
- `scripts/NetworkManager.gd` - Core networking system
- `scenes/ui/MultiplayerLobby.tscn` - Lobby interface
- `scenes/ui/MultiplayerLobby.gd` - Lobby logic
- `scenes/entity/player_network.gd` - Network-synced player
- `scenes/entity/bullet_pvp.gd` - PvP bullet damage
- `scenes/main_multiplayer.gd` - Multiplayer main scene

### Modified Files:
- `scenes/main_menu.tscn` - Added "Multiplayer" button
- `scenes/main_menu.gd` - Added multiplayer button handler
- `scenes/main.tscn` - Uses multiplayer script
- `project.godot` - Added NetworkManager autoload

## Troubleshooting

### Players can't connect
- Check firewall settings (allow port 7777)
- Verify correct IP address
- Make sure both instances are running the same version

### Players can't see each other
- Check console for errors
- Verify NetworkManager is in autoload
- Make sure main.tscn uses main_multiplayer.gd

### Bullets don't damage players
- Check that bullet_pvp.gd is being used
- Verify player Health component exists
- Check console for "PvP damage" messages

## Next Steps

- Add player names/labels
- Add kill/death counter
- Add respawn system
- Add team modes
- Add chat system
- Add dedicated server support
