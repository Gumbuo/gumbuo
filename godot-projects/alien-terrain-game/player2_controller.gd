extends CharacterBody2D

const SPEED = 200.0

func _physics_process(delta):
	var direction = Vector2.ZERO
	
	# Arrow keys for Player 2
	if Input.is_key_pressed(KEY_LEFT):
		direction.x -= 1
	if Input.is_key_pressed(KEY_RIGHT):
		direction.x += 1
	if Input.is_key_pressed(KEY_UP):
		direction.y -= 1
	if Input.is_key_pressed(KEY_DOWN):
		direction.y += 1
	
	if direction != Vector2.ZERO:
		direction = direction.normalized()
		velocity = direction * SPEED
	else:
		velocity = velocity.move_toward(Vector2.ZERO, SPEED * delta * 10)
	
	move_and_slide()
