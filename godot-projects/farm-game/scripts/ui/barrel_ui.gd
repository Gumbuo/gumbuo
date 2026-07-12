extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

const RECIPE_ING:          Dictionary = {"grape_must": 20}
const RECIPE_OUTPUT:       String     = "wine"
const RECIPE_OUTPUT_COUNT: int        = 60
const OWNER_BONUS_COUNT:   int        = 60
const COOK_TIME_SEC:       int        = 604800   # 7 days

const PANEL_W := 520.0
const PANEL_H := 470.0

const COL_BG      := Color(0.05, 0.04, 0.10)
const COL_PANEL   := Color(0.09, 0.08, 0.18)
const COL_BORDER  := Color(0.25, 0.12, 0.38)
const COL_ACCENT  := Color(0.76, 0.28, 0.64)
const COL_BAR_BG  := Color(0.12, 0.07, 0.22)
const COL_TEXT    := Color(0.92, 0.90, 0.96)
const COL_SUBTLE  := Color(0.58, 0.52, 0.70)
const COL_GREEN   := Color(0.30, 1.00, 0.45)
const COL_ROW_BG  := Color(0.08, 0.06, 0.16)

var _tile_id:    String    = ""
var _anchor_pos: Vector2i  = Vector2i(-1, -1)
var _slot_btns:  Array     = []
var _name_lbls:  Array     = []
var _bar_fill:   ColorRect = null
var _timer_lbl:  Label     = null
var _fill_lbl:   Label     = null
var _claimed:    bool      = false

func _ready() -> void:
	layer = 30
	add_to_group("action_windows")

func setup_collab(t_id: String, a_pos: Vector2i) -> void:
	_tile_id    = t_id
	_anchor_pos = a_pos
	LandManager.ensure_collab(t_id, a_pos)
	_build_ui()
	LandManager.collab_state_changed.connect(_on_collab_changed)

func _on_collab_changed(tid: String, _k: String, _s: String) -> void:
	if tid == _tile_id:
		_refresh_ui()

func _close() -> void:
	if LandManager.collab_state_changed.is_connected(_on_collab_changed):
		LandManager.collab_state_changed.disconnect(_on_collab_changed)
	closed.emit()
	queue_free()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		_close()

func _process(_delta: float) -> void:
	if not is_instance_valid(_timer_lbl): return
	var collab := _get_collab()
	var state: String = collab.get("state", "waiting")
	if state == "cooking":
		var elapsed: int   = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
		var remaining: int = max(0, COOK_TIME_SEC - elapsed)
		_timer_lbl.text = "fermentation: %s remaining" % _fmt_time(remaining)
		if is_instance_valid(_bar_fill):
			_bar_fill.size.x = 448.0 * clampf(float(elapsed) / float(COOK_TIME_SEC), 0.0, 1.0)
	elif state == "ready" and not _claimed:
		_do_auto_collect()

func _get_collab() -> Dictionary:
	if _tile_id == "" or _anchor_pos == Vector2i(-1, -1): return {}
	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	return slots.get(LandManager.slot_key(_anchor_pos), {}).get("collab", {})

func _fmt_time(secs: int) -> String:
	if secs >= 86400:
		return "%dd %dh" % [secs / 86400, (secs % 86400) / 3600]
	elif secs >= 3600:
		return "%dh %dm" % [secs / 3600, (secs % 3600) / 60]
	return "%dm %ds" % [secs / 60, secs % 60]

func _short_id(id: String) -> String:
	if id.length() <= 14: return id
	return id.substr(0, 6) + "..." + id.substr(id.length() - 4)

# ─────────────────────────── BUILD UI ───────────────────────

