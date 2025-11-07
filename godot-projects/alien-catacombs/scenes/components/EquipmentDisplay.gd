extends Node2D

# Equipment Display Component
# Shows equipped cosmetic items as sprite overlays on the player

onready var helmet_sprite = $HelmetSprite
onready var body_sprite = $BodySprite
onready var accessory_sprite = $AccessorySprite

var equipment_manager = null

func _ready():
	# Wait for equipment manager to be ready
	yield(get_tree(), "idle_frame")

	# Connect to equipment manager
	equipment_manager = get_node_or_null("/root/EquipmentManager")
	if equipment_manager:
		equipment_manager.connect("equipment_changed", self, "_on_equipment_changed")
		# Load currently equipped items
		_refresh_all_equipment()
	else:
		print("EquipmentDisplay: No EquipmentManager found")

func _on_equipment_changed(slot, item):
	match slot:
		"helmet":
			_update_sprite(helmet_sprite, item)
		"body":
			_update_sprite(body_sprite, item)
		"accessory":
			_update_sprite(accessory_sprite, item)

func _update_sprite(sprite_node, item):
	if item == null:
		# Unequip - hide sprite
		sprite_node.texture = null
		sprite_node.visible = false
	else:
		# Equip - load and show sprite
		var sprite_path = item.get("sprite_path", "")
		if sprite_path != "":
			var texture = load(sprite_path)
			if texture:
				sprite_node.texture = texture
				sprite_node.visible = true
				print("Equipped sprite: ", sprite_path)
			else:
				print("Failed to load sprite: ", sprite_path)

func _refresh_all_equipment():
	if not equipment_manager:
		return

	var all_equipped = equipment_manager.get_all_equipped()
	for slot in all_equipped.keys():
		_on_equipment_changed(slot, all_equipped[slot])
