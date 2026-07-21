extends "res://scripts/tiles/tile_base.gd"

# ── Fish loot table ───────────────────────────────────────────
const FISH_TABLE := [
	{ "item": "tadpole",         "weight": 20 },
	{ "item": "grey_chubfish",   "weight": 15 },
	{ "item": "yellow_chubfish", "weight": 15 },
	{ "item": "red_chubfish",    "weight": 12 },
	{ "item": "catfish",         "weight": 8  },
	{ "item": "black_crappie",   "weight": 7  },
	{ "item": "orange_bluegill", "weight": 6  },
	{ "item": "blue_bluegill",   "weight": 6  },
	{ "item": "yellow_bluegill", "weight": 5  },
	{ "item": "crucian_carp",    "weight": 5  },
	{ "item": "lotus_carp",      "weight": 3  },
	{ "item": "albino_catfish",  "weight": 2  },
	{ "item": "golden_koi",      "weight": 1  },
]

# ── Pond geometry — rect hw=3.0/hh=2.5 cells × 64px ────────────────
# Inner water cells cx=7-12, cy=5-8  (verts inside |v-center|≤3.0/2.5)
# Shore ring at cx=6/13, cy=4/9
# Screen coords: left shore x=384, right shore x=896 (clamped to walls 390/890)
#                top shore y=168,  bottom shore y=552
const POND_CX    := 640.0
const POND_CY    := 360.0
const POND_LEFT  := 390.0   # clamped to left wall (shore extends to 384 but wall blocks)
const POND_RIGHT := 890.0   # clamped to right wall
const POND_TOP   := 168.0   # vy=4 → canvas 256 → screen 168
const POND_BOT   := 552.0   # vy=10 → canvas 640 → screen 552
# Inner water (excluding sandy shore) — fish and bobber stay here
const WATER_LEFT  := 460.0   # vx=7 edge=448 + inset
const WATER_RIGHT := 820.0   # vx=13 edge=832 - inset
const WATER_TOP   := 245.0   # vy=5 → screen 232 + inset
const WATER_BOT   := 475.0   # vy=9 → screen 488 - inset

# ── Bite window ───────────────────────────────────────────────
const ATTRACT_DELAY_MIN := 2.5   # seconds after cast before a fish moves toward bobber
const ATTRACT_DELAY_MAX := 5.0
const BITE_WINDOW       := 3.0   # seconds player has to click after bite
const FISH_TYPES        := ["lotus_carp", "golden_koi"]
const FISH_COUNT        := 3     # fish spawned per cast

# ── State machine ─────────────────────────────────────────────
enum Phase { IDLE, WALKING, CASTING, WAITING_BITE, BITE_WINDOW, REELING }
var _phase: Phase = Phase.IDLE

# Fishing pole sprite paths
const POLE_CAST_PATH  := "res://assets/sprites/fishing_pole/cast_state.png"
const POLE_BITE_FRAMES := 9  # bite_000.png .. bite_008.png

# Bobber sprite paths — sits out at _bobber_pos (in the water), not the
# shore, so the player has a clear visual cue of where to click.
const BOBBER_IDLE_PATH := "res://assets/sprites/fishing_pole/bobber_idle.png"
const BOBBER_BOB_FRAMES := 9  # bobber_bob_000.png .. bobber_bob_008.png

# ── Runtime nodes ─────────────────────────────────────────────
var _pole_sprite: Sprite2D      = null   # static cast-out visual
var _pole_anim:   AnimatedSprite2D = null # bite bobbing animation
var _bobber_sprite: Sprite2D      = null   # idle bobber, floating in the water
var _bobber_anim:   AnimatedSprite2D = null # bobber dipping when a fish bites
var _fish_layer:  Node2D  = null
var _line:        Line2D  = null
var _bite_label:  Label   = null
var _fish_nodes:  Array   = []

# ── State data ────────────────────────────────────────────────
var _shore_pos:     Vector2 = Vector2.ZERO
var _bobber_pos:    Vector2 = Vector2.ZERO   # always pond center now
var _attract_timer: float   = 0.0
var _bite_timer:    float   = 0.0
var _attractor_idx: int     = -1
var _bob_time:      float   = 0.0
var _pond_waypoints: Array  = []

func _ready() -> void:
	super._ready()
	_build_fish_layer()
	_spawn_fish()  # fish always visible in the pond