func _build_ui() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.62)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(dim)

	var panel := Control.new()
	panel.position = Vector2((1280.0 - PANEL_W) / 2.0, (720.0 - PANEL_H) / 2.0)
	panel.size     = Vector2(PANEL_W, PANEL_H)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(panel)

	_rect(panel, Vector2.ZERO,  Vector2(PANEL_W, PANEL_H),      COL_BORDER)
	_rect(panel, Vector2(2, 2), Vector2(PANEL_W - 4, PANEL_H - 4), COL_BG)

	# ── Title bar ────────────────────────────────────────────
	_rect(panel, Vector2(2, 2), Vector2(PANEL_W - 4, 36), COL_PANEL)

	var title := Label.new()
	title.text     = "WINE BARREL"
	title.position = Vector2(16, 9)
	title.size     = Vector2(PANEL_W - 80, 20)
	title.add_theme_font_size_override("font_size", 14)
	title.modulate = COL_ACCENT
	panel.add_child(title)

	var close_btn := Button.new()
	close_btn.text     = "X"
	close_btn.position = Vector2(PANEL_W - 46, 5)
	close_btn.size     = Vector2(36, 26)
	close_btn.add_theme_font_size_override("font_size", 12)
	close_btn.pressed.connect(_close)
	_style_btn(close_btn, Color(0.20, 0.06, 0.30), Color(0.65, 0.20, 0.55))
	panel.add_child(close_btn)

	# ── Info section ─────────────────────────────────────────
	const IY := 44.0
	const IH := 154.0
	const IX := 16.0
	const IW := PANEL_W - 32.0   # 488

	_rect(panel, Vector2(IX - 1, IY - 1), Vector2(IW + 2, IH + 2), COL_BORDER)
	_rect(panel, Vector2(IX,     IY),     Vector2(IW,     IH),     COL_PANEL)

	var barrel_lbl := Label.new()
	barrel_lbl.text = "wine barrel"
	barrel_lbl.position = Vector2(IX, IY + 10)
	barrel_lbl.size     = Vector2(IW, 24)
	barrel_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	barrel_lbl.add_theme_font_size_override("font_size", 16)
	barrel_lbl.modulate = COL_TEXT
	panel.add_child(barrel_lbl)

	_fill_lbl = Label.new()
	_fill_lbl.text = "needed: 3 players"
	_fill_lbl.position = Vector2(IX, IY + 38)
	_fill_lbl.size     = Vector2(IW, 16)
	_fill_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_fill_lbl.add_theme_font_size_override("font_size", 10)
	_fill_lbl.modulate = COL_SUBTLE
	panel.add_child(_fill_lbl)

	# Progress bar  (track then fill on top)
	const BY := IY + 62.0
	const BX := IX + 20.0
	const BW := IW - 40.0   # 448
	const BH := 14.0
	_rect(panel, Vector2(BX, BY), Vector2(BW, BH), COL_BAR_BG)
	_bar_fill = _rect(panel, Vector2(BX, BY), Vector2(0.0, BH), COL_ACCENT)

	_timer_lbl = Label.new()
	_timer_lbl.text     = "fermentation: --:--"
	_timer_lbl.position = Vector2(IX, BY + 22)
	_timer_lbl.size     = Vector2(IW, 16)
	_timer_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_timer_lbl.add_theme_font_size_override("font_size", 10)
	_timer_lbl.modulate = COL_SUBTLE
	panel.add_child(_timer_lbl)

	var cost_lbl := Label.new()
	cost_lbl.text = "each player contributes 20x Grape Must  —  rewards: 60 Wine per player + 60 bonus to tile owner"
	cost_lbl.position = Vector2(IX + 4, IY + IH - 32)
	cost_lbl.size     = Vector2(IW - 8, 28)
	cost_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cost_lbl.add_theme_font_size_override("font_size", 8)
	cost_lbl.modulate = Color(0.42, 0.36, 0.54)
	cost_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(cost_lbl)

	# ── Player join rows ─────────────────────────────────────
	const RY0 := IY + IH + 8.0   # = 206
	const RH  := 68.0
	const RG  := 6.0
	const RX  := 16.0
	const RW  := PANEL_W - 32.0  # 488

	_slot_btns.clear()
	_name_lbls.clear()

	for i in 3:
		var ry := RY0 + i * (RH + RG)

		_rect(panel, Vector2(RX - 1, ry - 1), Vector2(RW + 2, RH + 2), COL_BORDER)
		_rect(panel, Vector2(RX,     ry),     Vector2(RW,     RH),     COL_ROW_BG)

		# Icon box
		_rect(panel, Vector2(RX + 10, ry + 10), Vector2(48, 48), Color(0.12, 0.08, 0.22))
		var icon_path := "res://assets/sprites/items/grape_must.png"
		if ResourceLoader.exists(icon_path):
			var icon := TextureRect.new()
			icon.texture = load(icon_path)
			icon.position = Vector2(RX + 10, ry + 10)
			icon.size     = Vector2(48, 48)
			icon.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
			icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
			panel.add_child(icon)

		var slot_hdr := Label.new()
		slot_hdr.text     = "Player %d" % (i + 1)
		slot_hdr.position = Vector2(RX + 68, ry + 8)
		slot_hdr.size     = Vector2(200, 15)
		slot_hdr.add_theme_font_size_override("font_size", 8)
		slot_hdr.modulate = Color(0.40, 0.35, 0.54)
		panel.add_child(slot_hdr)

		var name_lbl := Label.new()
		name_lbl.text     = "Open Slot"
		name_lbl.position = Vector2(RX + 68, ry + 26)
		name_lbl.size     = Vector2(240, 20)
		name_lbl.add_theme_font_size_override("font_size", 11)
		name_lbl.modulate = COL_SUBTLE
		panel.add_child(name_lbl)
		_name_lbls.append(name_lbl)

		var btn := Button.new()
		btn.text     = "Join"
		btn.position = Vector2(RX + RW - 108, ry + 17)
		btn.size     = Vector2(100, 34)
		btn.add_theme_font_size_override("font_size", 11)
		var cap_i := i
		btn.pressed.connect(func(): _do_contribute(cap_i))
		_style_btn(btn, Color(0.12, 0.06, 0.22), Color(0.38, 0.14, 0.56))
		panel.add_child(btn)
		_slot_btns.append(btn)

	# ── Bottom close button ──────────────────────────────────
	var close_bottom := Button.new()
	close_bottom.text     = "Close"
	close_bottom.position = Vector2((PANEL_W - 120) / 2.0, PANEL_H - 40)
	close_bottom.size     = Vector2(120, 28)
	close_bottom.add_theme_font_size_override("font_size", 10)
	close_bottom.pressed.connect(_close)
	_style_btn(close_bottom, Color(0.14, 0.08, 0.22), Color(0.30, 0.12, 0.44))
	panel.add_child(close_bottom)

	_refresh_ui()

