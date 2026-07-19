extends CanvasLayer

signal slot_activated(grid_pos: Vector2i, action: String, item_id: String)
signal pond_water_clicked(screen_pos: Vector2)
signal item_chosen(item_id: String)

# Items offered by the "choose_farm" popup for empty land slots.
const FARM_POPUP_ITEMS: Array = [
	"soil_plot", "boulder", "tree", "apple_tree", "pear_tree", "peach_tree", "lemon_tree",
	"chicken_coop", "beehive", "mailbox",
]

const SLOT_PX  := 64.0
const SLOT_GAP := 4.0
# 8 columns wide; the outer 2 columns are 4 slots tall, the inner 6 are
# full height (6 slots tall) — same rounded shape as before, just extended.
const FULL_COLS := 8
const ROW_LAYOUT := [6, 8, 8, 8, 8, 6]

# Outer tool slots — bigger slots (~4x the area of a regular slot) placed
# outside the main grid for crafting/utility stations. Left/right columns,
# 5 rows each. The nav W/E buttons (x:4-144 / x:1136-1276) and SW/SE/NW/NE
# buttons (centered x:490-786) never overlap these columns (x:150-270 /
# x:1010-1130) so no vertical gap is needed to dodge them.
const TOOL_SLOT_PX := 120.0
const TOOL_SLOT_POS: Array = [
	Vector2(150,  16), Vector2(150, 144), Vector2(150, 272), Vector2(150, 400), Vector2(150, 528),
	Vector2(1010, 16), Vector2(1010, 144), Vector2(1010, 272), Vector2(1010, 400), Vector2(1010, 528),
]

# Persistent seed slide bar — sits in the gap between the SE nav button
# (ends x:786) and the right tool slot column (starts x:1010, and its
# bottom slot runs to y:648), clear of the HUD's bottom bar (y:664-712).
# Narrow on purpose — it's a horizontally-scrolling strip, not a full panel.
const SEED_BAR_POS  := Vector2(792, 612)
const SEED_BAR_SIZE := Vector2(212, 44)

# Mirrors the seed bar on the other side — sits in the gap between the left
# tool slot column (ends x:270) and the SW nav button (starts x:490).
const TOOL_BAR_POS  := Vector2(276, 612)
const TOOL_BAR_SIZE := Vector2(208, 44)

var tile_id: String = ""
var _held_item: String = ""
var _held_seed: String = ""
var _hovered_slot: Vector2i = Vector2i(-1, -1)

var _slot_nodes:   Dictionary = {}  # key -> Control
var _item_colors:  Dictionary = {}
var _picker_btns:  Array      = []
var _picker_panel:     Control    = null
var _picker_container: Control    = null
var _picker_bgs:   Dictionary = {}  # item_id -> Button
var _seed_bgs:     Dictionary = {}  # seed_id -> Button
var _root:         Control    = null

var _crop_sprites:    Dictionary = {}  # key -> {rect, tween, stage}
var _tree_sprites:    Dictionary = {}  # key -> TextureRect
var _tree_chop_state: Dictionary = {}  # key -> bool  (last known chopped state, drives animation)
var _tree_idle_tweens: Dictionary = {}  # key -> Tween (gentle idle sway for full trees)
var _rock_sprites: Dictionary = {}  # key -> TextureRect
var _rock_stage:   Dictionary = {}  # key -> int  0=full 1=cracked 2=mined/dust
var _rock_tweens:  Dictionary = {}  # key -> Tween (active animation)
var _item_sprites:  Dictionary = {}  # key -> TextureRect (generic item pixels)
var _beehive_sprites:    Dictionary = {}  # key -> TextureRect
var _beehive_tweens:     Dictionary = {}  # key -> Tween (looping frame animation)
var _beehive_ready_state: Dictionary = {} # key -> bool
var _chicken_sprites: Array = []    # TextureRect nodes for chickens on tile
var _chicken_wander:  Array = []    # parallel array: {target: Vector2, pause: float}
var _masked_positions: Dictionary = {}  # key -> true for slots hidden on pond tile
var _grow_timer:    float      = 0.0
var _display_timer: float      = 0.0
var _timer_label:   Label      = null
var _crop_sheet:      Image      = null  # loaded from crops.png
var _seed_phase_img:  Image      = null  # seed bag fallback for stage 0
var _seedling_imgs:   Dictionary = {}    # crop_id -> Image, loaded lazily at stage 0
var _medium_imgs:     Dictionary = {}    # crop_id -> Image, loaded lazily at stage 1
var _ready_imgs:      Dictionary = {}    # crop_id -> Image, loaded lazily at stage 2
var _active_crafting_ui: CanvasLayer = null
var _tool_slot_nodes: Dictionary = {}  # idx -> Control
var _tool_slot_sprites: Dictionary = {}  # idx -> TextureRect (item icon)
# True while a choice popup (seed/tool/farm) is open. The popup is built as
# part of this same CanvasLayer rather than a separate node with its own
# _ready(), so it can't join the "action_windows" group the other popups
# use to block slot_grid's raw _input() — this flag does the same job.
var _choice_popup_open: bool = false

# Persistent horizontal seed bar (replaces the one-shot modal for seeds only)
var _seed_bar:       Control        = null
var _seed_bar_box:   HBoxContainer  = null

# Mirrors the seed bar for tools/crafting stations, placed via empty tool slots
var _tool_bar:       Control        = null
var _tool_bar_box:   HBoxContainer  = null

# soil_plot/boulder (empty-land popup), all TREES (empty-land popup), and
# CRAFTING (tool slot popup) are no longer offered here — clicking the
# relevant empty slot now pops up a choice instead. Seeds are also gone;
# see the "choose_seed" popup triggered by clicking empty soil.
# Nothing left here — soil/trees/rocks/coop/beehive/mailbox are chosen via
# the "choose_farm" popup now, seeds via "choose_seed", crafting stations
# via the tool slots. silo/box/dropbox were unused placeholder content.
const PLACEABLE_CATEGORIES: Array = []

const CRAFTING_STATIONS: Dictionary = {
	"workbench":      "res://scripts/ui/workbench_ui.gd",
	"anvil":          "res://scripts/ui/anvil_ui.gd",
	"furnace":        "res://scripts/ui/furnace_ui.gd",
	"alchemy_table":  "res://scripts/ui/alchemy_table_ui.gd",
	"bonfire":        "res://scripts/ui/bonfire_ui.gd",
	"dyeing_vat":     "res://scripts/ui/dyeing_vat_ui.gd",
	"spinning_wheel": "res://scripts/ui/spinning_wheel_ui.gd",
	"stonecutter":    "res://scripts/ui/stonecutter_ui.gd",
	"wine_press":     "res://scripts/ui/wine_press_ui.gd",
	"bread_oven":     "res://scripts/ui/bread_oven_ui.gd",
	"barrel":         "res://scripts/ui/barrel_ui.gd",
	"sawmill":        "res://scripts/ui/sawmill_ui.gd",
	"npc_vendor":     "res://scripts/ui/npc_tom_ui.gd",
	"npc_lilly":      "res://scripts/ui/npc_lilly_ui.gd",
	"npc_gus":        "res://scripts/ui/npc_gus_ui.gd",
}

const ACTION_ITEMS: Array = ["tree", "oak_tree", "apple_tree", "pear_tree", "peach_tree", "lemon_tree", "boulder", "mailbox", "chicken_coop", "beehive", "egg_white", "egg_gold"]

# Maps item_id to the sprite folder name when they differ
const TREE_SPRITE_FOLDER: Dictionary = {
	"tree":       "oak_tree",
	"lemon_tree": "pear_tree",
}

# Band index (row) in crops.png — each band is 48px tall.
# Adjust these if crops appear wrong in-game.
const CROP_BAND: Dictionary = {
	"tomato":  0,
	"potato":  1,
	"carrot":  2,
	"cabbage": 3,
	"wheat":   5,
}
# Column region per growth stage: [x_offset, width] within the 128px band
# Cols 1-2 = seedling, cols 3-4 = growing, cols 5-7 = ready
const CROP_STAGE_COL: Array = [
	[16, 32],   # stage 0 seedling
	[48, 32],   # stage 1 growing
	[80, 48],   # stage 2 ready
]

# ─────────────────────────── INIT ───────────────────────────

func _ready() -> void:
	_item_colors = {
		"workbench":      Color(0.55, 0.38, 0.18),
		"soil_plot":      Color(0.55, 0.35, 0.15),
		"tree":           Color(0.25, 0.55, 0.15),
		"apple_tree":     Color(0.80, 0.20, 0.20),
		"pear_tree":      Color(0.75, 0.78, 0.20),
		"peach_tree":     Color(0.95, 0.60, 0.30),
		"lemon_tree":     Color(0.95, 0.90, 0.10),
		"boulder":        Color(0.55, 0.52, 0.48),
		"chicken_coop":   Color(0.85, 0.72, 0.30),
		"campfire":       Color(0.90, 0.45, 0.10),
		"bonfire":        Color(0.95, 0.38, 0.05),
		"workshop":       Color(0.50, 0.35, 0.20),
		"furnace":        Color(0.65, 0.20, 0.10),
		"burner_station": Color(0.50, 0.25, 0.70),
		"wheat_mill":     Color(0.82, 0.68, 0.10),
		"bread_oven":     Color(0.78, 0.55, 0.30),
		"silo":           Color(0.55, 0.58, 0.68),
		"alchemy_table":  Color(0.42, 0.18, 0.65),
		"anvil":          Color(0.40, 0.40, 0.42),
		"barrel":         Color(0.48, 0.30, 0.12),
		"beehive":        Color(0.92, 0.75, 0.10),
		"box":            Color(0.60, 0.42, 0.22),
		"dyeing_vat":     Color(0.55, 0.18, 0.55),
		"sawmill":        Color(0.48, 0.32, 0.15),
		"mailbox":        Color(0.85, 0.55, 0.15),
		"spinning_wheel": Color(0.78, 0.72, 0.85),
		"stonecutter":    Color(0.50, 0.48, 0.45),
		"wine_press":     Color(0.55, 0.12, 0.35),
		"npc_vendor":     Color(0.88, 0.72, 0.56),
		"npc_lilly":      Color(0.55, 0.90, 0.45),
		"npc_gus":        Color(0.90, 0.78, 0.35),
	}
	for _wc in ["mushroom", "carrot", "tomato", "potato", "cucumber",
			"red_flower", "blue_flower", "yellow_flower", "cotton"]:
		_item_colors["wild_" + _wc] = Color(0.22, 0.68, 0.22)
	add_to_group("slot_grid")

func setup(tid: String) -> void:
	tile_id = tid
	if tile_id == "":
		var player_tiles := LandManager.get_player_tiles()
		if not player_tiles.is_empty():
			tile_id = player_tiles[0]["id"]

	# Build UI now that tile_id is known — pond vs standard layout chosen here.
	_build_ui()

	# Migrate any old-style crafting station placements after the UI exists,
	# so a problem here can never prevent the grid/tool slots from rendering.
	if not _is_pond_tile():
		LandManager.migrate_crafting_items_to_tool_slots(tile_id)

	var sheet_tex: Texture2D = load("res://assets/sprites/crops/crops.png")
	if sheet_tex:
		_crop_sheet = sheet_tex.get_image()
	var seed_tex: Texture2D = load("res://assets/sprites/crops/seed_phase.png")
	if seed_tex:
		_seed_phase_img = seed_tex.get_image()
	LandManager.update_crop_states()
	LandManager.update_tree_states()
	LandManager.update_coop_states()
	LandManager.slot_item_placed.connect(func(_a, _b, _c): _refresh())
	LandManager.slot_item_removed.connect(func(_a, _b): _refresh())
	LandManager.crop_state_changed.connect(func(_a, _b, _c): _refresh())
	LandManager.collab_state_changed.connect(func(_a, _b, _c): _refresh())
	_refresh()
	_refresh_picker()
	_apply_pond_mask()
	# Seed/tool bars stay on screen permanently now instead of popping open
	# only when triggered — picking an item never blocks other clicks (see
	# the "_held_seed != "" and occupied" guard in _input()), so having them
	# always visible doesn't interfere with harvesting/pathing/etc.
	if not _is_pond_tile():
		show_seed_bar()
		show_tool_bar()

