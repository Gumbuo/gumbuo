extends "res://scripts/tiles/tile_base.gd"

const SPAWN_INTERVAL := 3 * 3600

func _check_wild_spawn(timer_key: String, crops: Array) -> void:
	if not LandManager.tiles.has(tile_id):
		return
	var now: int = int(Time.get_unix_time_from_system())
	var last: int = LandManager.tiles[tile_id].get(timer_key, 0)
	if last == 0:
		LandManager.tiles[tile_id][timer_key] = now
		LandManager.save_land_data()
		return
	if now - last < SPAWN_INTERVAL:
		return
	var empty: Array = _get_empty_slots()
	if empty.is_empty():
		return
	empty.shuffle()
	var count: int = randi_range(1, 2)
	var placed: int = 0
	for pos in empty:
		if placed >= count:
			break
		var crop: String = crops[randi() % crops.size()]
		if LandManager.place_slot_item(tile_id, pos, "wild_" + crop):
			placed += 1
	if placed > 0:
		LandManager.tiles[tile_id][timer_key] = now
		LandManager.save_land_data()
		_show_spawn_notice(placed)

func _get_empty_slots() -> Array:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var empty: Array = []
	for y in LandManager.SLOT_ROWS:
		for x in LandManager.SLOT_COLS:
			var pos := Vector2i(x, y)
			if not slots.has(LandManager.slot_key(pos)):
				empty.append(pos)
	return empty

func _show_spawn_notice(count: int) -> void:
	var lbl := Label.new()
	lbl.text = "Wild plants grew!  (%d new spot%s)" % [count, "s" if count > 1 else ""]
	lbl.add_theme_font_size_override("font_size", 20)
	lbl.modulate = Color(0.4, 0.88, 0.3)
	lbl.z_index = 10
	lbl.position = Vector2(440, 290)
	add_child(lbl)
	await get_tree().create_timer(2.5).timeout
	lbl.queue_free()
