extends CanvasLayer

var tile_id: String = ""
var grid_pos: Vector2i = Vector2i.ZERO

const MAX_FEED     := 30
const HATCH_SECS   := 129600   # 36 hrs — egg incubation
const DEPOSIT_AMT  := 10       # must deposit 10 bags at once

var _slot_key: String = ""
var _coop_data: Dictionary = {}
var _slot_panels: Array = []
var _icon_rects:  Array = []
var _feed_bar:    ColorRect = null
var _feed_lbl:    Label = null
var _status_lbl:  Label = null
var _chicken_rows_vb: VBoxContainer = null

func _ready() -> void:
	layer = 40

func setup(t_id: String, g_pos: Vector2i) -> void:
	tile_id   = t_id
	grid_pos  = g_pos
	_slot_key = LandManager.slot_key(grid_pos)
	_load_coop_data()
	_build_ui()

func _load_coop_data() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var data: Dictionary = slots.get(_slot_key, {})
	if not data.has("coop_slots"):       data["coop_slots"]        = [null, null, null]
	if not data.has("chickens"):         data["chickens"]          = []
	if not data.has("coop_feed"):        data["coop_feed"]         = 0
	if not data.has("feed_empty_since"): data["feed_empty_since"]  = 0
	_coop_data = data

func _save_coop_data() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	if not slots.has(_slot_key): return
	slots[_slot_key]["coop_slots"]       = _coop_data.get("coop_slots",       [null, null, null])
	slots[_slot_key]["chickens"]         = _coop_data.get("chickens",          [])
	slots[_slot_key]["coop_feed"]        = _coop_data.get("coop_feed",         0)
	slots[_slot_key]["feed_empty_since"] = _coop_data.get("feed_empty_since",  0)
	LandManager.save_land_data()
	LandManager.slot_item_placed.emit(tile_id, _slot_key, "chicken_coop")

# ─────────────────────── PROCESS (live timers) ──────────────────

func _process(_dt: float) -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var chickens: Array   = _coop_data.get("chickens", [])
	var now := int(Time.get_unix_time_from_system())
	var feed: int = _coop_data.get("coop_feed", 0)

	# Egg incubation timers + hatch button activation
	for i in 3:
		if i >= _slot_panels.size(): break
		var sp: PanelContainer = _slot_panels[i]
		var timer_lbl: Label  = sp.get_node_or_null("VBoxContainer/TimerLbl")
		var action_btn: Button = sp.get_node_or_null("VBoxContainer/ActionBtn")
		var cs: Variant = coop_slots[i]
		if cs == null:
			if timer_lbl: timer_lbl.text = ""
			continue
		var remaining: int = max(0, HATCH_SECS - (now - (cs as Dictionary).get("placed_at", now)))
		if remaining == 0:
			if timer_lbl:
				timer_lbl.text = "Ready to hatch!"
				timer_lbl.modulate = Color(1.0, 0.9, 0.2)
			if action_btn and action_btn.disabled:
				action_btn.text = "HATCH!"
				action_btn.disabled = false
				action_btn.modulate = Color(0.3, 1.0, 0.4)
		else:
			if timer_lbl:
				timer_lbl.text = "%dh %dm" % [remaining / 3600, (remaining % 3600) / 60]
				timer_lbl.modulate = Color(0.8, 0.85, 1.0)

	# Chicken lay timers (shown in chicken rows)
	if is_instance_valid(_chicken_rows_vb):
		var row_nodes := _chicken_rows_vb.get_children()
		for i in min(chickens.size(), row_nodes.size()):
			var row_node: Control = row_nodes[i]
			var tlbl: Label = row_node.get_node_or_null("TimerLbl")
			if not tlbl: continue
			var ch: Dictionary = chickens[i]
			var rem: int = max(0, LandManager.COOP_LAY_SECS - (now - ch.get("last_laid_at", 0)))
			if rem == 0:
				tlbl.text = "Laying soon..."
				tlbl.modulate = Color(1.0, 0.9, 0.2)
			else:
				tlbl.text = "Next egg: %dh %dm" % [rem / 3600, (rem % 3600) / 60]
				tlbl.modulate = Color(0.75, 0.85, 0.75)

	# Starvation warning
	var feed_empty_since: int = _coop_data.get("feed_empty_since", 0)
	if feed == 0 and feed_empty_since > 0 and chickens.size() > 0:
		var starve_rem: int = max(0, LandManager.COOP_STARVE_SECS - (now - feed_empty_since))
		if starve_rem < 86400 and is_instance_valid(_status_lbl):
			_status_lbl.text = "  WARNING: Chickens wander off in %dh %dm without feed!" % [starve_rem / 3600, (starve_rem % 3600) / 60]
			_status_lbl.modulate = Color(1.0, 0.35, 0.35)
			_status_lbl.visible = true

