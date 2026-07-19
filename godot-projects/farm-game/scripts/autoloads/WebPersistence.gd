extends Node

# Godot's HTML5 export writes user:// to an in-memory IDBFS that is only
# flushed to the browser's actual persistent IndexedDB storage at certain
# engine-chosen points (e.g. clean tab close) — a plain refresh can happen
# before that flush completes, silently losing anything written since the
# last sync even though ConfigFile.save() reported success. Call flush()
# right after any save whose loss would be noticeable (inventory, land,
# player data) to force the write out immediately.
func flush() -> void:
	if OS.get_name() != "Web":
		return
	JavaScriptBridge.eval("""
		if (typeof FS !== 'undefined' && FS.syncfs) {
			FS.syncfs(false, function(err) { if (err) console.error('[WebPersistence] syncfs error', err); });
		}
	""")
