extends Node

signal tile_placed(tile_data: Dictionary)
signal tile_moved(tile_id: String, new_position: Vector2i)
signal tile_removed(tile_id: String, position: Vector2i)
signal tile_settings_changed(tile_id: String)
signal deed_earned(tile_type: String)
signal slot_item_placed(tile_id: String, slot_key: String, item_id: String)
signal slot_item_removed(tile_id: String, slot_key: String)
signal crop_state_changed(tile_id: String, slot_key: String, new_state: String)
signal collab_state_changed(tile_id: String, slot_key: String, new_state: String)
signal passive_vault_updated(tile_id: String)
signal passive_income_received(tile_id: String, visitor_id: String, item_id: String, amount: int)

# Duration in seconds for each co-op station
const COLLAB_DURATION_SEC: Dictionary = {
	"bread_oven": 3600,
	"mill":        600,
	"barrel":     604800, # 7 days
}

enum TileType { FARM, FOREST, MOUNTAIN, POND, GUILD }
enum AccessMode { PUBLIC, PRIVATE, GUILD_ONLY }

const SAVE_PATH := "user://land_data.cfg"
const MAX_GRID_SIZE := Vector2i(30, 25)
const SLOT_COLS := 10
const SLOT_ROWS := 7
const GLOBAL_TILE_ID := "npc_global"
# [halfway_secs, ready_secs]  — halfway = 50% of total grow time
const GROW_TIMES := {
	"wheat":        [43200, 86400],
	"carrot":       [30,    60],
	"potato":       [5400,  10800],
	"cucumber":     [150,   300],
	"tomato":       [3600,  7200],
	"fern":         [900,   1800],
	"cotton":       [3600,  7200],
	"grapes":       [5400,  10800],
	"pumpkin":      [7200,  14400],
	"red_flower":   [7200,  14400],
	"blue_flower":  [7200,  14400],
	"yellow_flower":[7200,  14400],
}

var current_tile_id: String = ""
var home_tile_id: String = ""

# { tile_id -> TileData dict }
var tiles: Dictionary = {}
# { Vector2i -> tile_id } for fast position lookup
var grid: Dictionary = {}
# unplaced deeds in inventory { tile_type_str -> count }
var deed_inventory: Dictionary = {}
# tile IDs fetched from the world server (not saved locally)
var _remote_tile_ids: Dictionary = {}

func _ready() -> void:
	load_land_data()

func get_tile_at(grid_pos: Vector2i) -> Dictionary:
	var tile_id: String = grid.get(grid_pos, "")
	if tile_id == "":
		return {}
	return tiles.get(tile_id, {})

func place_tile(tile_type: TileType, grid_pos: Vector2i) -> bool:
	if grid.has(grid_pos):
		return false
	var type_str: String = str(TileType.keys()[tile_type])
	if deed_inventory.get(type_str, 0) <= 0:
		return false
	deed_inventory[type_str] -= 1

	var tile_id := _generate_tile_id()
	var tile_data := {
		"id": tile_id,
		"type": tile_type,
		"type_str": type_str,
		"position": grid_pos,
		"access_mode": AccessMode.PUBLIC,
		"yield_rate": 70,
		"passive_vault": {},
		"slots": {},
		"name": type_str.capitalize() + " Tile",
		"owner_id": PlayerData.player_id,
		"placed_at": Time.get_unix_time_from_system()
	}
	tiles[tile_id] = tile_data
	grid[grid_pos] = tile_id
	if tile_type == TileType.FOREST:
		_init_forest_trees(tile_id)
	if home_tile_id == "":
		home_tile_id = tile_id
	tile_placed.emit(tile_data)
	save_land_data()
	return true

func move_tile(tile_id: String, new_pos: Vector2i) -> bool:
	if not tiles.has(tile_id):
		return false
	if grid.has(new_pos):
		return false
	var tile_data: Dictionary = tiles[tile_id]
	var old_pos: Vector2i = tile_data["position"]
	grid.erase(old_pos)
	grid[new_pos] = tile_id
	tile_data["position"] = new_pos
	tile_moved.emit(tile_id, new_pos)
	save_land_data()
	return true

