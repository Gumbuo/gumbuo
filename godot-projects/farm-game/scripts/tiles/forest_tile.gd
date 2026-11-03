extends "res://scripts/tiles/wild_tile_base.gd"

const TREE_PATHS := [
	"res://assets/sprites/tiles/forest_trees/forest_tree_1.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_2.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_3.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_4.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_5.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_6.png",
]

# Slot grid occupies x=438-842, y=154-558.
# At scale 2.5 (120px), each tree spans ±60px from its center.
# All 6 positions are at y≤94 (top strip) or y≥618 (bottom strip) — completely
# outside every slot row regardless of x position.
# Left/right corner trees also clear the slot columns (x±60 stays outside 438-842).
const TREE_POSITIONS := [
	Vector2(355,  65),   # top-left  corner — tree 1
	Vector2(640,  65),   # top-center        — tree 2
	Vector2(925,  65),   # top-right corner  — tree 3
	Vector2(355, 650),   # bottom-left corner — tree 4
	Vector2(640, 650),   # bottom-center      — tree 5
	Vector2(925, 650),   # bottom-right corner — tree 6
]

func _ready() -> void:
	super._ready()
	_check_wild_spawn("forest_last_spawn", ["mushroom"])
	_spawn_deco_trees()

func _spawn_deco_trees() -> void:
	for i in TREE_PATHS.size():
		var path: String = TREE_PATHS[i]
		if not ResourceLoader.exists(path):
			continue
		var spr := Sprite2D.new()
		spr.texture = load(path) as Texture2D
		spr.position = TREE_POSITIONS[i]
		spr.scale = Vector2(2.5, 2.5)
		spr.z_index = -5
		add_child(spr)
