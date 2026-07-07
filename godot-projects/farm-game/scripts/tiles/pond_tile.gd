extends "res://scripts/tiles/wild_tile_base.gd"

const WILD_CROPS := [
	"cucumber", "tomato", "carrot", "potato",
	"red_flower", "blue_flower", "yellow_flower", "cotton",
]

const FISH_DURATION := 5.0

const FISH_TABLE := [
	{ "item": "tadpole",         "weight": 20 },
	{ "item": "grey_chubfish",   "weight": 15 },
	{ "item": "yellow_chubfish", "weight": 15 },
	{ "item": "red_chubfish",    "weight": 12 },
	{ "item": "catfish",         "weight": 8  },
	{ "item": "black_crappie",   "weight": 7  },
	{ "item": "orange_bluegill", "weight": 6  },
	{ "item": "blue_bluegill",   "weight": 6  },
	{ "item": "yellow_bluegill", "weight": 5  },
	{ "item": "crucian_carp",    "weight": 5  },
	{ "item": "lotus_carp",      "weight": 3  },
	{ "item": "albino_catfish",  "weight": 2  },
	{ "item": "golden_koi",      "weight": 1  },
]

var _pending_fish: bool = false
var _fish_world_pos: Vector2 = Vector2.ZERO
var _fishing: bool = false
var _fish_timer: float = 0.0

func _ready() -> void:
	super._ready()
	_check_wild_spawn("pond_last_spawn", WILD_CROPS)
	_slot_grid.pond_water_clicked.connect(_on_pond_water_clicked)

# Only allow wild spawns in the grassland rows (top and bottom of the slot grid)
func _get_empty_slots() -> Array:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var empty: Array = []
	for y in [0, 5]:
		for x in range(1, 5):  # cols 1–4, the only displayed slots in rows 0 and 5
			var pos := Vector2i(x, y)
			if not slots.has(LandManager.slot_key(pos)):
				empty.append(pos)
	return empty

func _process(delta: float) -> void:
	if not _fishing:
		return
	_fish_timer += delta
	if _fish_timer >= FISH_DURATION:
		_finish_fishing()

func _on_pond_water_clicked(_screen_pos: Vector2) -> void:
	if _fishing or _pending_fish:
		return
	if not PlayerData.spend_energy(1):
		return
	# Walk to the south shore of the pond (bottom center grassland slot)
	_fish_world_pos = _slot_center_world(Vector2i(3, 5))
	_player.move_to(_fish_world_pos)
	_pending_fish = true

func _on_player_arrived(at_pos: Vector2) -> void:
	if _pending_fish:
		_pending_fish = false
		if at_pos.distance_to(_fish_world_pos) < 80.0:
			_start_fishing()
			return
	super._on_player_arrived(at_pos)

func _start_fishing() -> void:
	_fishing = true
	_fish_timer = 0.0
	PlayerData.add_xp(1)
	_player.facing = "north"
	_player.start_fish_loop()

func _finish_fishing() -> void:
	_fishing = false
	_player.stop_fish_loop()
	var fish_id := _roll_fish()
	var is_owner: bool = LandManager.tiles.get(tile_id, {}).get("owner_id", "") == PlayerData.player_id
	if is_owner:
		ResourceManager.add_item(fish_id, 3)
		PlayerData.add_xp(2)
		_show_catch(fish_id, 3, false)
	else:
		ResourceManager.add_item(fish_id, 1)
		PlayerData.add_xp(1)
		LandManager.add_to_passive_vault(tile_id, fish_id, 2)
		_show_catch(fish_id, 1, true)

func _roll_fish() -> String:
	var total := 0
	for e in FISH_TABLE:
		total += e["weight"]
	var roll := randi_range(1, total)
	var running := 0
	for e in FISH_TABLE:
		running += e["weight"]
		if roll <= running:
			return e["item"]
	return FISH_TABLE[0]["item"]

func _show_catch(fish_id: String, player_count: int, split: bool) -> void:
	var ui: CanvasLayer = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	var drops := [{"label": "You caught", "color": Color(0.4, 0.75, 1.0), "items": [{"id": fish_id, "count": player_count}]}]
	if split:
		drops.append({"label": "Owner receives", "color": Color(1.0, 0.88, 0.3), "items": [{"id": fish_id, "count": 2}]})
	ui.show_drops(drops)
