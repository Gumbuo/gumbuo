extends Area2D

var speed = 800
var direction = Vector2.RIGHT
var damage = 20

func _ready():
	# Connect collision signal
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)

func _physics_process(delta):
	position += direction * speed * delta

func _on_body_entered(body):
	# Check if we hit a wall (StaticBody2D on layer 8)
	if body is StaticBody2D:
		queue_free()
		return

	# Check if we hit a tank
	if body.has_method("take_damage"):
		# Don't damage friendly tanks
		if is_in_group("enemy_bullet") and body.is_in_group("enemy"):
			return
		if is_in_group("p2_bullet") and body.is_in_group("player2"):
			return
		if not is_in_group("enemy_bullet") and not is_in_group("p2_bullet") and body.is_in_group("player") and not body.is_in_group("enemy"):
			return

		body.take_damage(damage)
		queue_free()

func _on_area_entered(_area):
	pass

func _on_screen_exited():
	queue_free()
