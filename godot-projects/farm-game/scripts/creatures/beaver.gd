extends Node2D

# PvE enemy: wanders a farm tile, eats ready crops off soil plots, and both
# can be challenged by the player and initiates its own attack if the player
# wanders too close. Implements the same enter_combat()/exit_combat()/
# play_combat_anim() contract as player.gd/remote_player.gd, so tile_base.gd's
# existing _run_combat() sequencer drives it identically to a PvP fight —
# no changes needed to CombatSim.

const BASE_PATH := "res://assets/sprites/characters/evil_beaver/"
const DIRS := ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

const ANIM_CONFIGS: Array = [
	{"name": "wander",    "folder": "wander",    "frame_count": 9, "fps": 6.0,  "loop": true},
	{"name": "eat",       "folder": "eat",       "frame_count": 9, "fps": 6.0,  "loop": false},
	{"name": "attack",    "folder": "attack",    "frame_count": 9, "fps": 10.0, "loop": false},
	{"name": "hit_react", "folder": "hit_react", "frame_count": 9, "fps": 10.0, "loop": false},
	{"name": "death",     "folder": "death",     "frame_count": 9, "fps": 8.0,  "loop": false},
]

const WANDER_SPEED := 30.0
const WANDER_CHANGE := 3.0
const SEEK_SPEED := 45.0
const EAT_CHECK_INTERVAL := 4.0
const ARRIVE_EPSILON := 14.0
const AGGRO_RADIUS := 70.0
const POST_COMBAT_COOLDOWN := 6.0  # avoid re-aggroing the instant a fight ends

# Roughly the visible walkable area of a farm tile (grass + slot grid),
# clear of the HUD chrome at the very top/bottom.
const WALK_BOUNDS_MIN := Vector2(200.0, 140.0)
const WALK_BOUNDS_MAX := Vector2(1080.0, 600.0)

enum State { WANDER, SEEK_CROP, EATING }

var combat_id: String = ""
var tile_id: String = ""

var _tile: Node = null
# The real animation state lives on a hidden sprite parented directly to this
# Node2D (in the tile's normal 2D space, so world-position math stays simple).
# What's actually drawn is a mirror sprite one CanvasLayer up (layer 6, same
# as tile_base.gd's own player-proxy trick) — SlotGrid's item icons render on
# their own CanvasLayer (layer 5), so a plain Node2D here would always draw
# underneath them regardless of z_index; only a higher CanvasLayer wins.
var _sprite: AnimatedSprite2D = AnimatedSprite2D.new()
var _proxy_layer: CanvasLayer = null
var _proxy_sprite: AnimatedSprite2D = null
var _state: State = State.WANDER
var _facing: String = "south"
var _velocity: Vector2 = Vector2.ZERO
var _wander_timer: float = 0.0
var _eat_check_timer: float = 0.0
var _target_slot_pos: Vector2i = Vector2i(-1, -1)
var _target_world_pos: Vector2 = Vector2.ZERO
var _in_combat: bool = false
var _dying: bool = false
var _combat_cooldown: float = 0.0

func setup(p_tile_id: String, tile: Node) -> void:
	tile_id = p_tile_id
	_tile = tile
	combat_id = "beaver_%d" % get_instance_id()
	global_position = Vector2(
		randf_range(WALK_BOUNDS_MIN.x, WALK_BOUNDS_MAX.x),
		randf_range(WALK_BOUNDS_MIN.y, WALK_BOUNDS_MAX.y)
	)

func _ready() -> void:
	add_child(_sprite)
	_setup_sprite()
	_setup_proxy()
	_pick_wander_dir()

func _setup_sprite() -> void:
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

	for cfg in ANIM_CONFIGS:
		for dir in DIRS:
			var anim: String = cfg["name"] + "_" + dir
			frames.add_animation(anim)
			frames.set_animation_loop(anim, cfg["loop"])
			frames.set_animation_speed(anim, cfg["fps"])
			for i in cfg["frame_count"]:
				var path: String = BASE_PATH + "%s/%s/frame_%03d.png" % [cfg["folder"], dir, i]
				if ResourceLoader.exists(path):
					frames.add_frame(anim, load(path))

	_sprite.sprite_frames = frames
	_sprite.scale = Vector2(1.2, 1.2)
	_sprite.offset = Vector2(0, -46)
	_sprite.visible = false  # hidden — only drives animation state, see _proxy_sprite
	_sprite.animation_finished.connect(_on_anim_finished)
	_sprite.play("idle_south")

func _setup_proxy() -> void:
	_proxy_layer = CanvasLayer.new()
	_proxy_layer.layer = 6
	_proxy_layer.follow_viewport_enabled = true
	add_child(_proxy_layer)

	_proxy_sprite = AnimatedSprite2D.new()
	_proxy_sprite.sprite_frames = _sprite.sprite_frames
	_proxy_sprite.scale = _sprite.scale
	_proxy_sprite.offset = _sprite.offset
	_proxy_layer.add_child(_proxy_sprite)

func _on_anim_finished() -> void:
	if _in_combat:
		return
	if _state == State.EATING:
		_finish_eating()

# ─────────────────────────── AI LOOP ─────────────────────────

