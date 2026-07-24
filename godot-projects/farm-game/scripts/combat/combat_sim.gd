class_name CombatSim
extends RefCounted

# Pure, deterministic fight resolution — given the same three inputs, this
# produces byte-identical results everywhere. That's the whole trick behind
# resolving PvP without a server: the attacker's client picks a timestamp
# and broadcasts {attacker, defender, ts} once; both clients then run this
# same function locally and independently arrive at the same outcome, so
# there's nothing to negotiate or race over the wire.

const MAX_HP := 100
const MAX_ROUNDS := 20
const MOVES := ["punch", "kick"]
const MOVE_DAMAGE := {"punch": [8, 16], "kick": [14, 24]}
const MISS_CHANCE := 0.12

# Returns {"rounds": Array, "winner": String, "final_hp": Dictionary}.
# Each round: {"attacker", "defender", "move", "hit", "damage",
#              "attacker_hp", "defender_hp"} (hp values are post-round).
static func simulate(attacker_wallet: String, defender_wallet: String, ts: int) -> Dictionary:
	var rng := RandomNumberGenerator.new()
	rng.seed = hash("%s|%s|%d" % [attacker_wallet, defender_wallet, ts])

	var hp := {attacker_wallet: MAX_HP, defender_wallet: MAX_HP}
	var rounds: Array = []
	var turn := attacker_wallet
	var other := defender_wallet

	for i in MAX_ROUNDS:
		if hp[attacker_wallet] <= 0 or hp[defender_wallet] <= 0:
			break
		var move: String = MOVES[rng.randi() % MOVES.size()]
		var hit: bool = rng.randf() >= MISS_CHANCE
		var dmg := 0
		if hit:
			var dmg_range: Array = MOVE_DAMAGE[move]
			dmg = rng.randi_range(dmg_range[0], dmg_range[1])
			hp[other] = max(0, hp[other] - dmg)
		rounds.append({
			"attacker": turn, "defender": other, "move": move,
			"hit": hit, "damage": dmg,
			"attacker_hp": hp[turn], "defender_hp": hp[other],
		})
		if hp[other] <= 0:
			break
		var tmp := turn
		turn = other
		other = tmp

	var winner: String
	if hp[attacker_wallet] <= 0 and hp[defender_wallet] > 0:
		winner = defender_wallet
	elif hp[defender_wallet] <= 0 and hp[attacker_wallet] > 0:
		winner = attacker_wallet
	else:
		# Ran out of rounds (or a simultaneous double-KO edge case) —
		# whoever has more HP left wins; attacker wins an exact tie.
		winner = attacker_wallet if hp[attacker_wallet] >= hp[defender_wallet] else defender_wallet

	return {"rounds": rounds, "winner": winner, "final_hp": hp}
