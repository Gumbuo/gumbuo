extends CanvasLayer

signal action_done

var _tile_id: String = ""
var _grid_pos: Vector2i = Vector2i.ZERO
var _item_id: String = ""

func _ready() -> void:
	layer = 30
	add_to_group("action_windows")

func open(grid_pos: Vector2i, item_id: String, screen_pos: Vector2, tile_id: String) -> void:
	_tile_id = tile_id
	_grid_pos = grid_pos
	_item_id = item_id
	_build_ui(screen_pos)

func _build_ui(screen_pos: Vector2) -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.01)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			queue_free()
	)
	add_child(overlay)

	var panel := PanelContainer.new()
	var clamped := Vector2(clamp(screen_pos.x, 0.0, 1080.0), clamp(screen_pos.y, 0.0, 580.0))
	panel.position = clamped
	panel.custom_minimum_size = Vector2(220, 0)
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)

	var title := Label.new()
	title.text = _item_id.replace("_", " ").to_upper()
	title.add_theme_font_size_override("font_size", 11)
	title.modulate = Color(1.0, 0.9, 0.4)
	vbox.add_child(title)

	vbox.add_child(HSeparator.new())

	var actions := _get_actions()
	if actions.is_empty():
		var lbl := Label.new()
		lbl.text = "Nothing to do here yet."
		lbl.add_theme_font_size_override("font_size", 10)
		lbl.modulate = Color(0.7, 0.7, 0.7)
		vbox.add_child(lbl)
	else:
		for act in actions:
			if act.get("recipe", {}).has("needs"):
				vbox.add_child(_make_recipe_row(act))
			else:
				var btn := Button.new()
				btn.text = act["label"]
				btn.add_theme_font_size_override("font_size", 10)
				if act.get("disabled", false):
					btn.disabled = true
					btn.tooltip_text = act.get("reason", "")
					btn.modulate = Color(0.6, 0.6, 0.6)
				else:
					var cap: Dictionary = act.duplicate()
					btn.pressed.connect(func(): _do_action(cap))
					if act.get("highlight", false):
						btn.add_theme_color_override("font_color", Color(0.3, 1.0, 0.4))
				vbox.add_child(btn)

	var close := Button.new()
	close.text = "x Close"
	close.add_theme_font_size_override("font_size", 9)
	close.pressed.connect(func(): queue_free())
	vbox.add_child(close)

func _item_icon(item_id: String, size: int) -> TextureRect:
	var tr := TextureRect.new()
	var path := "res://assets/sprites/items/%s.png" % item_id
	if ResourceLoader.exists(path):
		tr.texture = load(path)
	tr.custom_minimum_size = Vector2(size, size)
	tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	return tr

func _make_recipe_row(act: Dictionary) -> Control:
	var recipe: Dictionary = act["recipe"]
	var is_disabled: bool  = act.get("disabled", false)
	var needs: Array       = recipe.get("needs", [])

	var wrap := VBoxContainer.new()
	wrap.add_theme_constant_override("separation", 2)

	# Craft button row: [output icon] [Craft X button]
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 4)
	if recipe.has("gives"):
		top.add_child(_item_icon(recipe["gives"], 20))
	var btn := Button.new()
	btn.text = act["label"]
	btn.add_theme_font_size_override("font_size", 10)
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	if is_disabled:
		btn.disabled = true
		btn.modulate = Color(0.65, 0.65, 0.65)
	else:
		var cap: Dictionary = act.duplicate()
		btn.pressed.connect(func(): _do_action(cap))
		if act.get("highlight", false):
			btn.add_theme_color_override("font_color", Color(0.3, 1.0, 0.4))
	top.add_child(btn)
	wrap.add_child(top)

	# Ingredient icon row
	if not needs.is_empty():
		var ing := HBoxContainer.new()
		ing.add_theme_constant_override("separation", 3)
		var spacer_lbl := Label.new()
		spacer_lbl.text = "  "
		ing.add_child(spacer_lbl)
		for pair in needs:
			var iid: String = pair[0]
			var amt: int    = pair[1]
			var have_enough: bool = ResourceManager.has_item(iid, amt)
			ing.add_child(_item_icon(iid, 16))
			var amt_lbl := Label.new()
			amt_lbl.text = "x%d" % amt
			amt_lbl.add_theme_font_size_override("font_size", 9)
			amt_lbl.modulate = Color(0.3, 1.0, 0.4) if have_enough else Color(1.0, 0.4, 0.4)
			ing.add_child(amt_lbl)
		wrap.add_child(ing)

	return wrap