func remove_tile(tile_id: String) -> void:
	if not tiles.has(tile_id): return
	var tdata: Dictionary = tiles[tile_id]
	var pos: Vector2i = tdata.get("position", Vector2i(-1, -1))
	var type_str: String = tdata.get("type_str", "FARM")
	# Return all player-placed anchor items from slots back to backpack
	var slots: Dictionary = tdata.get("slots", {})
	for k in slots:
		var sd: Dictionary = slots[k]
		if not sd.get("is_anchor", false):
			continue
		var item_id: String = sd.get("item_id", "")
		if item_id == "" or item_id.ends_with("_tree") or item_id.begins_with("npc_"):
			continue
		ResourceManager.add_item(item_id, 1)
	if pos.x >= 0:
		grid.erase(pos)
	tiles.erase(tile_id)
	deed_inventory[type_str] = deed_inventory.get(type_str, 0) + 1
	save_land_data()
	tile_removed.emit(tile_id, pos)

func set_tile_access(tile_id: String, mode: AccessMode) -> void:
	if not tiles.has(tile_id):
		return
	tiles[tile_id]["access_mode"] = mode
	tile_settings_changed.emit(tile_id)
	save_land_data()

func set_tile_name(tile_id: String, new_name: String) -> void:
	if not tiles.has(tile_id): return
	tiles[tile_id]["name"] = new_name.strip_edges()
	tile_settings_changed.emit(tile_id)
	save_land_data()

func _init_forest_trees(tile_id: String) -> void:
	var slots: Dictionary = tiles[tile_id]["slots"]
	for key in slots:
		if slots[key].get("item_id", "").ends_with("tree"): return
	# All valid slot positions matching ROW_LAYOUT [4,6,6,6,6,4]
	var all_valid: Array = []
	var row_layout := [4, 6, 6, 6, 6, 4]
	var full_cols := 6
	for row in row_layout.size():
		var num_cols: int = row_layout[row]
		var col_offset: int = (full_cols - num_cols) / 2
		for i in num_cols:
			all_valid.append(Vector2i(col_offset + i, row))
	all_valid.shuffle()
	for i in 9:
		var pos: Vector2i = all_valid[i]
		var k: String = slot_key(pos)
		slots[k] = {"item_id": "oak_tree", "anchor": k, "is_anchor": true,
					 "size": [1, 1], "home_tile": tile_id}

func set_tile_yield_rate(tile_id: String, rate: int) -> void:
	if not tiles.has(tile_id):
		return
	tiles[tile_id]["yield_rate"] = clamp(rate, 50, 90)
	tile_settings_changed.emit(tile_id)
	save_land_data()

func earn_deed(tile_type: TileType) -> void:
	var type_str: String = str(TileType.keys()[tile_type])
	deed_inventory[type_str] = deed_inventory.get(type_str, 0) + 1
	deed_earned.emit(type_str)
	save_land_data()

func can_enter_tile(tile_id: String, visitor_id: String, _visitor_alliance: String) -> bool:
	if not tiles.has(tile_id):
		return false
	var tile: Dictionary = tiles[tile_id]
	var mode: int = tile["access_mode"]
	if mode == AccessMode.PUBLIC:
		return true
	if mode == AccessMode.PRIVATE:
		return tile["owner_id"] == visitor_id
	if mode == AccessMode.GUILD_ONLY:
		# TODO: check alliance membership via MarketManager
		return tile["owner_id"] == visitor_id
	return false

func add_to_passive_vault(tile_id: String, item_id: String, amount: int, visitor_id: String = "") -> void:
	if not tiles.has(tile_id):
		return
	var vault: Dictionary = tiles[tile_id]["passive_vault"]
	vault[item_id] = vault.get(item_id, 0) + amount
	save_land_data()
	passive_vault_updated.emit(tile_id)
	passive_income_received.emit(tile_id, visitor_id, item_id, amount)