func _spawn_slot_grid() -> void:
	super._spawn_slot_grid()  # spawns ring of farming slots around the pond

func _on_slot_activated(grid_pos: Vector2i, action: String, item_id: String) -> void:
	if _phase != Phase.IDLE:
		_reset()  # cancel any active fishing session before handling a farm action
	super._on_slot_activated(grid_pos, action, item_id)

# Pond ring: cols 0-9 where x = 302 + col*68.
# Top/bottom rows use cols 1-8 (x=370..846). Side cols: 0=left (x=302), 9=right (x=914).
func _slot_center_world(grid_pos: Vector2i) -> Vector2:
	var sx := -1.0
	var sy := -1.0
	match grid_pos.y:
		0:  # top strip — cols 1-8
			sx = 302.0 + grid_pos.x * 68.0 + 32.0
			sy = 112.0 + 32.0
		6:  # bottom strip — cols 1-8
			sx = 302.0 + grid_pos.x * 68.0 + 32.0
			sy = 548.0 + 32.0
		1, 2, 3, 4, 5:  # side columns
			sy = 180.0 + (grid_pos.y - 1) * 68.0 + 32.0
			match grid_pos.x:
				0: sx = 302.0 + 32.0   # left grass
				9: sx = 914.0 + 32.0   # right grass
	if sx > 0.0:
		return get_viewport().get_canvas_transform().affine_inverse() * Vector2(sx, sy)
	return super._slot_center_world(grid_pos)

func _slot_screen_pos(grid_pos: Vector2i) -> Vector2:
	var sx := -1.0
	var sy := -1.0
	match grid_pos.y:
		0:
			sx = 302.0 + grid_pos.x * 68.0 + 32.0
			sy = 112.0 + 32.0
		6:
			sx = 302.0 + grid_pos.x * 68.0 + 32.0
			sy = 548.0 + 32.0
		1, 2, 3, 4, 5:
			sy = 180.0 + (grid_pos.y - 1) * 68.0 + 32.0
			match grid_pos.x:
				0: sx = 302.0 + 32.0
				9: sx = 914.0 + 32.0
	if sx > 0.0:
		return Vector2(sx, sy)
	return super._slot_screen_pos(grid_pos)

func _build_fish_layer() -> void:
	_fish_layer = Node2D.new()
	_fish_layer.z_index = 2
	add_child(_fish_layer)

# ── Input ─────────────────────────────────────────────────────

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	var mp: Vector2 = get_viewport().get_mouse_position()
	if not _in_water(mp):
		return
	get_viewport().set_input_as_handled()

	match _phase:
		Phase.IDLE:
			_begin_cast(mp)
		Phase.BITE_WINDOW:
			_reel_in()

func _in_water(screen_pos: Vector2) -> bool:
	return screen_pos.x >= POND_LEFT and screen_pos.x <= POND_RIGHT \
		and screen_pos.y >= POND_TOP  and screen_pos.y <= POND_BOT

# ── Phase: start ──────────────────────────────────────────────

func _begin_cast(click_pos: Vector2) -> void:
	_action_queue.clear()  # cancel any queued farm tasks so fishing walk isn't hijacked
	_pond_waypoints.clear()
	_current_task = {}
	if not PlayerData.spend_energy(1):
		return
	_shore_pos  = _calc_shore(click_pos)
	_bobber_pos = Vector2(POND_CX, POND_CY)  # bobber always lands at pond center
	_phase = Phase.WALKING
	_player.move_to(_shore_pos)

func _calc_shore(click: Vector2) -> Vector2:
	# Find nearest rectangle edge and step outward onto the grass bank
	var dl := click.x - POND_LEFT
	var dr := POND_RIGHT - click.x
	var dt := click.y - POND_TOP
	var db := POND_BOT - click.y
	var m: float = min(dl, min(dr, min(dt, db)))
	if m == dl: return Vector2(POND_LEFT  - 44.0, clamp(click.y, POND_TOP + 10, POND_BOT - 10))
	if m == dr: return Vector2(POND_RIGHT + 44.0, clamp(click.y, POND_TOP + 10, POND_BOT - 10))
	if m == dt: return Vector2(clamp(click.x, POND_LEFT + 10, POND_RIGHT - 10), POND_TOP  - 44.0)
	return         Vector2(clamp(click.x, POND_LEFT + 10, POND_RIGHT - 10), POND_BOT  + 44.0)

