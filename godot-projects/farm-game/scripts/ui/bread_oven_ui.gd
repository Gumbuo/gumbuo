extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

const RECIPE_ING:         Dictionary = {"wood": 1, "wheat_flour": 1}
const RECIPE_OUTPUT:      String     = "bread"
const RECIPE_OUTPUT_COUNT:int        = 10  # bread per contributing player
const OWNER_BONUS_COUNT:  int        = 10  # extra bread to oven owner
const COOK_TIME_SEC:      int        = 3600 # 60 minutes

const RES_NAME:  Dictionary = {"wood": "Wood", "wheat_flour": "Wheat Flour"}
const RES_COLOR: Dictionary = {
	"wood":        Color(0.55, 0.35, 0.12),
	"wheat_flour": Color(0.92, 0.85, 0.55),
}

var _tile_id:     String    = ""
var _anchor_pos:  Vector2i  = Vector2i(-1, -1)
var _slot_btns:   Array     = []
var _slot_labels: Array     = []
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
	if collab.get("state", "") != "cooking": return
	var elapsed: int = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
	var remaining: int = max(0, COOK_TIME_SEC - elapsed)
	_timer_lbl.text = "Baking: %d:%02d remaining" % [remaining / 60, remaining % 60]

func _get_collab() -> Dictionary:
	if _tile_id == "" or _anchor_pos == Vector2i(-1, -1): return {}
	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	return slots.get(LandManager.slot_key(_anchor_pos), {}).get("collab", {})

# ─────────────────────────── BUILD UI ───────────────────────

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
	border.color = Color(0.50, 0.22, 0.05)
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
	tbar.color    = Color(0.18, 0.08, 0.02)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = "BREAD OVEN"
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = Color(1.0, 0.65, 0.25)
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
	desc.text     = "3 players each: 1 Wood + 1 Wheat Flour  →  60 min bake  →  10 Bread each + 10 to oven owner"
	desc.add_theme_font_size_override("font_size", 9)
	desc.modulate = Color(0.65, 0.65, 0.65)
	panel.add_child(desc)

	_slot_btns.clear()
	_slot_labels.clear()

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

		var ing_x := 24.0
		var pill_labels: Array = []
		for res_id in RECIPE_ING:
			var req: int = RECIPE_ING[res_id]
			var dot := ColorRect.new()
			dot.position = Vector2(ing_x, sy + 38)
			dot.size     = Vector2(10, 10)
			dot.color    = RES_COLOR.get(res_id, Color(0.4, 0.4, 0.4))
			dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
			panel.add_child(dot)
			var lbl := Label.new()
			lbl.position = Vector2(ing_x + 14, sy + 34)
			lbl.size     = Vector2(200, 18)
			lbl.add_theme_font_size_override("font_size", 9)
			lbl.text     = "%s x%d" % [RES_NAME.get(res_id, res_id), req]
			panel.add_child(lbl)
			pill_labels.append({"lbl": lbl, "res_id": res_id, "req": req})
			ing_x += 220.0
		_slot_labels.append(pill_labels)

		var status_lbl := Label.new()
		status_lbl.position = Vector2(24, sy + 60)
		status_lbl.size     = Vector2(600, 18)
		status_lbl.add_theme_font_size_override("font_size", 8)
		status_lbl.modulate = Color(0.55, 0.55, 0.55)
		panel.add_child(status_lbl)

		var btn := Button.new()
		btn.position = Vector2(pw - 172, sy + 28)
		btn.size     = Vector2(140, 32)
		btn.text     = "CONTRIBUTE"
		btn.add_theme_font_size_override("font_size", 10)
		var cap_i := i
		btn.pressed.connect(func(): _do_contribute(cap_i))
		panel.add_child(btn)
		_slot_btns.append(btn)

	_timer_lbl = Label.new()
	_timer_lbl.position = Vector2(16, 374)
	_timer_lbl.size     = Vector2(620, 28)
	_timer_lbl.add_theme_font_size_override("font_size", 12)
	panel.add_child(_timer_lbl)

	_collect_btn = Button.new()
	_collect_btn.position = Vector2(pw - 210, 368)
	_collect_btn.size     = Vector2(178, 38)
	_collect_btn.text     = "COLLECT BREAD (x10)"
	_collect_btn.add_theme_font_size_override("font_size", 10)
	_collect_btn.pressed.connect(_do_collect)
	panel.add_child(_collect_btn)

	_refresh_ui()

