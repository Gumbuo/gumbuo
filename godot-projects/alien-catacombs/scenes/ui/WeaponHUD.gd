extends CanvasLayer

# Weapon HUD that displays all weapons with counts and equipped items

onready var pistol_row = $MarginContainer/VBoxContainer/WeaponsList/PistolRow
onready var pistol_icon = $MarginContainer/VBoxContainer/WeaponsList/PistolRow/Icon
onready var pistol_label = $MarginContainer/VBoxContainer/WeaponsList/PistolRow/Label

onready var rifle_row = $MarginContainer/VBoxContainer/WeaponsList/RifleRow
onready var rifle_icon = $MarginContainer/VBoxContainer/WeaponsList/RifleRow/Icon
onready var rifle_label = $MarginContainer/VBoxContainer/WeaponsList/RifleRow/Label

onready var shotgun_row = $MarginContainer/VBoxContainer/WeaponsList/ShotgunRow
onready var shotgun_icon = $MarginContainer/VBoxContainer/WeaponsList/ShotgunRow/Icon
onready var shotgun_label = $MarginContainer/VBoxContainer/WeaponsList/ShotgunRow/Label

onready var helmet_icon = $MarginContainer/VBoxContainer/EquippedItems/HelmetIcon
onready var body_icon = $MarginContainer/VBoxContainer/EquippedItems/BodyIcon
onready var accessory_icon = $MarginContainer/VBoxContainer/EquippedItems/AccessoryIcon

var weapon_manager = null
var equipment_manager = null
var item_database = null

func _ready():
	# Find managers
	yield(get_tree(), "idle_frame")
	weapon_manager = get_node_or_null("/root/WeaponManager")
	equipment_manager = get_node_or_null("/root/EquipmentManager")
	item_database = get_node_or_null("/root/ItemDatabase")

	if weapon_manager:
		weapon_manager.connect("weapon_switched", self, "_on_weapon_switched")
		weapon_manager.connect("weapon_collected", self, "_on_weapon_collected")
		_update_weapons_display()

	if equipment_manager:
		equipment_manager.connect("equipment_changed", self, "_on_equipment_changed")
		_update_equipment_display()

func _on_weapon_switched(_weapon_type):
	_update_weapons_display()

func _on_weapon_collected(_weapon_type, _new_count):
	_update_weapons_display()

func _update_weapons_display():
	if not weapon_manager:
		return

	var active = weapon_manager.get_active_weapon()

	# Update Pistol
	var pistol_count = weapon_manager.get_weapon_count("weapon_pistol")
	_update_weapon_row(pistol_row, pistol_label, pistol_icon, "Luger", pistol_count, active == "weapon_pistol", "weapon_pistol")

	# Update Rifle
	var rifle_count = weapon_manager.get_weapon_count("weapon_rifle")
	_update_weapon_row(rifle_row, rifle_label, rifle_icon, "M15", rifle_count, active == "weapon_rifle", "weapon_rifle")

	# Update Shotgun
	var shotgun_count = weapon_manager.get_weapon_count("weapon_shotgun")
	_update_weapon_row(shotgun_row, shotgun_label, shotgun_icon, "Shotgun", shotgun_count, active == "weapon_shotgun", "weapon_shotgun")

func _update_weapon_row(row_node, label_node, icon_node, name: String, count: int, is_active: bool, weapon_id: String):
	if not label_node:
		return

	# Update text
	label_node.text = name + ": " + str(count)

	# Highlight if active
	if is_active and count > 0:
		label_node.add_color_override("font_color", Color(1, 1, 0))  # Yellow
	elif count > 0:
		label_node.add_color_override("font_color", Color(1, 1, 1))  # White
	else:
		label_node.add_color_override("font_color", Color(0.5, 0.5, 0.5))  # Gray

	# Load weapon icon
	if icon_node and item_database:
		var weapon_data = item_database.get_item(weapon_id)
		if weapon_data.has("sprite"):
			var texture = load(weapon_data.sprite)
			if texture:
				icon_node.texture = texture

func _on_equipment_changed(slot, item):
	_update_equipment_display()

func _update_equipment_display():
	if not equipment_manager:
		return

	# Update helmet icon
	var helmet = equipment_manager.equipped.get("helmet")
	_update_icon(helmet_icon, helmet)

	# Update body icon
	var body = equipment_manager.equipped.get("body")
	_update_icon(body_icon, body)

	# Update accessory icon
	var accessory = equipment_manager.equipped.get("accessory")
	_update_icon(accessory_icon, accessory)

func _update_icon(icon_node, item):
	if not icon_node:
		return

	if item == null:
		icon_node.texture = null
		icon_node.visible = false
	else:
		var sprite_path = item.get("sprite", "")
		if sprite_path != "":
			var texture = load(sprite_path)
			if texture:
				icon_node.texture = texture
				icon_node.visible = true
