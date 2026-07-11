extends Node

const MAX_ENTRIES  := 50
const MAX_VISIBLE  := 5
const HIDE_AFTER   := 10.0
const BATCH_DELAY  := 0.25
const PANEL_W      := 480.0
const PANEL_H      := 118.0

var _entries: Array = []
var _pending: Dictionary = {}
var _batch_timer: float = 0.0
var _hide_timer:  float = 0.0

var _panel:   PanelContainer = null
var _vbox:    VBoxContainer  = null
var _history: CanvasLayer    = null   # full scrollable history overlay

func _ready() -> void:
	_build_live_panel()
	ResourceManager.item_added.connect(_on_item_added)
	LandManager.passive_income_received.connect(_on_passive_income)
	HarvestManager.harvest_completed.connect(_on_harvest_completed)

# ── Live feed panel (small, centered, auto-hides) ────────────────────────────

func _build_live_panel() -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color     = Color(0.04, 0.08, 0.04, 0.90)
	sb.border_color = Color(0.30, 0.60, 0.25, 0.90)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(5)
	sb.content_margin_left   = 8.0
	sb.content_margin_right  = 8.0
	sb.content_margin_top    = 4.0
	sb.content_margin_bottom = 4.0

	_panel = PanelContainer.new()
	_panel.add_theme_stylebox_override("panel", sb)
	# Centered above HUD bar
	_panel.anchor_left   = 0.5
	_panel.anchor_right  = 0.5
	_panel.anchor_top    = 1.0
	_panel.anchor_bottom = 1.0
	_panel.offset_left   = -PANEL_W * 0.5
	_panel.offset_right  =  PANEL_W * 0.5
	_panel.offset_top    = -(58.0 + PANEL_H)
	_panel.offset_bottom = -58.0
	_panel.visible = false
	_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE

	var scroll := ScrollContainer.new()
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_panel.add_child(scroll)

	_vbox = VBoxContainer.new()
	_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox.add_theme_constant_override("separation", 2)
	_vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	scroll.add_child(_vbox)

	get_parent().add_child(_panel)

func _process(delta: float) -> void:
	if _batch_timer > 0.0:
		_batch_timer -= delta
		if _batch_timer <= 0.0:
			_flush_batch()
	if _hide_timer > 0.0:
		_hide_timer -= delta
		if _hide_timer <= 0.0:
			_panel.visible = false

# ── Signal handlers ───────────────────────────────────────────────────────────

func _on_item_added(item_id: String, amount: int) -> void:
	_pending[item_id] = _pending.get(item_id, 0) + amount
	_batch_timer = BATCH_DELAY

func _on_harvest_completed(tile_id: String, _visitor_id: String, item_id: String,
		visitor_amount: int, owner_amount: int) -> void:
	if owner_amount <= 0:
		return
	var tile: Dictionary = LandManager.tiles.get(tile_id, {})
	var tile_name: String = tile.get("name", "tile")
	var iname: String = _item_name(item_id)
	_add_entry("Farmed %dx %s on %s (+%dx to owner)" % [
		visitor_amount, iname, tile_name, owner_amount
	], Color(0.55, 1.0, 0.55))
	_pending.erase(item_id)
	_batch_timer = BATCH_DELAY if not _pending.is_empty() else 0.0

func _on_passive_income(tile_id: String, visitor_id: String, item_id: String, amount: int) -> void:
	var tile: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile.get("owner_id", "") != PlayerData.player_id:
		return
	var tile_name: String = tile.get("name", "your tile")
	var short_id: String  = _short_id(visitor_id)
	_add_entry("%s farmed %s -> vault +%dx %s" % [
		short_id, tile_name, amount, _item_name(item_id)
	], Color(1.0, 0.85, 0.30))

# ── History overlay (opened by bell button) ───────────────────────────────────

func toggle_history() -> void:
	if _history != null and is_instance_valid(_history):
		_history.queue_free()
		_history = null
		return
	_open_history()

func _open_history() -> void:
	_history = CanvasLayer.new()
	_history.layer = 30
	get_tree().current_scene.add_child(_history)

	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.60)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			toggle_history()
	)
	_history.add_child(overlay)

	var panel := PanelContainer.new()
	var psb := StyleBoxFlat.new()
	psb.bg_color     = Color(0.06, 0.10, 0.06, 0.97)
	psb.border_color = Color(0.35, 0.70, 0.25)
	psb.set_border_width_all(2)
	psb.set_corner_radius_all(8)
	psb.content_margin_left   = 12.0
	psb.content_margin_right  = 12.0
	psb.content_margin_top    = 8.0
	psb.content_margin_bottom = 8.0
	panel.add_theme_stylebox_override("panel", psb)
	panel.custom_minimum_size = Vector2(560, 480)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -280.0
	panel.offset_right  =  280.0
	panel.offset_top    = -240.0
	panel.offset_bottom =  240.0
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	_history.add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	panel.add_child(root)

	# Header
	var hdr := HBoxContainer.new()
	root.add_child(hdr)
	var title := Label.new()
	title.text = "ACTIVITY LOG"
	title.add_theme_font_size_override("font_size", 16)
	title.modulate = Color(0.55, 1.0, 0.40)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(title)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(30, 30)
	close_btn.pressed.connect(func(): toggle_history())
	hdr.add_child(close_btn)

	root.add_child(HSeparator.new())

	if _entries.is_empty():
		var empty := Label.new()
		empty.text = "No activity yet. Start farming!"
		empty.add_theme_font_size_override("font_size", 11)
		empty.modulate = Color(0.6, 0.6, 0.6)
		root.add_child(empty)
	else:
		var scroll := ScrollContainer.new()
		scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		root.add_child(scroll)
		var vbox := VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 3)
		vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		scroll.add_child(vbox)
		# Show newest first in history
		for i in range(_entries.size() - 1, -1, -1):
			var e: Dictionary = _entries[i]
			var lbl := Label.new()
			lbl.text = e["text"]
			lbl.modulate = e["color"]
			lbl.add_theme_font_size_override("font_size", 11)
			lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			vbox.add_child(lbl)

# ── Internal helpers ──────────────────────────────────────────────────────────

func _flush_batch() -> void:
	if _pending.is_empty():
		return
	var parts: Array = []
	for iid in _pending:
		parts.append("+%dx %s" % [_pending[iid], _item_name(iid)])
	_pending.clear()
	_add_entry(", ".join(parts), Color(0.60, 1.0, 0.60))

func _add_entry(text: String, color: Color) -> void:
	_entries.append({"text": text, "color": color})
	if _entries.size() > MAX_ENTRIES:
		_entries.pop_front()
	_rebuild_live_labels()
	_panel.visible = true
	_hide_timer = HIDE_AFTER

func _rebuild_live_labels() -> void:
	for child in _vbox.get_children():
		child.queue_free()
	var start: int = max(0, _entries.size() - MAX_VISIBLE)
	for i in range(start, _entries.size()):
		var e: Dictionary = _entries[i]
		var lbl := Label.new()
		lbl.text = e["text"]
		lbl.modulate = e["color"]
		lbl.add_theme_font_size_override("font_size", 11)
		lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_vbox.add_child(lbl)

func _item_name(item_id: String) -> String:
	return ResourceManager.get_item_info(item_id).get("name", item_id.capitalize())

func _short_id(id: String) -> String:
	if id.length() <= 14:
		return id
	return id.substr(0, 6) + "..." + id.substr(id.length() - 4)