# ─────────────────────────── REFRESH ────────────────────────

func _refresh_ui() -> void:
	var collab  := _get_collab()
	var state:   String = collab.get("state",   "waiting")
	var filled:  Array  = collab.get("filled",  [false, false, false])
	var players: Array  = collab.get("players", ["", "", ""])

	var filled_count: int = 0
	for v in filled:
		if v: filled_count += 1

	var has_all: bool = true
	for res_id in RECIPE_ING:
		if not ResourceManager.has_item(res_id, RECIPE_ING[res_id]):
			has_all = false
			break

	var already_joined: bool = false
	for pid in players:
		if pid != "" and pid == PlayerData.player_id:
			already_joined = true
			break

	for i in _slot_btns.size():
		var btn:  Button = _slot_btns[i]
		var nlbl: Label  = _name_lbls[i]
		if not is_instance_valid(btn) or not is_instance_valid(nlbl): continue

		var is_filled: bool = (i < filled.size() and filled[i]) or state in ["cooking", "ready"]
		var pid: String     = players[i] if i < players.size() else ""

		if is_filled:
			nlbl.text     = _short_id(pid) if pid != "" else "Joined"
			nlbl.modulate = COL_GREEN
			btn.text      = "Done"
			btn.disabled  = true
		else:
			nlbl.text     = "Open Slot"
			nlbl.modulate = COL_SUBTLE
			btn.text      = "Join"
			btn.disabled  = not has_all or state != "waiting" or already_joined

	if is_instance_valid(_fill_lbl):
		match state:
			"waiting":
				var need := 3 - filled_count
				if need > 0:
					_fill_lbl.text    = "needed: %d more player%s" % [need, "s" if need > 1 else ""]
					_fill_lbl.modulate = COL_SUBTLE
				else:
					_fill_lbl.text    = "All players joined!"
					_fill_lbl.modulate = COL_ACCENT
			"cooking":
				_fill_lbl.text    = "3 / 3 players — fermenting..."
				_fill_lbl.modulate = COL_ACCENT
			"ready":
				_fill_lbl.text    = "Fermentation complete!"
				_fill_lbl.modulate = COL_GREEN

	if is_instance_valid(_timer_lbl) and is_instance_valid(_bar_fill):
		match state:
			"waiting":
				_bar_fill.size.x = 448.0 * (float(filled_count) / 3.0)
				_bar_fill.color  = Color(COL_ACCENT.r, COL_ACCENT.g, COL_ACCENT.b, 0.55)
				_timer_lbl.text  = "waiting for all 3 players to contribute..."
				_timer_lbl.modulate = Color(0.42, 0.36, 0.54)
			"cooking":
				var elapsed: int   = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
				var remaining: int = max(0, COOK_TIME_SEC - elapsed)
				_bar_fill.size.x = 448.0 * clampf(float(elapsed) / float(COOK_TIME_SEC), 0.0, 1.0)
				_bar_fill.color  = COL_ACCENT
				_timer_lbl.text  = "fermentation: %s remaining" % _fmt_time(remaining)
				_timer_lbl.modulate = COL_SUBTLE
			"ready":
				_bar_fill.size.x = 448.0
				_bar_fill.color  = COL_GREEN
				_timer_lbl.text  = "Fermentation complete — claiming wine..."
				_timer_lbl.modulate = COL_GREEN

	if state == "ready" and not _claimed:
		_do_auto_collect()

