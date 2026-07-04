extends Node2D

@onready var sprite: Sprite2D = $Sprite2D
@onready var interact_area: Area2D = $InteractArea

var tile_id: String = ""
var max_hp: int = 6
var current_hp: int = 6
var is_depleted: bool = false
const RESPAWN_DAYS := 3

# Loot tables by vein type
const LOOT_TABLES := {
	"stone": [
		{ "item": "stone", "min": 3, "max": 6, "chance": 1.0 },
		{ "item": "clay", "min": 1, "max": 3, "chance": 0.4 }
	],
	"iron": [
		{ "item": "stone", "min": 1, "max": 3, "chance": 1.0 },
		{ "item": "iron_ore", "min": 2, "max": 4, "chance": 1.0 },
		{ "item": "silver_ore", "min": 1, "max": 2, "chance": 0.3 }
	],
	"gem": [
		{ "item": "stone", "min": 1, "max": 2, "chance": 1.0 },
		{ "item": "gold_ore", "min": 1, "max": 2, "chance": 0.35 },
		{ "item": "amethyst", "min": 1, "max": 1, "chance": 0.2 },
		{ "item": "ruby", "min": 1, "max": 1, "chance": 0.15 },
		{ "item": "emerald", "min": 1, "max": 1, "chance": 0.15 },
		{ "item": "sapphire", "min": 1, "max": 1, "chance": 0.15 }
	]
}

@export var vein_type: String = "stone"
var _days_depleted: int = 0

func _ready() -> void:
	GameManager.day_changed.connect(_on_day_changed)

func on_tool_use(tool_type: String, used_tile_id: String, player_id: String) -> void:
	if tool_type != "pickaxe" or is_depleted:
		return
	current_hp -= 1
	_update_sprite()
	if current_hp <= 0:
		_deplete(used_tile_id, player_id)

func _deplete(used_tile_id: String, player_id: String) -> void:
	is_depleted = true
	_days_depleted = 0
	var table: Array = LOOT_TABLES.get(vein_type, LOOT_TABLES["stone"])
	for entry in table:
		if randf() <= float(entry["chance"]):
			var amount: int = randi_range(int(entry["min"]), int(entry["max"]))
			HarvestManager.harvest(used_tile_id, entry["item"], amount, player_id)
	_update_sprite()

func _on_day_changed(_day: int, _season: String) -> void:
	if not is_depleted:
		return
	_days_depleted += 1
	if _days_depleted >= RESPAWN_DAYS:
		is_depleted = false
		current_hp = max_hp
		_update_sprite()

func _update_sprite() -> void:
	pass