func _is_owner() -> bool:
	var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
	return tile_owner.is_empty() or LandManager.is_effective_owner(_tile_id, PlayerData.player_id)

func _get_actions() -> Array:
	var tile_slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var slot_data: Dictionary = tile_slots.get(LandManager.slot_key(_grid_pos), {})
	var state: String = slot_data.get("state", "")

	if _item_id.begins_with("wild_"):
		return [{"label": "Forage  (1 item,  -1 energy)", "action": "forage_wild"}]

	match _item_id:
		"soil_plot":
			return _soil_plot_actions(state, slot_data)
		"tree", "oak_tree", "apple_tree", "pear_tree", "peach_tree", "lemon_tree":
			return _tree_actions()
		"boulder":
			return _boulder_actions()
		"campfire":
			return _campfire_actions()
		"workbench":
			return _workbench_actions()
		"workshop":
			return _workshop_actions()
		"furnace":
			return _furnace_actions()
		"wheat_mill", "mill":
			return [{"label": "Co-op station (2+ players needed)", "disabled": true}]
		"bread_oven":
			return [{"label": "Bake Bread  (collab x3)", "action": "open_bread_oven"}]
		"silo":
			return [{"label": "Collect from Silo", "action": "silo_check"}]
		"chicken_coop":
			if not _is_owner():
				return [{"label": "Open Coop", "disabled": true, "reason": "Only the tile owner can collect from this"}]
			return [{"label": "Open Coop", "action": "open_coop"}]
		"burner_station":
			return [{"label": "Burn Resources for Land Deed", "action": "burn_deed"}]
		"bonfire":
			return _campfire_actions()
		"alchemy_table":
			return [{"label": "Brew Potion (coming soon)", "disabled": true}]
		"anvil":
			return [{"label": "Craft Metal Objects (coming soon)", "disabled": true}]
		"barrel":
			return [{"label": "Ferment Wine  (collab x3)", "action": "open_barrel"}]
		"beehive":
			if not _is_owner():
				return [{"label": "Open Beehive", "disabled": true, "reason": "Only the tile owner can collect from this"}]
			return [{"label": "Open Beehive", "action": "open_beehive"}]
		"box":
			return [{"label": "Open Storage (coming soon)", "disabled": true}]
		"dyeing_vat":
			return [{"label": "Dye Wool (coming soon)", "disabled": true}]
		"sawmill":
			return [{"label": "Saw Wood Planks (coming soon)", "disabled": true}]
		"spinning_wheel":
			return [{"label": "Spin Wool (coming soon)", "disabled": true}]
		"stonecutter":
			return [{"label": "Cut Stone Blocks (coming soon)", "disabled": true}]
		"wine_press":
			return [{"label": "Press Grapes", "action": "open_wine_press"}]
		"mailbox":
			return [{"label": "Open Mailbox", "action": "open_mailbox"}]
	return [{"label": "Coming Soon", "disabled": true}]

