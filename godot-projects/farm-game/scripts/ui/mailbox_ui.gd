extends CanvasLayer

# Set before adding to scene tree
var mode: String = "inbox"       # "inbox" or "compose"
var recipient: String = ""       # mailbox owner wallet (compose mode)

var _compose_items: Array = []

var _inbox_list: VBoxContainer
var _items_box: VBoxContainer
var _note_field: LineEdit
var _status_lbl: Label
var _gold_lbl: Label

func _ready() -> void:
	layer = 40
	_build_ui()

# ─────────────────────────── BUILD ──────────────────────────

func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			queue_free()
	)
	add_child(overlay)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(420, 400)
	panel.anchor_left   = 0.5
	panel.anchor_top    = 0.5
	panel.anchor_right  = 0.5
	panel.anchor_bottom = 0.5
	panel.position      = Vector2(-210, -200)
	panel.mouse_filter  = Control.MOUSE_FILTER_STOP
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 5)
	panel.add_child(vbox)

	# ── Header ──
	var header := HBoxContainer.new()
	vbox.add_child(header)
	var title := Label.new()
	title.text = "  YOUR MAILBOX" if mode == "inbox" else "  SEND MAIL"
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = Color(1.0, 0.9, 0.4)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title)
	var close_btn := Button.new()
	close_btn.text = " X "
	close_btn.add_theme_font_size_override("font_size", 10)
	close_btn.pressed.connect(func(): queue_free())
	header.add_child(close_btn)
	vbox.add_child(HSeparator.new())

	# ── Status label ──
	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 9)
	_status_lbl.modulate = Color(0.5, 1.0, 0.6)
	_status_lbl.visible = false
	vbox.add_child(_status_lbl)

	# ── Scroll area ──
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(410, 320)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	if mode == "inbox":
		_inbox_list = VBoxContainer.new()
		_inbox_list.add_theme_constant_override("separation", 6)
		_inbox_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		scroll.add_child(_inbox_list)
		_fetch_inbox()
	else:
		var compose := VBoxContainer.new()
		compose.add_theme_constant_override("separation", 6)
		compose.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		scroll.add_child(compose)
		_build_compose(compose)

# ─────────────────────────── INBOX ──────────────────────────

func _fetch_inbox() -> void:
	_set_status("Loading mail...")
	MailManager.inbox_fetched.connect(_on_inbox_fetched, CONNECT_ONE_SHOT)
	MailManager.fetch_inbox()

func _on_inbox_fetched(messages: Array) -> void:
	_status_lbl.visible = false
	for c in _inbox_list.get_children():
		c.queue_free()

	if messages.is_empty():
		var lbl := Label.new()
		lbl.text = "No mail yet."
		lbl.add_theme_font_size_override("font_size", 10)
		lbl.modulate = Color(0.55, 0.55, 0.55)
		_inbox_list.add_child(lbl)
		return

	for msg in messages:
		_add_mail_row(msg)

func _add_mail_row(msg: Dictionary) -> void:
	var row := PanelContainer.new()
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 3)
	row.add_child(vb)

	# From address
	var from_str: String = str(msg.get("from", "unknown"))
	var short_from: String = from_str.substr(0, 8) + "..." + from_str.right(4) if from_str.length() > 14 else from_str
	var from_lbl := Label.new()
	from_lbl.text = "From: %s" % short_from
	from_lbl.add_theme_font_size_override("font_size", 9)
	from_lbl.modulate = Color(0.75, 0.9, 1.0)
	vb.add_child(from_lbl)

	# Items
	var items: Array = msg.get("items", [])
	if not items.is_empty():
		var parts: Array = []
		for it in items:
			var info := ResourceManager.get_item_info(str(it.get("item_id", "")))
			parts.append("%s x%d" % [info.get("name", it.get("item_id", "?")), it.get("count", 1)])
		var items_lbl := Label.new()
		items_lbl.text = "Items: " + ", ".join(parts)
		items_lbl.add_theme_font_size_override("font_size", 8)
		items_lbl.modulate = Color(0.6, 1.0, 0.6)
		items_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vb.add_child(items_lbl)

	# Note
	var note: String = str(msg.get("note", ""))
	if not note.is_empty():
		var note_lbl := Label.new()
		note_lbl.text = '"%s"' % (note.substr(0, 80) + ("..." if note.length() > 80 else ""))
		note_lbl.add_theme_font_size_override("font_size", 8)
		note_lbl.modulate = Color(0.88, 0.88, 0.88)
		note_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vb.add_child(note_lbl)

	# Claim button
	var btns := HBoxContainer.new()
	vb.add_child(btns)
	if msg.get("collected", false):
		var done_lbl := Label.new()
		done_lbl.text = "Collected"
		done_lbl.add_theme_font_size_override("font_size", 8)
		done_lbl.modulate = Color(0.45, 0.45, 0.45)
		btns.add_child(done_lbl)
	else:
		var btn := Button.new()
		btn.text = "Claim Items" if not items.is_empty() else "Mark Read"
		btn.add_theme_font_size_override("font_size", 9)
		var cap_id: String = str(msg.get("id", ""))
		btn.pressed.connect(func(): _do_collect(cap_id, btn))
		btns.add_child(btn)

	_inbox_list.add_child(row)

