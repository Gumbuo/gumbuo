extends Area2D

export var speed = 200
var direction = Vector2.RIGHT
var damage = 10
var is_enemy_bullet = false  # If true, damages player. If false, damages enemies

# Audio
var hit_sound = AudioStreamPlayer.new()

func _ready():
	# Setup hit sound
	hit_sound.stream = load("res://asset/sounds/0989b53bb47e5aa49e45669c5b3fa2d8607836fe7d797e30ee035f2d56d3ab3e-EnemyKnocked.ogg")
	hit_sound.volume_db = -3
	add_child(hit_sound)

	# Auto-destroy bullet after 2 seconds if it doesn't hit anything
	var timer = Timer.new()
	timer.wait_time = 2.0
	timer.one_shot = true
	timer.connect("timeout", self, "_on_timeout")
	add_child(timer)
	timer.start()

	# Connect to body entered signal
	connect("body_entered", self, "_on_body_entered")

func _physics_process(delta):
	position += direction * speed * delta

func _on_body_entered(body):
	print("Bullet hit: ", body.name, " Type: ", body.get_class())

	# Enemy bullets damage players only
	if is_enemy_bullet:
		# Check if hit player
		if body.is_in_group("player") or body.name == "player":
			print("Enemy bullet hit player!")
			if body.has_node("Health"):
				var health = body.get_node("Health")
				if health.has_method("take_damage"):
					print("Dealing ", damage, " damage to player")
					health.take_damage(damage)
					# Play hit sound
					hit_sound.play()
					# Hide bullet visually but keep it alive for sound
					$ColorRect.visible = false
					set_physics_process(false)
					# Destroy after sound plays
					yield(get_tree().create_timer(0.3), "timeout")
					queue_free()
		# Hit a wall
		elif body is TileMap or body is StaticBody2D:
			print("Hit wall, destroying bullet")
			queue_free()
		# Ignore other enemies
		return

	# Player bullets damage enemies only
	else:
		# Ignore player
		if body.is_in_group("player") or body.name == "player":
			print("Ignoring player")
			return

		# Check if hit an enemy (enemies have a health node and are NOT the player)
		if body.has_node("Health"):
			print("Found Health node!")
			var health = body.get_node("Health")
			if health.has_method("take_damage"):
				print("Dealing ", damage, " damage to enemy")
				health.take_damage(damage)
				# Play hit sound
				hit_sound.play()
				# Hide bullet visually but keep it alive for sound
				$ColorRect.visible = false
				set_physics_process(false)
				# Destroy after sound plays
				yield(get_tree().create_timer(0.3), "timeout")
				queue_free()
		# Hit a wall
		elif body is TileMap or body is StaticBody2D:
			print("Hit wall, destroying bullet")
			# Don't play sound for walls, just destroy
			queue_free()
		else:
			print("Hit unknown object: ", body)

func _on_timeout():
	queue_free()
