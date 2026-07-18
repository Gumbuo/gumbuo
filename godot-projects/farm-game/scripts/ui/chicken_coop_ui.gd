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
var _slot_remind_lbl: Label = null
var _status_lbl:  Label = null
var _chicken_rows_vb: VBoxContainer = null

func _ready() -> void:
	layer = 40
	add_to_group("action_windows")  # prevents slot_grid._input() from firing through this UI

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
	# Full-screen dark overlay — click outside panel to close
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed: queue_free()
	)
	add_child(overlay)

	# Main panel — 550×550 square (matches 256×256 bg image at ≈2.15× scale)
	var panel := Control.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(550, 550)
	panel.offset_left   = -275
	panel.offset_top    = -275
	panel.offset_right  =  275
	panel.offset_bottom =  275
	panel.mouse_filter  = Control.MOUSE_FILTER_STOP
	overlay.add_child(panel)

	# Background image
	const BG_PATH := "res://assets/sprites/ui/chicken_coop_bg.png"
	if ResourceLoader.exists(BG_PATH):
		var bg := TextureRect.new()
		bg.texture = load(BG_PATH) as Texture2D
		bg.set_anchors_preset(Control.PRESET_FULL_RECT)
		bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bg.stretch_mode = TextureRect.STRETCH_SCALE
		panel.add_child(bg)

	# Status / starvation warning (over the top sign area)
	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 8)
	_status_lbl.modulate = Color(0.3, 1.0, 0.5)
	_status_lbl.visible = false
	_status_lbl.position = Vector2(5, 3)
	_status_lbl.custom_minimum_size = Vector2(540, 0)
	_status_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(_status_lbl)

	# 3 incubation slots — egg icon floats over chamber window, action panel below
	# Image 256×256 at 2.148× → chamber viewing-window centres at panel y≈141
	# Chamber x-centres in image: ~44, 128, 212 → panel: ~95, 275, 456
	_slot_panels.clear()
	_icon_rects.clear()
	var slot_cx := [100, 280, 461]
	for i in 3:
		var cx: int = slot_cx[i]
		# Egg icon — standalone TextureRect over the chamber viewing window (no container)
		var ir := TextureRect.new()
		ir.custom_minimum_size = Vector2(64, 64)
		ir.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		ir.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		ir.position = Vector2(cx - 27, 162)
		ir.size = Vector2(64, 64)
		panel.add_child(ir)
		_icon_rects.append(ir)
		# Slot panel — visible, styled, in the lower portion of the chamber frame
		var sp := _make_slot_section(i, cx)
		panel.add_child(sp)
		_slot_panels.append(sp)

	# Chickens section — compact scrollable list between chambers and feed bin
	var chick_panel := PanelContainer.new()
	chick_panel.position = Vector2(90, 330)
	chick_panel.custom_minimum_size = Vector2(370, 10)
	var cpb := StyleBoxFlat.new()
	cpb.bg_color = Color(0.06, 0.04, 0.02, 0.85)
	cpb.set_corner_radius_all(4)
	cpb.set_content_margin_all(4)
	chick_panel.add_theme_stylebox_override("panel", cpb)
	panel.add_child(chick_panel)

	var chick_outer := VBoxContainer.new()
	chick_outer.add_theme_constant_override("separation", 2)
	chick_panel.add_child(chick_outer)

	var chick_hdr := Label.new()
	chick_hdr.text = "Chickens  (lays 1 egg/day into tile slots)"
	chick_hdr.add_theme_font_size_override("font_size", 9)
	chick_hdr.modulate = Color(1.0, 0.85, 0.3)
	chick_outer.add_child(chick_hdr)

	var chick_scroll := ScrollContainer.new()
	chick_scroll.custom_minimum_size = Vector2(362, 44)
	chick_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	chick_outer.add_child(chick_scroll)

	_chicken_rows_vb = VBoxContainer.new()
	_chicken_rows_vb.add_theme_constant_override("separation", 2)
	_chicken_rows_vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chick_scroll.add_child(_chicken_rows_vb)

	# Feed info — inside the same card, below the chickens list
	chick_outer.add_child(HSeparator.new())

	_feed_lbl = Label.new()
	_feed_lbl.add_theme_font_size_override("font_size", 9)
	_feed_lbl.add_theme_color_override("font_color", Color(0.72, 0.90, 0.65))
	_feed_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chick_outer.add_child(_feed_lbl)

	_slot_remind_lbl = Label.new()
	_slot_remind_lbl.add_theme_font_size_override("font_size", 9)
	_slot_remind_lbl.add_theme_color_override("font_color", Color(0.40, 0.75, 1.0))
	_slot_remind_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_slot_remind_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	chick_outer.add_child(_slot_remind_lbl)

	# Feed bar — dark mask slides right to reveal the image's own grain bar beneath
	# Mask starts at x=22 (full width = all hidden), shrinks left as feed increases
	# Image bar area: x≈10-205 → panel x≈22-440, y≈415-437
	_feed_bar = ColorRect.new()
	_feed_bar.color = Color(0.05, 0.03, 0.01, 0.92)
	_feed_bar.position = Vector2(22, 415)
	_feed_bar.size = Vector2(418, 22)  # starts fully opaque (feed = 0 → all hidden)
	panel.add_child(_feed_bar)

	# Feed (+) button — transparent, overlaid on bottom-left bag art
	# Image: x=0-65, y=208-256 → panel: x=0-140, y=447-550
	var feed_btn := Button.new()
	feed_btn.position = Vector2(5, 452)
	feed_btn.custom_minimum_size = Vector2(132, 90)
	feed_btn.text = ""
	feed_btn.tooltip_text = "Deposit %d bags of chicken feed" % DEPOSIT_AMT
	_style_transparent_btn(feed_btn)
	feed_btn.pressed.connect(_do_add_feed)
	panel.add_child(feed_btn)

	# Close button — transparent, overlaid on bottom-right close art
	# Image: x=191-256, y=217-256 → panel: x=411-550, y=466-550
	var close_btn := Button.new()
	close_btn.position = Vector2(415, 466)
	close_btn.custom_minimum_size = Vector2(127, 77)
	close_btn.text = ""
	_style_transparent_btn(close_btn)
	close_btn.pressed.connect(func(): queue_free())
	panel.add_child(close_btn)

	_refresh_static()

