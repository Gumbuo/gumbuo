extends CanvasLayer

const COLLECT_SECS := 86400  # 24 h production cycle

# ── Position constants — image is ~230×150 px shown at ≈2× in a 460×300 panel ──
const PANEL_W    := 460
const PANEL_H    := 300
# Dark mask over the amber bar (row 2 of the image)
# Honey jar icon is on the left; amber bar spans ~x60-404, y82-116
const BAR_X      := 60.0
const BAR_Y      := 82.0
const BAR_W      := 344.0
const BAR_H      := 34.0
# Timer label centred on the bar area
const STATUS_X   := 60.0
const STATUS_Y   := 88.0
const STATUS_W   := 344.0
# COLLECT button (row 3 — wide amber button)
const COLLECT_X  := 8.0
const COLLECT_Y  := 136.0
const COLLECT_BW := 444.0
const COLLECT_BH := 68.0
# X CLOSE button (bottom-right corner)
const CLOSE_X    := 308.0
const CLOSE_Y    := 224.0
const CLOSE_BW   := 148.0
const CLOSE_BH   := 52.0
# ─────────────────────────────────────────────────────────────────────────

var _tile_id:      String   = ""
var _grid_pos:     Vector2i = Vector2i.ZERO
var _slot_key:     String   = ""

var _progress_bar: ColorRect = null  # dark mask — slides right as bar fills
var _status_lbl:   Label     = null
var _collect_btn:  Button    = null

func _ready() -> void:
	layer = 40
	add_to_group("action_windows")  # prevents slot_grid._input() from firing through this UI

func setup(t_id: String, g_pos: Vector2i) -> void:
	_tile_id  = t_id
	_grid_pos = g_pos
	_slot_key = LandManager.slot_key(_grid_pos)
	_build_ui()

# ── Live update ───────────────────────────────────────────────────────────

func _process(_dt: float) -> void:
	_refresh_ui()

# ── Helpers ───────────────────────────────────────────────────────────────

func _get_slot_data() -> Dictionary:
	return LandManager.tiles.get(_tile_id, {}).get("slots", {}).get(_slot_key, {})

func _elapsed() -> int:
	var last: int = _get_slot_data().get("last_collected", 0)
	if last == 0:
		return COLLECT_SECS  # never collected → ready immediately
	return int(Time.get_unix_time_from_system()) - last

func _is_ready() -> bool:
	return _elapsed() >= COLLECT_SECS

func _fill_pct() -> float:
	return clampf(float(_elapsed()) / float(COLLECT_SECS), 0.0, 1.0)

# ── Build UI ──────────────────────────────────────────────────────────────

