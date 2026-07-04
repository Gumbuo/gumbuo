extends "res://scripts/tiles/wild_tile_base.gd"

const WILD_CROPS := [
	"cucumber", "tomato", "carrot", "potato",
	"red_flower", "blue_flower", "yellow_flower", "cotton",
]

func _ready() -> void:
	super._ready()
	_check_wild_spawn("pond_last_spawn", WILD_CROPS)