func set_held_item(item_id: String) -> void:
	_held_item = item_id
	_held_seed = ""
	_update_picker_visuals()

# ─────────────────────────── LOOP ───────────────────────────

func _process(delta: float) -> void:
	if (_held_item != "" or _held_seed != "") and Input.is_action_just_pressed("ui_cancel"):
		_held_item = ""
		_held_seed = ""
		_update_picker_visuals()
		if _seed_bar and is_instance_valid(_seed_bar):
			_seed_bar.visible = false

	_update_chicken_wander(delta)

	_grow_timer += delta
	if _grow_timer >= 10.0:
		_grow_timer = 0.0
		LandManager.update_crop_states()
		LandManager.update_collab_states()
		LandManager.update_tree_states()
		LandManager.update_coop_states()

	_display_timer += delta
	if _display_timer >= 1.0:
		_display_timer = 0.0
		_update_crop_timers()

	var mouse_pos: Vector2 = get_viewport().get_mouse_position()
	var new_hover := Vector2i(-1, -1)

	var candidate := _screen_to_slot(mouse_pos)
	if _held_item != "":
		new_hover = candidate
	else:
		if candidate.x >= 0:
			var k := LandManager.slot_key(candidate)
			var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
			if slots.has(k) and slots[k].get("is_anchor", false) \
					and slots[k].get("item_id","") == "soil_plot":
				new_hover = candidate  # highlight all soil: empty (blue/cyan) or planted (for timer)

	if new_hover != _hovered_slot:
		_clear_hover()
		_hovered_slot = new_hover
		if _hovered_slot.x >= 0:
			var k := LandManager.slot_key(_hovered_slot)
			if _slot_nodes.has(k):
				var f: ColorRect = _slot_nodes[k].get_node_or_null("Fill")
				if f:
					var sl: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
					if sl.has(k) and sl[k].has("crop"):
						f.color = Color(0.85, 0.85, 0.10, 0.55)  # golden tint on planted soil hover
					elif _held_seed != "":
						f.color = Color(0.10, 0.85, 0.70, 0.85)
					else:
						f.color = Color(0.15, 0.40, 1.0, 0.85)

	# ── crop hover timer ──
	if _timer_label != null:
		var show_timer := false
		if candidate.x >= 0:
			var k := LandManager.slot_key(candidate)
			var sl: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
			if sl.has(k) and sl[k].get("is_anchor", false) and sl[k].has("crop"):
				var data: Dictionary = sl[k]
				var crop: String = data.get("crop", "wheat")
				var state: String = data.get("state", "seedling")
				var planted_at: int = data.get("planted_at", 0)
				var now: int = int(Time.get_unix_time_from_system())
				var times: Array = LandManager.GROW_TIMES.get(crop, [30, 90])
				var remaining: int = max(0, times[1] - (now - planted_at))
				var mins: int = remaining / 60
				var secs: int = remaining % 60
				var txt: String
				if state == "ready":
					txt = crop.capitalize() + "\nClick to harvest!"
				elif mins > 0:
					txt = crop.capitalize() + "\n%dm %ds" % [mins, secs]
				else:
					txt = crop.capitalize() + "\n%ds" % secs
				_timer_label.text = txt
				var slot_ctrl: Control = _slot_nodes.get(k)
				if slot_ctrl:
					_timer_label.position = slot_ctrl.position + Vector2(2, -36)
				_timer_label.visible = true
				show_timer = true
		if not show_timer:
			_timer_label.visible = false

# ─────────────────────────── INPUT ──────────────────────────

func _input(event: InputEvent) -> void:
	if _choice_popup_open:
		return
	if _active_crafting_ui != null and is_instance_valid(_active_crafting_ui):
		return
	if not get_tree().get_nodes_in_group("action_windows").is_empty():
		return
	if not event is InputEventMouseButton or not event.pressed:
		return
	var mouse_pos: Vector2 = get_viewport().get_mouse_position()

	if event.button_index == MOUSE_BUTTON_LEFT:
		var tool_idx := _screen_to_tool_slot(mouse_pos)
		if tool_idx >= 0:
			get_viewport().set_input_as_handled()
			_handle_tool_slot_click(tool_idx, event.double_click)
			return

	var slot_pos := _screen_to_slot(mouse_pos)
	if slot_pos.x < 0:
		return  # let non-slot clicks bubble to pond_tile._unhandled_input for fishing
	get_viewport().set_input_as_handled()

	var _td: Dictionary = LandManager.tiles.get(tile_id, {})
	var is_tile_owner: bool = _td.get("owner_id", "") == PlayerData.player_id
	var slots: Dictionary = _td.get("slots", {})
	var key: String = LandManager.slot_key(slot_pos)

	if event.button_index == MOUSE_BUTTON_LEFT:
		var occupied: bool = slots.has(key)

		# ── seed planting (any player — visitors can plant on public land
		# too; harvest already splits the yield with the owner) ──
		# Only intercepts the click when the target is actually plantable
		# (empty, un-cropped soil) — anything else (a ready crop elsewhere,
		# a tree, a station) falls through to the normal handling below so
		# holding a seed never blocks harvesting/other interactions.
		if _held_seed != "" and occupied:
			var d: Dictionary = slots[key]
			if d.get("is_anchor", false) and d.get("item_id","") == "soil_plot" and not d.has("crop"):
				if ResourceManager.has_item(_held_seed):
					slot_activated.emit(slot_pos, "plant", _held_seed)
				return

		# ── single click on planted soil → harvest if ready ──
		if occupied:
			var data: Dictionary = slots[key]
			var anchor_key: String = data.get("anchor", key)
			var ap := anchor_key.split(",")
			var anchor_pos := slot_pos
			if ap.size() == 2:
				anchor_pos = Vector2i(int(ap[0]), int(ap[1]))
			var adat: Dictionary = slots.get(anchor_key, data)

			if adat.get("item_id","") == "soil_plot" and adat.get("state","") == "ready":
				slot_activated.emit(anchor_pos, "harvest", adat.get("crop", ""))
				return
			elif adat.get("item_id","") == "soil_plot" and adat.has("crop"):
				return  # still growing — do nothing
			elif adat.get("item_id","") == "soil_plot" and not event.double_click:
				# Empty, plantable soil — walk over, then pop up a seed choice.
				# Visitors can plant on public land too; harvest already
				# splits the yield with the owner.
				slot_activated.emit(anchor_pos, "choose_seed", "")
				return
			elif CRAFTING_STATIONS.has(adat.get("item_id","")) and not event.double_click:
				_open_crafting_station(adat.get("item_id",""), anchor_pos)
				return
			elif adat.get("item_id","") in ACTION_ITEMS and not event.double_click:
				var aid: String = adat.get("item_id","")
				if aid in ["egg_white", "egg_gold"]:
					slot_activated.emit(anchor_pos, "pickup", aid)
				else:
					slot_activated.emit(anchor_pos, "action", aid)
				return
			elif adat.get("item_id","").begins_with("wild_") and not event.double_click:
				slot_activated.emit(anchor_pos, "pickup", adat.get("item_id",""))
				return
			elif not event.double_click:
				return  # non-soil occupied: need double-click to return

		# ── double-click on occupied slot → return to backpack (owner only) ──
		if occupied and event.double_click and is_tile_owner:
			var data: Dictionary = slots[key]
			var anchor_key: String = data.get("anchor", key)
			var ap := anchor_key.split(",")
			var anchor_pos := slot_pos
			if ap.size() == 2:
				anchor_pos = Vector2i(int(ap[0]), int(ap[1]))
			var adat: Dictionary = slots.get(anchor_key, data)
			if adat.get("item_id","") != "soil_plot":
				_show_return_popup(anchor_pos, adat.get("item_id",""))
			return

		# ── empty slot (owner only) — queue character walk ──
		if not occupied and not event.double_click and is_tile_owner:
			if _held_item != "" and ResourceManager.has_item(_held_item) \
					and not LandManager.CRAFTING_ITEM_IDS.has(_held_item):
				# Legacy path — still used for picker categories that keep the
				# old pick-first flow (e.g. STORAGE).
				slot_activated.emit(slot_pos, "place", _held_item)
			elif _held_item == "":
				# New way — walk over, then pop up a soil/tree/rock choice.
				slot_activated.emit(slot_pos, "choose_farm", "")

	elif event.button_index == MOUSE_BUTTON_RIGHT:
		if not slots.has(key) or not is_tile_owner: return
		var d: Dictionary = slots[key]
		if d.get("item_id","") == "soil_plot" and d.has("crop"):
			return  # harvest or wait — can't pull soil while crop lives
		if d.get("item_id","") == "oak_tree":
			return  # oak trees are non-tradeable, can't remove to backpack
		var removed := LandManager.remove_slot_item(tile_id, slot_pos)
		if removed != "":
			ResourceManager.add_item(removed, 1)
			_refresh_picker()

# ─────────────────────────── TOOL SLOTS ──────────────────────

func _handle_tool_slot_click(idx: int, is_double_click: bool) -> void:
	var _td: Dictionary = LandManager.tiles.get(tile_id, {})
	var is_tile_owner: bool = _td.get("owner_id", "") == PlayerData.player_id
	var slots: Dictionary = _td.get("slots", {})
	var pos: Vector2i = LandManager.tool_slot_pos(idx)
	var key: String = LandManager.slot_key(pos)

	if slots.has(key):
		var item_id: String = slots[key].get("item_id", "")
		if is_double_click and is_tile_owner:
			_show_return_popup(pos, item_id)
			return
		if not is_double_click and CRAFTING_STATIONS.has(item_id):
			# Walk over first, then open the station — see "open_station" in
			# tile_base.gd's _execute_current_task().
			slot_activated.emit(pos, "open_station", item_id)
		return

	# Empty tool slot — if a tool is already held (picked from the tool
	# bar), place it directly; otherwise walk over and pop up a choice.
	if not is_double_click and is_tile_owner:
		if _held_item != "" and LandManager.CRAFTING_ITEM_IDS.has(_held_item) and ResourceManager.has_item(_held_item):
			slot_activated.emit(pos, "place_tool", _held_item)
		else:
			slot_activated.emit(pos, "choose_tool", "")

# ─────────────────────────── CRAFTING STATIONS ──────────────

func _open_crafting_station(item_id: String, anchor_pos: Vector2i = Vector2i(-1, -1)) -> void:
	if _active_crafting_ui != null and is_instance_valid(_active_crafting_ui): return
	_active_crafting_ui = _spawn_crafting_ui(CRAFTING_STATIONS[item_id])
	_active_crafting_ui.closed.connect(func(): _active_crafting_ui = null)
	if _active_crafting_ui.has_method("setup_collab"):
		_active_crafting_ui.setup_collab(tile_id, anchor_pos)
	elif _active_crafting_ui.has_method("setup_context"):
		_active_crafting_ui.setup_context(tile_id)

func _spawn_crafting_ui(script_path: String) -> CanvasLayer:
	var s: GDScript = load(script_path)
	var ui := CanvasLayer.new()
	ui.set_script(s)
	get_parent().add_child(ui)
	ui.item_crafted.connect(func(_id, _n): _refresh_picker())
	return ui

# ─────────────────────────── SCREEN → SLOT ──────────────────