func _soil_plot_actions(state: String, slot_data: Dictionary) -> Array:
	if state == "ready":
		return [{"label": "Harvest Crop", "action": "harvest"}]
	if state == "seedling" or state == "growing":
		var crop: String     = slot_data.get("crop", "")
		var times: Array     = LandManager.GROW_TIMES.get(crop, [1800, 3600])
		var planted_at: int  = slot_data.get("planted_at", 0)
		var elapsed: int     = int(Time.get_unix_time_from_system()) - planted_at
		var remaining: int   = max(0, times[1] - elapsed)
		var h: int = remaining / 3600
		var m: int = (remaining % 3600) / 60
		var s: int = remaining % 60
		var time_str: String = "%dh %dm" % [h, m] if h > 0 else ("%dm %ds" % [m, s] if m > 0 else "%ds" % s)
		var phase: String = "Seedling" if state == "seedling" else "Halfway grown"
		return [{"label": "%s  —  %s left" % [phase, time_str], "disabled": true}]
	var seeds: Array = _get_seeds()
	if seeds.is_empty():
		return [{"label": "No seeds in backpack", "disabled": true}]
	var acts: Array = []
	for s in seeds:
		acts.append({"label": "Plant %s (x%d)" % [s["name"], s["count"]], "action": "plant", "seed_id": s["id"]})
	return acts

func _get_seeds() -> Array:
	var result: Array = []
	for iid in ResourceManager.inventory:
		var cnt: int = ResourceManager.inventory[iid]
		if cnt <= 0:
			continue
		var info: Dictionary = ResourceManager.get_item_info(iid)
		if info.get("category", "") == "seeds":
			result.append({"id": iid, "name": info.get("name", iid), "count": cnt})
	return result

func _tree_actions() -> Array:
	var tile_slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var slot_data: Dictionary = tile_slots.get(LandManager.slot_key(_grid_pos), {})
	var chopped_at: int = slot_data.get("tree_chopped_at", 0)
	if chopped_at > 0:
		var elapsed: int = int(Time.get_unix_time_from_system()) - chopped_at
		var remaining: int = max(0, 28800 - elapsed)
		if remaining > 0:
			var h: int = remaining / 3600
			var m: int = (remaining % 3600) / 60
			var time_str: String = "%dh %dm" % [h, m] if h > 0 else "%dm" % m
			return [{"label": "Regrowing... (%s)" % time_str, "disabled": true}]
	var has_axe: bool = ResourceManager.has_item("tool_axe_iron") or \
		ResourceManager.has_item("tool_axe_silver") or \
		ResourceManager.has_item("tool_axe_gold")
	if has_axe:
		return [{"label": "Chop Tree  (-1 energy)", "action": "chop_tree", "highlight": true}]
	return [{"label": "Need an Iron+ Axe to chop", "disabled": true}]

func _boulder_actions() -> Array:
	var tile_slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var slot_data: Dictionary = tile_slots.get(LandManager.slot_key(_grid_pos), {})
	var now: int = int(Time.get_unix_time_from_system())
	var mined_at: int = slot_data.get("boulder_mined_at", 0)
	var crack_at: int = slot_data.get("boulder_cracked_at", 0)
	if mined_at > 0:
		var elapsed: int = now - mined_at
		var remaining: int = max(0, 14400 - elapsed)
		if remaining > 0:
			var h: int = remaining / 3600
			var m: int = (remaining % 3600) / 60
			var time_str: String = "%dh %dm" % [h, m] if h > 0 else "%dm" % m
			return [{"label": "Regrowing... (%s)" % time_str, "disabled": true}]
	# Animation in progress — block double-click
	if crack_at > 0 and mined_at == 0:
		return [{"label": "Mining...", "disabled": true}]
	var has_pick: bool = ResourceManager.has_item("tool_pickaxe_iron") or \
		ResourceManager.has_item("tool_pickaxe_silver") or \
		ResourceManager.has_item("tool_pickaxe_gold")
	if not has_pick:
		return [{"label": "Need an Iron+ Pickaxe to mine", "disabled": true}]
	return [{"label": "Mine Rock  (-1 energy)", "action": "mine_boulder", "highlight": true}]

func _fishing_actions() -> Array:
	var has_rod: bool = ResourceManager.has_item("tool_rod_basic") or \
		ResourceManager.has_item("tool_rod_iron") or \
		ResourceManager.has_item("tool_rod_silver") or \
		ResourceManager.has_item("tool_rod_gold")
	if has_rod:
		return [{"label": "Fish  (-1 energy)", "action": "fish"}]
	return [{"label": "Need a Fishing Rod", "disabled": true}]

