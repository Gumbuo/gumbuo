extends Node2D

# Pure GDScript visual — no texture assets, always renders

var pulse_time := 0.0

func _process(delta):
	pulse_time += delta
	update()

func _draw():
	var pulse = 0.7 + 0.3 * sin(pulse_time * 3.0)
	# Outer glow ring
	draw_circle(Vector2.ZERO, 22, Color(0.0, pulse, pulse, 0.3))
	# Main body
	draw_rect(Rect2(-14, -18, 28, 36), Color(0.05, 0.15, 0.25, 1.0))
	draw_rect(Rect2(-14, -18, 28, 36), Color(0.0, pulse, pulse * 0.8, 1.0), false, 2.0)
	# Screen panel
	draw_rect(Rect2(-9, -13, 18, 16), Color(0.0, pulse * 0.5, pulse * 0.3, 1.0))
	# Indicator lights
	draw_circle(Vector2(-6, 10), 3, Color(0.0, 1.0, 0.6, pulse))
	draw_circle(Vector2(0,  10), 3, Color(pulse, 0.8, 0.0, 1.0))
	draw_circle(Vector2(6,  10), 3, Color(0.2, 0.4, pulse, 1.0))