# Pond ring: 8-slot top/bottom rows + 1 side column on each side.
# All col values are 0-9 (non-negative) so the (-1,-1) "no slot" sentinel still works.
# Col formula: x = 302 + col * 68.
# Col 0 = x=302 (left side only), cols 1-8 = x=370..846 (top/bottom rows), col 9 = x=914 (right side only).
# Cols 1-8 in rows 1-5 are over the pond — masked so they cannot be clicked.
const _POND_SLOTS: Array = [
	# Row 0 — top strip (above pond), cols 1-8 at x=370..846
	[1, 0, 370, 112], [2, 0, 438, 112], [3, 0, 506, 112], [4, 0, 574, 112],
	[5, 0, 642, 112], [6, 0, 710, 112], [7, 0, 778, 112], [8, 0, 846, 112],
	# Rows 1-5 — col 0 left (x=302), col 9 right (x=914)
	[0, 1, 302, 180], [9, 1, 914, 180],
	[0, 2, 302, 248], [9, 2, 914, 248],
	[0, 3, 302, 316], [9, 3, 914, 316],
	[0, 4, 302, 384], [9, 4, 914, 384],
	[0, 5, 302, 452], [9, 5, 914, 452],
	# Row 6 — bottom strip (below pond), cols 1-8 at x=370..846
	[1, 6, 370, 548], [2, 6, 438, 548], [3, 6, 506, 548], [4, 6, 574, 548],
	[5, 6, 642, 548], [6, 6, 710, 548], [7, 6, 778, 548], [8, 6, 846, 548],
]

func _screen_to_slot(screen_pos: Vector2) -> Vector2i:
	if _is_pond_tile():
		return _pond_screen_to_slot(screen_pos)
	var full_cols := FULL_COLS
	var step := SLOT_PX + SLOT_GAP
	var grid_w: float = full_cols * step - SLOT_GAP
	var grid_h: float = ROW_LAYOUT.size() * step - SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)
	var local := screen_pos - origin
	if local.x < 0 or local.y < 0: return Vector2i(-1, -1)
	var col := int(local.x / step)
	var row := int(local.y / step)
	if col < 0 or col >= full_cols or row < 0 or row >= ROW_LAYOUT.size():
		return Vector2i(-1, -1)
	var num_cols: int = ROW_LAYOUT[row]
	var col_offset: int = (full_cols - num_cols) / 2
	if col < col_offset or col >= col_offset + num_cols: return Vector2i(-1, -1)
	var local_in_slot := local - Vector2(col * step, row * step)
	if local_in_slot.x >= SLOT_PX or local_in_slot.y >= SLOT_PX: return Vector2i(-1, -1)
	if _masked_positions.has(LandManager.slot_key(Vector2i(col, row))):
		return Vector2i(-1, -1)
	return Vector2i(col, row)

func _pond_screen_to_slot(screen_pos: Vector2) -> Vector2i:
	for entry in _POND_SLOTS:
		var sx: float = float(entry[2])
		var sy: float = float(entry[3])
		if screen_pos.x >= sx and screen_pos.x < sx + SLOT_PX \
				and screen_pos.y >= sy and screen_pos.y < sy + SLOT_PX:
			return Vector2i(entry[0], entry[1])
	return Vector2i(-1, -1)

# ─────────────────────────── POND MASK ──────────────────────

func _is_pond_tile() -> bool:
	return LandManager.tiles.get(tile_id, {}).get("type_str", "") == "POND"

func _apply_pond_mask() -> void:
	_masked_positions.clear()
	if not _is_pond_tile():
		return
	# Cols 1-8 in rows 1-5 are over the pond water — only cols 0 and 9 are valid side slots.
	for row in range(1, 6):
		for col in range(1, 9):
			_masked_positions[LandManager.slot_key(Vector2i(col, row))] = true

# ─────────────────────────── BUILD UI ───────────────────────

func _build_ui() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)

	_timer_label = Label.new()
	_timer_label.z_index = 10
	_timer_label.visible = false
	_timer_label.add_theme_font_size_override("font_size", 10)
	_timer_label.add_theme_color_override("font_color", Color.WHITE)
	_timer_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	_timer_label.add_theme_constant_override("shadow_offset_x", 1)
	_timer_label.add_theme_constant_override("shadow_offset_y", 1)
	_timer_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_timer_label)

	if _is_pond_tile():
		_build_pond_ring_ui()
		return

	var full_cols := FULL_COLS
	var step := SLOT_PX + SLOT_GAP
	var grid_w: float = full_cols * step - SLOT_GAP
	var grid_h: float = ROW_LAYOUT.size() * step - SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)

	for row in ROW_LAYOUT.size():
		var num_cols: int = ROW_LAYOUT[row]
		var col_offset: int = (full_cols - num_cols) / 2
		for i in num_cols:
			var col: int = col_offset + i
			var pos := Vector2i(col, row)
			var slot := _make_slot(origin + Vector2(col * step, row * step), pos)
			_root.add_child(slot)
			_slot_nodes[LandManager.slot_key(pos)] = slot

	_picker_panel = _build_picker(_root, Vector2(1280.0 - 130.0, origin.y), grid_h)
	_build_tool_slots()

func _build_tool_slots() -> void:
	_tool_slot_nodes.clear()
	_tool_slot_sprites.clear()
	for i in TOOL_SLOT_POS.size():
		var slot := _make_tool_slot(TOOL_SLOT_POS[i], i)
		_root.add_child(slot)
		_tool_slot_nodes[i] = slot

func _build_pond_ring_ui() -> void:
	for entry in _POND_SLOTS:
		var pos := Vector2i(entry[0], entry[1])
		var slot := _make_slot(Vector2(float(entry[2]), float(entry[3])), pos)
		_root.add_child(slot)
		_slot_nodes[LandManager.slot_key(pos)] = slot
	# Picker to the right of the right side column (col 8 ends at x=978, wall at x=1260)
	_picker_panel = _build_picker(_root, Vector2(984.0, 180.0), 340.0)

func _make_slot(screen_pos: Vector2, grid_pos: Vector2i) -> Control:
	var c := Control.new()
	c.position = screen_pos
	c.size = Vector2(SLOT_PX, SLOT_PX)
	c.mouse_filter = Control.MOUSE_FILTER_STOP

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(1, 1, 1, 0.4)
	border.name = "Border"
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(border)

	var fill := ColorRect.new()
	fill.position = Vector2(1, 1)
	fill.size = Vector2(SLOT_PX - 2, SLOT_PX - 2)
	fill.color = Color(0, 0, 0, 0)
	fill.name = "Fill"
	c.add_child(fill)

	var lbl := Label.new()
	lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 7)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl.name = "Lbl"
	c.add_child(lbl)

	var tim := Label.new()
	tim.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	tim.offset_top = -13.0
	tim.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tim.add_theme_font_size_override("font_size", 7)
	tim.add_theme_color_override("font_color", Color(1.0, 0.90, 0.35))
	tim.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.90))
	tim.add_theme_constant_override("shadow_offset_x", 1)
	tim.add_theme_constant_override("shadow_offset_y", 1)
	tim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tim.name = "Timer"
	tim.visible = false
	c.add_child(tim)

	var cap_pos: Vector2i = grid_pos
	var get_drag_fn := func(_p: Vector2) -> Variant:
		var s: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
		var k: String = LandManager.slot_key(cap_pos)
		if not s.has(k): return null
		var sd: Dictionary = s[k]
		if not sd.get("is_anchor", false): return null
		var iid: String = sd.get("item_id", "")
		if iid == "" or sd.has("crop"): return null  # don't drag soil with crop
		var preview := ColorRect.new()
		preview.size = Vector2(SLOT_PX, SLOT_PX)
		preview.color = _item_colors.get(iid, Color(0.4, 0.4, 0.4))
		preview.modulate.a = 0.75
		c.set_drag_preview(preview)
		return {"item_id": iid, "source": "slot",
				"from_tile": tile_id, "from_x": cap_pos.x, "from_y": cap_pos.y}
	var can_drop_fn := func(_p: Vector2, data: Variant) -> bool:
		if not data is Dictionary or not data.has("item_id"): return false
		if LandManager.CRAFTING_ITEM_IDS.has(data.get("item_id", "")): return false
		var s: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
		var key: String = LandManager.slot_key(cap_pos)
		if data.get("source", "") == "seed_picker":
			if not s.has(key): return false
			var d: Dictionary = s[key]
			return d.get("item_id","") == "soil_plot" and d.get("is_anchor", false) and not d.has("crop")
		return not s.has(key)
	var drop_fn := func(_p: Vector2, data: Variant) -> void:
		var iid: String = data.get("item_id", "")
		if iid == "": return
		match data.get("source", ""):
			"seed_picker":
				if ResourceManager.has_item(iid):
					if LandManager.plant_seed(tile_id, cap_pos, iid):
						ResourceManager.remove_item(iid)
						if not ResourceManager.has_item(iid):
							_held_seed = ""
			"slot":
				var from_tile: String = data.get("from_tile", "")
				var from_pos := Vector2i(data.get("from_x", -1), data.get("from_y", -1))
				if from_tile == "" or from_pos.x < 0: return
				if from_tile == tile_id and from_pos == cap_pos: return
				var from_slots: Dictionary = LandManager.tiles.get(from_tile, {}).get("slots", {})
				var from_slot_data: Dictionary = from_slots.get(LandManager.slot_key(from_pos), {})
				var moving_item: String = from_slot_data.get("item_id","")
				if moving_item == "oak_tree" and from_tile != tile_id:
					return  # oak trees can only move within their own tile
				var home: String = from_slot_data.get("home_tile", from_tile)
				var removed := LandManager.remove_slot_item(from_tile, from_pos)
				if removed == "": return
				if not LandManager.place_slot_item(tile_id, cap_pos, removed):
					if from_tile == tile_id:
						LandManager.place_slot_item(from_tile, from_pos, removed)
					else:
						ResourceManager.add_item(removed, 1)
				elif moving_item == "oak_tree":
					# Restore home_tile tag so it stays bound to its forest
					var new_key: String = LandManager.slot_key(cap_pos)
					var t_slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
					if t_slots.has(new_key):
						t_slots[new_key]["home_tile"] = home
					LandManager.save_land_data()
			"picker":
				if ResourceManager.has_item(iid):
					if LandManager.place_slot_item(tile_id, cap_pos, iid):
						ResourceManager.remove_item(iid)
						_held_item = ""
		_refresh_picker()
	c.set_drag_forwarding(get_drag_fn, can_drop_fn, drop_fn)
	return c