# ─────────────────────────── BUILD UI ───────────────────────

func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed: queue_free()
	)
	add_child(overlay)

	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -275
	panel.offset_top    = -270
	panel.offset_right  = 275
	panel.offset_bottom = 270
	panel.mouse_filter  = Control.MOUSE_FILTER_STOP
	var _style := StyleBoxFlat.new()
	_style.bg_color = Color(0.11, 0.11, 0.15, 0.97)
	_style.border_width_left   = 1; _style.border_width_right  = 1
	_style.border_width_top    = 1; _style.border_width_bottom = 1
	_style.border_color        = Color(0.35, 0.35, 0.45)
	_style.set_content_margin_all(10)
	panel.add_theme_stylebox_override("panel", _style)
	overlay.add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 8)
	panel.add_child(root)

	# Header
	var hdr := HBoxContainer.new()
	root.add_child(hdr)
	var title := Label.new()
	title.text = "  CHICKEN COOP"
	title.add_theme_font_size_override("font_size", 14)
	title.modulate = Color(1.0, 0.85, 0.3)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(title)
	var x_btn := Button.new()
	x_btn.text = " X "
	x_btn.pressed.connect(func(): queue_free())
	hdr.add_child(x_btn)
	root.add_child(HSeparator.new())

	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 9)
	_status_lbl.modulate = Color(0.4, 1.0, 0.6)
	_status_lbl.visible = false
	root.add_child(_status_lbl)

	# Incubation slots
	var slots_hdr := Label.new()
	slots_hdr.text = "  Incubation  (place an egg · 36hr hatch · click HATCH when ready)"
	slots_hdr.add_theme_font_size_override("font_size", 10)
	slots_hdr.modulate = Color(0.75, 0.85, 1.0)
	root.add_child(slots_hdr)

	var slots_row := HBoxContainer.new()
	slots_row.add_theme_constant_override("separation", 8)
	root.add_child(slots_row)
	_slot_panels.clear()
	for i in 3:
		slots_row.add_child(_make_slot_panel(i))

	root.add_child(HSeparator.new())

	# Chickens section
	var chick_hdr := Label.new()
	chick_hdr.text = "  Chickens  (hatch an egg to get one · lays 1 egg/day into tile slots · pick up to collect)"
	chick_hdr.add_theme_font_size_override("font_size", 10)
	chick_hdr.modulate = Color(0.75, 0.85, 1.0)
	root.add_child(chick_hdr)

	_chicken_rows_vb = VBoxContainer.new()
	_chicken_rows_vb.add_theme_constant_override("separation", 4)
	root.add_child(_chicken_rows_vb)

	root.add_child(HSeparator.new())

	# Feed section
	var feed_hdr := Label.new()
	feed_hdr.text = "  Feed Bin  (deposit 10 bags · 1 feed consumed per egg laid)"
	feed_hdr.add_theme_font_size_override("font_size", 10)
	feed_hdr.modulate = Color(0.75, 0.85, 1.0)
	root.add_child(feed_hdr)
	root.add_child(_make_feed_section())

	_refresh_static()

