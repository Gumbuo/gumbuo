extends CanvasLayer

# drops: Array of { "label": String, "color": Color, "items": [{ "id": String, "count": int }] }
func show_drops(drops: Array) -> void:
	layer = 50

	var panel := PanelContainer.new()
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.anchor_left   = 0.5
	panel.anchor_top    = 1.0
	panel.anchor_right  = 0.5
	panel.anchor_bottom = 1.0
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)

	for group in drops:
		if group.get("items", []).is_empty():
			continue

		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 6)
		vbox.add_child(hbox)

		var who_lbl := Label.new()
		who_lbl.text = str(group.get("label", "?")) + ":"
		who_lbl.add_theme_font_size_override("font_size", 9)
		who_lbl.modulate = group.get("color", Color(1.0, 1.0, 1.0))
		who_lbl.custom_minimum_size = Vector2(72, 0)
		hbox.add_child(who_lbl)

		var parts: Array = []
		for it in group["items"]:
			if it.get("count", 0) <= 0:
				continue
			var info: Dictionary = ResourceManager.get_item_info(str(it.get("id", "")))
			parts.append("%s x%d" % [info.get("name", it.get("id", "?")), it.get("count", 0)])
		if parts.is_empty():
			continue

		var items_lbl := Label.new()
		items_lbl.text = "  ".join(parts)
		items_lbl.add_theme_font_size_override("font_size", 10)
		items_lbl.modulate = Color(0.9, 0.95, 1.0)
		hbox.add_child(items_lbl)

	# size and position after children are laid out
	await get_tree().process_frame
	await get_tree().process_frame
	var sz: Vector2 = panel.size
	panel.position = Vector2(-sz.x / 2.0, -sz.y - 18.0)

	# slide up then fade out
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(panel, "position:y", panel.position.y - 18.0, 2.8).set_ease(Tween.EASE_OUT)
	tween.tween_property(panel, "modulate:a", 0.0, 2.8).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN).set_delay(1.6)
	tween.chain().tween_callback(queue_free)