func _do_collect(mail_id: String, btn: Button) -> void:
	btn.disabled = true
	_set_status("Claiming...")
	MailManager.mail_collected.connect(func(success: bool, received: Array) -> void:
		if success:
			for it in received:
				ResourceManager.add_item(str(it.get("item_id", "")), int(it.get("count", 1)))
			_set_status("Items added to your backpack!")
			_fetch_inbox()
		else:
			_set_status("Failed to claim. Try again.")
			btn.disabled = false
	, CONNECT_ONE_SHOT)
	MailManager.collect_mail(mail_id)

# ─────────────────────────── COMPOSE ────────────────────────

func _build_compose(parent: VBoxContainer) -> void:
	# Show recipient (read-only)
	var to_lbl := Label.new()
	var short_r: String = recipient.substr(0, 8) + "..." + recipient.right(4) if recipient.length() > 14 else recipient
	to_lbl.text = "To: %s" % short_r
	to_lbl.add_theme_font_size_override("font_size", 9)
	to_lbl.modulate = Color(0.75, 0.9, 1.0)
	parent.add_child(to_lbl)
	parent.add_child(HSeparator.new())

	# Items section
	var items_hdr := HBoxContainer.new()
	parent.add_child(items_hdr)
	var items_lbl := Label.new()
	items_lbl.text = "Items to send:"
	items_lbl.add_theme_font_size_override("font_size", 9)
	items_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	items_hdr.add_child(items_lbl)
	var add_btn := Button.new()
	add_btn.text = "+ Add Item"
	add_btn.add_theme_font_size_override("font_size", 9)
	add_btn.pressed.connect(_show_item_picker)
	items_hdr.add_child(add_btn)

	_items_box = VBoxContainer.new()
	_items_box.add_theme_constant_override("separation", 3)
	parent.add_child(_items_box)
	parent.add_child(HSeparator.new())

	# Note field
	var note_lbl := Label.new()
	note_lbl.text = "Message (optional, 200 chars max):"
	note_lbl.add_theme_font_size_override("font_size", 9)
	parent.add_child(note_lbl)
	_note_field = LineEdit.new()
	_note_field.placeholder_text = "Write a message..."
	_note_field.add_theme_font_size_override("font_size", 9)
	_note_field.max_length = 200
	_note_field.custom_minimum_size = Vector2(400, 0)
	parent.add_child(_note_field)
	parent.add_child(HSeparator.new())

	# Tax label
	_gold_lbl = Label.new()
	_gold_lbl.text = "Tax: 0.00 gold (0 items)  |  Your gold: %g" % PlayerData.gold
	_gold_lbl.add_theme_font_size_override("font_size", 9)
	_gold_lbl.modulate = Color(1.0, 0.85, 0.3)
	parent.add_child(_gold_lbl)

	# Send button
	var send_btn := Button.new()
	send_btn.text = "SEND"
	send_btn.add_theme_font_size_override("font_size", 11)
	send_btn.pressed.connect(_do_send)
	parent.add_child(send_btn)

func _show_item_picker() -> void:
	var popup := PanelContainer.new()
	popup.z_index = 50
	popup.custom_minimum_size = Vector2(210, 300)
	popup.position = Vector2(500, 150)
	popup.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(popup)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 3)
	popup.add_child(vb)

	var hdr := Label.new()
	hdr.text = "Pick an item:"
	hdr.add_theme_font_size_override("font_size", 10)
	vb.add_child(hdr)
	vb.add_child(HSeparator.new())

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(200, 230)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vb.add_child(scroll)

	var list := VBoxContainer.new()
	list.add_theme_constant_override("separation", 2)
	scroll.add_child(list)

	var has_any := false
	for iid in ResourceManager.inventory:
		var cnt: int = ResourceManager.inventory[iid]
		if cnt <= 0: continue
		var info := ResourceManager.get_item_info(iid)
		if info.get("player_bound", false): continue
		has_any = true
		var row_btn := Button.new()
		row_btn.text = "%s  x%d" % [info.get("name", iid), cnt]
		row_btn.add_theme_font_size_override("font_size", 9)
		row_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var cap_iid: String = iid
		row_btn.pressed.connect(func() -> void:
			_add_compose_item(cap_iid, 1)
			popup.queue_free()
		)
		list.add_child(row_btn)

	if not has_any:
		var none_lbl := Label.new()
		none_lbl.text = "No sendable items."
		none_lbl.add_theme_font_size_override("font_size", 9)
		list.add_child(none_lbl)

	var cancel := Button.new()
	cancel.text = "Cancel"
	cancel.add_theme_font_size_override("font_size", 9)
	cancel.pressed.connect(func(): popup.queue_free())
	vb.add_child(cancel)

