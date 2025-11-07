extends CanvasLayer

# Weapon HUD that displays current weapon info

onready var weapon_label = $MarginContainer/VBoxContainer/WeaponName
onready var slot_indicators = $MarginContainer/VBoxContainer/SlotIndicators

var weapon_manager = null

func _ready():
	# Find weapon manager
	yield(get_tree(), "idle_frame")
	weapon_manager = get_node_or_null("/root/WeaponManager")

	if weapon_manager:
		weapon_manager.connect("weapon_switched", self, "_on_weapon_switched")
		weapon_manager.connect("weapon_added", self, "_on_weapon_added")
		_update_display()

func _on_weapon_switched(weapon):
	_update_display()

func _on_weapon_added(weapon):
	_update_display()

func _update_display():
	if not weapon_manager:
		return

	var current_weapon = weapon_manager.get_current_weapon()

	if current_weapon.empty():
		weapon_label.text = "No Weapon"
		slot_indicators.text = ""
		return

	# Display weapon name
	weapon_label.text = current_weapon.get("name", "Unknown")

	# Show weapon slots (1 2 3) with current highlighted
	var slots_text = ""
	for i in range(weapon_manager.weapons.size()):
		if i == weapon_manager.current_weapon_index:
			slots_text += "[" + str(i + 1) + "] "
		else:
			slots_text += str(i + 1) + " "

	slot_indicators.text = slots_text.strip_edges()
