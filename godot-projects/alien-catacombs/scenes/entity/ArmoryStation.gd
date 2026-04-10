extends Area2D

# Armory Station — triggers the web armory UI when the player enters and presses E

export(String) var station_id = "plasmaRefinery"
export(String) var station_name = "Plasma Refinery"
export(String) var station_icon = "🔥"

var player_nearby = false
var label: Label
var pulse_time := 0.0

func _ready():
	add_to_group("armory_station")
	connect("body_entered", self, "_on_body_entered")
	connect("body_exited",  self, "_on_body_exited")
	print("[ArmoryStation] READY — ", station_name, " at global_pos: ", global_position)

	# Interaction prompt label
	label = Label.new()
	label.text = "[E] " + station_name
	label.align = Label.ALIGN_CENTER
	label.rect_position = Vector2(-64, -56)
	label.rect_size    = Vector2(128, 24)
	label.visible = false
	label.add_color_override("font_color", Color(0.4, 0.99, 0.95))
	add_child(label)

func _process(delta):
	pulse_time += delta
	update()

func _draw():
	var pulse = 0.7 + 0.3 * sin(pulse_time * 3.0)
	# Outer glow
	draw_circle(Vector2.ZERO, 22, Color(0.0, pulse, pulse, 0.3))
	# Body
	draw_rect(Rect2(-14, -18, 28, 36), Color(0.05, 0.15, 0.25, 1.0))
	draw_rect(Rect2(-14, -18, 28, 36), Color(0.0, pulse, pulse * 0.8, 1.0), false, 2.0)
	# Screen panel
	draw_rect(Rect2(-9, -13, 18, 16), Color(0.0, pulse * 0.5, pulse * 0.3, 1.0))
	# Indicator lights
	draw_circle(Vector2(-6, 10), 3, Color(0.0, 1.0, 0.6, pulse))
	draw_circle(Vector2(0,  10), 3, Color(pulse, 0.8, 0.0, 1.0))
	draw_circle(Vector2(6,  10), 3, Color(0.2, 0.4, pulse, 1.0))

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
		get_tree().paused = true
	else:
		print("[ArmoryStation] Would open: ", station_id)
