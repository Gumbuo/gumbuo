extends CanvasLayer

var tile_id: String = ""
var grid_pos: Vector2i = Vector2i.ZERO

const MAX_FEED      := 30
const HATCH_SECS    := 129600   # 36 hrs — egg incubation
const LAY_SECS      := 86400    # 24 hrs — egg-laying cycle
const STARVE_SECS   := 259200   # 72 hrs — chicken wanders off when feed empty this long
const DEPOSIT_AMT   := 10       # must deposit 10 bags at once

var _slot_key: String = ""
var _coop_data: Dictionary = {}
var _slot_panels: Array = []
var _icon_rects:  Array = []
var _feed_bar: ColorRect = null
var _feed_lbl: Label = null
var _collect_btn: Button = null
var _status_lbl: Label = null

func _ready() -> void:
	layer = 40
	_slot_key = LandManager.slot_key(grid_pos)
	_load_coop_data()
	_build_ui()

func _load_coop_data() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var data: Dictionary = slots.get(_slot_key, {})
	if not data.has("coop_slots"):      data["coop_slots"]       = [null, null, null]
	if not data.has("coop_feed"):       data["coop_feed"]        = 0
	if not data.has("feed_empty_since"): data["feed_empty_since"] = 0
	_coop_data = data

func _save_coop_data() -> void:
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	if not slots.has(_slot_key): return
	slots[_slot_key]["coop_slots"]       = _coop_data.get("coop_slots", [null, null, null])
	slots[_slot_key]["coop_feed"]        = _coop_data.get("coop_feed", 0)
	slots[_slot_key]["feed_empty_since"] = _coop_data.get("feed_empty_since", 0)
	LandManager.save_land_data()
	LandManager.slot_item_placed.emit(tile_id, _slot_key, "chicken_coop")

# ─────────────────── PROCESS (live timers) ──────────────────

func _process(_dt: float) -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var now := int(Time.get_unix_time_from_system())
	var eggs_ready := 0
	var feed: int = _coop_data.get("coop_feed", 0)

	for i in 3:
		if i >= _slot_panels.size(): break
		var sp: PanelContainer = _slot_panels[i]
		var timer_lbl: Label   = sp.get_node_or_null("VBoxContainer/TimerLbl")
		var cs: Variant = coop_slots[i]

		if cs == null or not is_instance_valid(timer_lbl):
			if is_instance_valid(timer_lbl): timer_lbl.text = ""
			continue

		if (cs as Dictionary).get("kind", "") == "egg":
			var remaining: int = max(0, HATCH_SECS - (now - (cs as Dictionary).get("placed_at", now)))
			if remaining == 0:
				timer_lbl.text = "Hatching!"
				timer_lbl.modulate = Color(1.0, 0.9, 0.2)
			else:
				timer_lbl.text = "%dh %dm" % [remaining / 3600, (remaining % 3600) / 60]
				timer_lbl.modulate = Color(0.8, 0.85, 1.0)
		else:  # chicken
			var last_laid: int = (cs as Dictionary).get("last_laid_at", 0)
			var remaining: int = max(0, LAY_SECS - (now - last_laid))
			if remaining == 0:
				eggs_ready += 1
				timer_lbl.text = "EGG READY!"
				timer_lbl.modulate = Color(1.0, 0.9, 0.2)
			else:
				timer_lbl.text = "Next egg: %dh %dm" % [remaining / 3600, (remaining % 3600) / 60]
				timer_lbl.modulate = Color(0.75, 0.85, 0.75)

	# Starvation warning
	var feed_empty_since: int = _coop_data.get("feed_empty_since", 0)
	if feed == 0 and feed_empty_since > 0:
		var starve_remaining: int = max(0, STARVE_SECS - (now - feed_empty_since))
		if starve_remaining < 86400 and is_instance_valid(_status_lbl):
			_status_lbl.text = "  WARNING: Chickens will wander off in %dh %dm if not fed!" % [starve_remaining / 3600, (starve_remaining % 3600) / 60]
			_status_lbl.modulate = Color(1.0, 0.35, 0.35)
			_status_lbl.visible = true

	# Collect button live state
	if is_instance_valid(_collect_btn):
		if eggs_ready > 0 and feed >= eggs_ready:
			_collect_btn.text = "Collect Eggs  (%d ready · uses %d feed)" % [eggs_ready, eggs_ready]
			_collect_btn.disabled = false
			_collect_btn.modulate = Color(1, 1, 1)
		elif eggs_ready > 0 and feed > 0:
			_collect_btn.text = "Collect Eggs  (%d ready · only %d feed, will collect %d)" % [eggs_ready, feed, feed]
			_collect_btn.disabled = false
			_collect_btn.modulate = Color(1.0, 0.85, 0.5)
		elif eggs_ready > 0:
			_collect_btn.text = "Need Feed  (%d eggs waiting — bin empty!)" % eggs_ready
			_collect_btn.disabled = true
			_collect_btn.modulate = Color(1.0, 0.4, 0.4)
		else:
			_collect_btn.text = _collect_idle_text()
			_collect_btn.disabled = true
			_collect_btn.modulate = Color(0.6, 0.6, 0.6)

