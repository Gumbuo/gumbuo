extends "res://scripts/tiles/wild_tile_base.gd"

const TREE_PATHS := [
	"res://assets/sprites/tiles/forest_trees/forest_tree_1.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_2.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_3.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_4.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_5.png",
	"res://assets/sprites/tiles/forest_trees/forest_tree_6.png",
]

# Fixed scatter positions (screen x, y) for decorative trees.
# Placed along edges and gaps so they frame the farmable slots.
const TREE_POSITIONS := [
	# Top row
	Vector2(400, 118), Vector2(460, 105), Vector2(530, 118), Vector2(600, 108),
	Vector2(670, 118), Vector2(740, 108), Vector2(810, 118), Vector2(870, 108),
	# Left column
	Vector2(400, 190), Vector2(400, 270), Vector2(400, 350),
	Vector2(400, 430), Vector2(400, 510),
	# Right column
	Vector2(870, 190), Vector2(870, 270), Vector2(870, 350),
	Vector2(870, 430), Vector2(870, 510),
	# Bottom row
	Vector2(420, 575), Vector2(490, 585), Vector2(560, 575), Vector2(630, 585),
	Vector2(700, 575), Vector2(770, 585), Vector2(840, 575),
]

# Which tree variant each position uses (index into TREE_PATHS, cycles through all 6)
const TREE_VARIANTS := [
	0, 2, 4, 1, 3, 5, 0, 2,
	1, 3, 5,
	4, 2,
	0, 4, 1,
	5, 3,
	2, 0, 4, 1, 5, 3, 2,
]

func _ready() -> void:
	super._ready()
	_check_wild_spawn("forest_last_spawn", ["mushroom"])
	_spawn_deco_trees()

func _spawn_deco_trees() -> void:
	var textures: Array = []
	for path in TREE_PATHS:
		if ResourceLoader.exists(path):
			textures.append(load(path) as Texture2D)
		else:
			textures.append(null)

	for i in TREE_POSITIONS.size():
		var tex: Texture2D = textures[TREE_VARIANTS[i] % textures.size()]
		if tex == null:
			continue
		var spr := Sprite2D.new()
		spr.texture = tex
		spr.position = TREE_POSITIONS[i]
		spr.scale = Vector2(2.5, 2.5)
		spr.z_index = -5   # behind slot items, in front of flat background
		add_child(spr)