func claim_passive_vault(tile_id: String) -> Dictionary:
	if not tiles.has(tile_id):
		return {}
	var vault: Dictionary = tiles[tile_id]["passive_vault"].duplicate()
	tiles[tile_id]["passive_vault"].clear()
	save_land_data()
	return vault

func get_player_tiles() -> Array:
	var result: Array = []
	for tile_data in tiles.values():
		if tile_data["owner_id"] == PlayerData.player_id:
			result.append(tile_data)
	return result

func get_kingdom_tier() -> int:
	var count := get_player_tiles().size()
	if count >= 19:
		return 5
	elif count >= 11:
		return 4
	elif count >= 6:
		return 3
	elif count >= 3:
		return 2
	return 1

func _ensure_global_tile() -> void:
	if not tiles.has(GLOBAL_TILE_ID):
		tiles[GLOBAL_TILE_ID] = {
			"id": GLOBAL_TILE_ID,
			"type": TileType.GUILD,
			"type_str": "GUILD",
			"position": Vector2i(-1, -1),
			"access_mode": AccessMode.PUBLIC,
			"yield_rate": 70,
			"passive_vault": {},
			"slots": {},
			"name": "Global Garden",
			"owner_id": "global",
			"placed_at": 0
		}
	# place npc_vendor at center (2,2) if not already there
	var gslots: Dictionary = tiles[GLOBAL_TILE_ID]["slots"]
	if not gslots.has(slot_key(Vector2i(2, 2))):
		place_slot_item(GLOBAL_TILE_ID, Vector2i(2, 2), "npc_vendor")
	save_land_data()

func grant_starter_pack() -> void:
	deed_inventory["FARM"]     = deed_inventory.get("FARM",     0) + 1
	deed_inventory["MOUNTAIN"] = deed_inventory.get("MOUNTAIN", 0) + 1
	deed_inventory["POND"]     = deed_inventory.get("POND",     0) + 1
	deed_inventory["FOREST"]   = deed_inventory.get("FOREST",   0) + 1
	# Mark permanently so _run_deed_migrations never re-grants
	var pid := PlayerData.player_id
	if pid != "":
		var cfg := ConfigFile.new()
		cfg.load(SAVE_PATH)
		cfg.set_value("starter_granted", pid, true)
		cfg.save(SAVE_PATH)
	save_land_data()

func get_slot_item_size(_item_id: String) -> Vector2i:
	return Vector2i(1, 1)

func slot_key(pos: Vector2i) -> String:
	return "%d,%d" % [pos.x, pos.y]

func place_slot_item(tile_id: String, slot_pos: Vector2i, item_id: String) -> bool:
	if not tiles.has(tile_id):
		return false
	var size: Vector2i = get_slot_item_size(item_id)
	var slots: Dictionary = tiles[tile_id]["slots"]
	for dy in size.y:
		for dx in size.x:
			var check := slot_pos + Vector2i(dx, dy)
			if check.x >= SLOT_COLS or check.y >= SLOT_ROWS:
				return false
			if slots.has(slot_key(check)):
				return false
	var anchor: String = slot_key(slot_pos)
	for dy in size.y:
		for dx in size.x:
			var p := slot_pos + Vector2i(dx, dy)
			slots[slot_key(p)] = {
				"item_id": item_id,
				"anchor": anchor,
				"is_anchor": dx == 0 and dy == 0,
				"size": [size.x, size.y]
			}
	save_land_data()
	slot_item_placed.emit(tile_id, anchor, item_id)
	return true

func remove_slot_item(tile_id: String, slot_pos: Vector2i) -> String:
	if not tiles.has(tile_id):
		return ""
	var slots: Dictionary = tiles[tile_id]["slots"]
	var key: String = slot_key(slot_pos)
	if not slots.has(key):
		return ""
	var anchor: String = slots[key].get("anchor", key)
	var item_id: String = slots[key].get("item_id", "")
	var to_remove: Array = []
	for k in slots:
		if slots[k].get("anchor", k) == anchor:
			to_remove.append(k)
	for k in to_remove:
		slots.erase(k)
	save_land_data()
	slot_item_removed.emit(tile_id, anchor)
	return item_id

