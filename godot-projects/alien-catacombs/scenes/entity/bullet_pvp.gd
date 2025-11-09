extends "res://scenes/entity/bullet.gd"

# PvP support - track who shot the bullet
var owner_id = -1  # ID of the player who shot this bullet
var is_pvp = true  # Enable PvP mode

func set_owner_id(id):
	owner_id = id

func _on_body_entered(body):
	print("PvP Bullet hit: ", body.name, " Type: ", body.get_class())

	# In PvP mode, bullets can damage ALL players except the shooter
	if is_pvp:
		# Check if hit a player
		if body.is_in_group("player") or body.name.begins_with("Player"):
			# Get the player's network ID
			var target_player_id = -1
			if body.has_method("get_player_id"):
				target_player_id = body.player_id

			# Don't damage the player who shot the bullet
			if target_player_id == owner_id:
				print("Ignoring bullet owner")
				return

			print("PvP bullet hit player ", target_player_id, " from player ", owner_id)

			# Deal damage to the other player
			if body.has_node("Health"):
				var health = body.get_node("Health")
				if health.has_method("take_damage"):
					print("Dealing ", damage, " PvP damage to player")

					# Sync damage across network
					if get_tree().network_peer and get_tree().is_network_server():
						rpc("sync_damage", body.get_path(), damage)
					else:
						# Call locally
						health.take_damage(damage)

					# Play hit sound
					if hit_sound:
						hit_sound.play()
					# Hide bullet visually but keep it alive for sound
					if has_node("Sprite"):
						$Sprite.visible = false
					set_physics_process(false)
					# Destroy after sound plays
					yield(get_tree().create_timer(0.3), "timeout")
					queue_free()
			return

		# Hit a wall or other object
		elif body is TileMap or body is StaticBody2D:
			print("Hit wall, destroying bullet")
			queue_free()
			return

		# Also damage enemies
		elif body.has_node("Health") and not body.is_in_group("player"):
			var health = body.get_node("Health")
			if health.has_method("take_damage"):
				print("Dealing ", damage, " damage to enemy")
				health.take_damage(damage)
				if hit_sound:
					hit_sound.play()
				if has_node("Sprite"):
					$Sprite.visible = false
				set_physics_process(false)
				yield(get_tree().create_timer(0.3), "timeout")
				queue_free()
			return

# Sync damage across all clients
remotesync func sync_damage(target_path, damage_amount):
	var target = get_node(target_path)
	if target and target.has_node("Health"):
		var health = target.get_node("Health")
		if health.has_method("take_damage"):
			health.take_damage(damage_amount)