func _collect_idle_text() -> String:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	for cs: Variant in coop_slots:
		if cs != null and (cs as Dictionary).get("kind", "") == "chicken": return "No eggs ready (24hr cycle)"
	return "No chickens yet — incubate some eggs"

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

	# Panel is a child of the overlay (not a sibling).  In Godot 4, a child with
	# MOUSE_FILTER_STOP consumes the click before it bubbles to the parent, so
	# clicking inside the panel never fires the overlay's "close" handler.
	# Clicking outside the panel (on the overlay directly) does close it.
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -275
	panel.offset_top    = -255
	panel.offset_right  = 275
	panel.offset_bottom = 255
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

	var slots_hdr := Label.new()
	slots_hdr.text = "  Slots  (place an egg to incubate · 36hr hatch)"
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

	var feed_hdr := Label.new()
	feed_hdr.text = "  Feed Bin  (deposit 10 bags at once · 1 feed consumed per egg per chicken)"
	feed_hdr.add_theme_font_size_override("font_size", 10)
	feed_hdr.modulate = Color(0.75, 0.85, 1.0)
	root.add_child(feed_hdr)
	root.add_child(_make_feed_section())
	root.add_child(HSeparator.new())

	_collect_btn = Button.new()
	_collect_btn.add_theme_font_size_override("font_size", 11)
	_collect_btn.pressed.connect(_do_collect_eggs)
	root.add_child(_collect_btn)

	_refresh_static()

func _make_slot_panel(idx: int) -> PanelContainer:
	var sp := PanelContainer.new()
	sp.custom_minimum_size = Vector2(162, 175)
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
	var _feed_tex_path := "res://assets/sprites/items/chicken_feed.png"
	if ResourceLoader.exists(_feed_tex_path):
		feed_icon.texture = load(_feed_tex_path)
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
	if ResourceLoader.exists(path):
		return load(path) as Texture2D
	return null

func _refresh_static() -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var feed: int = _coop_data.get("coop_feed", 0)

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
			if action_btn: action_btn.text = "Place Egg ↑"; action_btn.disabled = false; action_btn.modulate = Color(1, 1, 1)
		elif (cs as Dictionary).get("kind", "") == "egg":
			var etype: String = (cs as Dictionary).get("type", "white")
			if icon_rect:  icon_rect.texture = _load_icon("egg_" + etype)
			if kind_lbl:
				kind_lbl.text = ("Gold Egg" if etype == "gold" else "White Egg")
				kind_lbl.modulate = Color(1.0, 0.88, 0.3) if etype == "gold" else Color(1.0, 1.0, 0.9)
			if action_btn: action_btn.text = "Incubating..."; action_btn.disabled = true; action_btn.modulate = Color(0.55, 0.55, 0.65)
		else:  # chicken
			var ctype: String = (cs as Dictionary).get("type", "white")
			var clrs: Dictionary = {
				"white": Color(1.0, 1.0, 1.0), "black": Color(0.7, 0.7, 0.8),
				"brown": Color(0.85, 0.6, 0.3), "gold": Color(1.0, 0.88, 0.2)
			}
			if icon_rect:  icon_rect.texture = _load_icon("chicken_" + ctype)
			if kind_lbl:
				kind_lbl.text = ctype.capitalize() + " Chicken"
				kind_lbl.modulate = clrs.get(ctype, Color(1, 1, 1))
			if action_btn: action_btn.text = "Lays 1 egg / 24hr"; action_btn.disabled = true; action_btn.modulate = Color(0.55, 0.55, 0.65)

	var fill_pct := float(feed) / float(MAX_FEED)
	if is_instance_valid(_feed_bar):
		_feed_bar.size = Vector2(510.0 * fill_pct, 20)
		_feed_bar.color = Color(0.3, 0.8, 0.3) if feed > 0 else Color(0.65, 0.2, 0.2)
	if is_instance_valid(_feed_lbl):
		var have := ResourceManager.get_count("chicken_feed")
		_feed_lbl.text = "  Feed: %d / %d    (You have %d bags — deposit 10 at a time)" % [feed, MAX_FEED, have]
		_feed_lbl.modulate = Color(0.3, 1.0, 0.4) if feed > 0 else Color(1.0, 0.35, 0.35)