func _make_tool_slot(screen_pos: Vector2, idx: int) -> Control:
	var c := Control.new()
	c.position = screen_pos
	c.size = Vector2(TOOL_SLOT_PX, TOOL_SLOT_PX)
	c.mouse_filter = Control.MOUSE_FILTER_STOP

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(1.0, 0.85, 0.35, 0.5)
	border.name = "Border"
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(border)

	var fill := ColorRect.new()
	fill.position = Vector2(2, 2)
	fill.size = Vector2(TOOL_SLOT_PX - 4, TOOL_SLOT_PX - 4)
	fill.color = Color(0, 0, 0, 0)
	fill.name = "Fill"
	c.add_child(fill)

	var lbl := Label.new()
	lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 9)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl.name = "Lbl"
	c.add_child(lbl)

	var cap_idx: int = idx
	var cap_pos: Vector2i = LandManager.tool_slot_pos(idx)
	var get_drag_fn := func(_p: Vector2) -> Variant:
		var s: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
		var k: String = LandManager.slot_key(cap_pos)
		if not s.has(k): return null
		var iid: String = s[k].get("item_id", "")
		if iid == "": return null
		var preview := ColorRect.new()
		preview.size = Vector2(TOOL_SLOT_PX, TOOL_SLOT_PX)
		preview.color = _item_colors.get(iid, Color(0.4, 0.4, 0.4))
		preview.modulate.a = 0.75
		c.set_drag_preview(preview)
		return {"item_id": iid, "source": "tool_slot",
				"from_tile": tile_id, "from_idx": cap_idx}
	var can_drop_fn := func(_p: Vector2, data: Variant) -> bool:
		if not data is Dictionary or not data.has("item_id"): return false
		if not LandManager.CRAFTING_ITEM_IDS.has(data.get("item_id", "")): return false
		var s: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
		return not s.has(LandManager.slot_key(cap_pos))
	var drop_fn := func(_p: Vector2, data: Variant) -> void:
		var iid: String = data.get("item_id", "")
		if iid == "": return
		match data.get("source", ""):
			"picker":
				if ResourceManager.has_item(iid):
					if LandManager.place_tool_item(tile_id, cap_idx, iid):
						ResourceManager.remove_item(iid)
						_held_item = ""
			"tool_slot":
				var from_tile: String = data.get("from_tile", "")
				var from_idx: int = data.get("from_idx", -1)
				if from_tile == "" or from_idx < 0: return
				if from_tile == tile_id and from_idx == cap_idx: return
				var removed := LandManager.remove_tool_item(from_tile, from_idx)
				if removed == "": return
				if not LandManager.place_tool_item(tile_id, cap_idx, removed):
					LandManager.place_tool_item(from_tile, from_idx, removed)
		_refresh_picker()
	c.set_drag_forwarding(get_drag_fn, can_drop_fn, drop_fn)
	return c

func tool_slot_screen_center(idx: int) -> Vector2:
	var sp: Vector2 = TOOL_SLOT_POS[idx]
	return sp + Vector2(TOOL_SLOT_PX, TOOL_SLOT_PX) * 0.5

func _screen_to_tool_slot(screen_pos: Vector2) -> int:
	for i in TOOL_SLOT_POS.size():
		var sp: Vector2 = TOOL_SLOT_POS[i]
		if screen_pos.x >= sp.x and screen_pos.x < sp.x + TOOL_SLOT_PX \
				and screen_pos.y >= sp.y and screen_pos.y < sp.y + TOOL_SLOT_PX:
			return i
	return -1

func _build_picker(parent: Control, origin: Vector2, height: float) -> Control:
	var panel := Control.new()
	panel.position = origin
	panel.size = Vector2(120, height)
	panel.mouse_filter = Control.MOUSE_FILTER_PASS
	parent.add_child(panel)

	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.05, 0.05, 0.05, 0.65)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(bg)

	var title := Label.new()
	title.position = Vector2(4, 4)
	title.size = Vector2(112, 16)
	title.text = "PLACEABLES"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 8)
	panel.add_child(title)

	var held_lbl := Label.new()
	held_lbl.name = "HeldLbl"
	held_lbl.position = Vector2(4, 22)
	held_lbl.size = Vector2(112, 28)
	held_lbl.text = "click item\nthen click slot"
	held_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	held_lbl.add_theme_font_size_override("font_size", 7)
	held_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	held_lbl.modulate = Color(0.6, 0.6, 0.6)
	panel.add_child(held_lbl)

	var scroll := ScrollContainer.new()
	scroll.name = "PickerScroll"
	scroll.position = Vector2(4, 54)
	scroll.size = Vector2(112, height - 58)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode   = ScrollContainer.SCROLL_MODE_AUTO
	panel.add_child(scroll)

	var items_container := VBoxContainer.new()
	items_container.name = "ItemsContainer"
	items_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	items_container.add_theme_constant_override("separation", 3)
	scroll.add_child(items_container)
	_picker_container = items_container

	return panel

# ─────────────────────────── PICKER REFRESH ─────────────────

func _refresh_picker() -> void:
	for cell in _picker_btns:
		if is_instance_valid(cell) and cell.get_parent():
			cell.get_parent().remove_child(cell)
		cell.queue_free()
	_picker_btns.clear()
	_picker_bgs.clear()
	_seed_bgs.clear()

	var container: Control = _picker_container
	if not container: return

	# ── categorised placeables ──
	for cat_pair in PLACEABLE_CATEGORIES:
		var cat_name: String = cat_pair[0]
		var cat_ids:  Array  = cat_pair[1]
		var available: Array = []
		for id in cat_ids:
			if ResourceManager.get_count(id) > 0:
				available.append(id)
		if available.is_empty(): continue

		var hdr := Label.new()
		hdr.text = "- %s -" % cat_name
		hdr.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		hdr.add_theme_font_size_override("font_size", 7)
		hdr.modulate = Color(0.85, 0.78, 0.40)
		container.add_child(hdr)
		_picker_btns.append(hdr)

		for item_id in available:
			var btn := _make_picker_btn(item_id, ResourceManager.get_count(item_id), false)
			container.add_child(btn)
			_picker_btns.append(btn)
			_picker_bgs[item_id] = btn

	# Nothing to show — hide the panel entirely instead of an empty box.
	if _picker_panel: _picker_panel.visible = not _picker_btns.is_empty()

	_update_picker_visuals()
	_refresh_seed_bar_if_open()
	_refresh_tool_bar_if_open()

func _make_picker_btn(item_id: String, count: int, is_seed: bool) -> Button:
	var cap_id := item_id
	var display := item_id.trim_prefix("seed_").replace("_", " ")
	var btn := Button.new()
	btn.text = "%s  x%d" % [display, count]
	btn.custom_minimum_size = Vector2(112, 28)
	btn.add_theme_font_size_override("font_size", 8)
	btn.focus_mode = Control.FOCUS_NONE
	if is_seed:
		btn.modulate = Color(0.75, 1.0, 0.75)

	btn.pressed.connect(func() -> void:
		if not ResourceManager.has_item(cap_id): return
		if is_seed:
			_held_seed = cap_id if _held_seed != cap_id else ""
			_held_item = ""
		else:
			_held_item = cap_id if _held_item != cap_id else ""
			_held_seed = ""
		_update_picker_visuals()
	)

	var picker_get_drag := func(_p: Vector2) -> Variant:
		if not ResourceManager.has_item(cap_id): return null
		var preview := Control.new()
		preview.custom_minimum_size = Vector2(SLOT_PX, SLOT_PX)
		var pb := ColorRect.new()
		pb.set_anchors_preset(Control.PRESET_FULL_RECT)
		pb.color = Color(0.30, 0.72, 0.30) if is_seed else _item_colors.get(cap_id, Color(0.3, 0.55, 0.3))
		preview.add_child(pb)
		var pl := Label.new()
		pl.set_anchors_preset(Control.PRESET_FULL_RECT)
		pl.text = cap_id.trim_prefix("seed_").replace("_", " ")
		pl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		pl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		pl.add_theme_font_size_override("font_size", 8)
		preview.add_child(pl)
		btn.set_drag_preview(preview)
		if is_seed:
			_held_seed = cap_id
			_held_item = ""
			_update_picker_visuals()
			return {"item_id": cap_id, "source": "seed_picker"}
		_held_item = cap_id
		_held_seed = ""
		_update_picker_visuals()
		return {"item_id": cap_id, "source": "picker"}
	var cant_drop := func(_p: Vector2, _d: Variant) -> bool: return false
	var no_drop   := func(_p: Vector2, _d: Variant) -> void: pass
	btn.set_drag_forwarding(picker_get_drag, cant_drop, no_drop)
	return btn

func _update_picker_visuals() -> void:
	var held_lbl: Label = _picker_panel.get_node_or_null("HeldLbl") if _picker_panel else null
	if held_lbl:
		if _held_item != "":
			held_lbl.text = "PLACING:\n%s" % _held_item.replace("_", " ")
			held_lbl.modulate = Color(0.4, 1.0, 0.4)
		elif _held_seed != "":
			held_lbl.text = "PLANTING:\n%s" % _held_seed.trim_prefix("seed_").replace("_", " ")
			held_lbl.modulate = Color(0.4, 1.0, 0.65)
		else:
			held_lbl.text = "click item\nthen click slot"
			held_lbl.modulate = Color(0.6, 0.6, 0.6)

	for iid in _picker_bgs:
		var btn = _picker_bgs[iid]
		if is_instance_valid(btn):
			btn.modulate = Color(0.4, 1.0, 0.4) if iid == _held_item else Color.WHITE

	for sid in _seed_bgs:
		var btn = _seed_bgs[sid]
		if is_instance_valid(btn):
			btn.modulate = Color(0.3, 1.0, 0.5) if sid == _held_seed else Color(0.75, 1.0, 0.75)

func _get_player_placeables() -> Array:
	var ids := ["workbench","soil_plot","boulder","chicken_coop","campfire","bonfire",
		"workshop","furnace","burner_station","wheat_mill","bread_oven","silo",
		"tree","apple_tree","pear_tree","peach_tree","lemon_tree",
		"alchemy_table","anvil","barrel","beehive","box",
		"dropbox","dyeing_vat","sawmill","spinning_wheel","stonecutter","wine_press",
		"mailbox"]
	var result: Array = []
	for id in ids:
		if ResourceManager.get_count(id) > 0: result.append(id)
	return result

func _get_player_seeds() -> Array:
	var result: Array = []
	for iid in ResourceManager.inventory:
		if ResourceManager.inventory[iid] <= 0:
			continue
		if ResourceManager.get_item_info(iid).get("category", "") == "seeds":
			result.append(iid)
	return result

# ─────────────────────────── SLOT REFRESH ───────────────────

func _refresh() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	for key in _slot_nodes:
		var ctrl: Control = _slot_nodes[key]
		var fill: ColorRect = ctrl.get_node("Fill")
		var lbl: Label = ctrl.get_node("Lbl")
		var border: ColorRect = ctrl.get_node_or_null("Border")
		if border: border.visible = not slots.has(key)
		if slots.has(key):
			var data: Dictionary = slots[key]
			var item_id: String = data.get("item_id", "")
			if data.get("is_anchor", false):
				var state: String = data.get("state", "")
				match state:
					"seedling":
						fill.color = Color(0.25, 0.50, 0.20, 0.85)
						lbl.text = ""
					"growing":
						fill.color = Color(0.20, 0.55, 0.20, 0.85)
						lbl.text = ""
					"ready":
						fill.color = Color(0.70, 0.60, 0.10, 0.85)
						lbl.text = ""
					_:
						if item_id.ends_with("tree"):
							fill.color = Color(0, 0, 0, 0)
							lbl.text = ""
						elif item_id == "boulder":
							fill.color = Color(0, 0, 0, 0)  # sprite handles all visual stages
							lbl.text = ""
						elif item_id in ["npc_vendor", "npc_lilly", "npc_gus"]:
							fill.color = _item_colors.get(item_id, Color(0.4, 0.4, 0.4, 0.85))
							lbl.text = {"npc_vendor": "TOM", "npc_lilly": "LILLY", "npc_gus": "GUS"}[item_id]
							lbl.add_theme_font_size_override("font_size", 11)
						else:
							fill.color = _item_colors.get(item_id, Color(0.4, 0.4, 0.4, 0.85))
							if item_id.begins_with("wild_"):
								lbl.text = item_id.trim_prefix("wild_").replace("_", "\n")
							else:
								lbl.text = item_id.replace("_", "\n")
			else:
				fill.color = _item_colors.get(item_id, Color(0.4, 0.4, 0.4, 0.85))
				lbl.text = ""
		else:
			fill.color = Color(0, 0, 0, 0)
			lbl.text = ""
	_refresh_item_sprites()
	_refresh_crop_sprites()
	_refresh_tree_sprites()
	_refresh_rock_sprites()
	_refresh_beehive_sprites()
	_refresh_coop_labels()
	_refresh_chicken_sprites()
	_refresh_tool_slots()
	_update_crop_timers()

