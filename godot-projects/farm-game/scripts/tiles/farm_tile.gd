extends "res://scripts/tiles/wild_tile_base.gd"

const WILD_CROPS := [
	"cucumber", "tomato", "carrot", "potato",
	"red_flower", "blue_flower", "yellow_flower", "cotton",
]

# Chance of a PvE beaver showing up on any visit to a farm tile that already
# has at least one planted crop — see scripts/creatures/beaver.gd.
const BEAVER_SPAWN_CHANCE := 0.4

func _ready() -> void:
	super._ready()
	_check_wild_spawn("farm_last_spawn", WILD_CROPS)
	_maybe_spawn_beaver()

func _maybe_spawn_beaver() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var has_crop := false
	for key in slots:
		var data: Dictionary = slots[key]
		if data.get("is_anchor", false) and data.get("item_id", "") == "soil_plot" and data.has("crop"):
			has_crop = true
			break
	if not has_crop:
		return
	if randf() > BEAVER_SPAWN_CHANCE:
		return
	_spawn_beaver()