# ─────────────────────────── LOGIC ──────────────────────────

func _do_contribute(idx: int) -> void:
	var collab := _get_collab()
	if collab.get("state", "waiting") != "waiting": return
	var filled: Array = collab.get("filled", [false, false, false])
	if idx < filled.size() and filled[idx]: return
	# Guard: player can only join once
	var players: Array = collab.get("players", ["", "", ""])
	for pid in players:
		if pid != "" and pid == PlayerData.player_id: return
	for res_id in RECIPE_ING:
		if not ResourceManager.has_item(res_id, RECIPE_ING[res_id]): return
	for res_id in RECIPE_ING:
		ResourceManager.remove_item(res_id, RECIPE_ING[res_id])
	LandManager.fill_collab_slot(_tile_id, _anchor_pos, idx)
	# Store player ID in slot data so it persists
	var slot_data = LandManager.tiles.get(_tile_id, {}).get("slots", {}).get(LandManager.slot_key(_anchor_pos), null)
	if slot_data != null:
		if not slot_data.has("collab"): slot_data["collab"] = {}
		var cdata: Dictionary = slot_data["collab"]
		if not cdata.has("players"): cdata["players"] = ["", "", ""]
		cdata["players"][idx] = PlayerData.player_id
		LandManager.save_land_data()
	_refresh_ui()

func _do_auto_collect() -> void:
	_claimed = true
	if LandManager.collect_collab(_tile_id, _anchor_pos):
		ResourceManager.add_item(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		item_crafted.emit(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
		var is_owner: bool = tile_owner.is_empty() or tile_owner == PlayerData.player_id
		if is_owner:
			ResourceManager.add_item(RECIPE_OUTPUT, OWNER_BONUS_COUNT)
		if is_instance_valid(_timer_lbl):
			_timer_lbl.text    = "Wine claimed!  +%d Wine added to backpack." % (RECIPE_OUTPUT_COUNT + (OWNER_BONUS_COUNT if is_owner else 0))
			_timer_lbl.modulate = COL_GREEN
		_claimed = false
		_refresh_ui()

# ─────────────────────────── HELPERS ────────────────────────

func _rect(parent: Control, pos: Vector2, sz: Vector2, color: Color) -> ColorRect:
	var cr := ColorRect.new()
	cr.position     = pos
	cr.size         = sz
	cr.color        = color
	cr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(cr)
	return cr

func _style_btn(btn: Button, base_col: Color, border_col: Color) -> void:
	var specs := [
		["normal",   base_col,                                   border_col],
		["hover",    Color(base_col.r+0.08, base_col.g+0.04, base_col.b+0.12), Color(border_col.r+0.20, border_col.g+0.08, border_col.b+0.20)],
		["pressed",  Color(base_col.r-0.03, base_col.g-0.02, base_col.b-0.04), Color(border_col.r-0.10, border_col.g-0.04, border_col.b-0.10)],
		["disabled", Color(0.08, 0.06, 0.14),                   Color(0.20, 0.15, 0.28)],
	]
	for spec in specs:
		var s := StyleBoxFlat.new()
		s.bg_color     = spec[1]
		s.border_color = spec[2]
		s.set_corner_radius_all(5)
		s.set_border_width_all(1)
		s.content_margin_top    = 4
		s.content_margin_bottom = 4
		s.content_margin_left   = 8
		s.content_margin_right  = 8
		btn.add_theme_stylebox_override(spec[0], s)
	btn.add_theme_color_override("font_color", COL_TEXT)
	btn.add_theme_color_override("font_disabled_color", Color(0.35, 0.30, 0.46))