func _process(delta: float) -> void:
	if _in_combat:
		_sync_proxy()
		return
	if _combat_cooldown > 0.0:
		_combat_cooldown -= delta
	_check_aggro()
	if _in_combat:
		_sync_proxy()
		return  # aggro may have just started a fight this frame

	match _state:
		State.WANDER:
			_wander_timer -= delta
			if _wander_timer <= 0.0:
				_pick_wander_dir()
			global_position += _velocity * delta
			_clamp_to_bounds()
			_update_walk_anim()
			_eat_check_timer -= delta
			if _eat_check_timer <= 0.0:
				_eat_check_timer = EAT_CHECK_INTERVAL
				_try_start_seek_crop()
		State.SEEK_CROP:
			var to_target: Vector2 = _target_world_pos - global_position
			if to_target.length() < ARRIVE_EPSILON:
				_start_eating()
			else:
				_velocity = to_target.normalized() * SEEK_SPEED
				_update_facing(_velocity)
				global_position += _velocity * delta
				_update_walk_anim()
		State.EATING:
			pass  # animation-driven, see _on_anim_finished

	_sync_proxy()

func _sync_proxy() -> void:
	if not is_instance_valid(_proxy_sprite):
		return
	_proxy_sprite.position = global_position
	if _proxy_sprite.animation != _sprite.animation or not _proxy_sprite.is_playing():
		_proxy_sprite.play(_sprite.animation)
	_proxy_sprite.frame = _sprite.frame

func _pick_wander_dir() -> void:
	var angle := randf() * TAU
	_velocity = Vector2(cos(angle), sin(angle)) * WANDER_SPEED
	_wander_timer = randf_range(1.5, WANDER_CHANGE)

func _clamp_to_bounds() -> void:
	var clamped: Vector2 = global_position.clamp(WALK_BOUNDS_MIN, WALK_BOUNDS_MAX)
	if clamped != global_position:
		global_position = clamped
		_pick_wander_dir()

func _update_facing(dir: Vector2) -> void:
	var deg := fmod(rad_to_deg(dir.angle()) + 360.0, 360.0)
	if   deg < 22.5  or deg >= 337.5: _facing = "east"
	elif deg < 67.5:                  _facing = "south-east"
	elif deg < 112.5:                 _facing = "south"
	elif deg < 157.5:                 _facing = "south-west"
	elif deg < 202.5:                 _facing = "west"
	elif deg < 247.5:                 _facing = "north-west"
	elif deg < 292.5:                 _facing = "north"
	else:                             _facing = "north-east"

func _update_walk_anim() -> void:
	_update_facing(_velocity)
	var anim: String = ("wander_" if _velocity.length() > 1.0 else "idle_") + _facing
	if _sprite.sprite_frames.has_animation(anim) and _sprite.animation != anim:
		_sprite.play(anim)

func _play_idle() -> void:
	var anim: String = "idle_" + _facing
	if _sprite.sprite_frames.has_animation(anim):
		_sprite.play(anim)

# ─────────────────────────── EATING ──────────────────────────

func _try_start_seek_crop() -> void:
	if not is_instance_valid(_tile):
		return
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var best_pos := Vector2i(-1, -1)
	var best_dist := INF
	for key in slots:
		var data: Dictionary = slots[key]
		if not data.get("is_anchor", false): continue
		if data.get("item_id", "") != "soil_plot": continue
		if data.get("state", "") != "ready": continue
		var parts: PackedStringArray = key.split(",")
		if parts.size() != 2: continue
		var gp := Vector2i(int(parts[0]), int(parts[1]))
		var wp: Vector2 = _tile.call("_slot_center_world", gp)
		var d: float = global_position.distance_to(wp)
		if d < best_dist:
			best_dist = d
			best_pos = gp
			_target_world_pos = wp
	if best_pos.x < 0:
		return
	_target_slot_pos = best_pos
	_state = State.SEEK_CROP

func _start_eating() -> void:
	_velocity = Vector2.ZERO
	_state = State.EATING
	var anim: String = "eat_" + _facing
	if _sprite.sprite_frames.has_animation(anim):
		_sprite.play(anim)
	else:
		_finish_eating()

func _finish_eating() -> void:
	if _target_slot_pos.x >= 0 and LandManager.tiles.has(tile_id):
		LandManager.harvest_crop(tile_id, _target_slot_pos)
	_target_slot_pos = Vector2i(-1, -1)
	_state = State.WANDER
	_pick_wander_dir()

# ─────────────────────────── AGGRO ───────────────────────────

func _check_aggro() -> void:
	if _combat_cooldown > 0.0 or not is_instance_valid(_tile):
		return
	var player = _tile.get("_player")
	if player == null or not is_instance_valid(player):
		return
	if global_position.distance_to(player.global_position) <= AGGRO_RADIUS:
		if _tile.has_method("start_beaver_combat"):
			_tile.call("start_beaver_combat", self)

# ─────────────────────────── COMBAT ──────────────────────────
# Same contract as player.gd/remote_player.gd — driven externally by
# tile_base.gd's _run_combat(), which doesn't know or care this isn't a
# real player.

func enter_combat() -> void:
	_in_combat = true
	_velocity = Vector2.ZERO

func exit_combat() -> void:
	_in_combat = false
	if _dying:
		queue_free()
		return
	_combat_cooldown = POST_COMBAT_COOLDOWN
	_play_idle()

func play_combat_anim(anim_name: String) -> void:
	var mapped: String
	match anim_name:
		"fight_idle":
			mapped = "idle"
		"punch", "kick":
			mapped = "attack"
		"hit_react":
			mapped = "hit_react"
		"death":
			mapped = "death"
			_dying = true
		_:
			mapped = "idle"
	var anim: String = mapped + "_" + _facing
	if _sprite.sprite_frames.has_animation(anim):
		_sprite.play(anim)
