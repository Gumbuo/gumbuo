extends Node

# Reports a leaderboard score to the parent gamehole.games page via
# postMessage, matching the GAME_OVER contract useGameScoreTracking.ts
# listens for. No-ops outside of a Web export (e.g. desktop test builds).
func report_score(score: int, extra_stats: Dictionary = {}) -> void:
	if OS.get_name() != "Web":
		return
	var payload := {
		"type": "GAME_OVER",
		"game": "foxstead",
		"score": score,
	}
	for key in extra_stats:
		payload[key] = extra_stats[key]
	var json_str := JSON.stringify(payload)
	JavaScriptBridge.eval("window.parent.postMessage(%s, '*');" % json_str)
