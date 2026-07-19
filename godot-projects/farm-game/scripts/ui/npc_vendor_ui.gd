extends CanvasLayer

signal closed
# Unused but required — _spawn_crafting_ui() in slot_grid.gd connects to
# this signal unconditionally for every registered CRAFTING_STATIONS entry.
signal item_crafted(item_id: String, count: int)

const BORDER_COLOR := Color(0.55, 0.42, 0.20)
const TITLE_COLOR  := Color(0.90, 0.75, 0.45)

var _claim_btn: Button = null
var _status_lbl: Label = null

func _ready() -> void:
	layer = 30
	_build_ui()

func _close() -> void:
	closed.emit()
	queue_free()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		_close()

func _build_ui() -> void:
	var pw := 460; var ph := 220
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
	title.text     = "TRAVELING VENDOR"
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
	desc.position = Vector2(16, 50)
	desc.size     = Vector2(pw - 32, 40)
	desc.text     = "New around here? Claim a free iron axe, pickaxe, and fishing rod to get started. One-time offer."
	desc.add_theme_font_size_override("font_size", 9)
	desc.modulate = Color(0.7, 0.7, 0.7)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(desc)

	_claim_btn = Button.new()
	_claim_btn.position = Vector2((pw - 220) / 2.0, 120)
	_claim_btn.size     = Vector2(220, 40)
	_claim_btn.add_theme_font_size_override("font_size", 11)
	_claim_btn.pressed.connect(_on_claim_pressed)
	panel.add_child(_claim_btn)

	_status_lbl = Label.new()
	_status_lbl.position = Vector2(16, 172)
	_status_lbl.size     = Vector2(pw - 32, 30)
	_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status_lbl.add_theme_font_size_override("font_size", 9)
	_status_lbl.modulate = Color(0.55, 0.85, 0.55)
	panel.add_child(_status_lbl)

	_refresh()

func _on_claim_pressed() -> void:
	if ResourceManager.claim_starter_tools():
		_status_lbl.text = "Claimed! Check your backpack."
	_refresh()

func _refresh() -> void:
	if ResourceManager.has_claimed_starter_tools():
		_claim_btn.text = "Already Claimed"
		_claim_btn.disabled = true
	else:
		_claim_btn.text = "Claim Starter Tools"
		_claim_btn.disabled = false