func _make_slot_section(idx: int, cx: int) -> PanelContainer:
	# Visible panel sitting in the lower portion of the chamber frame (y≈248-318)
	var sp := PanelContainer.new()
	sp.position = Vector2(cx - 82, 248)
	var ssb := StyleBoxFlat.new()
	ssb.bg_color = Color(0.08, 0.06, 0.03, 0.92)
	ssb.border_width_left = 1; ssb.border_width_right  = 1
	ssb.border_width_top  = 1; ssb.border_width_bottom = 1
	ssb.border_color = Color(0.60, 0.48, 0.22)
	ssb.set_corner_radius_all(4)
	ssb.set_content_margin_all(5)
	sp.add_theme_stylebox_override("panel", ssb)

	var vb := VBoxContainer.new()
	vb.name = "VBoxContainer"  # explicit name so get_node_or_null path is reliable
	vb.add_theme_constant_override("separation", 3)
	sp.add_child(vb)

	var kind_lbl := Label.new()
	kind_lbl.name = "KindLbl"
	kind_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	kind_lbl.add_theme_font_size_override("font_size", 9)
	kind_lbl.add_theme_color_override("font_color", Color(0.92, 0.85, 0.70))
	vb.add_child(kind_lbl)

	var timer_lbl := Label.new()
	timer_lbl.name = "TimerLbl"
	timer_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	timer_lbl.add_theme_font_size_override("font_size", 8)
	timer_lbl.add_theme_color_override("font_color", Color(0.75, 0.88, 1.0))
	vb.add_child(timer_lbl)

	var action_btn := Button.new()
	action_btn.name = "ActionBtn"
	action_btn.add_theme_font_size_override("font_size", 10)
	action_btn.custom_minimum_size = Vector2(150, 28)
	action_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_btn.pressed.connect(func(): _on_slot_pressed(idx))
	vb.add_child(action_btn)

	return sp

func _style_transparent_btn(btn: Button) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color     = Color(0, 0, 0, 0)
	sb.border_color = Color(0, 0, 0, 0)
	btn.add_theme_stylebox_override("normal", sb)
	var sb_hover := StyleBoxFlat.new()
	sb_hover.bg_color = Color(1, 1, 1, 0.18)
	sb_hover.set_corner_radius_all(4)
	btn.add_theme_stylebox_override("hover", sb_hover)
	var sb_press := StyleBoxFlat.new()
	sb_press.bg_color = Color(1, 1, 1, 0.28)
	sb_press.set_corner_radius_all(4)
	btn.add_theme_stylebox_override("pressed", sb_press)

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
		var icon_rect: TextureRect = _icon_rects[i] if i < _icon_rects.size() else null
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
			var ready: bool = now - (cs as Dictionary).get("placed_at", now) >= HATCH_SECS
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

	# Feed bar — dark mask slides right as fill increases, revealing image's grain bar below
	var fill_pct := float(feed) / float(MAX_FEED)
	if is_instance_valid(_feed_bar):
		var fill_w := 418.0 * fill_pct
		_feed_bar.position = Vector2(22.0 + fill_w, 415)
		_feed_bar.size = Vector2(418.0 - fill_w, 22)
	if is_instance_valid(_feed_lbl):
		var have := ResourceManager.get_count("chicken_feed")
		_feed_lbl.text = "  Feed: %d / %d    (You have %d bags)" % [feed, MAX_FEED, have]
		_feed_lbl.modulate = Color(0.3, 1.0, 0.4) if feed > 0 else Color(1.0, 0.35, 0.35)
	if is_instance_valid(_slot_remind_lbl):
		var n := chickens.size()
		if n == 0:
			_slot_remind_lbl.text = "  Keep 1+ tile slots free so chickens can lay eggs."
		else:
			_slot_remind_lbl.text = "  Keep %d tile slot%s free — 1 per chicken for egg laying." % [n, "s" if n > 1 else ""]

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
	icon.custom_minimum_size = Vector2(20, 20)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(icon)

	var name_lbl := Label.new()
	name_lbl.text = ctype.capitalize() + " Chicken"
	name_lbl.modulate = clrs.get(ctype, Color(1, 1, 1))
	name_lbl.add_theme_font_size_override("font_size", 9)
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(name_lbl)

	var tlbl := Label.new()
	tlbl.name = "TimerLbl"
	tlbl.add_theme_font_size_override("font_size", 8)
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