func _make_slot_panel(idx: int) -> PanelContainer:
	var sp := PanelContainer.new()
	sp.custom_minimum_size = Vector2(162, 165)
	_slot_panels.append(sp)

	var slot_style := StyleBoxFlat.new()
	slot_style.bg_color = Color(0.16, 0.16, 0.22, 1.0)
	slot_style.border_width_left   = 1; slot_style.border_width_right  = 1
	slot_style.border_width_top    = 1; slot_style.border_width_bottom = 1
	slot_style.border_color        = Color(0.4, 0.4, 0.55)
	slot_style.set_content_margin_all(6)
	sp.add_theme_stylebox_override("panel", slot_style)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 3)
	sp.add_child(vb)

	var icon_rect := TextureRect.new()
	icon_rect.name = "IconRect"
	icon_rect.custom_minimum_size = Vector2(64, 64)
	icon_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon_rect.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	vb.add_child(icon_rect)
	_icon_rects.append(icon_rect)

	var kind_lbl := Label.new()
	kind_lbl.name = "KindLbl"
	kind_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	kind_lbl.add_theme_font_size_override("font_size", 11)
	vb.add_child(kind_lbl)

	var timer_lbl := Label.new()
	timer_lbl.name = "TimerLbl"
	timer_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	timer_lbl.add_theme_font_size_override("font_size", 10)
	vb.add_child(timer_lbl)

	var action_btn := Button.new()
	action_btn.name = "ActionBtn"
	action_btn.add_theme_font_size_override("font_size", 10)
	action_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_btn.pressed.connect(func(): _on_slot_pressed(idx))
	vb.add_child(action_btn)

	return sp

func _make_feed_section() -> VBoxContainer:
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 4)

	var bar_bg := PanelContainer.new()
	bar_bg.custom_minimum_size = Vector2(510, 20)
	vb.add_child(bar_bg)

	_feed_bar = ColorRect.new()
	_feed_bar.color = Color(0.3, 0.8, 0.3)
	_feed_bar.set_anchors_preset(Control.PRESET_LEFT_WIDE)
	bar_bg.add_child(_feed_bar)

	var row := HBoxContainer.new()
	vb.add_child(row)
	_feed_lbl = Label.new()
	_feed_lbl.add_theme_font_size_override("font_size", 9)
	_feed_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_feed_lbl)

	var feed_icon := TextureRect.new()
	var _ftp := "res://assets/sprites/items/chicken_feed.png"
	if ResourceLoader.exists(_ftp): feed_icon.texture = load(_ftp)
	feed_icon.custom_minimum_size = Vector2(24, 24)
	feed_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	feed_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(feed_icon)

	var add_feed_btn := Button.new()
	add_feed_btn.text = "+ Deposit 10 Bags"
	add_feed_btn.add_theme_font_size_override("font_size", 9)
	add_feed_btn.pressed.connect(_do_add_feed)
	row.add_child(add_feed_btn)

	return vb

# ─────────────────── STATIC REFRESH ─────────────────────────

func _load_icon(item_id: String) -> Texture2D:
	var path := "res://assets/sprites/items/%s.png" % item_id
	if ResourceLoader.exists(path): return load(path) as Texture2D
	return null