func _add_compose_item(item_id: String, amount: int) -> void:
	for entry in _compose_items:
		if entry["item_id"] == item_id:
			entry["count"] = min(entry["count"] + amount, ResourceManager.get_count(item_id))
			_rebuild_compose_items()
			return
	_compose_items.append({"item_id": item_id, "count": amount})
	_rebuild_compose_items()

func _rebuild_compose_items() -> void:
	for c in _items_box.get_children():
		c.queue_free()

	for i in _compose_items.size():
		var entry: Dictionary = _compose_items[i]
		var info: Dictionary = ResourceManager.get_item_info(str(entry["item_id"]))
		var max_have: int = ResourceManager.get_count(entry["item_id"])
		var row := HBoxContainer.new()

		var name_lbl := Label.new()
		name_lbl.text = info.get("name", entry["item_id"])
		name_lbl.add_theme_font_size_override("font_size", 9)
		name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(name_lbl)

		var minus_btn := Button.new()
		minus_btn.text = "-"
		minus_btn.add_theme_font_size_override("font_size", 9)
		minus_btn.custom_minimum_size = Vector2(26, 0)
		var ci := i
		minus_btn.pressed.connect(func(): _adjust_item(ci, -1))
		row.add_child(minus_btn)

		var cnt_lbl := Label.new()
		cnt_lbl.text = "%d/%d" % [entry["count"], max_have]
		cnt_lbl.add_theme_font_size_override("font_size", 9)
		cnt_lbl.custom_minimum_size = Vector2(48, 0)
		cnt_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		row.add_child(cnt_lbl)

		var plus_btn := Button.new()
		plus_btn.text = "+"
		plus_btn.add_theme_font_size_override("font_size", 9)
		plus_btn.custom_minimum_size = Vector2(26, 0)
		var ci2 := i
		plus_btn.pressed.connect(func(): _adjust_item(ci2, 1))
		row.add_child(plus_btn)

		var max_btn := Button.new()
		max_btn.text = "Max"
		max_btn.add_theme_font_size_override("font_size", 8)
		max_btn.custom_minimum_size = Vector2(32, 0)
		var ci3 := i
		max_btn.pressed.connect(func(): _compose_items[ci3]["count"] = max_have; _rebuild_compose_items())
		row.add_child(max_btn)

		var rm_btn := Button.new()
		rm_btn.text = "X"
		rm_btn.add_theme_font_size_override("font_size", 9)
		rm_btn.custom_minimum_size = Vector2(26, 0)
		rm_btn.modulate = Color(1.0, 0.4, 0.4)
		var ci4 := i
		rm_btn.pressed.connect(func(): _compose_items.remove_at(ci4); _rebuild_compose_items())
		row.add_child(rm_btn)

		_items_box.add_child(row)

	_update_gold_label()

func _adjust_item(idx: int, delta: int) -> void:
	if idx >= _compose_items.size(): return
	var entry: Dictionary = _compose_items[idx]
	entry["count"] = clamp(entry["count"] + delta, 1, ResourceManager.get_count(entry["item_id"]))
	_rebuild_compose_items()

func _update_gold_label() -> void:
	var n: int = _compose_items.size()
	_gold_lbl.text = "Tax: %.2f gold (%d item type%s)  |  Your gold: %g" % [
		snappedf(n * 0.01, 0.01), n, "s" if n != 1 else "", PlayerData.gold
	]

func _do_send() -> void:
	var to: String = recipient.strip_edges().to_lower()
	if not (to.begins_with("0x") and to.length() >= 10):
		_set_status("Invalid recipient address.")
		return

	var note: String = _note_field.text.strip_edges()
	if _compose_items.is_empty() and note.is_empty():
		_set_status("Add at least one item or write a message.")
		return

	var cost: float = snappedf(_compose_items.size() * 0.01, 0.01)
	if cost > 0.0 and not PlayerData.spend_gold(cost):
		_set_status("Not enough gold. Need %.2f gold for tax." % cost)
		return

	for entry in _compose_items:
		ResourceManager.remove_item(entry["item_id"], entry["count"])

	_set_status("Sending...")

	MailManager.mail_sent.connect(func(success: bool, error: String) -> void:
		if success:
			PlayerData.save_data()
			ResourceManager.save_inventory()
			_compose_items.clear()
			_note_field.text = ""
			_rebuild_compose_items()
			_set_status("Mail sent!")
		else:
			if cost > 0.0: PlayerData.add_gold(cost)
			for entry in _compose_items:
				ResourceManager.add_item(entry["item_id"], entry["count"])
			_set_status("Failed: %s" % error)
	, CONNECT_ONE_SHOT)

	MailManager.send_mail(to, _compose_items.duplicate(true), note)

# ──────────────────────────── UTIL ──────────────────────────

func _set_status(msg: String) -> void:
	_status_lbl.text = "  " + msg
	_status_lbl.visible = true