# ── Phase: arrived ────────────────────────────────────────────

func _on_player_arrived(at_pos: Vector2) -> void:
	if _phase == Phase.WALKING:
		if at_pos.distance_to(_shore_pos) < 90.0:
			_do_cast()
		else:
			_reset()
		return
	# Step through corner waypoints one at a time
	if not _pond_waypoints.is_empty():
		_player.move_to(_pond_waypoints.pop_front())
		return
	# After the last waypoint the player may be at a corner, not yet at the slot.
	# Move to the actual target if still far; super handles arrival at the slot.
	if not _current_task.is_empty():
		var target: Vector2 = _current_task.get("world_pos", at_pos)
		if at_pos.distance_to(target) > 80.0:
			_player.move_to(target)
			return
	super._on_player_arrived(at_pos)

func _do_cast() -> void:
	_phase = Phase.CASTING
	var dir: Vector2 = Vector2(POND_CX, POND_CY) - _player.global_position
	_player.facing = _dir_name(dir)
	# One-shot cast-out motion, not a loop — it plays once and the player's
	# own _on_action_finished() returns to idle automatically, same as
	# chop/mine/harvest. The old start_fish_loop() looped this animation
	# for the whole wait, which doesn't fit a single "throw the line out"
	# motion like this one.
	_player.play_fish()
	PlayerData.add_xp(1)

	_spawn_pole_sprites()
	_spawn_line()
	_spawn_bite_label()

	_attract_timer = randf_range(ATTRACT_DELAY_MIN, ATTRACT_DELAY_MAX)
	_bob_time = 0.0
	_phase = Phase.WAITING_BITE

# ── Process ───────────────────────────────────────────────────

func _process(delta: float) -> void:
	super._process(delta)   # keeps the player sprite proxy synced
	match _phase:
		Phase.WAITING_BITE:
			_attract_timer -= delta
			_bob_time += delta
			_update_line()
			if _attract_timer <= 0.0 and _attractor_idx < 0:
				_attract_random_fish()

		Phase.BITE_WINDOW:
			_bite_timer -= delta
			_bob_time += delta
			_update_line()
			if _bite_timer <= 0.0:
				_fish_got_away()

# ── Fishing pole sprite ───────────────────────────────────────

func _spawn_pole_sprites() -> void:
	# Static cast sprite — shown during WAITING_BITE
	_pole_sprite = Sprite2D.new()
	_pole_sprite.z_index = 7   # above player proxy (layer=6)
	if ResourceLoader.exists(POLE_CAST_PATH):
		_pole_sprite.texture = load(POLE_CAST_PATH) as Texture2D
	_pole_sprite.scale = Vector2(2.0, 2.0)
	_pole_sprite.global_position = _shore_pos + Vector2(0.0, -24.0)
	add_child(_pole_sprite)

	# Animated bobbing sprite — shown only during BITE_WINDOW
	_pole_anim = AnimatedSprite2D.new()
	_pole_anim.z_index = 7
	_pole_anim.scale = Vector2(2.0, 2.0)
	_pole_anim.global_position = _shore_pos + Vector2(0.0, -24.0)
	_pole_anim.visible = false
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("bite")
	frames.set_animation_loop("bite", true)
	frames.set_animation_speed("bite", 8.0)
	for i in POLE_BITE_FRAMES:
		var path := "res://assets/sprites/fishing_pole/bite_%03d.png" % i
		if ResourceLoader.exists(path):
			frames.add_frame("bite", load(path) as Texture2D)
	_pole_anim.sprite_frames = frames
	add_child(_pole_anim)

	# Idle bobber — floating in the water at _bobber_pos, shown during WAITING_BITE
	_bobber_sprite = Sprite2D.new()
	_bobber_sprite.z_index = 4
	if ResourceLoader.exists(BOBBER_IDLE_PATH):
		_bobber_sprite.texture = load(BOBBER_IDLE_PATH) as Texture2D
	_bobber_sprite.scale = Vector2(1.5, 1.5)
	_bobber_sprite.global_position = _bobber_pos
	add_child(_bobber_sprite)

	# Bobbing dip animation — shown only during BITE_WINDOW, same spot
	_bobber_anim = AnimatedSprite2D.new()
	_bobber_anim.z_index = 4
	_bobber_anim.scale = Vector2(1.5, 1.5)
	_bobber_anim.global_position = _bobber_pos
	_bobber_anim.visible = false
	var bobber_frames := SpriteFrames.new()
	bobber_frames.remove_animation("default")
	bobber_frames.add_animation("bob")
	bobber_frames.set_animation_loop("bob", true)
	bobber_frames.set_animation_speed("bob", 8.0)
	for i in BOBBER_BOB_FRAMES:
		var bpath := "res://assets/sprites/fishing_pole/bobber_bob_%03d.png" % i
		if ResourceLoader.exists(bpath):
			bobber_frames.add_frame("bob", load(bpath) as Texture2D)
	_bobber_anim.sprite_frames = bobber_frames
	add_child(_bobber_anim)