func _item_icon_path(item_id: String) -> String:
	var path := "res://assets/sprites/items/%s.png" % item_id
	if ResourceLoader.exists(path): return path
	path = "res://assets/sprites/buildings/%s.png" % item_id
	if ResourceLoader.exists(path): return path
	path = "res://assets/sprites/environment/%s.png" % item_id
	if ResourceLoader.exists(path): return path
	return ""

func _refresh_tool_slots() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	for idx in _tool_slot_nodes:
		var ctrl: Control = _tool_slot_nodes[idx]
		var fill: ColorRect = ctrl.get_node("Fill")
		var lbl: Label = ctrl.get_node("Lbl")
		var border: ColorRect = ctrl.get_node_or_null("Border")
		var key: String = LandManager.slot_key(LandManager.tool_slot_pos(idx))
		if border: border.visible = not slots.has(key)

		if not slots.has(key):
			fill.color = Color(0, 0, 0, 0)
			lbl.text = ""
			if _tool_slot_sprites.has(idx):
				var old: TextureRect = _tool_slot_sprites[idx]
				if is_instance_valid(old): old.queue_free()
				_tool_slot_sprites.erase(idx)
			continue

		var item_id: String = slots[key].get("item_id", "")
		var icon_path := _item_icon_path(item_id)

		if icon_path == "":
			fill.color = _item_colors.get(item_id, Color(0.4, 0.4, 0.4, 0.85))
			lbl.text = item_id.replace("_", "\n")
			continue

		fill.color = Color(0, 0, 0, 0)
		lbl.text = ""
		if _tool_slot_sprites.has(idx):
			var rect: TextureRect = _tool_slot_sprites[idx]
			if is_instance_valid(rect): rect.texture = load(icon_path)
		else:
			var rect := TextureRect.new()
			rect.set_anchors_preset(Control.PRESET_FULL_RECT)
			rect.offset_left = 10; rect.offset_top = 10
			rect.offset_right = -10; rect.offset_bottom = -10
			rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
			rect.texture = load(icon_path)
			ctrl.add_child(rect)
			_tool_slot_sprites[idx] = rect

func _update_crop_timers() -> void:
	var now := int(Time.get_unix_time_from_system())
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	for key in _slot_nodes:
		var slot: Control = _slot_nodes[key]
		var tim: Label = slot.get_node_or_null("Timer")
		if not is_instance_valid(tim):
			continue
		if _masked_positions.has(key):
			tim.visible = false
			continue
		var data: Dictionary = slots.get(key, {})
		if not (data.get("is_anchor", false) and data.get("item_id", "") == "soil_plot" and data.has("crop")):
			tim.visible = false
			continue
		if data.get("state", "") == "ready":
			tim.visible = false
			continue
		var crop: String  = data.get("crop", "")
		var planted: int  = data.get("planted_at", now)
		var elapsed: int  = now - planted
		if data.get("fast_grow", false):
			elapsed = int(float(elapsed) / 0.85)
		var times: Array  = LandManager.GROW_TIMES.get(crop, [30, 90])
		var secs_left: int = maxi(0, times[1] - elapsed)
		if secs_left <= 0:
			tim.visible = false
		else:
			tim.text    = _fmt_time(secs_left)
			tim.visible = true

func _fmt_time(secs: int) -> String:
	var h := secs / 3600
	var m := (secs % 3600) / 60
	var s := secs % 60
	if h > 0: return "%dh%dm" % [h, m]
	if m > 0: return "%dm%ds" % [m, s]
	return "%ds" % s

# ─────────────────────────── CROP SPRITES ───────────────────

func _refresh_crop_sprites() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})

	var to_remove: Array = []
	for key in _crop_sprites:
		if not slots.has(key) or not slots[key].has("crop"):
			var e: Dictionary = _crop_sprites[key]
			if e.get("tween") and is_instance_valid(e["tween"]): e["tween"].kill()
			if e.get("rect")  and is_instance_valid(e["rect"]):  e["rect"].queue_free()
			to_remove.append(key)
	for key in to_remove: _crop_sprites.erase(key)

	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		if data.get("item_id", "") != "soil_plot": continue
		if not data.has("crop"): continue

		var crop: String  = data["crop"]
		var stage: int    = _state_to_stage(data.get("state", "seedling"))

		if _crop_sprites.has(key):
			var e: Dictionary = _crop_sprites[key]
			if e.get("stage", -1) != stage:
				if e.get("rect") and is_instance_valid(e["rect"]):
					e["rect"].texture = _make_crop_texture(crop, stage)
				if e.get("tween") and is_instance_valid(e["tween"]): e["tween"].kill()
				e["tween"] = _start_crop_tween(e["rect"], stage)
				e["stage"] = stage
		else:
			if not _slot_nodes.has(key): continue
			var slot_ctrl: Control = _slot_nodes[key]
			var rect := TextureRect.new()
			rect.set_anchors_preset(Control.PRESET_FULL_RECT)
			rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
			rect.texture = _make_crop_texture(crop, stage)
			slot_ctrl.add_child(rect)
			_crop_sprites[key] = {"rect": rect, "tween": _start_crop_tween(rect, stage), "stage": stage}

func _state_to_stage(state: String) -> int:
	match state:
		"growing": return 1
		"ready":   return 2
	return 0

func _start_crop_tween(rect: TextureRect, stage: int) -> Tween:
	if not is_instance_valid(rect): return null
	var tween := create_tween()
	tween.set_loops()
	var speed := 2.0 if stage < 2 else 0.5
	var peak: Color
	match stage:
		0: peak = Color(1.1, 1.2, 1.1)
		1: peak = Color(1.0, 1.15, 1.0)
		2: peak = Color(1.4, 1.25, 0.7)
		_: peak = Color.WHITE
	tween.tween_property(rect, "modulate", peak, speed)
	tween.tween_property(rect, "modulate", Color.WHITE, speed)
	return tween

# ─────────────────────────── TREE SPRITES ───────────────────

func _refresh_tree_sprites() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})

	# Remove rects for trees no longer present
	var to_remove: Array = []
	for key in _tree_sprites:
		var s: Dictionary = slots.get(key, {})
		if not s.get("is_anchor", false) or not s.get("item_id", "").ends_with("tree"):
			var r: Variant = _tree_sprites[key]
			if is_instance_valid(r): (r as TextureRect).queue_free()
			to_remove.append(key)
	for key in to_remove:
		_tree_sprites.erase(key)
		_tree_chop_state.erase(key)
		if _tree_idle_tweens.has(key):
			if is_instance_valid(_tree_idle_tweens[key]): _tree_idle_tweens[key].kill()
			_tree_idle_tweens.erase(key)

	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		var item_id: String = data.get("item_id", "")
		if not item_id.ends_with("tree"): continue
		if not _slot_nodes.has(key): continue

		var is_chopped: bool = data.get("tree_chopped_at", 0) > 0

		if not _tree_sprites.has(key):
			_create_tree_rect(key, item_id, is_chopped)
			_tree_chop_state[key] = is_chopped
		else:
			var was_chopped: bool = _tree_chop_state.get(key, false)
			if is_chopped and not was_chopped:
				_tree_chop_state[key] = true
				if _tree_idle_tweens.has(key):
					if is_instance_valid(_tree_idle_tweens[key]): _tree_idle_tweens[key].kill()
					_tree_idle_tweens.erase(key)
				_play_chop_animation(key, item_id)
			elif not is_chopped and was_chopped:
				_tree_chop_state[key] = false
				var r: Variant = _tree_sprites[key]
				if is_instance_valid(r):
					(r as TextureRect).texture = _make_tree_texture(item_id, false)
					(r as TextureRect).modulate = Color.WHITE
					_start_tree_idle_tween(key, r as TextureRect)

func _create_tree_rect(key: String, item_id: String, is_chopped: bool) -> void:
	var tex: Texture2D = _make_tree_texture(item_id, is_chopped)
	if tex == null: return
	var slot_ctrl: Control = _slot_nodes[key]
	var rect := TextureRect.new()
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rect.texture = tex
	slot_ctrl.add_child(rect)
	_tree_sprites[key] = rect
	if not is_chopped:
		_start_tree_idle_tween(key, rect)

func _start_tree_idle_tween(key: String, rect: TextureRect) -> void:
	if not is_instance_valid(rect): return
	var tween := create_tween()
	tween.set_loops()
	tween.tween_property(rect, "modulate", Color(1.1, 1.2, 1.0), 2.5)
	tween.tween_property(rect, "modulate", Color.WHITE, 2.5)
	_tree_idle_tweens[key] = tween

func _chop_set_tex(rect: TextureRect, tex: Texture2D) -> void:
	if is_instance_valid(rect): rect.texture = tex

func _play_chop_animation(key: String, item_id: String) -> void:
	if not _slot_nodes.has(key): return

	# Load all 9 chop frames then all 9 stump frames
	var sprite_id: String = TREE_SPRITE_FOLDER.get(item_id, item_id)
	var frames: Array[Texture2D] = []
	for i in 9:
		var path: String = "res://assets/sprites/trees/%s/chop_%03d.png" % [sprite_id, i]
		if not ResourceLoader.exists(path):
			path = "res://assets/sprites/trees/apple_tree/chop_%03d.png" % i
		if ResourceLoader.exists(path):
			var t := load(path) as Texture2D
			if t: frames.append(t)
	for i in 9:
		var path: String = "res://assets/sprites/trees/%s/stump_%03d.png" % [sprite_id, i]
		if not ResourceLoader.exists(path):
			path = "res://assets/sprites/trees/apple_tree/stump_%03d.png" % i
		if ResourceLoader.exists(path):
			var t := load(path) as Texture2D
			if t: frames.append(t)
	if frames.is_empty(): return

	var r: Variant = _tree_sprites.get(key)
	if r == null:
		_create_tree_rect(key, item_id, false)
		r = _tree_sprites.get(key)
	if not is_instance_valid(r): return
	var rect := r as TextureRect

	var tween := create_tween()
	for i in frames.size():
		tween.tween_callback(_chop_set_tex.bind(rect, frames[i]))
		if i < frames.size() - 1:
			tween.tween_interval(0.07)

func _make_tree_texture(item_id: String, is_chopped: bool) -> Texture2D:
	var sprite_id: String = TREE_SPRITE_FOLDER.get(item_id, item_id)
	var file: String = "stump_008" if is_chopped else "full"
	var path: String = "res://assets/sprites/trees/%s/%s.png" % [sprite_id, file]
	if not ResourceLoader.exists(path):
		path = "res://assets/sprites/trees/apple_tree/%s.png" % file
	if not ResourceLoader.exists(path):
		return null
	return load(path) as Texture2D

# ─────────────────────────── ROCK / BOULDER STAGES ──────────

func _rock_current_stage(data: Dictionary) -> int:
	var now: int = int(Time.get_unix_time_from_system())
	var mined_at: int  = data.get("boulder_mined_at",  0)
	var crack_at: int  = data.get("boulder_cracked_at", 0)
	if mined_at > 0 and now - mined_at < 14400:
		return 2  # fully mined / dust
	if crack_at > 0 and mined_at == 0:
		return 1  # cracked
	return 0      # full intact rock

func _refresh_rock_sprites() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})

	var to_remove: Array = []
	for key in _rock_sprites:
		var d: Dictionary = slots.get(key, {})
		if not d.get("is_anchor", false) or d.get("item_id", "") != "boulder":
			to_remove.append(key)
	for key in to_remove:
		var r: Variant = _rock_sprites[key]
		if is_instance_valid(r): (r as TextureRect).queue_free()
		_rock_sprites.erase(key)
		_rock_stage.erase(key)
		if _rock_tweens.has(key):
			if is_instance_valid(_rock_tweens[key]): _rock_tweens[key].kill()
			_rock_tweens.erase(key)

	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		if data.get("item_id", "") != "boulder": continue
		if not _slot_nodes.has(key): continue

		var stage: int = _rock_current_stage(data)

		if not _rock_sprites.has(key):
			_create_rock_rect(key, stage)
			_rock_stage[key] = stage
		else:
			var prev: int = _rock_stage.get(key, 0)
			if stage != prev:
				_rock_stage[key] = stage
				_play_rock_animation(key, prev, stage)

