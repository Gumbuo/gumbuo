extends Control

signal closed

const CREDITS = [
	{
		"section": "Art & Assets",
		"entries": [
			{ "role": "Overworld Tileset & Character Sprites", "name": "o_lobster", "url": "o-lobster.itch.io" },
			{ "role": "Everterra Asset Pack (terrain, farm, forest, buildings)", "name": "dsatpxls", "url": "dsatpxls.itch.io/everterra" },
			{ "role": "STRANDED Factory Pack (workshop, forge, kiln)", "name": "Penusbmic", "url": "penusbmic.itch.io" },
			{ "role": "Pixel 16 Woods", "name": "itch.io free pack", "url": "" },
			{ "role": "NPC Character Sprites", "name": "EleonoreAndJoanna (itch.io)", "url": "" },
		]
	},
	{
		"section": "Built With",
		"entries": [
			{ "role": "Game Engine", "name": "Godot 4.5", "url": "godotengine.org" },
			{ "role": "Blockchain", "name": "Base Network", "url": "base.org" },
			{ "role": "Wallet Connect", "name": "RainbowKit", "url": "" },
		]
	},
	{
		"section": "Development",
		"entries": [
			{ "role": "Game Design & Development", "name": "Tom Gumbuo", "url": "" },
		]
	},
]

@onready var content: VBoxContainer = $ScrollContainer/VBoxContainer
@onready var scroll: ScrollContainer = $ScrollContainer

func _ready() -> void:
	_build_credits()

func _build_credits() -> void:
	for section_data in CREDITS:
		var section_label := Label.new()
		section_label.text = section_data["section"]
		section_label.add_theme_font_size_override("font_size", 18)
		section_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
		section_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		content.add_child(section_label)

		for entry in section_data["entries"]:
			var row := HBoxContainer.new()
			row.alignment = BoxContainer.ALIGNMENT_CENTER

			var role_label := Label.new()
			role_label.text = entry["role"] + ":  "
			role_label.add_theme_color_override("font_color", Color(0.75, 0.75, 0.75))
			role_label.custom_minimum_size.x = 340
			role_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
			row.add_child(role_label)

			var name_label := Label.new()
			name_label.text = entry["name"]
			name_label.add_theme_color_override("font_color", Color.WHITE)
			if entry["url"] != "":
				name_label.text += "  (%s)" % entry["url"]
			name_label.custom_minimum_size.x = 340
			row.add_child(name_label)

			content.add_child(row)

		var spacer := Control.new()
		spacer.custom_minimum_size.y = 16
		content.add_child(spacer)

func _on_close_pressed() -> void:
	closed.emit()
	queue_free()