func _show_bite_animation() -> void:
	if is_instance_valid(_pole_sprite): _pole_sprite.visible = false
	if is_instance_valid(_pole_anim):
		_pole_anim.visible = true
		_pole_anim.play("bite")
	if is_instance_valid(_bobber_sprite): _bobber_sprite.visible = false
	if is_instance_valid(_bobber_anim):
		_bobber_anim.visible = true
		_bobber_anim.play("bob")

func _show_cast_animation() -> void:
	if is_instance_valid(_pole_anim):  _pole_anim.visible = false
	if is_instance_valid(_pole_sprite): _pole_sprite.visible = true
	if is_instance_valid(_bobber_anim):   _bobber_anim.visible = false
	if is_instance_valid(_bobber_sprite): _bobber_sprite.visible = true

# ── Fishing line ──────────────────────────────────────────────

func _spawn_line() -> void:
	_line = Line2D.new()
	_line.z_index = 3
	_line.width = 1.0
	_line.default_color = Color(0.7, 0.6, 0.4, 0.9)
	add_child(_line)
	_update_line()

func _update_line() -> void:
	if not is_instance_valid(_line):
		return
	_line.clear_points()
	var tip := _shore_pos + Vector2(0.0, -46.0)
	_line.add_point(tip)
	_line.add_point(_bobber_pos)

# ── Fish ──────────────────────────────────────────────────────

func _spawn_fish() -> void:
	var fish_scene := load("res://scenes/fish/FishSprite.tscn") as PackedScene
	if not fish_scene:
		return
	for i in FISH_COUNT:
		var fish = fish_scene.instantiate()
		fish.fish_type = FISH_TYPES[randi() % FISH_TYPES.size()]
		fish.z_index = 2
		_fish_layer.add_child(fish)           # add first so global_position works
		fish.global_position = _random_water_pos()
		fish.reached_bobber.connect(_on_fish_reached_bobber)
		_fish_nodes.append(fish)

func _random_water_pos() -> Vector2:
	return Vector2(
		randf_range(WATER_LEFT + 20.0, WATER_RIGHT - 20.0),
		randf_range(WATER_TOP  + 20.0, WATER_BOT   - 20.0)
	)

func _attract_random_fish() -> void:
	if _fish_nodes.is_empty():
		return
	_attractor_idx = randi() % _fish_nodes.size()
	var fish = _fish_nodes[_attractor_idx]
	if is_instance_valid(fish):
		fish.attract_to(_bobber_pos)

func _on_fish_reached_bobber() -> void:
	if _phase != Phase.WAITING_BITE:
		return
	_phase = Phase.BITE_WINDOW
	_bite_timer = BITE_WINDOW
	_show_bite_animation()
	if is_instance_valid(_bite_label):
		_bite_label.visible = true

# ── Bite label ────────────────────────────────────────────────

func _spawn_bite_label() -> void:
	_bite_label = Label.new()
	_bite_label.text = "! Click !"
	_bite_label.z_index = 20
	_bite_label.add_theme_color_override("font_color", Color(1.0, 0.9, 0.1))
	_bite_label.add_theme_font_size_override("font_size", 18)
	_bite_label.visible = false
	# Position above the bobber
	_bite_label.global_position = _bobber_pos + Vector2(-28.0, -32.0)
	add_child(_bite_label)

# ── Reel / miss / reset ───────────────────────────────────────