func _campfire_actions() -> Array:
	var pairs: Array = [
	]
	var acts: Array = []
	for p in pairs:
		var rec: Dictionary = {"needs": [[p[0], 1]], "gives": p[1]}
		if ResourceManager.has_item(p[0]):
			acts.append({"label": "Cook %s" % p[2], "action": "cook",
				"recipe": rec})
		else:
			acts.append({"label": "Cook %s" % p[2], "disabled": true, "recipe": rec})
	return acts

func _workbench_actions() -> Array:
	var recipes: Array = [
		{"name": "Soil Plot",    "gives": "soil_plot",    "gives_amt": 1, "needs": [["wood", 3], ["stone", 2]]},
		{"name": "Soil Plot x3", "gives": "soil_plot",    "gives_amt": 3, "needs": [["wood", 8], ["stone", 5]]},
		{"name": "Campfire",     "gives": "campfire",     "gives_amt": 1, "needs": [["wood", 5], ["stone", 3]]},
		{"name": "Fishing Rod",  "gives": "tool_rod_basic",     "gives_amt": 1, "needs": [["wood", 8], ["cotton", 4]]},
	]
	var acts: Array = []
	for r in recipes:
		var ok: bool = true
		for pair in r["needs"]:
			if not ResourceManager.has_item(pair[0], pair[1]):
				ok = false
		if ok:
			acts.append({"label": "Craft %s" % r["name"], "action": "workbench_craft", "recipe": r})
		else:
			acts.append({"label": "Craft %s" % r["name"], "disabled": true, "recipe": r})
	return acts

func _workshop_actions() -> Array:
	var recipes: Array = [
		{"name": "Hoe", "gives": "hoe", "needs": [["wood", 5], ["stone", 3]]},
		{"name": "Watering Can", "gives": "watering_can", "needs": [["wood", 4], ["stone", 5]]},
		{"name": "Axe", "gives": "axe", "needs": [["wood", 4], ["stone", 8]]},
		{"name": "Pickaxe", "gives": "pickaxe", "needs": [["wood", 3], ["stone", 10]]},
	]
	var acts: Array = []
	for r in recipes:
		var ok: bool = true
		for pair in r["needs"]:
			if not ResourceManager.has_item(pair[0], pair[1]):
				ok = false
		if ok:
			acts.append({"label": "Craft %s" % r["name"], "action": "craft", "recipe": r})
		else:
			acts.append({"label": "Craft %s" % r["name"], "disabled": true, "recipe": r})
	return acts

func _furnace_actions() -> Array:
	var acts: Array = []
	if ResourceManager.has_item("stone", 3):
		acts.append({"label": "Smelt Silver  (3 stone)", "action": "smelt_silver"})
	else:
		acts.append({"label": "Smelt Silver  (need 3 stone)", "disabled": true})
	if ResourceManager.has_item("gold_ore", 3):
		acts.append({"label": "Smelt Gold  (3 gold ore)", "action": "smelt_gold"})
	else:
		acts.append({"label": "Smelt Gold  (need 3 gold ore)", "disabled": true})
	return acts

func _do_action(act: Dictionary) -> void:
	match act.get("action", ""):
		"plant": _do_plant(act["seed_id"])
		"harvest": _do_harvest()
		"chop_tree": _do_chop()
		"mine_boulder": _do_mine()
		"cook": _do_cook(act["recipe"])
		"workbench_craft": _do_workbench_craft(act["recipe"])
		"craft": _do_craft(act["recipe"])
		"smelt_silver": _do_smelt_silver()
		"smelt_gold": _do_smelt_gold()
		"collect_eggs": _do_collect_eggs()
		"forage_wild":  _do_forage_wild()
		"open_mailbox":    _do_open_mailbox()
		"open_coop":       _do_open_coop()
		"open_beehive":    _do_open_beehive()
		"open_wine_press": _do_open_wine_press()
		"open_barrel":     _do_open_barrel()
		"open_bread_oven": _do_open_bread_oven()
	queue_free()

