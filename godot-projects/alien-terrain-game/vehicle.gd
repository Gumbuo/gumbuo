extends Area2D

class_name Vehicle

# Vehicle properties
export var vehicle_name = "Vehicle"
export var vehicle_speed = 150

# Reference to player currently in vehicle
var player_inside = null
var is_occupied = false

func _ready():
	# Connect signals for collision detection
	connect("body_entered", self, "_on_body_entered")
	connect("body_exited", self, "_on_body_exited")

func _on_body_entered(body):
	# Check if it's the player
	if body.is_in_group("player"):
		print(vehicle_name + " - Player nearby, press 'E' to enter")
		# You could show UI hint here

func _on_body_exited(body):
	if body.is_in_group("player"):
		print("Player left " + vehicle_name + " area")

func _input(event):
	# Handle player entering/exiting vehicle
	if event.is_action_pressed("ui_accept") or (event is InputEventKey and event.scancode == KEY_E and event.pressed):
		if is_occupied and player_inside:
			# Exit vehicle
			exit_vehicle()
		else:
			# Try to enter vehicle
			attempt_enter()

func attempt_enter():
	# Find nearby player
	var bodies = get_overlapping_bodies()
	for body in bodies:
		if body.is_in_group("player") and not is_occupied:
			enter_vehicle(body)
			break

func enter_vehicle(player):
	print("Player entering " + vehicle_name)
	player_inside = player
	is_occupied = true

	# Disable player's normal movement
	if player.has_method("set_can_move"):
		player.set_can_move(false)

	# Hide player or attach them to vehicle
	player.hide()

	# Now vehicle controls the movement
	set_physics_process(true)

func exit_vehicle():
	print("Player exiting " + vehicle_name)

	if player_inside:
		# Re-enable player movement
		if player_inside.has_method("set_can_move"):
			player_inside.set_can_move(true)

		# Show player again
		player_inside.show()

		# Position player next to vehicle
		player_inside.global_position = global_position + Vector2(50, 0)

	player_inside = null
	is_occupied = false
	set_physics_process(false)

func _physics_process(delta):
	if not is_occupied:
		return

	# Vehicle movement controls
	var velocity = Vector2.ZERO

	if Input.is_action_pressed("move_up"):
		velocity.y -= 1
	if Input.is_action_pressed("move_down"):
		velocity.y += 1
	if Input.is_action_pressed("move_left"):
		velocity.x -= 1
	if Input.is_action_pressed("move_right"):
		velocity.x += 1

	if velocity.length() > 0:
		velocity = velocity.normalized() * vehicle_speed
		global_position += velocity * delta
