extends CanvasLayer

# Inventory UI that can be toggled with 'I' key
# Displays items in a grid

onready var panel = $Panel
onready var grid = $Panel/MarginContainer/VBoxContainer/GridContainer
onready var title = $Panel/MarginContainer/VBoxContainer/Title

var inventory = null
var is_open := false

func _ready():
	# Start hidden
	visible = false
	is_open = false

	# Find inventory system
	if get_tree().root.has_node("Inventory"):
		inventory = get_tree().root.get_node("Inventory")
		inventory.connect("inventory_changed", self, "_on_inventory_changed")

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
