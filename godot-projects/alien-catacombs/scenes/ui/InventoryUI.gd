extends CanvasLayer

# Inventory UI that can be toggled with 'I' key
# Displays items in a grid with equipment slots

onready var panel = $Panel
onready var grid = $Panel/MarginContainer/VBoxContainer/GridContainer
onready var title = $Panel/MarginContainer/VBoxContainer/Title

var inventory = null
var equipment_manager = null
var is_open := false
var selected_item_index = -1

func _ready():
	# Start hidden
	visible = false
	is_open = false

	# Find inventory system
	if get_tree().root.has_node("Inventory"):
		inventory = get_tree().root.get_node("Inventory")
		inventory.connect("inventory_changed", self, "_on_inventory_changed")

	# Find equipment manager
	yield(get_tree(), "idle_frame")
	equipment_manager = get_node_or_null("/root/EquipmentManager")
	if equipment_manager:
		equipment_manager.connect("equipment_changed", self, "_on_equipment_changed")

func _input(event):
	# Toggle inventory with 'I' key
	if event.is_action_pressed("ui_inventory"):
		toggle_inventory()

func toggle_inventory():
	is_open = !is_open
	visible = is_open

	if is_open:
		_refresh_inventory()
		# Pause game when inventory is open
		get_tree().paused = true
	else:
		get_tree().paused = false

func _on_inventory_changed():
	if is_open:
		_refresh_inventory()

func _refresh_inventory():
	if not inventory:
		return

	# Clear existing items
	for child in grid.get_children():
		child.queue_free()

	# Add items
	for i in range(inventory.max_slots):
		# Create stylized slot
		var slot = Panel.new()
		slot.rect_min_size = Vector2(50, 50)

		# Add border using StyleBoxFlat
		var style = StyleBoxFlat.new()
		if i < inventory.items.size():
			# Filled slot - cyan border with dark background
			style.bg_color = Color(0.05, 0.1, 0.15, 0.9)
			style.border_color = Color(0, 1, 1, 1)  # Cyan
		else:
			# Empty slot - grey border with darker background
			style.bg_color = Color(0.05, 0.05, 0.05, 0.7)
			style.border_color = Color(0.3, 0.3, 0.3, 0.8)  # Grey

		style.set_border_width_all(2)
		slot.add_stylebox_override("panel", style)

		if i < inventory.items.size():
			var item = inventory.items[i]

			# Make slot clickable for cosmetic items
			if item.get("type") == "cosmetic":
				var button = Button.new()
				button.text = item.get("name", "???")
				button.rect_min_size = Vector2(50, 50)
				button.set_anchors_preset(Control.PRESET_WIDE)
				button.add_color_override("font_color", Color(0, 1, 1, 1))  # Cyan text
				button.add_color_override("font_color_hover", Color(1, 1, 0, 1))  # Yellow on hover
				button.flat = true
				button.connect("pressed", self, "_on_item_clicked", [i])
				slot.add_child(button)
			else:
				# Non-cosmetic items just show as label
				var label = Label.new()
				label.text = item.get("name", "???")
				label.align = Label.ALIGN_CENTER
				label.valign = Label.VALIGN_CENTER
				label.rect_min_size = Vector2(50, 50)
				label.add_color_override("font_color", Color(0, 1, 1, 1))  # Cyan text
				label.set_anchors_preset(Control.PRESET_WIDE)
				slot.add_child(label)

		grid.add_child(slot)

	# Update title
	title.text = "INVENTORY (" + str(inventory.items.size()) + "/" + str(inventory.max_slots) + ")"

func _on_equipment_changed(slot, item):
	# Refresh inventory when equipment changes
	if is_open:
		_refresh_inventory()

func _on_item_clicked(item_index):
	if item_index >= inventory.items.size():
		return

	var item = inventory.items[item_index]

	# Check if it's a cosmetic item
	if item.get("type") == "cosmetic":
		# Equip the item
		if equipment_manager:
			if equipment_manager.equip_item(item):
				# Remove from inventory after equipping
				inventory.items.remove(item_index)
				inventory.emit_signal("inventory_changed")
				_refresh_inventory()
	else:
		print("Cannot equip item: ", item.get("name"))
