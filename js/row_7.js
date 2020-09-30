const MASTERY = {
	spellCost() {
		let bought = player.mb.extraSpells;
		let cost = bought.pow(2).plus(1).plus(player.mb.extraBoosters).plus(player.ma.built);
		return cost.floor();
	},
	boosterCost() {
		let bought = player.mb.extraBoosters;
		let cost = bought.pow(3).plus(1).times(2).plus(player.mb.extraSpells).plus(player.ma.built);
		return cost.floor();
	},
	machineCost() {
		let bought = player.ma.built;
		let cost = bought.plus(1).pow(1.5).times(2).plus(player.mb.extraSpells).plus(player.mb.extraBoosters);
		return cost.floor();
	},
	respec() {
		if (!player.mb.unl || !confirm("Are you sure? This will perform a Row 7 reset and will reset your Mastery Buildings!")) return
		player.mb.extraSpells = new Decimal(0)
		player.mb.extraBoosters = new Decimal(0)
		player.ma.built = new Decimal(0)
		player.mb.points = player.mb.points.plus(player.mb.spent)
		player.mb.best = player.mb.best.max(player.mb.points)
		player.mb.spent = new Decimal(0)
		doReset("mb", true)
	},
	tooltip(x) {
		switch(x) {
			case 1: 
				if (player.mb.extraSpells.lt(MAX_SPELLS-4)) return "Next Effect: "+SPELL_DESCS[player.mb.extraSpells.plus(5).toNumber()]
				else return "Currently: "+format(tmp.mb.spellBoost.sub(1).times(100))+"% stronger"
				break;
			case 2: 
				if (player.mb.extraBoosters.lt(LIFE_BOOSTERS.max-5)) return "Next Effect: "+LIFE_BOOSTERS[player.mb.extraBoosters.plus(6).toNumber()].effDesc("X")
				else return "Currently: "+format(tmp.mb.lbBoost.sub(1).times(100))+"% stronger"
				break;
			case 3: 
				if (player.ma.built.lt(MACHINES.maxBuild)) return "Next Effect: "+MACHINES[player.ma.built.plus(1).toNumber()].reward
				else return "Currently: "+format(tmp.mb.machBoost.sub(1).times(100))+"% stronger"
				break;
		}
	},
}

function unlockNewSpell() {
	if (!player.mb.unl) return;
	let cost = MASTERY.spellCost()
	if (player.mb.points.lt(cost)) return;
	player.mb.points = player.mb.points.sub(cost);
	player.mb.spent = player.mb.spent.plus(cost);
	player.mb.extraSpells = player.mb.extraSpells.plus(1);
}

function unlockNewLB() {
	if (!player.mb.unl) return;
	let cost = MASTERY.boosterCost()
	if (player.mb.points.lt(cost)) return;
	player.mb.points = player.mb.points.sub(cost);
	player.mb.spent = player.mb.spent.plus(cost);
	player.mb.extraBoosters = player.mb.extraBoosters.plus(1);
}

function unlockNewMachine() {
	if (!player.mb.unl) return;
	if (!player.ma.unl) return;
	let cost = MASTERY.machineCost()
	if (player.mb.points.lt(cost)) return;
	player.mb.points = player.mb.points.sub(cost);
	player.mb.spent = player.mb.spent.plus(cost);
	player.ma.built = player.ma.built.plus(1);
}

function getMechChallPow() {
	let pow = new Decimal(1)
	if (player.ge.upgrades.includes(12)) pow = pow.times(LAYER_UPGS.ge[12].currently())
	return pow;
}

