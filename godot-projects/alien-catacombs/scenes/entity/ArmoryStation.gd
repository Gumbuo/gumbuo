extends Area2D

# Armory Station — triggers the web armory UI when the player enters and presses E

export(String) var station_id = "plasmaRefinery"
export(String) var station_name = "Plasma Refinery"
export(String) var station_icon = "🔥"

var player_nearby = false
var label: Label

func _ready():
	add_to_group("armory_station")
	connect("body_entered", self, "_on_body_entered")
	connect("body_exited",  self, "_on_body_exited")
	print("[ArmoryStation] READY — ", station_name, " at global_pos: ", global_position)
	# Draw a visible glowing box — no texture assets needed
	var box = Node2D.new()
	box.set_script(load("res://scenes/entity/ArmoryStationVisual.gd"))
	add_child(box)

	# Interaction prompt label
	label = Label.new()
	label.text = "[E] " + station_name
	label.align = Label.ALIGN_CENTER
	label.rect_position = Vector2(-64, -56)
	label.rect_size    = Vector2(128, 24)
	label.visible = false
	# Cyan colour to match web armory theme
	label.add_color_override("font_color", Color(0.4, 0.99, 0.95))
	add_child(label)

# E key is handled by player_combat.gd which calls _open_armory() directly

func _on_body_entered(body):
	if body.is_in_group("player"):
		player_nearby = true
		label.visible = true

func _on_body_exited(body):
	if body.is_in_group("player"):
		player_nearby = false
		label.visible = false

func _open_armory():
	if OS.get_name() == "HTML5":
		var js_code = """
		if (window.parent) {
			window.parent.postMessage({
				type: 'OPEN_ARMORY_STATION',
				stationId: '%s'
			}, '*');
		}
		""" % station_id
		JavaScript.eval(js_code)
		# Pause game physics while armory panel is open
		get_tree().paused = true
	else:
		print("[ArmoryStation] Would open: ", station_id)