# ─────────────────────────── LOGIC ──────────────────────────

func _refresh_ui() -> void:
	var collab := _get_collab()
	var state:  String = collab.get("state", "waiting")
	var filled: Array  = collab.get("filled", [false, false, false])

	var has_all: bool = true
	for res_id in RECIPE_ING:
		if not ResourceManager.has_item(res_id, RECIPE_ING[res_id]):
			has_all = false
			break

	for i in _slot_btns.size():
		var btn: Button = _slot_btns[i]
		if not is_instance_valid(btn): continue
		var is_filled: bool = (i < filled.size() and filled[i]) or state == "cooking" or state == "ready"
		if is_filled:
			btn.text     = "✓ Contributed"
			btn.disabled = true
		else:
			btn.text     = "CONTRIBUTE"
			btn.disabled = not has_all

	for i in _slot_labels.size():
		var pill_labels: Array = _slot_labels[i]
		var is_filled: bool = (i < filled.size() and filled[i]) or state == "cooking" or state == "ready"
		for p in pill_labels:
			var lbl: Label = p["lbl"]
			if not is_instance_valid(lbl): continue
			var have: int = ResourceManager.get_count(p["res_id"])
			lbl.text = "%s %d/%d" % [RES_NAME.get(p["res_id"], p["res_id"]), have, p["req"]]
			if is_filled:
				lbl.modulate = Color(0.3, 1.0, 0.4)
			else:
				lbl.modulate = Color(0.3, 0.7, 1.0) if have >= p["req"] else Color(1.0, 0.4, 0.4)

	if is_instance_valid(_timer_lbl):
		match state:
			"waiting":
				var done: int = 0
				for v in filled:
					if v: done += 1
				_timer_lbl.text    = "Waiting for players... %d/3 contributed" % done
				_timer_lbl.modulate = Color(0.6, 0.6, 0.6)
			"cooking":
				var elapsed:   int = int(Time.get_unix_time_from_system()) - collab.get("timer_start", 0)
				var remaining: int = max(0, COOK_TIME_SEC - elapsed)
				_timer_lbl.text    = "Baking: %d:%02d remaining" % [remaining / 60, remaining % 60]
				_timer_lbl.modulate = Color(1.0, 0.75, 0.35)
			"ready":
				_timer_lbl.text    = "READY!  Bread is done baking."
				_timer_lbl.modulate = Color(0.3, 1.0, 0.4)

	if is_instance_valid(_collect_btn):
		_collect_btn.visible = (state == "ready")

func _do_contribute(idx: int) -> void:
	var collab := _get_collab()
	if collab.get("filled", [false, false, false])[idx]: return
	if collab.get("state", "waiting") != "waiting": return
	for res_id in RECIPE_ING:
		if not ResourceManager.has_item(res_id, RECIPE_ING[res_id]): return
	for res_id in RECIPE_ING:
		ResourceManager.remove_item(res_id, RECIPE_ING[res_id])
	LandManager.fill_collab_slot(_tile_id, _anchor_pos, idx)
	_refresh_ui()

func _do_collect() -> void:
	if LandManager.collect_collab(_tile_id, _anchor_pos):
		ResourceManager.add_item(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
		var is_owner: bool = tile_owner.is_empty() or tile_owner == PlayerData.player_id
		if is_owner:
			ResourceManager.add_item(RECIPE_OUTPUT, OWNER_BONUS_COUNT)
		item_crafted.emit(RECIPE_OUTPUT, RECIPE_OUTPUT_COUNT)
		_refresh_ui()