const MACHINES = {
	maxBuild: 5,
	max: 6,
	1: {
		unl() { return player.ma.built.gte(1) },
		reward: "Unused Space adds extra levels to all Space Buildings.",
		currently() { return getSpace().sqrt().times(player.ma.enhancements.sqrt().plus(1).pow(2)).times(tmp.mb ? tmp.mb.machBoost : 1).times(tmp.ma ? tmp.ma.pow : 1) },
		effDisp(x) { return "+"+format(x) },
	},
	2: {
		unl() { return player.ma.built.gte(2) },
		reward: "The requirement to increase the cap of Super-Upgrades is lower based on your Total Hyperspace.",
		currently() { return player.hs.space.plus(1).times(player.ma.enhancements.sqrt().plus(1)).times(tmp.mb ? tmp.mb.machBoost : 1).times(tmp.ma ? tmp.ma.pow : 1).log10().times(105).floor() },
		effDisp(x) { return "-"+formatWhole(x) },
	},
	3: {
		unl() { return player.ma.built.gte(3) },
		reward: "All Life Boosters are stronger based on your Best Machine Power.",
		currently() { 
			let ret = player.ma.best.plus(1).log10().times(player.ma.enhancements.sqrt().plus(1)).times(tmp.mb ? tmp.mb.machBoost : 1).times(tmp.ma ? tmp.ma.pow : 1).plus(1) 
			if (ret.gte(26)) ret = ret.log10().times(26/Math.log10(26)).min(ret)
			return ret;
		},
		effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
	},
	4: {
		unl() { return player.ma.built.gte(4) },
		reward: "Gears make Mastery Bricks cheaper.",
		currently() { return player.ge.points.plus(1).log10().plus(1).log10().times(player.ma.enhancements.sqrt().plus(1).times(10)).times(tmp.mb ? tmp.mb.machBoost : 1).times(tmp.ma ? tmp.ma.pow : 1).plus(1).log10().plus(1) },
		effDisp(x) { return "/"+format(x) },
	},
	5: {
		unl() { return player.ma.built.gte(5) },
		reward: "All Super-Upgrades are stronger based on your Imperium Bricks & Life Bricks.",
		currently() { return player.i.points.plus(player.i.lifeBricks).plus(1).log10().times(player.ma.enhancements.sqrt().plus(1)).times(tmp.mb ? tmp.mb.machBoost : 1).times(tmp.ma ? tmp.ma.pow : 1).plus(1).log10().plus(1) },
		effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
	},
	6: {
		unl() { return player.ma.enhancements.gte(2) },
		reward: "Best Machine Power boosts Hyperspace Energy gain.",
		currently() { return player.ma.best.plus(1).log10().plus(1).pow(player.ma.enhancements.sqrt().plus(1)).pow(tmp.mb ? tmp.mb.machBoost : 1).pow(tmp.ma ? tmp.ma.pow : 1).pow(15) },
		effDisp(x) { return format(x)+"x" },
	},
	
	lvlCost(res) {
		let e = player.ma.enhancements
		if (e.gte(4)) e = e.times(0.8)
		if (e.gte(4)) e = Decimal.pow(2, e.sub(4)).times(3.7)
		if (res=="ma") {
			if (e.gte(3.5)) e = e.pow(1.5).div(Math.sqrt(3.5)).times(1.3)
			else if (e.gte(3)) e = e.pow(2).div(2.5)
			return Decimal.pow(10, e.pow(2).plus(1))
		} else return e.plus(1).pow(2).plus(14).floor()
	},
	lvlUpDesc() { 
		let desc = "Power up all Machines"
		let x = player.ma.enhancements;
		if (x.lte(2)) {
			desc += " and "
			let y = x.toNumber()+1;
			switch(y) {
				case 1: 
					desc += "unlock a new Hindrance";
					break;
				case 2: 
					desc += "unlock a new Machine";
					break;
				case 3: 
					desc += "unlock a new Mechanical Challenge";
					break;
			}
		}
		return desc;
	},
	canLvlUp() { return player.ma.points.gte(this.lvlCost("ma")) && player.i.points.gte(this.lvlCost("i")) },
}

function lvlUpMachines() {
	if (!MACHINES.canLvlUp()) return;
	player.ma.points = player.ma.points.sub(MACHINES.lvlCost("ma"))
	player.i.points = player.i.points.sub(MACHINES.lvlCost("i"))
	player.ma.enhancements = player.ma.enhancements.plus(1);
}

function getMachinePower() {
	let pow = new Decimal(1)
	if (player.ge.upgrades.includes(11)) pow = pow.times(LAYER_UPGS.ge[11].currently())
	return pow;
}