extends CanvasLayer

# drops: Array of { "label": String, "color": Color, "items": [{ "id": String, "count": int }] }
func show_drops(drops: Array) -> void:
	layer = 100  # above slot_grid (layer 1) and player proxy (layer 6)
	# Kill any other drops_popup already on screen so we never show two at once.
	for existing in get_tree().get_nodes_in_group("drops_popup_active"):
		if is_instance_valid(existing) and existing != self:
			existing.queue_free()
	add_to_group("drops_popup_active")

	# Gather all drop text into one compact line per group
	var lines: Array = []
	for group in drops:
		var parts: Array = []
		for it in group.get("items", []):
			if it.get("count", 0) <= 0:
				continue
			var info: Dictionary = ResourceManager.get_item_info(str(it.get("id", "")))
			parts.append("%s x%d" % [info.get("name", it.get("id", "?")), it.get("count", 0)])
		if parts.is_empty():
			continue
		lines.append("%s: %s" % [group.get("label", ""), "  ".join(parts)])

	if lines.is_empty():
		queue_free()
		return

	# Plain ColorRect background — no PanelContainer padding so height stays tight
	var vp_size := get_viewport().get_visible_rect().size
	const CARD_H   := 38.0   # fits in the ~48 px gap between bottom slots (y≈612) and HUD (y≈660)
	const HUD_H    := 64.0   # approximate HUD bar height from the bottom
	const TOP_PAD  :=  4.0

	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.04, 0.08, 0.92)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bg.size = Vector2(vp_size.x, CARD_H)
	bg.position = Vector2(0.0, vp_size.y - HUD_H - CARD_H)
	add_child(bg)

	# Stack lines inside the card
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 1)
	vbox.position = Vector2(0.0, TOP_PAD)
	vbox.size = Vector2(vp_size.x, CARD_H - TOP_PAD * 2.0)
	bg.add_child(vbox)

	for i in lines.size():
		var lbl := Label.new()
		lbl.text = lines[i]
		lbl.add_theme_font_size_override("font_size", 10)
		lbl.add_theme_constant_override("outline_size", 1)
		lbl.add_theme_color_override("font_outline_color", Color(0.95, 0.97, 1.0))
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		lbl.size_flags_vertical = Control.SIZE_EXPAND_FILL
		lbl.modulate = Color(0.95, 0.97, 1.0)
		vbox.add_child(lbl)

	# Fade out quickly — visible ~0.9 s, then gone
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(bg, "position:y", bg.position.y - 6.0, 1.4).set_ease(Tween.EASE_OUT)
	tween.tween_property(bg, "modulate:a", 0.0, 1.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN).set_delay(0.9)
	tween.chain().tween_callback(queue_free)
