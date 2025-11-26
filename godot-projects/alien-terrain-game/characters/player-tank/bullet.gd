extends Area2D

var speed = 1000
var direction = Vector2.RIGHT

func _physics_process(delta):
    position += direction * speed * delta

# This function is connected to a VisibleOnScreenNotifier2D node in the bullet scene.
# It will automatically destroy the bullet when it goes off-screen to save memory.
func _on_screen_exited():
    queue_free()
