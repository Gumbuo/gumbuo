extends Area2D

export var speed = 200
var direction = Vector2.RIGHT
var damage = 10
var is_enemy_bullet = false  # If true, damages player. If false, damages enemies
var bullet_texture: Texture = null  # Custom texture for this bullet

# Audio
var hit_sound = AudioStreamPlayer.new()

func _ready():
	# Setup hit sound
	hit_sound.stream = load("res://asset/sounds/0989b53bb47e5aa49e45669c5b3fa2d8607836fe7d797e30ee035f2d56d3ab3e-EnemyKnocked.ogg")
	hit_sound.volume_db = -3
	add_child(hit_sound)

	# Use custom texture if provided
	if bullet_texture:
		$Sprite.texture = bullet_texture

	# Make sprite visible
	$Sprite.visible = true

	# DEBUG
	print("Bullet created at position: ", global_position)
	print("Bullet direction: ", direction)
	print("Bullet z_index: ", z_index)
	print("Bullet Sprite visible: ", $Sprite.visible)
	print("Bullet Sprite texture: ", $Sprite.texture)

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
		# Ignore enemies (don't hit the shooter or other enemies)
		if body.is_in_group("enemy") or body.get_class() == "KinematicBody2D" and not body.is_in_group("player"):
			print("Enemy bullet ignoring enemy")
			return

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
					$Sprite.visible = false
					set_physics_process(false)
					# Destroy after sound plays
					yield(get_tree().create_timer(0.3), "timeout")
					queue_free()
					return
		# Hit a wall
		elif body is TileMap or body is StaticBody2D:
			print("Hit wall, destroying bullet")
			queue_free()
			return
		# Ignore everything else
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

			# Trigger hurt state/animation via hurtbox if available
			if body.has_node("Hurtbox"):
				var hurtbox = body.get_node("Hurtbox")
				if hurtbox.has_method("_on_area_entered"):
					# Create a temporary area to trigger the hurtbox
					# This triggers the full hurt system including animation
					print("Triggering hurtbox hurt state")
					if body.has_method("_on_hit_received"):
						body._on_hit_received(damage, 200, global_position)

			# Also damage health directly as fallback
			var health = body.get_node("Health")
			if health.has_method("take_damage"):
				print("Dealing ", damage, " damage to enemy")
				health.take_damage(damage)

			# Play hit sound
			hit_sound.play()
			# Hide bullet visually but keep it alive for sound
			$Sprite.visible = false
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
	print("Bullet destroyed by timeout")
	queue_free()

func _exit_tree():
	print("Bullet removed from scene at position: ", global_position)
