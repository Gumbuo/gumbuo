extends Node2D

func _ready():
	print("🎨 Terrain Painting Ready!")
	print("================================")
	print("How to paint terrain:")
	print("1. Select TileMapLayer node (left panel)")
	print("2. Click TileMap tab (bottom panel)")
	print("3. Click Terrains tab")
	print("4. Select a terrain from the palette")
	print("5. Press R for Rect Tool")
	print("6. Draw rectangles in the viewport!")
	print("")
	print("Navigation:")
	print("- Mouse wheel: Zoom in/out")
	print("- Middle mouse + drag: Pan camera")
	print("- Space: Clear map")
	print("================================")

func _input(event):
	if event is InputEventKey and event.pressed and event.keycode == KEY_SPACE:
		$TileMapLayer.clear()
		print("Map cleared!")
