const LAYER_CHALLS = {
	h: {
		rows: 7,
		cols: 2,
		res() { return player.points },
		resDisp: "Points",
		choose: 1,
		active(x) {
			if (x==12) if (LAYER_CHALLS.ge.active(31)) return true;
			if (x<72) if (this.active(72)) return true;
			if (x<71&&x!=42&&x!=52) if (this.active(71)) return true
			if (x==11||x==41) if (this.active(51)) return true
			if (x==31||x==32) if (this.active(61)) return true
			return player.h.active==x;
		},
		11: {
			name: "Skip the Second",
			desc: "Boosters and Generator Power do nothing",
			unl() { return player.h.best.gt(0) },
			goal: new Decimal("1e2400"),
			reward: "The generator power effect is raised to the power of 1.25",
		},
		12: {
			name: "Anti-Upgrades",
			desc: "Row 3 Upgrades do nothing",
			unl() { return player.h.challs.includes(11) },
			goal: new Decimal("1e840"),
			reward: "Quirk gain is boosted by your Quirk Layers",
			currently() { return Decimal.pow(1.5, player.q.layers.times(player.sp.upgrades.includes(22)?250:1)) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			name: "Prestigeless",
			desc: "Prestige Point gain is raised to the power of 0.01",
			unl() { return player.h.challs.includes(12) },
			goal: new Decimal("1e1200"),
			reward: "Hindrance Spirit & Quirks make Time Capsules & Space Energy cheaper.",
			currently() { return player.h.points.add(player.q.points).div(2).add(1).pow(1000).pow(player.sp.upgrades.includes(22)?250:1) },
			effDisp(x) { return format(x)+"x cheaper" },
		},
		22: {
			name: "Impaired Nodes",
			desc: "Enhancers, Extra Time Capsules, and Space Buildings do nothing.",
			unl() { return player.h.challs.includes(12) },
			goal: new Decimal("1e4600"),
			reward: "Add 0.25 to the Super-Booster base.",
		},
		31: {
			name: "Flattened Curve",
			desc: "Point generation is tetrated by 0.1",
			unl() { return player.h.challs.includes(21)||player.h.challs.includes(22) },
			goal: new Decimal(1e208),
			reward: "Enhancers are twice as strong.",
		},
		32: {
			name: "Surprise Junction",
			desc: "Prestige Upgrade 2 does nothing",
			unl() { return player.h.challs.includes(21)&&player.h.challs.includes(22) },
			goal: new Decimal("1e2580"),
			reward: "Unlock 2 new Super-Booster Upgrades and 7 new Quirk Upgrades.",
		},
		41: {
			name: "Skip the Third",
			desc: "Enhancers, Time Capsules, Space Buildings, and Super-Boosters do nothing.",
			unl() { return player.h.challs.includes(31)||player.h.challs.includes(32) },
			goal: new Decimal("4.444e4444"),
			reward: "Add 0.25 to the Super-Booster base.",
		},
		42: {
			name: "Slowed to a Halt",
			desc: "Time slows down over time, halting to a stop after 10 seconds. Hint: This also impacts auto Enhance Point generation, so make sure to manually press E!",
			unl() { return player.h.challs.includes(31)&&player.h.challs.includes(32) },
			goal: new Decimal("1e16500"),
			reward: "Cube the Generator Power effect.",
		},
		51: {
			name: "It's all Gone",
			desc: '"Skip the Second" and "Skip the Third" are both applied at once.',
			unl() { return player.h.challs.includes(41)&&player.h.challs.includes(42) },
			goal: new Decimal("1e2840"),
			reward: "Super-Boosters multiply the Generator base.",
			currently() { return player.sb.points.add(1).sqrt() },
			effDisp(x) { return format(x)+"x" },
		},
		52: {
			name: "Anti-Enhancers",
			desc: "You lose Enhancers over time, which can make your Enhancer amount get below 0. Hint: Maybe it's best to not have any Time Capsules or Space Energy?",
			unl() { return player.h.challs.includes(41)&&player.h.challs.includes(42)&&player.h.challs.includes(51) },
			goal: new Decimal("1e440000"),
			reward: "Quirk Layers are faster based on your Hindrance Spirit & Quirks.",
			currently() { 
				let h = player.h.points.times(player.q.points).sqrt();
				if (h.gte(1e150)) h = h.log10().pow(50).times(1e150/Math.pow(150, 50)).min(h)
				if (h.gte(1e100)) h = h.times(1e100).sqrt()
				let ret = h.add(1).pow(0.04);
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		61: {
			name: "Microanalysis",
			desc: '"Flattened Curve" and "Surprised Junction" are both applied at once.',
			unl() { return player.m.upgrades.includes(12) },
			goal: new Decimal("1e12300"),
			reward: "Hindrance Spirit & Quirk Energy are 20% stronger.",
		},
		62: {
			name: "Truly Prestigeless",
			desc: "You cannot gain Prestige Points.",
			unl() { return player.m.upgrades.includes(12) },
			goal: new Decimal("1e134000"),
			reward: "Unlock Super-Generators.",
		},
		71: {
			name: "The Final Stockade",
			desc: 'All previous Hindrances (except "Slowed to a Halt" and "Anti-Enhancers") are applied at once.',
			unl() { return player.m.upgrades.includes(31) },
			goal: new Decimal("1e1150"),
			reward: "Gain more Hindrance Spirit based on your Quirk Energy.",
			currently() { 
				let ret = player.q.energy.add(1).sqrt() 
				if (ret.gte("1.8e308")) ret = ret.sqrt().times(Decimal.sqrt("1.8e308"))
				if (spellActive(5)) ret = ret.pow(tmp.spellEffs[5])
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		72: {
			name: "The Truly Final Stockade",
			desc: "All previous Hindrances are applied at once.",
			unl() { return player.ma.enhancements.gte(1) },
			goal: new Decimal("1e350000"),
			reward: "The post-20 Quirk Layer cost scaling is 50% weaker.",
		},
	},
	ge: {
		rows: 3,
		cols: 2,
		res() { return player.p.points },
		resDisp: "Prestige Points",
		choose: 2,
		active(x) {
			return (player.ge.active||[]).includes(x);
		},
		11: {
			name: "Unique Gameplay",
			desc: "All Super & Hyper layers do nothing (but their upgrades still work).",
			unl() { return true },
			goal: new Decimal("1e10000"),
			reward: "Gears boost the efficiency of all Super & Hyper layers.",
			currently() { return player.ge.points.plus(1).log2().plus(1).log10().plus(1).log10().div(2).times(Decimal.cbrt(tmp.challActive?(tmp.challActive.ge.combos[11]||0):0)).times(tmp.ge ? tmp.ge.pow : 1).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% more efficient" },
		},
		12: {
			name: "All for Nothing",
			desc: "Quirk Energy's boost to Point gain is the only source of Point generation.",
			unl() { return true },
			goal: new Decimal("1e1930"),
			reward: "Gears make Quirk Layers more efficient.",
			currently() { return player.ge.points.plus(1).log2().plus(1).log2().plus(1).log10().div(5).times(tmp.challActive?(tmp.challActive.ge.combos[12]||0):0).times(tmp.ge ? tmp.ge.pow : 1).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% more efficient" },
		},
		21: {
			name: "Mechanical Exhaustion",
			desc: "Work is increased by 0.75.",
			unl() { return true },
			goal: new Decimal("1e2750"),
			reward: "Gears raise Life Power to an exponent.",
			currently() { return player.ge.points.plus(1).log10().plus(1).log10().times(tmp.challActive?(tmp.challActive.ge.combos[21]||0):0).times(tmp.ge ? tmp.ge.pow : 1).plus(1) },
			effDisp(x) { return "^"+format(x) },
		},
		22: {
			name: "The Olden Days",
			desc: "All row 6 layers other than Super-Prestige do nothing.",
			unl() { return true },
			goal: new Decimal("1e3875"),
			reward: "Gears boost Super-Prestige Point gain.",
			currently() { return player.ge.points.plus(1).pow(tmp.challActive?Math.pow(tmp.challActive.ge.combos[22]||0, 0.8):0).pow(tmp.ge ? tmp.ge.pow : 1).pow(1.25) },
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			name: "Crank of the Dead",
			desc: "All row 3 layers other than Super-Boosters and Super-Generators do nothing (including upgrades).",
			unl() { return player.ma.enhancements.gte(3) },
			goal: new Decimal("1e8325"),
			reward: "Gears & Best Machine Power multiply all Quirk Layers.",
			currently() { 
				let ret = player.ge.points.plus(1).times(player.ma.best.plus(1)).log10().plus(1).pow(tmp.challActive?(tmp.challActive.ge.combos[31]||0):0).pow(tmp.ge ? tmp.ge.pow : 1).pow(150).pow(player.ma.enhancements.sub(3).max(1).pow(1.25));
				if (ret.gte("1e4000")) ret = ret.root(8).times("1e3500")
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		32: {
			name: "???",
			desc: "You aren't supposed to see this...",
			unl() { return false },
			goal: new Decimal("10^^69"),
			reward: "???",
		},
	},
}

function startChall(layer, x) {
	if (!player[layer].unl) return
	if (LAYER_CHALLS[layer].choose==1) {
		if (player[layer].active==x) {
			completeChall(layer, x)
			delete player[layer].active
		} else {
			player[layer].active = x
		}
	} else {
		if (!player[layer].choices) {
			player[layer].choices = [x]
			return;
		} else if (player[layer].choices.includes(x)&&player[layer].choices.length<LAYER_CHALLS[layer].choose) {
			delete player[layer].choices
			return;
		} else if (player[layer].choices.length<LAYER_CHALLS[layer].choose) {
			player[layer].choices.push(x)
			return;
		} else {
			let activeChalls = ((player[layer].active instanceof Array) ? player[layer].active : [player[layer].active])
			if (activeChalls.includes(x)) {
				for (let chall in activeChalls) completeChall(layer, chall)
				delete player[layer].active
				delete player[layer].choices
			} else {
				let selectedChalls = ((player[layer].choices instanceof Array) ? player[layer].choices : [player[layer].choices])
				if (selectedChalls.includes(x)) {
					player[layer].active = player[layer].choices
				} else return;
			}
		}
	}
	doReset(layer, true)
	updateChallTemp(layer)
}

function calcChallGoal(layer, x) {
	if (LAYER_CHALLS[layer].choose==1) return LAYER_CHALLS[layer][x].goal;
	else {
		let goal = LAYER_CHALLS[layer][x[0]].goal
		for (let i=1;i<LAYER_CHALLS[layer].choose;i++) if (LAYER_CHALLS[layer][x[i]]) goal = Decimal.pow(10, goal.log10().times(LAYER_CHALLS[layer][x[i]].goal.log10()));
		return goal;
	}
}

function completeChall(layer, x) {
	var x = player[layer].active
	if (!x) return
	if (x==""||x==0||x==[]) return;
	if (!LAYER_CHALLS[layer].res().gte(tmp.challActive[layer].goal)) return
	if (LAYER_CHALLS[layer].choose>1) {
		let challCombo = []
		for (let i=0;i<LAYER_CHALLS[layer].choose;i++) challCombo.push(player[layer].active[i])
		let contained = false
		for (let i=0;i<player[layer].challs.length;i++) {
			let combo = player[layer].challs[i]
			let semiContained = 0
			for (let j=0;j<combo.length;j++) {
				let chall = combo[j]
				if (challCombo.includes(chall)) semiContained++
			}
			if (semiContained>=combo.length) {
				contained = true
				break;
			}
		}
		if (!contained) player[layer].challs.push(challCombo);
	} else if (!player[layer].challs.includes(x)) {
		if (layer == "h" && x == 62) needCanvasUpdate = true
		player[layer].challs.push(x);
	}
	delete player[layer].active
	updateChallTemp(layer)
}