func plant_seed(tile_id: String, slot_pos: Vector2i, seed_id: String) -> bool:
	if not tiles.has(tile_id): return false
	var slots: Dictionary = tiles[tile_id]["slots"]
	var key := slot_key(slot_pos)
	if not slots.has(key): return false
	var data: Dictionary = slots[key]
	if data.get("item_id", "") != "soil_plot": return false
	if not data.get("is_anchor", false): return false
	if data.has("crop"): return false
	var crop: String = seed_id.trim_prefix("seed_")
	data["state"] = "seedling"
	data["crop"] = crop
	data["planted_at"] = int(Time.get_unix_time_from_system())
	if PlayerData.has_farming_boost():
		data["fast_grow"] = true
	save_land_data()
	slot_item_placed.emit(tile_id, key, "soil_plot")
	return true

func harvest_crop(tile_id: String, slot_pos: Vector2i) -> String:
	if not tiles.has(tile_id): return ""
	var slots: Dictionary = tiles[tile_id]["slots"]
	var key := slot_key(slot_pos)
	if not slots.has(key): return ""
	var data: Dictionary = slots[key]
	if not data.get("is_anchor", false): return ""
	if data.get("state", "") != "ready": return ""
	var crop: String = data.get("crop", "")
	data.erase("state")
	data.erase("crop")
	data.erase("planted_at")
	save_land_data()
	slot_item_placed.emit(tile_id, key, "soil_plot")
	return crop

func update_crop_states() -> bool:
	var changed := false
	var now := int(Time.get_unix_time_from_system())
	for tid in tiles:
		var slots: Dictionary = tiles[tid].get("slots", {})
		for k in slots:
			var data: Dictionary = slots[k]
			if not data.get("is_anchor", false): continue
			if data.get("item_id", "") != "soil_plot": continue
			if not data.has("crop"): continue
			var crop: String = data.get("crop", "wheat")
			var elapsed: int = now - data.get("planted_at", now)
			if data.get("fast_grow", false):
				elapsed = int(elapsed * (1.0 / 0.85))
			var times: Array = GROW_TIMES.get(crop, [30, 90])
			var new_state: String
			if elapsed >= times[1]:   new_state = "ready"
			elif elapsed >= times[0]: new_state = "growing"
			else:                     new_state = "seedling"
			if data.get("state", "") != new_state:
				data["state"] = new_state
				crop_state_changed.emit(tid, k, new_state)
				changed = true
	if changed:
		save_land_data()
	return changed

# ─────────────────────────── CO-OP STATIONS ────────────────────────────────

func ensure_collab(tile_id: String, slot_pos: Vector2i) -> void:
	if not tiles.has(tile_id): return
	var slots: Dictionary = tiles[tile_id].get("slots", {})
	var key: String = slot_key(slot_pos)
	if not slots.has(key): return
	var data: Dictionary = slots[key]
	if not data.get("is_anchor", false): return
	if data.has("collab"): return
	data["collab"] = {"filled": [false, false, false], "timer_start": 0, "state": "waiting"}
	save_land_data()

func fill_collab_slot(tile_id: String, slot_pos: Vector2i, idx: int) -> void:
	if not tiles.has(tile_id): return
	var slots: Dictionary = tiles[tile_id].get("slots", {})
	var key: String = slot_key(slot_pos)
	if not slots.has(key): return
	var collab: Dictionary = slots[key].get("collab", {})
	if collab.is_empty(): return
	collab["filled"][idx] = true
	var all_filled: bool = true
	for v in collab["filled"]:
		if not v:
			all_filled = false
			break
	if all_filled and collab["state"] == "waiting":
		collab["timer_start"] = int(Time.get_unix_time_from_system())
		collab["state"] = "cooking"
		collab_state_changed.emit(tile_id, key, "cooking")
	save_land_data()

