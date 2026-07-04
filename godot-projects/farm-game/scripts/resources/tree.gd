extends Node2D

@onready var sprite: Sprite2D = $Sprite2D
@onready var interact_area: Area2D = $InteractArea

var tile_id: String = ""
var max_hp: int = 5
var current_hp: int = 5
var is_depleted: bool = false
var days_until_respawn: int = 0
const RESPAWN_DAYS := 2

func _ready() -> void:
	GameManager.day_changed.connect(_on_day_changed)

func on_tool_use(tool_type: String, used_tile_id: String, player_id: String) -> void:
	if tool_type != "axe" or is_depleted:
		return
	current_hp -= 1
	_update_sprite()
	if current_hp <= 0:
		_deplete(used_tile_id, player_id)

func _deplete(used_tile_id: String, player_id: String) -> void:
	is_depleted = true
	days_until_respawn = RESPAWN_DAYS
	HarvestManager.harvest(used_tile_id, "wood", randi_range(2, 4), player_id)
	if randf() < 0.1:
		HarvestManager.harvest(used_tile_id, "fiber", 1, player_id)
	_update_sprite()

func _on_day_changed(_day: int, _season: String) -> void:
	if not is_depleted:
		return
	days_until_respawn -= 1
	if days_until_respawn <= 0:
		is_depleted = false
		current_hp = max_hp
		_update_sprite()

func _update_sprite() -> void:
	pass
