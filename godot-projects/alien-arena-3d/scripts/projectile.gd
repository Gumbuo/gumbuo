extends Area3D

var direction: Vector3 = Vector3.FORWARD
var speed: float = 20.0
var damage: int = 20
var lifetime: float = 3.0
var shooter = null

func _ready():
	body_entered.connect(_on_body_entered)
	# Destroy after lifetime
	await get_tree().create_timer(lifetime).timeout
	queue_free()

func _physics_process(delta):
	global_position += direction * speed * delta

func _on_body_entered(body):
	if body == shooter:
		return

	if body.has_method("take_damage"):
		body.take_damage(damage, shooter)

	# Create hit effect
	spawn_hit_effect()
	queue_free()

func spawn_hit_effect():
	# Simple particle burst on hit
	pass