func _reel_in() -> void:
	_phase = Phase.REELING
	_player.stop_fish_loop()
	var fish_id := _roll_fish()
	var is_owner: bool = LandManager.tiles.get(tile_id, {}).get("owner_id", "") == PlayerData.player_id
	if is_owner:
		ResourceManager.add_item(fish_id, 3, true)  # silent — drops_popup handles the notification
		PlayerData.add_xp(2)
		_show_catch(fish_id, 3, false)
	else:
		ResourceManager.add_item(fish_id, 1, true)  # silent — drops_popup handles the notification
		PlayerData.add_xp(1)
		LandManager.add_to_passive_vault(tile_id, fish_id, 2)
		_show_catch(fish_id, 1, true)
	# Remove the caught fish and immediately spawn a replacement so the pond stays full.
	if _attractor_idx >= 0 and _attractor_idx < _fish_nodes.size():
		var caught = _fish_nodes[_attractor_idx]
		if is_instance_valid(caught): caught.queue_free()
		_fish_nodes.remove_at(_attractor_idx)
	var fish_scene := load("res://scenes/fish/FishSprite.tscn") as PackedScene
	if fish_scene:
		var f = fish_scene.instantiate()
		f.fish_type = FISH_TYPES[randi() % FISH_TYPES.size()]
		f.z_index = 2
		_fish_layer.add_child(f)
		f.global_position = _random_water_pos()
		f.reached_bobber.connect(_on_fish_reached_bobber)
		_fish_nodes.append(f)
	_cleanup_fishing()
	_phase = Phase.IDLE

func _fish_got_away() -> void:
	_player.stop_fish_loop()
	if _attractor_idx >= 0 and _attractor_idx < _fish_nodes.size():
		var fish = _fish_nodes[_attractor_idx]
		if is_instance_valid(fish):
			fish.return_to_wander()
	_attractor_idx = -1
	_cleanup_fishing()
	_phase = Phase.IDLE

func _reset() -> void:
	_player.stop_fish_loop()
	for fish in _fish_nodes:
		if is_instance_valid(fish):
			fish.return_to_wander()
	_attractor_idx = -1
	_cleanup_fishing()
	_phase = Phase.IDLE

func _cleanup_fishing() -> void:
	_attractor_idx = -1
	if is_instance_valid(_pole_sprite):
		_pole_sprite.queue_free()
		_pole_sprite = null
	if is_instance_valid(_pole_anim):
		_pole_anim.queue_free()
		_pole_anim = null
	if is_instance_valid(_bobber_sprite):
		_bobber_sprite.queue_free()
		_bobber_sprite = null
	if is_instance_valid(_bobber_anim):
		_bobber_anim.queue_free()
		_bobber_anim = null
	if is_instance_valid(_line):
		_line.queue_free()
		_line = null
	if is_instance_valid(_bite_label):
		_bite_label.queue_free()
		_bite_label = null

# ── Helpers ───────────────────────────────────────────────────

func _dir_name(dir: Vector2) -> String:
	var deg := fmod(rad_to_deg(dir.angle()) + 360.0, 360.0)
	if   deg < 22.5  or deg >= 337.5: return "east"
	elif deg < 67.5:                  return "south-east"
	elif deg < 112.5:                 return "south"
	elif deg < 157.5:                 return "south-west"
	elif deg < 202.5:                 return "west"
	elif deg < 247.5:                 return "north-west"
	elif deg < 292.5:                 return "north"
	else:                             return "north-east"

func _roll_fish() -> String:
	var total := 0
	for e in FISH_TABLE:
		total += e["weight"]
	var roll := randi_range(1, total)
	var running := 0
	for e in FISH_TABLE:
		running += e["weight"]
		if roll <= running:
			return e["item"]
	return FISH_TABLE[0]["item"]

func _show_catch(fish_id: String, player_count: int, split: bool) -> void:
	var ui: CanvasLayer = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	var drops := [{"label": "You caught", "color": Color(0.4, 0.75, 1.0), "items": [{"id": fish_id, "count": player_count}]}]
	if split:
		drops.append({"label": "Owner receives", "color": Color(1.0, 0.88, 0.3), "items": [{"id": fish_id, "count": 2}]})
	ui.show_drops(drops)

# ── Pond perimeter routing ─────────────────────────────────────
# Collision wall positions (from PondTile.tscn, center ± half-size):
#   WaterWallLeft:   center(390,399), size 20×308 → blocks x=380-400, y=245-553
#   WaterWallRight:  center(890,399), size 20×308 → blocks x=880-900, y=245-553
#   WaterWallTop:    center(640,245), size 520×20  → blocks x=380-900, y=235-255
#   WaterWallBottom: center(640,552), size 520×20  → blocks x=380-900, y=542-562
const _WALL_L := 380.0
const _WALL_R := 900.0
const _WALL_T := 235.0
const _WALL_B := 562.0

