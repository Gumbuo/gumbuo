extends "res://scripts/tiles/wild_tile_base.gd"

func _ready() -> void:
	super._ready()
	_check_wild_spawn("forest_last_spawn", ["mushroom"])
