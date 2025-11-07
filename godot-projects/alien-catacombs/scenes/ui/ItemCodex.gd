extends CanvasLayer

# Item Codex - Collection menu showing all items in the game
# Toggle with 'C' key

onready var panel = $Panel
onready var scroll = $Panel/MarginContainer/VBoxContainer/ScrollContainer
onready var content = $Panel/MarginContainer/VBoxContainer/ScrollContainer/VBoxContainer
onready var title = $Panel/MarginContainer/VBoxContainer/Title
onready var stats_label = $Panel/MarginContainer/VBoxContainer/StatsLabel

var item_database = null
var is_open := false

func _ready():
	# Start hidden
	visible = false
	is_open = false

	# Find item database
	yield(get_tree(), "idle_frame")
	item_database = get_node_or_null("/root/ItemDatabase")
	if item_database:
		item_database.connect("item_discovered", self, "_on_item_discovered")

func _input(event):
	# Toggle codex with 'C' key
	if event.is_action_pressed("ui_codex"):
		toggle_codex()

func toggle_codex():
	is_open = !is_open
	visible = is_open

	if is_open:
		_refresh_codex()
		# Pause game when codex is open
		get_tree().paused = true
	else:
		get_tree().paused = false

func _on_item_discovered(item_id):
	if is_open:
		_refresh_codex()

func _refresh_codex():
	if not item_database:
		return

	# Clear existing content
	for child in content.get_children():
		child.queue_free()

	# Update stats
	var stats = item_database.get_discovery_stats()
	stats_label.text = "Collected: %d/%d (%.1f%%)" % [
		stats.discovered,
		stats.total_items,
		stats.percentage
	]

	# Get all categories
	var categories = item_database.get_all_categories()
	categories.sort()

	# Display items by category
	for category in categories:
		# Category header
		var category_label = Label.new()
		category_label.text = "=== " + category.to_upper() + " ==="
		category_label.add_color_override("font_color", Color(0, 1, 1, 1))  # Cyan
		content.add_child(category_label)

		# Get items in this category
		var category_items = item_database.get_items_by_category(category)

		# Display each item
		for item in category_items:
			var item_container = HBoxContainer.new()
			item_container.rect_min_size.y = 32

			# Item icon/sprite (small preview)
			var icon = TextureRect.new()
			icon.rect_min_size = Vector2(24, 24)
			icon.expand = true
			icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED

			# Check if discovered
			var is_discovered = item_database.is_discovered(item.id)

			if is_discovered:
				# Show actual sprite
				var texture = load(item.sprite)
				if texture:
					icon.texture = texture
			else:
				# Show question mark for undiscovered
				icon.modulate = Color(0.3, 0.3, 0.3, 0.5)

			item_container.add_child(icon)

			# Item info
			var info_vbox = VBoxContainer.new()
			info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL

			# Item name
			var name_label = Label.new()
			if is_discovered:
				name_label.text = item.name
				name_label.add_color_override("font_color", Color(1, 1, 1, 1))
			else:
				name_label.text = "???"
				name_label.add_color_override("font_color", Color(0.5, 0.5, 0.5, 1))

			info_vbox.add_child(name_label)

			# Item description
			if is_discovered:
				var desc_label = Label.new()
				desc_label.text = item.description
				desc_label.add_color_override("font_color", Color(0.7, 0.7, 0.7, 1))
				desc_label.autowrap = true
				info_vbox.add_child(desc_label)

			item_container.add_child(info_vbox)
			content.add_child(item_container)

		# Add spacing between categories
		var spacer = Control.new()
		spacer.rect_min_size.y = 10
		content.add_child(spacer)