# Safe corner waypoints on the grass shore, outside all water walls
const _COR_TL := Vector2(300.0, 175.0)   # top of left grass strip
const _COR_TR := Vector2(980.0, 175.0)   # top of right grass strip
const _COR_BL := Vector2(300.0, 600.0)   # bottom of left grass strip
const _COR_BR := Vector2(980.0, 600.0)   # bottom of right grass strip

# Override base _start_next_task to insert corner waypoints before moving
func _start_next_task() -> void:
	if _action_queue.is_empty():
		return
	_repath_attempt = 0
	_current_task = _action_queue.pop_front()
	_pond_waypoints.clear()
	var target: Vector2 = _current_task.get("world_pos", Vector2.ZERO)
	_pond_waypoints = _pond_route(_player.global_position, target)
	if _pond_waypoints.is_empty():
		_player.move_to(target)
	else:
		_player.move_to(_pond_waypoints.pop_front())

# Override base _on_path_cancelled: if a waypoint is blocked, abort the task
func _on_path_cancelled() -> void:
	if not _pond_waypoints.is_empty():
		_pond_waypoints.clear()
		_repath_attempt = 0
		_current_task = {}
		_start_next_task()
		return
	super._on_path_cancelled()

func _pond_route(from: Vector2, to: Vector2) -> Array:
	if not _crosses_walls(from, to):
		return []
	var fz := _pond_zone(from)
	var tz := _pond_zone(to)
	if fz == tz:
		return []
	match [fz, tz]:
		["top",    "left"]:   return [_COR_TL]
		["top",    "right"]:  return [_COR_TR]
		["top",    "bottom"]: return _pick_lr(_COR_TL, _COR_BL, _COR_TR, _COR_BR, from, to)
		["bottom", "top"]:    return _pick_lr(_COR_BL, _COR_TL, _COR_BR, _COR_TR, from, to)
		["bottom", "left"]:   return [_COR_BL]
		["bottom", "right"]:  return [_COR_BR]
		["left",   "top"]:    return [_COR_TL]
		["left",   "bottom"]: return [_COR_BL]
		["left",   "right"]:  return _pick_tb(_COR_TL, _COR_TR, _COR_BL, _COR_BR, from, to)
		["right",  "top"]:    return [_COR_TR]
		["right",  "bottom"]: return [_COR_BR]
		["right",  "left"]:   return _pick_tb(_COR_TR, _COR_TL, _COR_BR, _COR_BL, from, to)
	return []

# Pick between left-side (c1a→c1b) or right-side (c2a→c2b) corner pair
# based on which has shorter total horizontal travel
func _pick_lr(c1a: Vector2, c1b: Vector2, c2a: Vector2, c2b: Vector2,
              from: Vector2, to: Vector2) -> Array:
	var d1 := absf(from.x - c1a.x) + absf(to.x - c1b.x)
	var d2 := absf(from.x - c2a.x) + absf(to.x - c2b.x)
	return [c1a, c1b] if d1 <= d2 else [c2a, c2b]

# Pick between top-side (c1a→c1b) or bottom-side (c2a→c2b) corner pair
# based on which has shorter total vertical travel
func _pick_tb(c1a: Vector2, c1b: Vector2, c2a: Vector2, c2b: Vector2,
              from: Vector2, to: Vector2) -> Array:
	var d1 := absf(from.y - c1a.y) + absf(to.y - c1b.y)
	var d2 := absf(from.y - c2a.y) + absf(to.y - c2b.y)
	return [c1a, c1b] if d1 <= d2 else [c2a, c2b]

# Sample 9 interior points along from→to; return true if any land inside the wall rectangle
func _crosses_walls(from: Vector2, to: Vector2) -> bool:
	for i in 9:
		var p := from.lerp(to, float(i + 1) / 10.0)
		if p.x > _WALL_L and p.x < _WALL_R and p.y > _WALL_T and p.y < _WALL_B:
			return true
	return false

# Classify a screen position by which side of the water walls it's on
func _pond_zone(pos: Vector2) -> String:
	if pos.y <= _WALL_T: return "top"
	if pos.y >= _WALL_B: return "bottom"
	if pos.x <= _WALL_L: return "left"
	return "right"