func _do_plant(seed_id: String) -> void:
	if not ResourceManager.has_item(seed_id) or not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	ResourceManager.remove_item(seed_id)
	var crop: String = seed_id.trim_prefix("seed_")
	var tile_slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var key: String = LandManager.slot_key(_grid_pos)
	if tile_slots.has(key):
		tile_slots[key]["state"] = "seedling"
		tile_slots[key]["crop"] = crop
		tile_slots[key]["planted_at"] = int(Time.get_unix_time_from_system())
		LandManager.save_land_data()
		LandManager.slot_item_placed.emit(_tile_id, key, "soil_plot")

func _do_harvest() -> void:
	var tile_slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var key: String = LandManager.slot_key(_grid_pos)
	if not tile_slots.has(key) or tile_slots[key].get("state", "") != "ready":
		return
	if not PlayerData.spend_energy(1):
		_show_drops_popup([{"label": "No energy!", "color": Color(1.0, 0.3, 0.3), "items": [{"id": "bread", "count": 0}]}])
		return
	PlayerData.add_xp(1)
	var crop: String = tile_slots[key].get("crop", "")
	tile_slots[key].erase("state")
	tile_slots[key].erase("crop")
	tile_slots[key].erase("planted_at")
	LandManager.save_land_data()
	LandManager.slot_item_placed.emit(_tile_id, key, "soil_plot")
	var _p: Node = get_tree().get_first_node_in_group("player")
	if _p and _p.has_method("play_harvest"): _p.call("play_harvest")
	if crop == "":
		return
	var tile: Dictionary = LandManager.tiles.get(_tile_id, {})
	var tile_owner: String = tile.get("owner_id", "")
	var is_owner: bool = tile_owner.is_empty() or LandManager.is_effective_owner(_tile_id, PlayerData.player_id)
	var total_amt: int = randi_range(2, 5)
	var you_amt: int
	var owner_amt: int = 0
	if is_owner:
		you_amt = total_amt
	else:
		var yield_rate: int = tile.get("yield_rate", 70)
		you_amt   = int(total_amt * yield_rate / 100.0)
		owner_amt = total_amt - you_amt
	ResourceManager.add_item(crop, you_amt, true)
	if owner_amt > 0:
		LandManager.add_to_passive_vault(_tile_id, crop, owner_amt, PlayerData.player_id)
	var drops: Array = [
		{"label": "You", "color": Color(0.4, 1.0, 0.5), "items": [{"id": crop, "count": you_amt}]}
	]
	if owner_amt > 0:
		drops.append({"label": "Owner gets", "color": Color(1.0, 0.85, 0.3), "items": [{"id": crop, "count": owner_amt}]})
	_show_drops_popup(drops)

