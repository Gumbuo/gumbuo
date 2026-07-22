extends Node2D

# Lightweight visual-only stand-in for another live player sharing the same
# tile — no input, no collision, no action animations. Just idle/walk in the
# 8 compass directions, smoothly interpolated toward whatever position the
# presence poll last reported (updates arrive every ~1.2s, so without
# interpolation movement would look like teleporting between spots).

const BASE_PATH := "res://assets/sprites/characters/evil_fox/"
const DIRS := ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]
const LERP_SPEED := 6.0
const ARRIVED_EPSILON := 2.0

var wallet: String = ""

var _sprite: AnimatedSprite2D = null
var _name_label: Label = null
var _target_pos: Vector2 = Vector2.ZERO
var _facing: String = "south"
var _has_target: bool = false
var _snapped: bool = false

func _ready() -> void:
	_sprite = AnimatedSprite2D.new()
	add_child(_sprite)
	_setup_frames()

	_name_label = Label.new()
	_name_label.text = "Player"
	_name_label.position = Vector2(-46, -108)
	_name_label.size = Vector2(92, 16)
	_name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name_label.add_theme_font_size_override("font_size", 9)
	_name_label.add_theme_color_override("font_color", Color(0.75, 0.85, 1.0))
	_name_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	_name_label.add_theme_constant_override("shadow_offset_x", 1)
	_name_label.add_theme_constant_override("shadow_offset_y", 1)
	add_child(_name_label)

func _setup_frames() -> void:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	for dir in DIRS:
		var idle_anim: String = "idle_" + dir
		frames.add_animation(idle_anim)
		frames.set_animation_loop(idle_anim, true)
		frames.set_animation_speed(idle_anim, 4.0)
		var rot_path: String = BASE_PATH + "rotations/%s.png" % dir
		if ResourceLoader.exists(rot_path):
			frames.add_frame(idle_anim, load(rot_path))

		var walk_anim: String = "walk_" + dir
		frames.add_animation(walk_anim)
		frames.set_animation_loop(walk_anim, true)
		frames.set_animation_speed(walk_anim, 10.0)
		for i in 6:
			var path: String = BASE_PATH + "walk/%s/frame_%03d.png" % [dir, i]
			if ResourceLoader.exists(path):
				frames.add_frame(walk_anim, load(path))
			elif ResourceLoader.exists(rot_path):
				frames.add_frame(walk_anim, load(rot_path))
	_sprite.sprite_frames = frames
	_sprite.scale = Vector2(1.2, 1.2)
	_sprite.offset = Vector2(0, -46)
	_sprite.play("idle_south")

func set_player_name(n: String) -> void:
	if _name_label:
		_name_label.text = n

func update_target(world_pos: Vector2, facing: String) -> void:
	_target_pos = world_pos
	_facing = facing
	_has_target = true
	# First update after spawning — snap instead of gliding in from wherever
	# the node happened to be created.
	if not _snapped:
		_snapped = true
		global_position = world_pos

func _process(delta: float) -> void:
	if not _has_target:
		return
	var moving: bool = global_position.distance_to(_target_pos) > ARRIVED_EPSILON
	if moving:
		global_position = global_position.lerp(_target_pos, clamp(delta * LERP_SPEED, 0.0, 1.0))
	var anim: String = ("walk_" if moving else "idle_") + _facing
	if _sprite.sprite_frames.has_animation(anim) and _sprite.animation != anim:
		_sprite.play(anim)
