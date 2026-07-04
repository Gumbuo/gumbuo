extends Node2D

signal state_changed(new_state: int)
signal crop_ready(crop_id: String)

enum State { EMPTY, TILLED, PLANTED, WATERED, READY }

const CROP_DATA_PATH := "res://data/crops.json"

@onready var sprite: Sprite2D = $Sprite2D
@onready var interact_hitbox: Area2D = $InteractHitbox

var tile_id: String = ""
var state: State = State.EMPTY
var crop_id: String = ""
var grow_stage: int = 0
var days_planted: int = 0

var _all_crops: Dictionary = {}

func _ready() -> void:
	_load_crop_data()
	GameManager.day_changed.connect(_on_day_changed)
	_update_sprite()

func on_tool_use(tool_type: String, used_tile_id: String, player_id: String) -> void:
	match tool_type:
		"hoe":
			if state == State.EMPTY:
				_till()
		"watering_can":
			if state == State.PLANTED:
				_water(used_tile_id, player_id)
		"scythe":
			if state == State.READY:
				_harvest(used_tile_id, player_id)

func plant_seed(seed_item_id: String, used_tile_id: String) -> bool:
	if state != State.TILLED:
		return false
	var crop := _get_crop_by_seed(seed_item_id)
	if crop.is_empty():
		return false
	if not GameManager.get_season() in crop["seasons"]:
		return false
	if not ResourceManager.remove_item(seed_item_id):
		return false
	crop_id = crop["id"]
	grow_stage = 0
	days_planted = 0
	state = State.PLANTED
	state_changed.emit(state)
	_update_sprite()
	PlayerData.add_xp(1)
	return true

func _till() -> void:
	state = State.TILLED
	state_changed.emit(state)
	_update_sprite()
	PlayerData.add_xp(1)

func _water(used_tile_id: String, player_id: String) -> void:
	state = State.WATERED
	state_changed.emit(state)
	_update_sprite()
	PlayerData.add_xp(1)

func _harvest(used_tile_id: String, player_id: String) -> void:
	var crop: Dictionary = _all_crops.get(crop_id, {})
	if crop.is_empty():
		return
	var harvest_id: String = _pick_harvest_id(crop)
	HarvestManager.harvest(used_tile_id, harvest_id, crop.get("harvest_amount", 1), player_id)
	state = State.EMPTY
	crop_id = ""
	grow_stage = 0
	_update_sprite()
	state_changed.emit(state)

func _pick_harvest_id(crop: Dictionary) -> String:
	if not crop.has("harvest_table"):
		return crop.get("harvest_id", "")
	var table: Array = crop["harvest_table"]
	var total: int = 0
	for entry in table:
		total += int(entry["weight"])
	var roll: int = randi_range(0, total - 1)
	var cumulative: int = 0
	for entry in table:
		cumulative += int(entry["weight"])
		if roll < cumulative:
			return entry["item"]
	return table[0]["item"]

func _on_day_changed(_day: int, _season: String) -> void:
	if state != State.WATERED:
		return
	var crop: Dictionary = _all_crops.get(crop_id, {})
	if crop.is_empty():
		return
	days_planted += 1
	var grow_days: int = crop.get("grow_time_days", 3)
	var stages: int = crop.get("grow_stages", 4)
	grow_stage = min(int(days_planted * stages / grow_days), stages - 1)
	if days_planted >= grow_days:
		state = State.READY
		state_changed.emit(state)
		crop_ready.emit(crop_id)
	else:
		state = State.PLANTED
		state_changed.emit(state)
	_update_sprite()

func _update_sprite() -> void:
	pass

func _get_crop_by_seed(seed_id: String) -> Dictionary:
	for crop in _all_crops.values():
		if crop.get("seed_id", "") == seed_id:
			return crop
	return {}

func _load_crop_data() -> void:
	if not FileAccess.file_exists(CROP_DATA_PATH):
		return
	var file := FileAccess.open(CROP_DATA_PATH, FileAccess.READ)
	var json := JSON.new()
	if json.parse(file.get_as_text()) == OK:
		for crop in json.get_data():
			_all_crops[crop["id"]] = crop
