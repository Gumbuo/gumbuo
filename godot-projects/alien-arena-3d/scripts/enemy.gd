extends CharacterBody3D

signal died

@export var enemy_type: String = "fire_elemental"
@export var speed: float = 3.0
@export var max_health: int = 50
@export var damage: int = 15
@export var attack_range: float = 1.5
@export var attack_cooldown: float = 1.0

var health: int = 50
var can_attack: bool = true
var is_dead: bool = false
var target: Node3D = null
var direction_name: String = "south"

# Animation system
var current_anim: String = "breathing-idle"
var anim_frames: Array = []
var anim_frame: int = 0
var anim_timer: float = 0.0
var anim_speed: float = 0.18
var is_attacking: bool = false
var attack_timer: float = 0.0

@onready var sprite: Sprite3D = $Sprite3D
@onready var attack_area: Area3D = $AttackArea

func _ready():
	health = max_health
	add_to_group("enemies")

	# Find nearest player as target
	find_target()

	# Load initial animation
	load_animation("breathing-idle", "south")

func find_target():
	var players = get_tree().get_nodes_in_group("players")
	if players.size() == 0:
		# If no group, try finding by name
		var arena = get_parent()
		if arena:
			var p1 = arena.get_node_or_null("Player1")
			var p2 = arena.get_node_or_null("Player2")
			players = []
			if p1: players.append(p1)
			if p2: players.append(p2)

	if players.size() > 0:
		# Target closest player
		var closest_dist = INF
		for player in players:
			if player.is_dead if player.has_method("is_dead") else false:
				continue
			var dist = global_position.distance_to(player.global_position)
			if dist < closest_dist:
				closest_dist = dist
				target = player

func load_animation(anim_name: String, dir_name: String):
	anim_frames.clear()
	var base_path = "res://assets/sprites/enemies/" + enemy_type + "/animations/" + anim_name + "/" + dir_name + "/"

	# Try to load frames
	for i in range(16):
		var frame_path = base_path + "frame_%03d.png" % i
		if ResourceLoader.exists(frame_path):
			anim_frames.append(load(frame_path))
		else:
			break

	# Fallback to rotations
	if anim_frames.size() == 0:
		var static_path = "res://assets/sprites/enemies/" + enemy_type + "/rotations/" + dir_name + ".png"
		if ResourceLoader.exists(static_path):
			anim_frames.append(load(static_path))

	anim_frame = 0
	anim_timer = 0.0
	if anim_frames.size() > 0:
		sprite.texture = anim_frames[0]

func update_animation(delta):
	if anim_frames.size() <= 1:
		return

	anim_timer += delta
	if anim_timer >= anim_speed:
		anim_timer = 0.0
		anim_frame = (anim_frame + 1) % anim_frames.size()
		sprite.texture = anim_frames[anim_frame]

func set_animation(anim_name: String):
	if current_anim != anim_name:
		current_anim = anim_name
		load_animation(anim_name, direction_name)

func _physics_process(delta):
	if is_dead:
		return

	update_animation(delta)

	# Handle attack timer
	if is_attacking:
		attack_timer -= delta
		if attack_timer <= 0:
			is_attacking = false

	# Re-find target periodically
	if target == null or (target.has_method("is_dead") and target.is_dead):
		find_target()

	if target == null:
		velocity = Vector3.ZERO
		set_animation("breathing-idle")
		move_and_slide()
		return

	# Move towards target
	var direction = (target.global_position - global_position)
	direction.y = 0
	var distance = direction.length()

	if distance > attack_range:
		# Move towards player
		direction = direction.normalized()
		velocity = direction * speed
		update_direction_name(direction)
		if not is_attacking:
			set_animation("walking-8-frames")
	else:
		# In range - attack!
		velocity = Vector3.ZERO
		if can_attack and not is_attacking:
			attack()
		elif not is_attacking:
			set_animation("fight-stance-idle-8-frames")

	move_and_slide()

func update_direction_name(dir: Vector3):
	# Use atan2(z, x) for proper screen-space angles
	var angle = atan2(dir.z, dir.x)
	var deg = rad_to_deg(angle)
	if deg < 0:
		deg += 360

	var new_direction = "east"
	if deg >= 337.5 or deg < 22.5:
		new_direction = "east"       # 0° = right
	elif deg >= 22.5 and deg < 67.5:
		new_direction = "south-east" # 45° = down-right
	elif deg >= 67.5 and deg < 112.5:
		new_direction = "south"      # 90° = down
	elif deg >= 112.5 and deg < 157.5:
		new_direction = "south-west" # 135° = down-left
	elif deg >= 157.5 and deg < 202.5:
		new_direction = "west"       # 180° = left
	elif deg >= 202.5 and deg < 247.5:
		new_direction = "north-west" # 225° = up-left
	elif deg >= 247.5 and deg < 292.5:
		new_direction = "north"      # 270° = up
	elif deg >= 292.5 and deg < 337.5:
		new_direction = "north-east" # 315° = up-right

	if new_direction != direction_name:
		direction_name = new_direction
		load_animation(current_anim, direction_name)

func attack():
	can_attack = false
	is_attacking = true
	attack_timer = 0.5
	set_animation("cross-punch")

	# Deal damage to target
	if target and global_position.distance_to(target.global_position) <= attack_range + 0.5:
		if target.has_method("take_damage"):
			target.take_damage(damage, self)

	# Reset attack after cooldown
	await get_tree().create_timer(attack_cooldown).timeout
	can_attack = true

func take_damage(amount: int, attacker = null):
	if is_dead:
		return

	health -= amount

	# Flash white (damage indicator)
	sprite.modulate = Color(2, 2, 2, 1)
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color.WHITE

	if health <= 0:
		die()

func die():
	is_dead = true
	died.emit()

	# Simple death animation - fade out
	var tween = create_tween()
	tween.tween_property(sprite, "modulate:a", 0.0, 0.5)
	await tween.finished
	queue_free()
