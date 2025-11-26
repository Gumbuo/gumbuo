extends CharacterBody2D

# Movement speed
var speed = 300

func _physics_process(delta):
    # Get input direction
    var direction = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    
    # Set velocity
    velocity = direction * speed
    
    # Move the character
    move_and_slide()
    
    # Update animations based on direction (you will set these up in the editor)
    update_animation(direction)

func update_animation(direction):
    if direction.length() > 0:
        # The animation names like "walk_south", "walk_north", etc., 
        # should match the names you create in the SpriteFrames editor.
        if direction.x > 0:
            $AnimatedSprite2D.play("walk_east")
        elif direction.x < 0:
            $AnimatedSprite2D.play("walk_west")
        elif direction.y > 0:
            $AnimatedSprite2D.play("walk_south")
        elif direction.y < 0:
            $AnimatedSprite2D.play("walk_north")
    else:
        # Play an idle animation if the character is not moving
        # You can create an "idle_south" animation for the default standing pose
        $AnimatedSprite2D.play("idle_south")