# ─────────────────────────── ACTIONS ────────────────────────

func _on_slot_pressed(idx: int) -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	if coop_slots[idx] != null: return
	if not ResourceManager.has_item("egg_white") and not ResourceManager.has_item("egg_gold"):
		_set_status("No eggs in backpack. Need egg_white or egg_gold.")
		return
	_show_egg_picker(idx)

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
	coop_slots[slot_idx] = {"kind": "egg", "type": egg_type, "placed_at": int(Time.get_unix_time_from_system())}
	_coop_data["coop_slots"] = coop_slots
	_save_coop_data()
	_set_status("Egg placed! Hatches in 36 hours.")
	_refresh_static()

func _do_add_feed() -> void:
	if not ResourceManager.has_item("chicken_feed", DEPOSIT_AMT):
		_set_status("Need at least %d bags of Chicken Feed to deposit." % DEPOSIT_AMT)
		return
	var feed: int = _coop_data.get("coop_feed", 0)
	if feed + DEPOSIT_AMT > MAX_FEED:
		_set_status("Not enough space. Bin has %d/%d. Max is %d." % [feed, MAX_FEED, MAX_FEED])
		return
	ResourceManager.remove_item("chicken_feed", DEPOSIT_AMT)
	_coop_data["coop_feed"] = feed + DEPOSIT_AMT
	_coop_data["feed_empty_since"] = 0  # reset starvation clock
	_save_coop_data()
	_set_status("Deposited %d feed. Bin: %d / %d." % [DEPOSIT_AMT, _coop_data["coop_feed"], MAX_FEED])
	_refresh_static()

func _do_collect_eggs() -> void:
	var coop_slots: Array = _coop_data.get("coop_slots", [null, null, null])
	var feed: int = _coop_data.get("coop_feed", 0)
	if feed <= 0:
		_set_status("Feed bin empty — deposit 10 bags first.")
		return
	var now: int = int(Time.get_unix_time_from_system())
	var collected: int = 0
	for i in coop_slots.size():
		var cs: Variant = coop_slots[i]
		if cs == null or (cs as Dictionary).get("kind", "") != "chicken": continue
		if now - (cs as Dictionary).get("last_laid_at", 0) < LAY_SECS: continue
		if feed <= 0: break  # ran out of feed mid-collect
		# Roll egg type: 90% white, 10% gold
		ResourceManager.add_item("egg_gold" if randf() < 0.10 else "egg_white", 1)
		(cs as Dictionary)["last_laid_at"] = now
		coop_slots[i] = cs
		feed -= 1
		collected += 1

	if collected == 0:
		_set_status("No eggs ready yet. Chickens lay once every 24 hours.")
		return

	_coop_data["coop_slots"] = coop_slots
	_coop_data["coop_feed"]  = feed
	# If feed is now 0, start starvation clock
	if feed == 0 and _coop_data.get("feed_empty_since", 0) == 0:
		_coop_data["feed_empty_since"] = now
	_save_coop_data()
	PlayerData.add_xp(1)
	_set_status("Collected %d egg%s! (%d feed used)" % [collected, "s" if collected != 1 else "", collected])
	_refresh_static()

func _set_status(msg: String) -> void:
	if not is_instance_valid(_status_lbl): return
	_status_lbl.text = "  " + msg
	_status_lbl.modulate = Color(0.4, 1.0, 0.6)
	_status_lbl.visible = true