func collect_collab(tile_id: String, slot_pos: Vector2i) -> bool:
	if not tiles.has(tile_id): return false
	var slots: Dictionary = tiles[tile_id].get("slots", {})
	var key: String = slot_key(slot_pos)
	if not slots.has(key): return false
	var collab: Dictionary = slots[key].get("collab", {})
	if collab.get("state", "") != "ready": return false
	collab["filled"]      = [false, false, false]
	collab["timer_start"] = 0
	collab["state"]       = "waiting"
	collab_state_changed.emit(tile_id, key, "waiting")
	save_land_data()
	return true

func update_collab_states() -> bool:
	var changed := false
	var now := int(Time.get_unix_time_from_system())
	for tid in tiles:
		var slots: Dictionary = tiles[tid].get("slots", {})
		for k in slots:
			var data: Dictionary = slots[k]
			if not data.get("is_anchor", false): continue
			var item_id: String = data.get("item_id", "")
			if not COLLAB_DURATION_SEC.has(item_id): continue
			var collab: Dictionary = data.get("collab", {})
			if collab.get("state", "") != "cooking": continue
			var elapsed: int = now - collab.get("timer_start", now)
			if elapsed >= COLLAB_DURATION_SEC[item_id]:
				collab["state"] = "ready"
				collab_state_changed.emit(tid, k, "ready")
				changed = true
	if changed:
		save_land_data()
	return changed

func update_tree_states() -> bool:
	var changed := false
	var now := int(Time.get_unix_time_from_system())
	for tid in tiles:
		var slots: Dictionary = tiles[tid].get("slots", {})
		for k in slots:
			var data: Dictionary = slots[k]
			if not data.get("is_anchor", false): continue
			var item_id: String = data.get("item_id", "")
			if not item_id.ends_with("tree"): continue
			var chopped_at: int = data.get("tree_chopped_at", 0)
			if chopped_at == 0: continue
			if now - chopped_at >= 28800:
				data.erase("tree_chopped_at")
				slot_item_placed.emit(tid, k, item_id)
				changed = true
	if changed:
		save_land_data()
	return changed

const COOP_LAY_SECS    := 86400   # 24 hrs — egg-laying cycle
const COOP_STARVE_SECS := 259200  # 72 hrs — chicken wanders off without feed

func update_coop_states() -> bool:
	var changed := false
	var now := int(Time.get_unix_time_from_system())
	for tid in tiles:
		var tslots: Dictionary = tiles[tid].get("slots", {})
		for k in tslots:
			var data: Dictionary = tslots[k]
			if not data.get("is_anchor", false): continue
			if data.get("item_id", "") != "chicken_coop": continue
			var coop_changed := false

			var chickens: Array = data.get("chickens", [])
			var feed: int = data.get("coop_feed", 0)
			var feed_empty_since: int = data.get("feed_empty_since", 0)

			# Egg laying — each chicken lays one egg per day into an open tile slot
			for i in chickens.size():
				if feed <= 0: break
				var ch: Dictionary = chickens[i]
				if now - ch.get("last_laid_at", 0) < COOP_LAY_SECS: continue
				var egg_pos := _find_empty_slot(tid)
				if egg_pos == Vector2i(-1, -1): break
				var egg_type := "egg_gold" if randf() < 0.10 else "egg_white"
				var egg_key := slot_key(egg_pos)
				tslots[egg_key] = {"item_id": egg_type, "is_anchor": true, "size": [1, 1], "anchor": egg_key}
				chickens[i]["last_laid_at"] = now
				feed -= 1
				coop_changed = true

			# Starvation — chickens wander off after 72hrs with no feed
			if chickens.size() > 0 and feed == 0:
				if feed_empty_since == 0:
					data["feed_empty_since"] = now
					coop_changed = true
				elif now - feed_empty_since >= COOP_STARVE_SECS:
					chickens.clear()
					data["feed_empty_since"] = 0
					coop_changed = true
			elif feed > 0 and feed_empty_since != 0:
				data["feed_empty_since"] = 0
				coop_changed = true

			if coop_changed:
				data["chickens"] = chickens
				data["coop_feed"] = feed
				changed = true
				slot_item_placed.emit(tid, k, "chicken_coop")
	if changed:
		save_land_data()
	return changed

