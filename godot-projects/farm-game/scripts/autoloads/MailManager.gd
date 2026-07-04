extends Node

signal inbox_fetched(messages: Array)
signal mail_sent(success: bool, error: String)
signal mail_collected(success: bool, items: Array)

const API_URL := "https://gumbuo.com/api/farm-mail"

var inbox: Array = []

func _make_http() -> HTTPRequest:
	var http := HTTPRequest.new()
	add_child(http)
	return http

func fetch_inbox() -> void:
	var wallet := PlayerData.wallet_address
	if wallet.is_empty():
		inbox_fetched.emit([])
		return
	var http := _make_http()
	http.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
		http.queue_free()
		if result != HTTPRequest.RESULT_SUCCESS or code != 200:
			inbox_fetched.emit([])
			return
		var json := JSON.new()
		if json.parse(body.get_string_from_utf8()) != OK:
			inbox_fetched.emit([])
			return
		var data = json.get_data()
		if data is Dictionary and data.get("success", false):
			inbox = data.get("messages", [])
			inbox_fetched.emit(inbox)
		else:
			inbox_fetched.emit([])
	)
	http.request("%s?wallet=%s" % [API_URL, wallet])

func send_mail(to_wallet: String, items: Array, note: String) -> void:
	var http := _make_http()
	http.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
		http.queue_free()
		if result != HTTPRequest.RESULT_SUCCESS or code != 200:
			mail_sent.emit(false, "Network error")
			return
		var json := JSON.new()
		if json.parse(body.get_string_from_utf8()) != OK:
			mail_sent.emit(false, "Parse error")
			return
		var data = json.get_data()
		if data is Dictionary and data.get("success", false):
			mail_sent.emit(true, "")
		else:
			mail_sent.emit(false, str(data.get("error", "Unknown error")) if data is Dictionary else "Unknown error")
	)
	var payload := JSON.stringify({
		"from": PlayerData.wallet_address,
		"to": to_wallet,
		"items": items,
		"note": note
	})
	var headers := PackedStringArray(["Content-Type: application/json"])
	http.request(API_URL, headers, HTTPClient.METHOD_POST, payload)

func collect_mail(mail_id: String) -> void:
	var http := _make_http()
	http.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
		http.queue_free()
		if result != HTTPRequest.RESULT_SUCCESS or code != 200:
			mail_collected.emit(false, [])
			return
		var json := JSON.new()
		if json.parse(body.get_string_from_utf8()) != OK:
			mail_collected.emit(false, [])
			return
		var data = json.get_data()
		if data is Dictionary and data.get("success", false):
			mail_collected.emit(true, data.get("items", []))
		else:
			mail_collected.emit(false, [])
	)
	var payload := JSON.stringify({
		"wallet": PlayerData.wallet_address,
		"mail_id": mail_id
	})
	var headers := PackedStringArray(["Content-Type: application/json"])
	http.request(API_URL, headers, HTTPClient.METHOD_PATCH, payload)
