extends CharacterBody2D

signal arrived(at_pos: Vector2)

const SPEED    := 130.0
const BASE_PATH := "res://assets/sprites/characters/farmer_tom/"
const DIRS := ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

const ACTION_CONFIGS: Array = [
	{"name": "chop",    "folder": "chopping",   "frame_count": 9, "fps": 8.0},
	{"name": "fish",    "folder": "fishing",    "frame_count": 9, "fps": 5.0},
	{"name": "harvest", "folder": "picking_up", "frame_count": 5, "fps": 8.0},
	{"name": "drink",   "folder": "drinking",   "frame_count": 6, "fps": 6.0},
]

@onready var sprite:      AnimatedSprite2D = $AnimatedSprite2D
@onready var name_label:  Label            = $NameLabel
@onready var placeholder: ColorRect        = $PlaceholderRect

var tile_id:     String = ""
var current_tool:String = ""
var facing:      String = "south"

var _target_pos:  Vector2 = Vector2.ZERO
var _has_target:  bool    = false
var _is_acting:   bool    = false

func _ready() -> void:
	add_to_group("player")
	if PlayerData.has_method("get") and PlayerData.get("player_name") != null:
		name_label.text = PlayerData.player_name
	_target_pos = global_position
	placeholder.visible = false
	_setup_sprite()
	_setup_collision()

func _setup_collision() -> void:
	var col: CollisionShape2D = $CollisionShape2D
	if col and not col.shape:
		var cap := CapsuleShape2D.new()
		cap.radius = 8.0
		cap.height = 16.0
		col.shape = cap
		col.position = Vector2(0, -8)

func _setup_sprite() -> void:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")

	# Idle — single static frame per direction
	for dir in DIRS:
		var tex: Texture2D = load(BASE_PATH + "rotations/%s.png" % dir)
		var idle_anim: String = "idle_" + dir
		frames.add_animation(idle_anim)
		frames.set_animation_loop(idle_anim, true)
		frames.set_animation_speed(idle_anim, 4.0)
		frames.add_frame(idle_anim, tex)

	# Walk — 6-frame cycle per direction
	for dir in DIRS:
		var walk_anim: String = "walk_" + dir
		frames.add_animation(walk_anim)
		frames.set_animation_loop(walk_anim, true)
		frames.set_animation_speed(walk_anim, 10.0)
		for i in 6:
			var path: String = BASE_PATH + "walk/%s/frame_%03d.png" % [dir, i]
			if ResourceLoader.exists(path):
				frames.add_frame(walk_anim, load(path))
			else:
				frames.add_frame(walk_anim, load(BASE_PATH + "rotations/%s.png" % dir))

	# Action animations — individual frame PNGs per direction
	for cfg in ACTION_CONFIGS:
		for dir in DIRS:
			var anim: String = cfg["name"] + "_" + dir
			frames.add_animation(anim)
			frames.set_animation_loop(anim, false)
			frames.set_animation_speed(anim, cfg["fps"])
			for i in cfg["frame_count"]:
				var path: String = BASE_PATH + "%s/%s/frame_%03d.png" % [cfg["folder"], dir, i]
				frames.add_frame(anim, load(path))

	sprite.sprite_frames = frames
	sprite.scale  = Vector2(0.75, 0.75)
	sprite.offset = Vector2(0, -46)
	sprite.animation_finished.connect(_on_action_finished)
	sprite.play("idle_south")

func _on_action_finished() -> void:
	_is_acting = false
	_play_idle()

# ─────────────────────────── MOVEMENT ───────────────────────

func _physics_process(_delta: float) -> void:
	if _is_acting:
		velocity = Vector2.ZERO
		move_and_slide()
		return

	var wasd := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):    wasd.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):  wasd.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):  wasd.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT): wasd.x += 1.0

	if wasd != Vector2.ZERO:
		_has_target = false
		velocity = wasd.normalized() * SPEED
		_update_facing(velocity)
	elif _has_target:
		var dir: Vector2 = _target_pos - global_position
		if dir.length() < 6.0:
			_has_target = false
			velocity = Vector2.ZERO
			arrived.emit(global_position)
		else:
			velocity = dir.normalized() * SPEED
			_update_facing(velocity)
	else:
		velocity = Vector2.ZERO

	move_and_slide()
	_update_walk_anim()

func move_to(world_pos: Vector2) -> void:
	_target_pos = world_pos
	_has_target = true

func _update_facing(dir: Vector2) -> void:
	var deg := fmod(rad_to_deg(dir.angle()) + 360.0, 360.0)
	if   deg < 22.5  or deg >= 337.5: facing = "east"
	elif deg < 67.5:                  facing = "south-east"
	elif deg < 112.5:                 facing = "south"
	elif deg < 157.5:                 facing = "south-west"
	elif deg < 202.5:                 facing = "west"
	elif deg < 247.5:                 facing = "north-west"
	elif deg < 292.5:                 facing = "north"
	else:                             facing = "north-east"

func _update_walk_anim() -> void:
	if _is_acting: return
	var anim: String = ("walk_" if velocity.length() > 1.0 else "idle_") + facing
	if sprite.sprite_frames.has_animation(anim) and sprite.animation != anim:
		sprite.play(anim)

func _play_idle() -> void:
	var anim: String = "idle_" + facing
	if sprite.sprite_frames.has_animation(anim):
		sprite.play(anim)

# ─────────────────────────── ACTIONS ────────────────────────

func equip_tool(tool_id: String) -> void:
	current_tool = tool_id

func play_chop() -> void:
	_play_action("chop")

func play_harvest() -> void:
	_play_action("harvest")

func play_fish() -> void:
	_play_action("fish")

func play_drink() -> void:
	_play_action("drink")

func _play_action(action_name: String) -> void:
	if _is_acting: return
	var anim: String = action_name + "_" + facing
	if not sprite.sprite_frames.has_animation(anim):
		return
	_is_acting = true
	sprite.play(anim)