func _do_chop() -> void:
	if not PlayerData.spend_energy(1):
		_show_drops_popup([{"label": "No energy!", "color": Color(1.0, 0.3, 0.3), "items": [{"id": "bread", "count": 0}]}])
		return
	PlayerData.add_xp(1)

	var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
	var is_owner: bool = tile_owner.is_empty() or LandManager.is_effective_owner(_tile_id, PlayerData.player_id)

	# Wood ranges per axe tier [own_min, own_max, chop_min, chop_max, passive_min, passive_max]
	var w: Array
	if ResourceManager.has_item("tool_axe_gold"):
		w = [5, 11, 2, 3, 2, 8]
	elif ResourceManager.has_item("tool_axe_silver"):
		w = [4, 7,  1, 3, 2, 5]
	else:
		w = [3, 5,  1, 2, 1, 4]

	var fruit: String = _item_id.replace("_tree", "")
	var has_fruit: bool = fruit in ["apple", "pear", "peach", "lemon"]

	var you_wood: int
	var you_fruit: int = 0
	var owner_wood: int = 0
	var owner_fruit: int = 0

	if is_owner:
		you_wood = randi_range(w[0], w[1])
		if has_fruit: you_fruit = 3
	else:
		you_wood = randi_range(w[2], w[3])
		if has_fruit: you_fruit = 1
		owner_wood = randi_range(w[4], w[5])
		if has_fruit: owner_fruit = 2

	ResourceManager.add_item("wood", you_wood, true)
	if has_fruit and you_fruit > 0: ResourceManager.add_item(fruit, you_fruit, true)
	if owner_wood > 0: LandManager.add_to_passive_vault(_tile_id, "wood", owner_wood)
	if owner_fruit > 0: LandManager.add_to_passive_vault(_tile_id, fruit, owner_fruit)

	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var key: String = LandManager.slot_key(_grid_pos)
	if slots.has(key) and slots[key].get("is_anchor", false):
		slots[key]["tree_chopped_at"] = int(Time.get_unix_time_from_system())
		LandManager.save_land_data()
		LandManager.slot_item_placed.emit(_tile_id, key, slots[key].get("item_id", "tree"))
		var player_node: Node = get_tree().get_first_node_in_group("player")
		if player_node and player_node.has_method("play_chop"):
			player_node.call("play_chop")

	var you_items: Array = [{"id": "wood", "count": you_wood}]
	if has_fruit and you_fruit > 0: you_items.append({"id": fruit, "count": you_fruit})
	var drops: Array = [{"label": "You", "color": Color(0.4, 1.0, 0.5), "items": you_items}]
	if not is_owner:
		var owner_items: Array = [{"id": "wood", "count": owner_wood}]
		if has_fruit and owner_fruit > 0: owner_items.append({"id": fruit, "count": owner_fruit})
		drops.append({"label": "Landowner", "color": Color(1.0, 0.85, 0.3), "items": owner_items})
	_show_drops_popup(drops)

func _do_mine() -> void:
	if not PlayerData.spend_energy(1):
		_show_drops_popup([{"label": "No energy!", "color": Color(1.0, 0.3, 0.3), "items": [{"id": "stone", "count": 0}]}])
		return
	PlayerData.add_xp(1)
	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var key: String = LandManager.slot_key(_grid_pos)
	if not (slots.has(key) and slots[key].get("is_anchor", false)):
		return
	var slot: Dictionary = slots[key]
	var now: int = int(Time.get_unix_time_from_system())
	var player_node: Node = get_tree().get_first_node_in_group("player")
	if player_node and player_node.has_method("play_mine"):
		player_node.call("play_mine")
	var stone_amt: int = randi_range(4, 8)
	ResourceManager.add_item("stone", stone_amt, true)
	_show_drops_popup([{"label": "You", "color": Color(0.55, 0.85, 0.55), "items": [{"id": "stone", "count": stone_amt}]}])
	# Stage 0 → 1: crack animation plays (~1.3s of rustling + crack frames)
	slot["boulder_cracked_at"] = now
	slot.erase("boulder_mined_at")
	LandManager.save_land_data()
	LandManager.slot_item_placed.emit(_tile_id, key, "boulder")
	# Stage 1 → 2: auto-finish after crack animation completes
	var tid := _tile_id
	get_tree().create_timer(1.5).timeout.connect(func():
		var live_slots: Dictionary = LandManager.tiles.get(tid, {}).get("slots", {})
		if not live_slots.has(key): return
		var live_slot: Dictionary = live_slots[key]
		if live_slot.get("boulder_cracked_at", 0) > 0 and live_slot.get("boulder_mined_at", 0) == 0:
			live_slot["boulder_mined_at"] = int(Time.get_unix_time_from_system())
			live_slot.erase("boulder_cracked_at")
			LandManager.save_land_data()
			LandManager.slot_item_placed.emit(tid, key, "boulder")
	)

