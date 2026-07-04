extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

# Recipe not yet configured — contribute buttons disabled until set.
const RECIPE_ING:         Dictionary = {}
const RECIPE_OUTPUT:      String     = "wheat_flour"
const RECIPE_OUTPUT_COUNT:int        = 5
const COOK_TIME_SEC:      int        = 600 # 10 min placeholder

const BORDER_COLOR := Color(0.42, 0.30, 0.08)
const TITLE_COLOR  := Color(1.00, 0.82, 0.40)

var _tile_id:     String    = ""
var _anchor_pos:  Vector2i  = Vector2i(-1, -1)
var _slot_btns:   Array     = []
var _timer_lbl:   Label     = null
var _collect_btn: Button    = null

func _ready() -> void:
	layer = 30

func setup_collab(t_id: String, a_pos: Vector2i) -> void:
	_tile_id    = t_id
	_anchor_pos = a_pos
	LandManager.ensure_collab(t_id, a_pos)
	_build_ui()
	LandManager.collab_state_changed.connect(_on_collab_changed)

func _on_collab_changed(tid: String, _k: String, _s: String) -> void:
	if tid == _tile_id: _refresh_ui()

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
	if collab.get("state", "") != "cooking": return
	var elapsed: int = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
	var remaining: int = max(0, COOK_TIME_SEC - elapsed)
	_timer_lbl.text = "Milling: %d:%02d remaining" % [remaining / 60, remaining % 60]

func _get_collab() -> Dictionary:
	if _tile_id == "" or _anchor_pos == Vector2i(-1, -1): return {}
	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	return slots.get(LandManager.slot_key(_anchor_pos), {}).get("collab", {})

func _build_ui() -> void:
	var pw := 920; var ph := 480
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.55)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(dim)

	var panel := Control.new()
	panel.position = Vector2((1280 - pw) / 2.0, (720 - ph) / 2.0)
	panel.size     = Vector2(pw, ph)
	root.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = BORDER_COLOR
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(1, 1)
	inner.size     = Vector2(pw - 2, ph - 2)
	inner.color    = Color(0.07, 0.07, 0.09, 0.98)
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(inner)

	var tbar := ColorRect.new()
	tbar.position = Vector2(1, 1)
	tbar.size     = Vector2(pw - 2, 38)
	tbar.color    = Color(BORDER_COLOR.r * 0.4, BORDER_COLOR.g * 0.4, BORDER_COLOR.b * 0.4)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = "MILL"
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = TITLE_COLOR
	panel.add_child(title)

	var close_btn := Button.new()
	close_btn.position = Vector2(pw - 46, 6)
	close_btn.size     = Vector2(38, 26)
	close_btn.text     = "X"
	close_btn.pressed.connect(_close)
	panel.add_child(close_btn)

	var desc := Label.new()
	desc.position = Vector2(16, 44)
	desc.size     = Vector2(pw - 32, 18)
	desc.text     = "3 players contribute to grind wheat into Wheat Flour. Recipe ingredients coming soon."
	desc.add_theme_font_size_override("font_size", 9)
	desc.modulate = Color(0.65, 0.65, 0.65)
	panel.add_child(desc)

	_slot_btns.clear()
	for i in 3:
		var sy: float = 70.0 + i * 100.0
		var slot_bg := ColorRect.new()
		slot_bg.position = Vector2(16, sy)
		slot_bg.size     = Vector2(pw - 32, 90)
		slot_bg.color    = Color(0.10, 0.10, 0.13)
		slot_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		panel.add_child(slot_bg)

		var player_lbl := Label.new()
		player_lbl.position = Vector2(24, sy + 8)
		player_lbl.size     = Vector2(130, 20)
		player_lbl.text     = "Player %d" % (i + 1)
		player_lbl.add_theme_font_size_override("font_size", 11)
		panel.add_child(player_lbl)

		var recipe_lbl := Label.new()
		recipe_lbl.position = Vector2(24, sy + 36)
		recipe_lbl.size     = Vector2(600, 18)
		recipe_lbl.text     = "Recipe not yet configured — check back soon."
		recipe_lbl.add_theme_font_size_override("font_size", 9)
		recipe_lbl.modulate = Color(0.45, 0.45, 0.45)
		panel.add_child(recipe_lbl)

		var btn := Button.new()
		btn.position = Vector2(pw - 172, sy + 28)
		btn.size     = Vector2(140, 32)
		btn.text     = "CONTRIBUTE"
		btn.disabled = true
		btn.add_theme_font_size_override("font_size", 10)
		panel.add_child(btn)
		_slot_btns.append(btn)

	_timer_lbl = Label.new()
	_timer_lbl.position = Vector2(16, 374)
	_timer_lbl.size     = Vector2(620, 28)
	_timer_lbl.add_theme_font_size_override("font_size", 12)
	panel.add_child(_timer_lbl)

	_collect_btn = Button.new()
	_collect_btn.position = Vector2(pw - 230, 368)
	_collect_btn.size     = Vector2(198, 38)
	_collect_btn.text     = "COLLECT WHEAT FLOUR"
	_collect_btn.add_theme_font_size_override("font_size", 10)
	_collect_btn.pressed.connect(_do_collect)
	panel.add_child(_collect_btn)

	_refresh_ui()

func _refresh_ui() -> void:
	var collab := _get_collab()
	var state:  String = collab.get("state", "waiting")

	if is_instance_valid(_timer_lbl):
		match state:
			"waiting":
				_timer_lbl.text    = "Waiting for recipe configuration."
				_timer_lbl.modulate = Color(0.5, 0.5, 0.5)
			"cooking":
				var elapsed:   int = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
				var remaining: int = max(0, COOK_TIME_SEC - elapsed)
				_timer_lbl.text    = "Milling: %d:%02d remaining" % [remaining / 60, remaining % 60]
				_timer_lbl.modulate = Color(1.0, 0.82, 0.40)
			"ready":
				_timer_lbl.text    = "READY!  Wheat Flour is done."
				_timer_lbl.modulate = Color(0.3, 1.0, 0.4)

	if is_instance_valid(_collect_btn):
		_collect_btn.visible = (state == "ready")

func _do_collect() -> void:
	if LandManager.collect_collab(_tile_id, _anchor_pos):
		ResourceManager.add_item(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		item_crafted.emit(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		_refresh_ui()
