# How to Download Your PixelLab Tilesets

You have 16 completed tilesets that need to be downloaded properly. Here's how:

## Your Tilesets

1. **Frozen Ice** - `d7118c92-dc40-4207-a253-e88213253234` (duplicate: `00bb2d41-d03b-4251-8d07-d915351869e1`)
2. **Volcanic Rock** - `8c585acb-055b-4cf6-940f-8cd978fc6c94` (duplicate: `5f2d8e66-8b4c-44a8-8730-b42a1e4b306a`)
3. **Ancient Stone** - `d38c6b08-2924-4951-802f-e5196e8ac28f` (duplicate: `8bbacb5b-2741-4c99-8c7f-9d2efe50847f`)
4. **Metal Tech** - `950aa8eb-ee8e-40c8-8f86-b2a1cb52116a` (duplicate: `ef74b8e7-3d19-4edc-b0c5-e7fea5de4262`)
5. **Alien GREEN** - `91278c27-8061-41b3-b1a8-ccac822383dd` (duplicate: `cebe7dc0-0b2c-48ce-adf1-6419a05cc4aa`)
6. **Alien BLUE** - `f6ec0076-b78b-4d13-b09b-0f881e2b8a95` (duplicate: `f2b9050a-29c5-4b11-8bd4-d45b98a45be1`)
7. **Alien RED** - `f1fc6f46-4b4c-4295-b0d5-9d98583c0fad` (duplicate: `f7a9053b-ff64-4f08-b1de-51d16e29e2e1`)
8. **Alien PURPLE** - `4088c780-d4cf-4379-a30a-b6327e7c4ff9` (duplicate: `5a7e5160-dbdb-4951-8415-d6d8c77a59ca`)

## Download Instructions

For each tileset, you need to download 2 files:

### Option A: Via PixelLab Website
1. Go to https://pixellab.ai/dashboard
2. Find your tilesets in the dashboard
3. Download the **metadata JSON** and **PNG sprite sheet** for each

### Option B: Via API (if you have an API key)
For each tileset ID above, download:
- Metadata: `https://api.pixellab.ai/mcp/tilesets/{TILESET_ID}/metadata`
- Image: `https://api.pixellab.ai/mcp/tilesets/{TILESET_ID}/image`

Save them as:
- `frozen_ice_metadata.json` + `frozen_ice_image.png`
- `volcanic_rock_metadata.json` + `volcanic_rock_image.png`
- etc.

## Next Steps

Once downloaded, run the converter:

```bash
cd "C:\Users\tcmid\gumbuo-site\godot-projects\alien-catacombs"

# Convert all tilesets at once (example with 2 tilesets):
godot --headless -s pixellab_tileset_converter.gd frozen_ice_metadata.json frozen_ice_image.png volcanic_rock_metadata.json volcanic_rock_image.png

# Or convert one at a time:
godot --headless -s pixellab_tileset_converter.gd alien_green_metadata.json alien_green_image.png
```

This will create `combined_terrain.tres` with all your terrains ready to paint in Godot!

## What You'll Get

After conversion, you'll be able to:
1. Open Godot
2. Add a TileMapLayer node
3. Assign the `combined_terrain.tres` file
4. Select the TileMapLayer
5. Click the "Terrains" tab
6. Choose a terrain (frozen ice, volcanic rock, alien tech, etc.)
7. Press **R** for Rect Tool
8. Draw rectangles and watch the tiles automatically connect!

## Important Notes

- You only need to download the 8 UNIQUE tilesets (not the duplicates)
- Each tileset contains 16 tiles arranged in a Wang pattern
- The converter will merge multiple tilesets into one Godot terrain system
- This enables visual terrain painting without any code!
