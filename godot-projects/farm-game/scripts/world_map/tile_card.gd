extends Control

signal enter_requested(tile_id: String)
signal npc_shop_requested(npc_id: String)
signal drag_started(tile_id: String, from_pos: Vector2i)
signal drop_requested(to_pos: Vector2i)
signal edit_requested(tile_id: String)

@export var grid_position: Vector2i = Vector2i(0, 0)

@onready var bg_rect: ColorRect = $BgRect
@onready var tile_type_label: Label = $TileTypeLabel
@onready var tile_name_label: Label = $TileNameLabel
@onready var access_icon: ColorRect = $AccessIcon
@onready var vault_label: Label = $VaultLabel
@onready var enter_button: Button = $EnterButton
@onready var empty_label: Label = $EmptyLabel

var TYPE_COLORS: Dictionary = {}

var _tile_id: String = ""
var _npc_id: String = ""
var _is_empty: bool = true
var _select_overlay: ColorRect = null
var _drop_overlay: ColorRect = null
var _edit_btn: Button = null

func _ready() -> void:
	TYPE_COLORS = {
		"FARM":     Color(0.40, 0.70, 0.30),
		"FOREST":   Color(0.20, 0.50, 0.20),
		"MOUNTAIN": Color(0.50, 0.40, 0.30),
		"POND":     Color(0.20, 0.40, 0.70),
		"GUILD":    Color(0.60, 0.40, 0.80),
	}
	_select_overlay = ColorRect.new()
	_select_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_select_overlay.color = Color(1.0, 0.85, 0.0, 0.40)
	_select_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_select_overlay.visible = false
	add_child(_select_overlay)

	_drop_overlay = ColorRect.new()
	_drop_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_drop_overlay.color = Color(0.0, 0.75, 0.4, 0.30)
	_drop_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_drop_overlay.visible = false
	add_child(_drop_overlay)

	_edit_btn = Button.new()
	_edit_btn.text = "✎"
	_edit_btn.flat = true
	_edit_btn.custom_minimum_size = Vector2(18, 18)
	_edit_btn.position = Vector2(size.x - 20, 2)
	_edit_btn.visible = false
	_edit_btn.mouse_filter = Control.MOUSE_FILTER_STOP
	_edit_btn.pressed.connect(_on_edit_pressed)
	add_child(_edit_btn)

	set_empty()

func set_empty() -> void:
	_tile_id = ""
	_npc_id = ""
	_is_empty = true
	bg_rect.color = Color(0, 0, 0, 0)
	tile_type_label.text = ""
	tile_name_label.text = ""
	vault_label.text = ""
	empty_label.text = ""
	empty_label.visible = false
	enter_button.visible = false
	access_icon.visible = false
	if _edit_btn: _edit_btn.visible = false

func set_tile(tile_data: Dictionary) -> void:
	_tile_id = tile_data["id"]
	_npc_id = ""
	_is_empty = false
	var type_str: String = tile_data.get("type_str", "FARM")
	bg_rect.color = TYPE_COLORS.get(type_str, Color(0.3, 0.3, 0.3))
	tile_type_label.text = type_str.capitalize()
	tile_name_label.text = tile_data.get("name", "")
	empty_label.text = ""
	empty_label.visible = false
	enter_button.text = "Enter"
	enter_button.visible = true
	access_icon.visible = true
	_update_access_icon(tile_data.get("access_mode", 0))
	_update_vault_label(tile_data.get("passive_vault", {}))
	if _edit_btn:
		var is_owner: bool = tile_data.get("owner_id", "") == PlayerData.player_id
		_edit_btn.visible = is_owner
		_edit_btn.position = Vector2(size.x - 20, 2)

func set_npc_tile(npc_data: Dictionary) -> void:
	_npc_id = npc_data.get("id", "")
	_tile_id = ""
	_is_empty = false
	var col: Array = npc_data.get("color", [0.8, 0.7, 0.2])
	bg_rect.color = Color(col[0], col[1], col[2])
	tile_type_label.text = "NPC"
	tile_name_label.text = npc_data.get("shop_name", npc_data.get("name", ""))
	vault_label.text = npc_data.get("name", "")
	empty_label.text = ""
	empty_label.visible = false
	enter_button.text = "Visit"
	enter_button.visible = true
	access_icon.visible = false

func set_selected(selected: bool) -> void:
	if _select_overlay:
		_select_overlay.visible = selected

func set_drop_target(is_target: bool) -> void:
	if _drop_overlay:
		_drop_overlay.visible = is_target
	if _is_empty and empty_label:
		empty_label.text = "+" if is_target else ""
		empty_label.visible = is_target

func is_empty_cell() -> bool:
	return _is_empty

func is_npc_tile() -> bool:
	return _npc_id != ""

func _update_access_icon(mode: int) -> void:
	if mode == LandManager.AccessMode.PUBLIC:
		access_icon.color = Color.GREEN
	elif mode == LandManager.AccessMode.PRIVATE:
		access_icon.color = Color.RED
	else:
		access_icon.color = Color.YELLOW

func _update_vault_label(vault: Dictionary) -> void:
	if vault.is_empty():
		vault_label.text = ""
		return
	var total: int = 0
	for v in vault.values():
		total += int(v)
	vault_label.text = "Vault: %d" % total

func _on_edit_pressed() -> void:
	if _tile_id != "":
		edit_requested.emit(_tile_id)

func _on_enter_button_pressed() -> void:
	if _npc_id != "":
		npc_shop_requested.emit(_npc_id)
	elif _tile_id != "":
		enter_requested.emit(_tile_id)

func _gui_input(event: InputEvent) -> void:
	if not event is InputEventMouseButton or not event.pressed:
		return
	if event.button_index != MOUSE_BUTTON_LEFT:
		return
	if _is_empty:
		drop_requested.emit(grid_position)
	elif _tile_id != "":
		drag_started.emit(_tile_id, grid_position)
	# NPC tiles (_npc_id set, _tile_id empty): no drag emitted — fixed in place