func _create_rock_rect(key: String, stage: int) -> void:
	var tex: Texture2D = _make_rock_texture(stage)
	if tex == null: return
	var slot_ctrl: Control = _slot_nodes[key]
	var rect := TextureRect.new()
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rect.texture = tex
	slot_ctrl.add_child(rect)
	_rock_sprites[key] = rect

func _play_rock_animation(key: String, from_stage: int, to_stage: int) -> void:
	if not _rock_sprites.has(key): return
	var r: Variant = _rock_sprites.get(key)
	if not is_instance_valid(r): return
	var rect := r as TextureRect

	if _rock_tweens.has(key) and is_instance_valid(_rock_tweens[key]):
		_rock_tweens[key].kill()

	# Clear the boulder image immediately — don't wait for tween's first callback
	rect.texture = null
	# Belt-and-suspenders: destroy any stale item sprite for this slot
	if _item_sprites.has(key):
		var ir = _item_sprites[key]
		if is_instance_valid(ir): ir.queue_free()
		_item_sprites.erase(key)
	# Clear the fill so nothing shows through transparent animation frames
	if _slot_nodes.has(key):
		var fill: ColorRect = _slot_nodes[key].get_node_or_null("Fill")
		if fill: fill.color = Color(0, 0, 0, 0)

	var frames: Array[Texture2D] = []

	if from_stage == 0 and to_stage == 1:
		# Full → cracked: rustling then crack_in_half
		for i in 9:
			var p := "res://assets/sprites/rocks/rustling_%03d.png" % i
			if ResourceLoader.exists(p): frames.append(load(p) as Texture2D)
		for i in 9:
			var p := "res://assets/sprites/rocks/crack_%03d.png" % i
			if ResourceLoader.exists(p): frames.append(load(p) as Texture2D)
	elif from_stage == 1 and to_stage == 2:
		# Cracked → dust: broken_to_dust
		for i in 9:
			var p := "res://assets/sprites/rocks/break_%03d.png" % i
			if ResourceLoader.exists(p): frames.append(load(p) as Texture2D)
	else:
		# Any respawn or stage skip: just snap to new texture
		rect.texture = _make_rock_texture(to_stage)
		return

	if frames.is_empty():
		rect.texture = _make_rock_texture(to_stage)
		return

	var final_tex: Texture2D = _make_rock_texture(to_stage)
	var tween := create_tween()
	for i in frames.size():
		tween.tween_callback(_rock_set_tex.bind(rect, frames[i]))
		if i < frames.size() - 1:
			tween.tween_interval(0.07)
	tween.tween_callback(_rock_set_tex.bind(rect, final_tex))
	_rock_tweens[key] = tween

func _rock_set_tex(rect: TextureRect, tex: Texture2D) -> void:
	if is_instance_valid(rect): rect.texture = tex

func _make_rock_texture(stage: int) -> Texture2D:
	var name: String
	match stage:
		1: name = "rock_cracked"
		2: name = "rock_dust"
		_: name = "rock_full"
	var path := "res://assets/sprites/rocks/%s.png" % name
	if not ResourceLoader.exists(path): return null
	return load(path) as Texture2D

# ─────────────────────────── ITEM SPRITES ───────────────────

func _refresh_item_sprites() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})

	var to_remove: Array = []
	for key in _item_sprites:
		var data: Dictionary = slots.get(key, {})
		var iid: String = data.get("item_id", "")
		var iid_base := iid.trim_prefix("wild_")
		var still_valid: bool = data.get("is_anchor", false) \
			and not iid.ends_with("tree") \
			and iid != "boulder" \
			and iid != "beehive" \
			and (ResourceLoader.exists("res://assets/sprites/items/%s.png" % iid) \
				or ResourceLoader.exists("res://assets/sprites/items/%s.png" % iid_base))
		if not still_valid:
			var rect = _item_sprites[key]
			if is_instance_valid(rect): rect.queue_free()
			to_remove.append(key)
	for key in to_remove:
		_item_sprites.erase(key)

	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		var item_id: String = data.get("item_id", "")
		if item_id.is_empty() or item_id.ends_with("tree") or item_id == "boulder" or item_id == "beehive": continue
		var path: String = "res://assets/sprites/items/%s.png" % item_id
		if not ResourceLoader.exists(path):
			path = "res://assets/sprites/items/%s.png" % item_id.trim_prefix("wild_")
		if not ResourceLoader.exists(path): continue

		var tex := _load_item_texture(path)
		if tex == null: continue

		if _slot_nodes.has(key):
			var slot_ctrl: Control = _slot_nodes[key]
			var fill: ColorRect = slot_ctrl.get_node_or_null("Fill")
			if fill: fill.color = Color(0, 0, 0, 0)
			var lbl: Label = slot_ctrl.get_node_or_null("Lbl")
			if lbl: lbl.text = ""

		if _item_sprites.has(key):
			var rect = _item_sprites[key]
			if is_instance_valid(rect): rect.texture = tex
		else:
			if not _slot_nodes.has(key): continue
			var slot_ctrl: Control = _slot_nodes[key]
			var rect := TextureRect.new()
			rect.set_anchors_preset(Control.PRESET_FULL_RECT)
			rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
			rect.texture = tex
			slot_ctrl.add_child(rect)
			_item_sprites[key] = rect

func _load_item_texture(path: String) -> Texture2D:
	if not ResourceLoader.exists(path): return null
	return load(path) as Texture2D

func _refresh_coop_labels() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		if data.get("item_id", "") != "chicken_coop": continue
		if not _slot_nodes.has(key): continue
		var lbl: Label = _slot_nodes[key].get_node_or_null("Lbl")
		if not lbl: continue
		var chickens: Array = data.get("chickens", [])
		var feed: int = data.get("coop_feed", 0)
		if chickens.size() > 0 and feed == 0:
			lbl.text = "HUNGRY"
			lbl.add_theme_color_override("font_color", Color(1.0, 0.25, 0.25))
			lbl.add_theme_font_size_override("font_size", 8)
		elif chickens.size() > 0:
			lbl.text = "FED"
			lbl.add_theme_color_override("font_color", Color(0.3, 1.0, 0.4))
			lbl.add_theme_font_size_override("font_size", 8)
		else:
			lbl.text = ""
			lbl.remove_theme_color_override("font_color")

# Open area above the slot grid (grid starts around y=154) where chickens roam free.
const _CHICKEN_WANDER_MIN := Vector2(330, 65)
const _CHICKEN_WANDER_MAX := Vector2(950, 148)
const _CHICKEN_WANDER_SPEED := 18.0  # px/sec

func _random_chicken_target() -> Vector2:
	return Vector2(
		randf_range(_CHICKEN_WANDER_MIN.x, _CHICKEN_WANDER_MAX.x),
		randf_range(_CHICKEN_WANDER_MIN.y, _CHICKEN_WANDER_MAX.y)
	)

func _refresh_chicken_sprites() -> void:
	# Clear old sprites
	for r in _chicken_sprites:
		if is_instance_valid(r): r.queue_free()
	_chicken_sprites.clear()
	_chicken_wander.clear()

	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var chickens: Array = []
	for key in slots:
		var data: Dictionary = slots[key]
		if data.get("is_anchor", false) and data.get("item_id", "") == "chicken_coop":
			chickens = data.get("chickens", [])
			break
	if chickens.is_empty(): return

	for i in chickens.size():
		var ch: Dictionary = chickens[i]
		var ctype: String = ch.get("type", "white")
		var path := "res://assets/sprites/items/chicken_%s.png" % ctype
		if not ResourceLoader.exists(path): continue
		var rect := TextureRect.new()
		rect.texture = load(path) as Texture2D
		rect.custom_minimum_size = Vector2(40, 40)
		rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var start_pos := _random_chicken_target()
		rect.position = start_pos - Vector2(20, 20)
		_root.add_child(rect)
		_chicken_sprites.append(rect)
		_chicken_wander.append({"target": _random_chicken_target(), "pause": randf_range(0.0, 2.0)})

func _update_chicken_wander(delta: float) -> void:
	for i in _chicken_sprites.size():
		var rect: TextureRect = _chicken_sprites[i]
		if not is_instance_valid(rect): continue
		var w: Dictionary = _chicken_wander[i]
		if w["pause"] > 0.0:
			w["pause"] -= delta
			continue
		var center: Vector2 = rect.position + Vector2(20, 20)
		var target: Vector2 = w["target"]
		var dir: Vector2 = target - center
		if dir.length() < 4.0:
			w["target"] = _random_chicken_target()
			w["pause"] = randf_range(1.0, 3.5)
			continue
		var step: Vector2 = dir.normalized() * _CHICKEN_WANDER_SPEED * delta
		rect.position += step
		rect.flip_h = step.x < 0.0

# ─────────────────────────── PIXEL ART ──────────────────────

func _make_crop_texture(crop: String, stage: int) -> ImageTexture:
	# Stage 0 — seedling: crop-specific seedling image, fall back to seed bag
	if stage == 0:
		if not _seedling_imgs.has(crop):
			var sp := "res://assets/sprites/crops/%s_seedling.png" % crop
			if ResourceLoader.exists(sp):
				var st: Texture2D = load(sp)
				_seedling_imgs[crop] = st.get_image() if st else null
			else:
				_seedling_imgs[crop] = null
		var seedling_img: Image = _seedling_imgs.get(crop)
		if seedling_img != null:
			return ImageTexture.create_from_image(seedling_img)
		if _seed_phase_img != null:
			return ImageTexture.create_from_image(_seed_phase_img)

	# Stage 1 — halfway: crop-specific medium image, fall back to seed bag
	if stage == 1:
		if not _medium_imgs.has(crop):
			var mpath := "res://assets/sprites/crops/%s_medium.png" % crop
			if ResourceLoader.exists(mpath):
				var mt: Texture2D = load(mpath)
				_medium_imgs[crop] = mt.get_image() if mt else null
			else:
				_medium_imgs[crop] = null
		var mid_img: Image = _medium_imgs.get(crop)
		if mid_img != null:
			return ImageTexture.create_from_image(mid_img)
		if _seed_phase_img != null:
			return ImageTexture.create_from_image(_seed_phase_img)

	# Stage 2 — ready: crop-specific ready image first, then spritesheet
	if stage == 2:
		if not _ready_imgs.has(crop):
			var rp := "res://assets/sprites/crops/%s_ready.png" % crop
			if ResourceLoader.exists(rp):
				var rt: Texture2D = load(rp)
				_ready_imgs[crop] = rt.get_image() if rt else null
			else:
				_ready_imgs[crop] = null
		var ready_img: Image = _ready_imgs.get(crop)
		if ready_img != null:
			return ImageTexture.create_from_image(ready_img)

	# Spritesheet fallback for crops in crops.png
	if _crop_sheet != null and CROP_BAND.has(crop):
		var band: int = CROP_BAND[crop]
		var col_info: Array = CROP_STAGE_COL[stage]
		var rect := Rect2i(col_info[0], band * 48, col_info[1], 48)
		var sub := _crop_sheet.get_region(rect)
		if sub != null and not sub.is_empty():
			return ImageTexture.create_from_image(sub)
	# Procedural fallback for crops not in the sheet
	var img := Image.create(16, 16, false, Image.FORMAT_RGBA8)
	img.fill(Color.TRANSPARENT)
	match crop:
		"wheat":  _draw_wheat(img, stage)
		"carrot": _draw_carrot(img, stage)
		"potato": _draw_potato(img, stage)
		_:        _draw_generic(img, stage)
	return ImageTexture.create_from_image(img)