func _refresh_static() -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var chickens: Array   = _coop_data.get("chickens", [])
	var feed: int = _coop_data.get("coop_feed", 0)
	var now := int(Time.get_unix_time_from_system())

	# Incubation slot panels
	for i in 3:
		if i >= _slot_panels.size(): break
		var sp: PanelContainer = _slot_panels[i]
		var icon_rect: TextureRect = sp.get_node_or_null("VBoxContainer/IconRect")
		var kind_lbl: Label        = sp.get_node_or_null("VBoxContainer/KindLbl")
		var action_btn: Button     = sp.get_node_or_null("VBoxContainer/ActionBtn")
		var cs: Variant = coop_slots[i]

		if cs == null:
			if icon_rect:  icon_rect.texture = null
			if kind_lbl:   kind_lbl.text = "── Empty ──"; kind_lbl.modulate = Color(0.55, 0.55, 0.65)
			if action_btn:
				action_btn.text = "Place Egg"
				action_btn.disabled = false
				action_btn.modulate = Color(1, 1, 1)
		else:
			var etype: String = (cs as Dictionary).get("type", "white")
			if icon_rect:  icon_rect.texture = _load_icon("egg_" + etype)
			if kind_lbl:
				kind_lbl.text = ("Gold Egg" if etype == "gold" else "White Egg")
				kind_lbl.modulate = Color(1.0, 0.88, 0.3) if etype == "gold" else Color(1.0, 1.0, 0.9)
			var ready := now - (cs as Dictionary).get("placed_at", now) >= HATCH_SECS
			if action_btn:
				if ready:
					action_btn.text = "HATCH!"
					action_btn.disabled = false
					action_btn.modulate = Color(0.3, 1.0, 0.4)
				else:
					action_btn.text = "Incubating..."
					action_btn.disabled = true
					action_btn.modulate = Color(0.55, 0.55, 0.65)

	# Chickens list
	if is_instance_valid(_chicken_rows_vb):
		for child in _chicken_rows_vb.get_children():
			child.queue_free()
		if chickens.is_empty():
			var none_lbl := Label.new()
			none_lbl.text = "  No chickens yet — hatch an egg to get one."
			none_lbl.add_theme_font_size_override("font_size", 9)
			none_lbl.modulate = Color(0.55, 0.55, 0.65)
			_chicken_rows_vb.add_child(none_lbl)
		else:
			for i in chickens.size():
				_chicken_rows_vb.add_child(_make_chicken_row(chickens[i]))

	# Feed bar
	var fill_pct := float(feed) / float(MAX_FEED)
	if is_instance_valid(_feed_bar):
		_feed_bar.size = Vector2(510.0 * fill_pct, 20)
		_feed_bar.color = Color(0.3, 0.8, 0.3) if feed > 0 else Color(0.65, 0.2, 0.2)
	if is_instance_valid(_feed_lbl):
		var have := ResourceManager.get_count("chicken_feed")
		_feed_lbl.text = "  Feed: %d / %d    (You have %d bags)" % [feed, MAX_FEED, have]
		_feed_lbl.modulate = Color(0.3, 1.0, 0.4) if feed > 0 else Color(1.0, 0.35, 0.35)

func _make_chicken_row(ch: Dictionary) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	row.name = "ChickenRow"

	var ctype: String = ch.get("type", "white")
	var clrs: Dictionary = {
		"white": Color(1.0, 1.0, 1.0), "black": Color(0.7, 0.7, 0.8),
		"brown": Color(0.85, 0.6, 0.3), "gold": Color(1.0, 0.88, 0.2)
	}

	var icon := TextureRect.new()
	var tex := _load_icon("chicken_" + ctype)
	if tex: icon.texture = tex
	icon.custom_minimum_size = Vector2(28, 28)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(icon)

	var name_lbl := Label.new()
	name_lbl.text = ctype.capitalize() + " Chicken"
	name_lbl.modulate = clrs.get(ctype, Color(1, 1, 1))
	name_lbl.add_theme_font_size_override("font_size", 10)
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(name_lbl)

	var tlbl := Label.new()
	tlbl.name = "TimerLbl"
	tlbl.add_theme_font_size_override("font_size", 9)
	tlbl.modulate = Color(0.75, 0.85, 0.75)
	row.add_child(tlbl)

	return row

# ─────────────────────────── ACTIONS ────────────────────────

func _on_slot_pressed(idx: int) -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var now := int(Time.get_unix_time_from_system())
	var cs: Variant = coop_slots[idx]

	if cs == null:
		# Empty slot — place an egg
		if not ResourceManager.has_item("egg_white") and not ResourceManager.has_item("egg_gold"):
			_set_status("No eggs in backpack. Need egg_white or egg_gold.")
			return
		_show_egg_picker(idx)
	elif (cs as Dictionary).get("kind", "") == "egg" or (cs as Dictionary).has("placed_at"):
		# Egg ready to hatch?
		var placed_at: int = (cs as Dictionary).get("placed_at", now)
		if now - placed_at < HATCH_SECS:
			return  # not ready, button is disabled anyway
		_hatch_egg(idx)