func _find_empty_slot(tile_id: String) -> Vector2i:
	var slots: Dictionary = tiles[tile_id].get("slots", {})
	for row in SLOT_ROWS:
		for col in SLOT_COLS:
			var pos := Vector2i(col, row)
			if not slots.has(slot_key(pos)):
				return pos
	return Vector2i(-1, -1)

func _hatch_egg(egg_type: String) -> String:
	var roll := randf()
	if egg_type == "white":
		if roll < 0.30: return "white"
		elif roll < 0.60: return "black"
		else: return ""
	else:  # gold
		if roll < 0.35: return "white"
		elif roll < 0.60: return "black"
		elif roll < 0.85: return "brown"
		else: return "gold"

# ─────────────────────────────────────────────────────────────────────────────

func _remove_legacy_starter_tile() -> void:
	# One-time migration: remove any single auto-placed FARM tile at (0,0) that
	# existed before the deed system. Players now place tiles themselves from inventory.
	var to_remove: Array = []
	for tid in tiles:
		var td: Dictionary = tiles[tid]
		var pos: Vector2i = td.get("position", Vector2i(-1, -1))
		if td.get("type_str", "") == "FARM" and pos == Vector2i(0, 0) \
				and td.get("placed_at", 1) == 0:
			to_remove.append(tid)
	for tid in to_remove:
		var pos: Vector2i = tiles[tid].get("position", Vector2i(-1, -1))
		if pos.x >= 0:
			grid.erase(pos)
		# Refund deed so player still has it to place
		deed_inventory["FARM"] = deed_inventory.get("FARM", 0) + 1
		tiles.erase(tid)
		if home_tile_id == tid:
			home_tile_id = ""

func _reclaim_local_tiles() -> void:
	var pid: String = PlayerData.player_id
	if pid == "":
		return
	for tid in tiles:
		var oid: String = tiles[tid].get("owner_id", "")
		if oid.begins_with("local_") and oid != pid:
			tiles[tid]["owner_id"] = pid

func _purge_unclaimed_tiles() -> void:
	for tid in tiles.keys():
		if tiles[tid].get("owner_id", "") == "":
			var pos: Vector2i = tiles[tid].get("position", Vector2i(-1, -1))
			if pos.x >= 0:
				grid.erase(pos)
			tiles.erase(tid)

func _generate_tile_id() -> String:
	return "tile_" + str(randi()) + "_" + str(Time.get_unix_time_from_system())

func is_remote_tile(tile_id: String) -> bool:
	return _remote_tile_ids.has(tile_id)

func merge_remote_tiles(remote_tiles: Array) -> void:
	var my_id: String = PlayerData.player_id
	for td in remote_tiles:
		var tid: String = td.get("id", "")
		if tid == "" or tiles.has(tid):
			continue
		# Never re-add own tiles from server — local save is authoritative.
		# Prevents a GET response in-flight before a delete from resurrecting it.
		if my_id != "" and str(td.get("owner_id", "")) == my_id:
			continue
		var pos_dict: Dictionary = td.get("position", {})
		var pos := Vector2i(int(pos_dict.get("x", -1)), int(pos_dict.get("y", -1)))
		if pos.x < 0 or grid.has(pos):
			continue
		var remote_slots: Dictionary = {}
		var raw_slots = td.get("slots", {})
		if raw_slots is Dictionary:
			remote_slots = raw_slots
		tiles[tid] = {
			"id":           tid,
			"type":         int(td.get("type", 0)),
			"type_str":     str(td.get("type_str", "FARM")),
			"position":     pos,
			"owner_id":     str(td.get("owner_id", "")),
			"name":         str(td.get("name", "Tile")),
			"access_mode":  int(td.get("access_mode", AccessMode.PUBLIC)),
			"yield_rate":   int(td.get("yield_rate", 70)),
			"placed_at":    0,
			"passive_vault": {},
			"slots":        remote_slots,
		}
		grid[pos] = tid
		_remote_tile_ids[tid] = true