func _px(img: Image, x: int, y: int, c: Color) -> void:
	if x >= 0 and x < 16 and y >= 0 and y < 16: img.set_pixel(x, y, c)

func _draw_wheat(img: Image, stage: int) -> void:
	var G  := Color(0.25, 0.72, 0.25)
	var DG := Color(0.12, 0.50, 0.12)
	var Y  := Color(0.95, 0.80, 0.12)
	var ST := Color(0.62, 0.46, 0.12)
	match stage:
		0:  # seedling
			for y in range(12, 16):
				_px(img, 6, y, G)
				_px(img, 9, y, G)
			_px(img, 5, 13, G); _px(img, 10, 13, G)
		1:  # growing
			for x in [4, 8, 12]:
				for y in range(5, 16): _px(img, x, y, DG)
				_px(img, x-1, 9, G); _px(img, x+1, 9, G)
		2:  # ready — golden grain heads
			for x in [3, 8, 13]:
				for y in range(8, 16): _px(img, x, y, ST)
				for y in range(4,  8): _px(img, x, y, Y)
				_px(img, x-1, 5, Y); _px(img, x+1, 5, Y); _px(img, x, 3, Y)

func _draw_carrot(img: Image, stage: int) -> void:
	var G  := Color(0.25, 0.72, 0.25)
	var O  := Color(0.92, 0.50, 0.10)
	var DO := Color(0.72, 0.32, 0.06)
	match stage:
		0:
			for p in [[8,15],[7,14],[8,14],[9,14],[8,13],[7,13],[9,13]]: _px(img,p[0],p[1],G)
		1:
			for y in range(10, 16): _px(img, 8, y, O)
			_px(img,7,11,O); _px(img,9,11,O); _px(img,8,15,DO)
			for p in [[8,9],[7,8],[9,8],[6,7],[10,7],[8,7],[7,6],[9,6]]: _px(img,p[0],p[1],G)
		2:
			for y in range(6, 15): _px(img, 8, y, O)
			for y in range(8, 13):
				_px(img,7,y,O)
				_px(img,9,y,O)
			for y in range(10,13):
				_px(img,6,y,O)
				_px(img,10,y,O)
			_px(img,8,15,DO); _px(img,7,14,DO); _px(img,9,14,DO)
			for p in [[8,5],[7,4],[9,4],[6,3],[10,3],[8,3],[5,4],[11,4],[8,2],[7,3],[9,3]]:
				_px(img,p[0],p[1],G)

func _draw_potato(img: Image, stage: int) -> void:
	var G  := Color(0.25, 0.72, 0.25)
	var DG := Color(0.12, 0.50, 0.12)
	var W  := Color(0.96, 0.96, 0.96)
	var SO := Color(0.48, 0.32, 0.12)
	match stage:
		0:
			for p in [[7,13],[9,13],[8,12],[7,12],[9,12],[8,11],[8,14]]: _px(img,p[0],p[1],G)
			_px(img,8,15,SO)
		1:
			for p in [[8,6],[7,7],[9,7],[6,8],[10,8],[5,9],[11,9],[6,10],[10,10],[7,11],[9,11],[8,12]]:
				_px(img,p[0],p[1],G)
			for p in [[7,8],[9,8],[8,7],[8,9],[8,10],[8,11]]: _px(img,p[0],p[1],DG)
			for x in range(5,12): _px(img,x,13,SO)
		2:  # white flowers = ready
			for p in [[8,5],[7,6],[9,6],[6,7],[10,7],[5,8],[11,8],[6,9],[10,9],[7,10],[9,10],[8,11]]:
				_px(img,p[0],p[1],G)
			for p in [[7,5],[9,5],[8,4],[6,6],[10,6],[5,7],[11,7],[8,6]]: _px(img,p[0],p[1],W)
			for x in range(5,12): _px(img,x,13,SO)
			for x in range(6,11): _px(img,x,14,SO)

func _draw_generic(img: Image, stage: int) -> void:
	var G := Color(0.30, 0.70, 0.30)
	var h := 4 + stage * 4
	for y in range(16 - h, 16):
		_px(img, 7, y, G)
		_px(img, 8, y, G)

# ─────────────────────────── HOVER ──────────────────────────

func _clear_hover() -> void:
	if _hovered_slot.x >= 0:
		var k := LandManager.slot_key(_hovered_slot)
		if _slot_nodes.has(k): _revert_slot_fill(_slot_nodes[k], _hovered_slot)

func _revert_slot_fill(c: Control, pos: Vector2i) -> void:
	var f: ColorRect = c.get_node_or_null("Fill")
	if not f: return
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var key: String = LandManager.slot_key(pos)
	if slots.has(key):
		var d: Dictionary = slots[key]
		match d.get("state", ""):
			"seedling": f.color = Color(0.25, 0.50, 0.20, 0.85)
			"growing":  f.color = Color(0.20, 0.55, 0.20, 0.85)
			"ready":    f.color = Color(0.70, 0.60, 0.10, 0.85)
			_:          f.color = _item_colors.get(d.get("item_id",""), Color(0.4, 0.4, 0.4, 0.85))
	else:
		f.color = Color(0, 0, 0, 0)

# ─────────────────────────── POPUPS ─────────────────────────

func _show_harvest_popup(anchor_pos: Vector2i, crop: String) -> void:
	var dim := ColorRect.new(); dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0,0,0,0.5); dim.mouse_filter = Control.MOUSE_FILTER_STOP
	_root.add_child(dim)
	var box := _make_popup_box()
	_root.add_child(box)

	var lbl: Label = box.get_node("Lbl")
	lbl.text = "Harvest %s?" % crop.capitalize()

	var yes: Button = box.get_node("Yes")
	yes.text = "HARVEST"
	yes.pressed.connect(func():
		var got := LandManager.harvest_crop(tile_id, anchor_pos)
		if got != "":
			ResourceManager.add_item(got, 1)
			_refresh_picker()
		dim.queue_free(); box.queue_free()
	)
	box.get_node("No").pressed.connect(func(): dim.queue_free(); box.queue_free())
	dim.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventMouseButton and ev.pressed: dim.queue_free(); box.queue_free())

# ─────────────────────────── CHOICE POPUPS ───────────────────

func _gather_choices(kind: String) -> Array:
	var result: Array = []
	match kind:
		"seed":
			for iid in _get_player_seeds():
				var info := ResourceManager.get_item_info(iid)
				result.append({"id": iid, "name": info.get("name", iid.capitalize()), "count": ResourceManager.get_count(iid)})
		"tool":
			for id in LandManager.CRAFTING_ITEM_IDS:
				var c: int = ResourceManager.get_count(id)
				if c > 0:
					result.append({"id": id, "name": id.replace("_", " ").capitalize(), "count": c})
		"farm":
			for id in FARM_POPUP_ITEMS:
				var c: int = ResourceManager.get_count(id)
				if c > 0:
					result.append({"id": id, "name": id.replace("_", " ").capitalize(), "count": c})
	return result

# Called after the player has already walked over. Builds the popup and
# returns true, or false if there was nothing to choose from (nothing shown).
# The caller awaits this node's item_chosen signal directly to get the pick
# ("" if the player closed the popup without choosing).
func show_choice_popup(kind: String) -> bool:
	if kind == "seed":
		return show_seed_bar()
	if kind == "tool":
		return show_tool_bar()
	var choices := _gather_choices(kind)
	if choices.is_empty():
		return false
	var title: String = {
		"farm": "Choose What to Place",
	}.get(kind, "Choose")
	_build_choice_popup(choices, title)
	return true

# ─────────────────────────── SEED SLIDE BAR ──────────────────
# Persistent alternative to the modal popup, used for seeds only. Stays open
# across multiple plantings so the player doesn't have to re-pick for every
# soil slot — picking a seed here sets _held_seed, which the raw _input()
# handler (see the "_held_seed != """ branch) uses to plant directly on
# subsequent clicks without going through "choose_seed"/this bar at all.
func show_seed_bar() -> bool:
	var seeds := _get_player_seeds()
	_ensure_seed_bar()
	_rebuild_seed_bar(seeds)
	_seed_bar.visible = true
	# False when there's nothing to plant, so the "choose_seed" task bails
	# out cleanly instead of leaving the player stuck awaiting a pick that
	# can never happen — the bar itself still stays visible either way.
	return not seeds.is_empty()

func _ensure_seed_bar() -> void:
	if _seed_bar and is_instance_valid(_seed_bar):
		return

	var panel := Control.new()
	panel.name = "SeedBar"
	panel.position = SEED_BAR_POS
	panel.size = SEED_BAR_SIZE
	_root.add_child(panel)

	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.0, 0.05, 0.15, 0.85)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(bg)

	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0)
	sb.border_color = Color(0.35, 0.70, 1.0, 0.90)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(6)
	var style_holder := Panel.new()
	style_holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	style_holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	style_holder.add_theme_stylebox_override("panel", sb)
	panel.add_child(style_holder)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.position = Vector2(SEED_BAR_SIZE.x - 22, 3)
	close_btn.size = Vector2(19, 19)
	close_btn.add_theme_font_size_override("font_size", 9)
	close_btn.focus_mode = Control.FOCUS_NONE
	close_btn.pressed.connect(_close_seed_bar)
	panel.add_child(close_btn)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(4, 3)
	scroll.size = Vector2(SEED_BAR_SIZE.x - 30, SEED_BAR_SIZE.y - 6)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)

	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", 4)
	scroll.add_child(box)

	_seed_bar = panel
	_seed_bar_box = box

# The bar is permanent now — X just deselects the currently held seed
# rather than hiding it, and still resolves a pending choose_seed await
# (from clicking empty soil with nothing held) so the walk doesn't hang.
func _close_seed_bar() -> void:
	_held_seed = ""
	_refresh_seed_bar_highlight()
	item_chosen.emit("")

func _rebuild_seed_bar(seeds: Array) -> void:
	for c in _seed_bar_box.get_children():
		c.queue_free()
	for iid in seeds:
		var info := ResourceManager.get_item_info(iid)
		var count: int = ResourceManager.get_count(iid)
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(36, 36)
		btn.focus_mode = Control.FOCUS_NONE
		btn.set_meta("seed_id", iid)
		btn.modulate = Color(0.4, 1.0, 0.6) if iid == _held_seed else Color(1, 1, 1, 1)

		var vb := VBoxContainer.new()
		vb.set_anchors_preset(Control.PRESET_FULL_RECT)
		vb.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.alignment = BoxContainer.ALIGNMENT_CENTER
		btn.add_child(vb)

		var icon_path := _item_icon_path(iid)
		if icon_path != "":
			var tex := TextureRect.new()
			tex.texture = load(icon_path)
			tex.custom_minimum_size = Vector2(18, 18)
			tex.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tex.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
			vb.add_child(tex)

		var lbl := Label.new()
		lbl.text = "x%d" % count
		lbl.add_theme_font_size_override("font_size", 7)
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.add_child(lbl)

		var cap_id: String = iid
		btn.pressed.connect(func():
			_held_seed = cap_id
			_held_item = ""
			_refresh_seed_bar_highlight()
			item_chosen.emit(cap_id)
		)
		_seed_bar_box.add_child(btn)

func _refresh_seed_bar_highlight() -> void:
	if not (_seed_bar_box and is_instance_valid(_seed_bar_box)):
		return
	for c in _seed_bar_box.get_children():
		var btn := c as Button
		if btn:
			btn.modulate = Color(0.4, 1.0, 0.6) if btn.get_meta("seed_id", "") == _held_seed else Color(1, 1, 1, 1)

# Called from _refresh_picker() so the bar's counts/contents stay live
# while it's open (e.g. after planting, or gaining/losing seeds elsewhere).
func _refresh_seed_bar_if_open() -> void:
	if not (_seed_bar and is_instance_valid(_seed_bar)):
		return
	if _held_seed != "" and not ResourceManager.has_item(_held_seed):
		_held_seed = ""
	_rebuild_seed_bar(_get_player_seeds())