func _build_ui() -> void:
	# Dark overlay — click outside panel to close
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed: queue_free()
	)
	add_child(overlay)

	# Main panel — square, centered
	var panel := Control.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(PANEL_W, PANEL_H)
	panel.offset_left   = -230
	panel.offset_top    = -150
	panel.offset_right  =  230
	panel.offset_bottom =  150
	panel.mouse_filter  = Control.MOUSE_FILTER_STOP
	overlay.add_child(panel)

	# Background image
	const BG_PATH := "res://assets/sprites/ui/beehive_ui_bg.png"
	if ResourceLoader.exists(BG_PATH):
		var bg := TextureRect.new()
		bg.texture = load(BG_PATH) as Texture2D
		bg.set_anchors_preset(Control.PRESET_FULL_RECT)
		bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bg.stretch_mode = TextureRect.STRETCH_SCALE
		panel.add_child(bg)
	else:
		# Fallback solid background when image is missing
		var bg := ColorRect.new()
		bg.color = Color(0.12, 0.09, 0.02, 0.97)
		bg.set_anchors_preset(Control.PRESET_FULL_RECT)
		panel.add_child(bg)
		var title := Label.new()
		title.text = "Beehive"
		title.add_theme_font_size_override("font_size", 18)
		title.modulate = Color(0.95, 0.80, 0.15)
		title.position = Vector2(20, 20)
		panel.add_child(title)

	# Dark mask — starts covering the full amber bar (0 % done) and slides right as time passes
	_progress_bar = ColorRect.new()
	_progress_bar.color       = Color(0.06, 0.04, 0.01, 0.88)
	_progress_bar.position    = Vector2(BAR_X, BAR_Y)
	_progress_bar.size        = Vector2(BAR_W, BAR_H)
	_progress_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(_progress_bar)

	# Status / timer label — added AFTER dark mask so it renders on top of it
	_status_lbl = Label.new()
	_status_lbl.position = Vector2(STATUS_X, STATUS_Y)
	_status_lbl.custom_minimum_size = Vector2(STATUS_W, 0)
	_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status_lbl.add_theme_font_size_override("font_size", 11)
	_status_lbl.add_theme_color_override("font_color", Color(0.95, 0.85, 0.40))
	_status_lbl.add_theme_constant_override("outline_size", 2)
	_status_lbl.add_theme_color_override("font_outline_color", Color(0.04, 0.02, 0.00, 0.95))
	panel.add_child(_status_lbl)

	# Collect button — transparent overlay over image art
	_collect_btn = Button.new()
	_collect_btn.position           = Vector2(COLLECT_X, COLLECT_Y)
	_collect_btn.custom_minimum_size = Vector2(COLLECT_BW, COLLECT_BH)
	_collect_btn.text = ""
	_collect_btn.tooltip_text = "Collect honey and beeswax"
	_style_transparent_btn(_collect_btn, true)
	_collect_btn.pressed.connect(_on_collect_pressed)
	panel.add_child(_collect_btn)

	# Close button — transparent overlay over image art
	var close_btn := Button.new()
	close_btn.position           = Vector2(CLOSE_X, CLOSE_Y)
	close_btn.custom_minimum_size = Vector2(CLOSE_BW, CLOSE_BH)
	close_btn.text = ""
	_style_transparent_btn(close_btn, false)
	close_btn.pressed.connect(func(): queue_free())
	panel.add_child(close_btn)

	_refresh_ui()

func _style_transparent_btn(btn: Button, highlight: bool) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0); sb.border_color = Color(0, 0, 0, 0)
	btn.add_theme_stylebox_override("normal", sb)
	var sb_h := StyleBoxFlat.new()
	sb_h.bg_color = Color(1, 1, 1, 0.20 if highlight else 0.12)
	sb_h.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("hover", sb_h)
	var sb_p := StyleBoxFlat.new()
	sb_p.bg_color = Color(1, 1, 1, 0.30 if highlight else 0.20)
	sb_p.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("pressed", sb_p)

# ── Refresh (called every frame) ──────────────────────────────────────────

func _refresh_ui() -> void:
	var pct   := _fill_pct()
	var ready := _is_ready()

	# Slide the dark mask right to reveal the image's bar as production fills
	if is_instance_valid(_progress_bar):
		var filled := BAR_W * pct
		_progress_bar.position = Vector2(BAR_X + filled, BAR_Y)
		_progress_bar.size     = Vector2(BAR_W - filled, BAR_H)

	if is_instance_valid(_status_lbl):
		if ready:
			_status_lbl.text = "Ready to collect!"
		else:
			var rem := COLLECT_SECS - _elapsed()
			_status_lbl.text = "%dh %dm" % [rem / 3600, (rem % 3600) / 60]

	if is_instance_valid(_collect_btn):
		_collect_btn.disabled = not ready

# ── Collect ───────────────────────────────────────────────────────────────

func _on_collect_pressed() -> void:
	if not _is_ready(): return

	ResourceManager.add_item("honey",   2, true)
	ResourceManager.add_item("beeswax", 1, true)
	PlayerData.add_xp(2)
	var popup = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(popup)
	popup.show_drops([{"label": "Collected", "color": Color(1.0, 0.88, 0.20), "items": [{"id": "honey", "count": 2}, {"id": "beeswax", "count": 1}]}])

	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var data: Dictionary  = slots.get(_slot_key, {})
	data["last_collected"] = int(Time.get_unix_time_from_system())
	LandManager.slot_item_placed.emit(_tile_id, _slot_key, "beehive")
	LandManager.save_land_data()

	queue_free()