func _do_forage_wild() -> void:
	if not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	var foraged: String = _item_id.trim_prefix("wild_")
	ResourceManager.add_item(foraged, 1, true)
	LandManager.remove_slot_item(_tile_id, _grid_pos)
	_show_drops_popup([{"label": "Foraged", "color": Color(0.55, 1.0, 0.55), "items": [{"id": foraged, "count": 1}]}])

func _do_cook(recipe: Dictionary) -> void:
	var needs: Array = recipe.get("needs", [])
	for pair in needs:
		if not ResourceManager.has_item(pair[0], pair[1]): return
	if not PlayerData.spend_energy(1): return
	PlayerData.add_xp(1)
	for pair in needs:
		ResourceManager.remove_item(pair[0], pair[1])
	ResourceManager.add_item(recipe["gives"], 1)

func _do_workbench_craft(recipe: Dictionary) -> void:
	for pair in recipe["needs"]:
		if not ResourceManager.has_item(pair[0], pair[1]):
			return
	if not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(2)
	for pair in recipe["needs"]:
		ResourceManager.remove_item(pair[0], pair[1])
	ResourceManager.add_item(recipe["gives"], recipe.get("gives_amt", 1))

func _do_craft(recipe: Dictionary) -> void:
	for pair in recipe["needs"]:
		if not ResourceManager.has_item(pair[0], pair[1]):
			return
	if not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	for pair in recipe["needs"]:
		ResourceManager.remove_item(pair[0], pair[1])
	ResourceManager.add_item(recipe["gives"], 1)

func _do_smelt_silver() -> void:
	if not ResourceManager.has_item("stone", 3) or not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	ResourceManager.remove_item("stone", 3)
	PlayerData.add_silver(1)

func _do_smelt_gold() -> void:
	if not ResourceManager.has_item("gold_ore", 3) or not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	ResourceManager.remove_item("gold_ore", 3)
	PlayerData.add_gold(1)

func _do_collect_eggs() -> void:
	if not PlayerData.spend_energy(1):
		return
	PlayerData.add_xp(1)
	var amt: int = randi_range(1, 3)
	ResourceManager.add_item("egg_white", amt, true)
	_show_drops_popup([{"label": "Collected", "color": Color(1.0, 0.95, 0.65), "items": [{"id": "egg_white", "count": amt}]}])

func _show_drops_popup(drops: Array) -> void:
	var popup = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(popup)
	popup.show_drops(drops)

func _do_open_coop() -> void:
	if not _is_owner():
		return  # menu already disables this for non-owners; defensive no-op
	var ui: CanvasLayer = (load("res://scripts/ui/chicken_coop_ui.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.setup(_tile_id, _grid_pos)

func _do_open_beehive() -> void:
	if not _is_owner():
		return  # menu already disables this for non-owners; defensive no-op
	var ui: CanvasLayer = (load("res://scripts/ui/beehive_ui.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.setup(_tile_id, _grid_pos)

func _do_open_wine_press() -> void:
	var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
	var is_visitor: bool = not tile_owner.is_empty() and tile_owner != PlayerData.player_id
	var ui: CanvasLayer = (load("res://scripts/ui/wine_press_ui.gd") as GDScript).new()
	ui.set_meta("is_visitor", is_visitor)
	ui.set_meta("owner_tile_id", _tile_id)
	get_tree().root.add_child(ui)

func _do_open_barrel() -> void:
	var ui: CanvasLayer = (load("res://scripts/ui/barrel_ui.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.setup_collab(_tile_id, _grid_pos)

func _do_open_bread_oven() -> void:
	var ui: CanvasLayer = (load("res://scripts/ui/bread_oven_ui.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.setup_collab(_tile_id, _grid_pos)

func _do_open_mailbox() -> void:
	var tile_owner: String = LandManager.tiles.get(_tile_id, {}).get("owner_id", "")
	var is_own: bool = tile_owner.is_empty() or tile_owner == PlayerData.player_id
	var ui = (load("res://scripts/ui/mailbox_ui.gd") as GDScript).new()
	ui.mode = "inbox" if is_own else "compose"
	ui.recipient = tile_owner
	get_tree().root.add_child(ui)
