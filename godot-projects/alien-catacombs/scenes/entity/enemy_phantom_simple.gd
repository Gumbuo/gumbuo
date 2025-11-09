extends "res://scenes/entity/enemy_klackon.gd"

# Override animation to prevent frame cycling
func animation():
	# Phantom uses a single static sprite - no animation
	pass

func _ready():
	._ready()
	# Set sprite to not use frames
	if sprite:
		sprite.frame = 0
	# Disable frame animation
	total_frames = 1