func save_land_data() -> void:
	var cfg := ConfigFile.new()
	cfg.load(SAVE_PATH)  # Load existing so other players' deed sections are preserved
	var local_tiles := {}
	var local_grid := {}
	for tid in tiles:
		if not _remote_tile_ids.has(tid):
			local_tiles[tid] = tiles[tid]
	for pos in grid:
		if not _remote_tile_ids.has(grid[pos]):
			local_grid[pos] = grid[pos]
	cfg.set_value("tiles", "data", var_to_str(local_tiles))
	cfg.set_value("grid",  "data", var_to_str(local_grid))
	cfg.set_value("tiles", "home_tile_id", home_tile_id)
	var pid: String = PlayerData.player_id
	if pid != "":
		cfg.set_value("deed_player", pid, var_to_str(deed_inventory))
	else:
		cfg.set_value("deeds", "inventory", var_to_str(deed_inventory))
	cfg.save(SAVE_PATH)

func load_land_data() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) != OK:
		return  # new player — PlayerData._init_new_player() will call grant_starter_pack()
	tiles = str_to_var(cfg.get_value("tiles", "data", "{}"))
	grid  = str_to_var(cfg.get_value("grid",  "data", "{}"))
	home_tile_id = cfg.get_value("tiles", "home_tile_id", "")
	deed_inventory = _read_deed_inventory(cfg)
	if tiles.is_empty():
		return
	# Migration: convert any sparse forest tiles to dense (clear old 3-tree layout first)
	for tid in tiles:
		if tiles[tid].get("type_str","") == "FOREST" and tiles[tid].get("density","") == "sparse":
			tiles[tid]["density"] = "dense"
			tiles[tid]["name"]    = "Forest"
			var sl: Dictionary = tiles[tid]["slots"]
			for k in sl.keys():
				if sl[k].get("item_id","") == "oak_tree":
					sl.erase(k)
			_init_forest_trees(tid)
	_purge_unclaimed_tiles()
	_reclaim_local_tiles()
	_remove_legacy_starter_tile()
	_run_deed_migrations()
	_ensure_global_tile()
	save_land_data()

# Called by PlayerData.set_username() after identity is set, so deed_inventory
# is loaded for the newly-logged-in player without reloading tiles/grid.
func reload_player_deeds() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) != OK:
		deed_inventory = {}
		return
	deed_inventory = _read_deed_inventory(cfg)
	_run_deed_migrations()
	save_land_data()

func _read_deed_inventory(cfg: ConfigFile) -> Dictionary:
	var pid: String = PlayerData.player_id
	if pid != "":
		var inv: Dictionary = str_to_var(cfg.get_value("deed_player", pid, "{}"))
		if not inv.is_empty():
			return inv
	return {}

func _run_deed_migrations() -> void:
	# Fold old FOREST_DENSE/FOREST_SPARSE keys into FOREST
	if deed_inventory.has("FOREST_DENSE"):
		deed_inventory["FOREST"] = deed_inventory.get("FOREST", 0) + deed_inventory["FOREST_DENSE"]
		deed_inventory.erase("FOREST_DENSE")
	deed_inventory.erase("FOREST_SPARSE")
	# Only grant starter deeds once per player — check the permanent flag first
	var total_deeds := 0
	for v in deed_inventory.values():
		total_deeds += int(v)
	if total_deeds == 0:
		var pid := PlayerData.player_id
		var already_granted := false
		if pid != "":
			var cfg := ConfigFile.new()
			cfg.load(SAVE_PATH)
			already_granted = cfg.get_value("starter_granted", pid, false)
			# Also retroactively mark existing accounts that already placed tiles
			if not already_granted:
				for tid in tiles:
					if tiles[tid].get("owner_id", "") == pid:
						already_granted = true
						cfg.set_value("starter_granted", pid, true)
						cfg.save(SAVE_PATH)
						break
		if not already_granted:
			deed_inventory["FARM"]     = deed_inventory.get("FARM",     0) + 1
			deed_inventory["MOUNTAIN"] = deed_inventory.get("MOUNTAIN", 0) + 1
			deed_inventory["POND"]     = deed_inventory.get("POND",     0) + 1
			deed_inventory["FOREST"]   = deed_inventory.get("FOREST",   0) + 1