func _show_egg_picker(slot_idx: int) -> void:
	var popup := PanelContainer.new()
	popup.z_index = 50
	popup.custom_minimum_size = Vector2(300, 0)
	popup.anchor_left   = 0.5
	popup.anchor_top    = 0.5
	popup.anchor_right  = 0.5
	popup.anchor_bottom = 0.5
	popup.position      = Vector2(-150, -90)
	popup.mouse_filter  = Control.MOUSE_FILTER_STOP
	add_child(popup)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	popup.add_child(vb)

	var hdr := Label.new()
	hdr.text = "  Choose egg to incubate (hatches in 36hrs):"
	hdr.add_theme_font_size_override("font_size", 10)
	vb.add_child(hdr)
	vb.add_child(HSeparator.new())

	if ResourceManager.has_item("egg_white"):
		var cnt := ResourceManager.get_count("egg_white")
		var btn := Button.new()
		btn.text = "White Egg  (x%d)\n30%% White · 30%% Black · 40%% fail" % cnt
		btn.add_theme_font_size_override("font_size", 9)
		btn.pressed.connect(func(): _place_egg(slot_idx, "white"); popup.queue_free())
		vb.add_child(btn)

	if ResourceManager.has_item("egg_gold"):
		var cnt := ResourceManager.get_count("egg_gold")
		var btn := Button.new()
		btn.text = "Gold Egg  (x%d)\n35%% White · 25%% Black · 25%% Brown · 15%% Gold" % cnt
		btn.add_theme_font_size_override("font_size", 9)
		btn.modulate = Color(1.0, 0.9, 0.3)
		btn.pressed.connect(func(): _place_egg(slot_idx, "gold"); popup.queue_free())
		vb.add_child(btn)

	var cancel := Button.new()
	cancel.text = "Cancel"
	cancel.add_theme_font_size_override("font_size", 9)
	cancel.pressed.connect(func(): popup.queue_free())
	vb.add_child(cancel)

func _place_egg(slot_idx: int, egg_type: String) -> void:
	var item_id := "egg_gold" if egg_type == "gold" else "egg_white"
	if not ResourceManager.has_item(item_id): return
	ResourceManager.remove_item(item_id)
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	coop_slots[slot_idx] = {"placed_at": int(Time.get_unix_time_from_system()), "type": egg_type}
	_coop_data["coop_slots"] = coop_slots
	_save_coop_data()
	_set_status("Egg placed! Hatches in 36 hours.")
	_refresh_static()

func _hatch_egg(slot_idx: int) -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var cs: Dictionary = coop_slots[slot_idx]
	var egg_type: String = cs.get("type", "white")

	# Roll chicken type
	var roll := randf()
	var chicken_type := ""
	if egg_type == "white":
		if   roll < 0.30: chicken_type = "white"
		elif roll < 0.60: chicken_type = "black"
		# else: 40% fail — no chicken
	else:  # gold
		if   roll < 0.35: chicken_type = "white"
		elif roll < 0.60: chicken_type = "black"
		elif roll < 0.85: chicken_type = "brown"
		else:             chicken_type = "gold"

	# Clear incubation slot
	coop_slots[slot_idx] = null
	_coop_data["coop_slots"] = coop_slots

	if chicken_type == "":
		_set_status("The egg didn't hatch. Better luck next time!")
	else:
		var chickens: Array = _coop_data.get("chickens", [])
		chickens.append({"type": chicken_type, "last_laid_at": 0})
		_coop_data["chickens"] = chickens
		_set_status("A %s chicken hatched!" % chicken_type.capitalize())

	_save_coop_data()
	_refresh_static()

func _do_add_feed() -> void:
	if not ResourceManager.has_item("chicken_feed", DEPOSIT_AMT):
		_set_status("Need at least %d bags of Chicken Feed to deposit." % DEPOSIT_AMT)
		return
	var feed: int = _coop_data.get("coop_feed", 0)
	if feed + DEPOSIT_AMT > MAX_FEED:
		_set_status("Not enough space. Bin has %d/%d." % [feed, MAX_FEED])
		return
	ResourceManager.remove_item("chicken_feed", DEPOSIT_AMT)
	_coop_data["coop_feed"] = feed + DEPOSIT_AMT
	_coop_data["feed_empty_since"] = 0
	_save_coop_data()
	_set_status("Deposited %d feed. Bin: %d / %d." % [DEPOSIT_AMT, _coop_data["coop_feed"], MAX_FEED])
	_refresh_static()

func _set_status(msg: String) -> void:
	if not is_instance_valid(_status_lbl): return
	_status_lbl.text = "  " + msg
	_status_lbl.modulate = Color(0.4, 1.0, 0.6)
	_status_lbl.visible = true