# ─────────────────────────── TOOL SLIDE BAR ──────────────────
# Mirrors the seed bar exactly, for tool/crafting-station items placed via
# empty tool slots. Picking one sets _held_item, which _handle_tool_slot_click
# uses to place directly on an empty tool slot without the "choose_tool"
# modal — see the fast-path check there.
func _get_player_tools() -> Array:
	var result: Array = []
	for iid in LandManager.CRAFTING_ITEM_IDS:
		if ResourceManager.get_count(iid) > 0:
			result.append(iid)
	return result

func show_tool_bar() -> bool:
	var tools := _get_player_tools()
	_ensure_tool_bar()
	_rebuild_tool_bar(tools)
	_tool_bar.visible = true
	return not tools.is_empty()

func _ensure_tool_bar() -> void:
	if _tool_bar and is_instance_valid(_tool_bar):
		return

	var panel := Control.new()
	panel.name = "ToolBar"
	panel.position = TOOL_BAR_POS
	panel.size = TOOL_BAR_SIZE
	_root.add_child(panel)

	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.0, 0.05, 0.15, 0.85)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(bg)

	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0)
	sb.border_color = Color(0.35, 0.70, 1.0, 0.90)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(6)
	var style_holder := Panel.new()
	style_holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	style_holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	style_holder.add_theme_stylebox_override("panel", sb)
	panel.add_child(style_holder)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.position = Vector2(TOOL_BAR_SIZE.x - 22, 3)
	close_btn.size = Vector2(19, 19)
	close_btn.add_theme_font_size_override("font_size", 9)
	close_btn.focus_mode = Control.FOCUS_NONE
	close_btn.pressed.connect(_close_tool_bar)
	panel.add_child(close_btn)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(4, 3)
	scroll.size = Vector2(TOOL_BAR_SIZE.x - 30, TOOL_BAR_SIZE.y - 6)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)

	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", 4)
	scroll.add_child(box)

	_tool_bar = panel
	_tool_bar_box = box

# X deselects the currently held tool rather than hiding the bar (permanent,
# like the seed bar) — resolves a pending choose_tool await too.
func _close_tool_bar() -> void:
	_held_item = ""
	_refresh_tool_bar_highlight()
	item_chosen.emit("")

func _rebuild_tool_bar(tools: Array) -> void:
	for c in _tool_bar_box.get_children():
		c.queue_free()
	for iid in tools:
		var count: int = ResourceManager.get_count(iid)
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(36, 36)
		btn.focus_mode = Control.FOCUS_NONE
		btn.set_meta("tool_id", iid)
		btn.modulate = Color(0.4, 1.0, 0.6) if iid == _held_item else Color(1, 1, 1, 1)

		var vb := VBoxContainer.new()
		vb.set_anchors_preset(Control.PRESET_FULL_RECT)
		vb.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.alignment = BoxContainer.ALIGNMENT_CENTER
		btn.add_child(vb)

		var icon_path := _item_icon_path(iid)
		if icon_path != "":
			var tex := TextureRect.new()
			tex.texture = load(icon_path)
			tex.custom_minimum_size = Vector2(18, 18)
			tex.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tex.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
			vb.add_child(tex)

		var lbl := Label.new()
		lbl.text = "x%d" % count
		lbl.add_theme_font_size_override("font_size", 7)
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.add_child(lbl)

		var cap_id: String = iid
		btn.pressed.connect(func():
			_held_item = cap_id
			_held_seed = ""
			_refresh_tool_bar_highlight()
			item_chosen.emit(cap_id)
		)
		_tool_bar_box.add_child(btn)

func _refresh_tool_bar_highlight() -> void:
	if not (_tool_bar_box and is_instance_valid(_tool_bar_box)):
		return
	for c in _tool_bar_box.get_children():
		var btn := c as Button
		if btn:
			btn.modulate = Color(0.4, 1.0, 0.6) if btn.get_meta("tool_id", "") == _held_item else Color(1, 1, 1, 1)

func _refresh_tool_bar_if_open() -> void:
	if not (_tool_bar and is_instance_valid(_tool_bar)):
		return
	if _held_item != "" and not ResourceManager.has_item(_held_item):
		_held_item = ""
	_rebuild_tool_bar(_get_player_tools())

func _build_choice_popup(choices: Array, title: String) -> void:
	_choice_popup_open = true
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.6)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.tree_exiting.connect(func(): _choice_popup_open = false)
	_root.add_child(overlay)

	var cols: int = min(4, choices.size())
	var rows: int = int(ceil(choices.size() / float(cols)))
	var cell := 90.0
	var pw: float = cols * cell + 20.0
	var ph: float = rows * cell + 70.0
	var panel := Control.new()
	panel.position = Vector2((1280.0 - pw) / 2.0, (720.0 - ph) / 2.0)
	panel.size = Vector2(pw, ph)
	overlay.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(0.35, 0.70, 1.0, 0.9)
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(2, 2)
	inner.size = Vector2(pw - 4, ph - 4)
	inner.color = Color(0.07, 0.07, 0.09, 0.98)
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(inner)

	var title_lbl := Label.new()
	title_lbl.position = Vector2(10, 8)
	title_lbl.size = Vector2(pw - 44, 20)
	title_lbl.text = title
	title_lbl.add_theme_font_size_override("font_size", 13)
	title_lbl.modulate = Color(0.55, 0.88, 1.0)
	panel.add_child(title_lbl)

	var close_btn := Button.new()
	close_btn.position = Vector2(pw - 32, 4)
	close_btn.size = Vector2(26, 24)
	close_btn.text = "X"
	close_btn.pressed.connect(func():
		item_chosen.emit("")
		overlay.queue_free()
	)
	panel.add_child(close_btn)

	for i in choices.size():
		var choice: Dictionary = choices[i]
		var col: int = i % cols
		var row: int = i / cols
		var btn := Button.new()
		btn.position = Vector2(10 + col * cell, 36 + row * cell)
		btn.size = Vector2(cell - 8, cell - 8)
		var cap_id: String = choice["id"]
		btn.pressed.connect(func():
			item_chosen.emit(cap_id)
			overlay.queue_free()
		)
		panel.add_child(btn)

		var vb := VBoxContainer.new()
		vb.set_anchors_preset(Control.PRESET_FULL_RECT)
		vb.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.alignment = BoxContainer.ALIGNMENT_CENTER
		btn.add_child(vb)

		var icon_path := _item_icon_path(choice["id"])
		if icon_path != "":
			var tex := TextureRect.new()
			tex.texture = load(icon_path)
			tex.custom_minimum_size = Vector2(36, 36)
			tex.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tex.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
			vb.add_child(tex)

		var lbl := Label.new()
		lbl.text = "%s\nx%d" % [choice["name"], choice["count"]]
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.add_theme_font_size_override("font_size", 8)
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vb.add_child(lbl)

func _show_return_popup(anchor_pos: Vector2i, item_id: String) -> void:
	var dim := ColorRect.new(); dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0,0,0,0.5); dim.mouse_filter = Control.MOUSE_FILTER_STOP
	_root.add_child(dim)
	var box := _make_popup_box()
	_root.add_child(box)

	var lbl: Label = box.get_node("Lbl")
	lbl.text = "Return %s to backpack?" % item_id.replace("_"," ").capitalize()

	var yes: Button = box.get_node("Yes")
	yes.pressed.connect(func():
		var removed := LandManager.remove_slot_item(tile_id, anchor_pos)
		if removed != "":
			ResourceManager.add_item(removed, 1)
			_refresh_picker()
		dim.queue_free(); box.queue_free()
	)
	box.get_node("No").pressed.connect(func(): dim.queue_free(); box.queue_free())
	dim.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventMouseButton and ev.pressed: dim.queue_free(); box.queue_free())

func _make_popup_box() -> Control:
	var box := Control.new()
	box.size = Vector2(300, 110); box.position = Vector2(490, 305)

	var bg := ColorRect.new(); bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.07,0.07,0.07,0.97); box.add_child(bg)

	var border := ColorRect.new(); border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(0.35,0.35,0.35,1); border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(1,1); inner.size = Vector2(298,108)
	inner.color = Color(0.07,0.07,0.07,1); box.add_child(inner)

	var lbl := Label.new()
	lbl.name = "Lbl"; lbl.position = Vector2(10,14); lbl.size = Vector2(280,36)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; box.add_child(lbl)

	var yes := Button.new()
	yes.name = "Yes"; yes.text = "YES"
	yes.position = Vector2(30,66); yes.size = Vector2(110,30); box.add_child(yes)

	var no := Button.new()
	no.name = "No"; no.text = "NO"
	no.position = Vector2(160,66); no.size = Vector2(110,30); box.add_child(no)

	return box

# ─────────────────────────── BEEHIVE SPRITES ─────────────────

func _refresh_beehive_sprites() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var now: int = int(Time.get_unix_time_from_system())

	var to_remove: Array = []
	for key in _beehive_sprites:
		var d: Dictionary = slots.get(key, {})
		if not d.get("is_anchor", false) or d.get("item_id", "") != "beehive":
			to_remove.append(key)
	for key in to_remove:
		_beehive_cleanup(key)

	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		if data.get("item_id", "") != "beehive": continue
		if not _slot_nodes.has(key): continue

		var last_collected: int = data.get("last_collected", 0)
		var is_ready: bool = last_collected == 0 or (now - last_collected) >= 86400
		var was_ready: bool = _beehive_ready_state.get(key, !is_ready)

		if is_ready == was_ready and _beehive_sprites.has(key):
			continue

		_beehive_ready_state[key] = is_ready
		_beehive_cleanup(key)
		var slot_ctrl: Control = _slot_nodes[key]
		if is_ready:
			_start_beehive_animation(key, slot_ctrl)
		else:
			_start_beehive_static(key, slot_ctrl)

func _beehive_cleanup(key: String) -> void:
	if _beehive_tweens.has(key):
		if is_instance_valid(_beehive_tweens[key]): _beehive_tweens[key].kill()
		_beehive_tweens.erase(key)
	if _beehive_sprites.has(key):
		var r = _beehive_sprites[key]
		if is_instance_valid(r): (r as TextureRect).queue_free()
		_beehive_sprites.erase(key)
	_beehive_ready_state.erase(key)

func _start_beehive_static(key: String, slot_ctrl: Control) -> void:
	var path := "res://assets/sprites/items/beehive.png"
	if not ResourceLoader.exists(path): return
	var tex := load(path) as Texture2D
	if tex == null: return
	var rect := _make_beehive_rect(slot_ctrl)
	rect.texture = tex
	_beehive_sprites[key] = rect

func _start_beehive_animation(key: String, slot_ctrl: Control) -> void:
	var frames: Array[Texture2D] = []
	for i in 9:
		var path := "res://assets/sprites/beehive/frame_%03d.png" % i
		if not ResourceLoader.exists(path):
			_start_beehive_static(key, slot_ctrl)
			return
		var tex := load(path) as Texture2D
		if tex == null:
			_start_beehive_static(key, slot_ctrl)
			return
		frames.append(tex)

	var rect := _make_beehive_rect(slot_ctrl)
	rect.texture = frames[0]
	_beehive_sprites[key] = rect

	var tween: Tween = create_tween().set_loops()
	_beehive_tweens[key] = tween
	for i in frames.size():
		var f: Texture2D = frames[i]
		tween.tween_callback(func():
			if is_instance_valid(rect): rect.texture = f
		)
		tween.tween_interval(0.15)

func _make_beehive_rect(slot_ctrl: Control) -> TextureRect:
	var rect := TextureRect.new()
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	slot_ctrl.add_child(rect)
	return rect
