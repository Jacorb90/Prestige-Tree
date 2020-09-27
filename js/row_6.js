function getLifePowerMult() {
	let x = tmp.layerEffs.ps.mult.div(30)
	if (player.sp.upgrades.includes(42)) x = x.times(LAYER_UPGS.sp[42].currently())
	if (tmp.s !== undefined && tmp.s.trueSbUnl >= 6) x = x.times(tmp.s.sbEff[6])
	if (spellActive(8)) x = x.times(tmp.spellEffs[8]);
	return x
}

function getLifePowerExp() {
	let x = tmp.layerEffs.ps.exp
	if (player.ge.unl) x = x.times(LAYER_CHALLS.ge[21].currently())
	return x
}

function getLifePowerSoftcapStart() {
	let x = tmp.layerEffs.l
	return x
}

function getLifePowerSoftcapExp() {
	let x = new Decimal(1/3)
	if (player.sp.upgrades.includes(54)) x = x.pow(0.85);
	return x
}

let LIFE_BOOSTERS = {
	max: 10,
	unl() {
		let unlocked = 4
		if (player.ps.upgrades.includes(21)) unlocked = 5
		if (player.mb.unl) unlocked += player.mb.extraBoosters.toNumber()
		return Math.min(unlocked, LIFE_BOOSTERS.max)
	},
	calcNewPower(diff) {
		if (!player.l.unl) return new Decimal(0)

		let exp = getLifePowerExp()
		let cap = getLifePowerSoftcapStart()
		let capExp = getLifePowerSoftcapExp()

		let power = player.l.power
		if (power.gt(1)) power = power.root(exp)
		if (power.gt(cap)) power = power.div(cap).pow(1/capExp).times(cap)
		power = power.add(getLifePowerMult().times(diff))
		if (power.gt(cap)) power = power.div(cap).pow(capExp).times(cap)
		if (power.gt(1)) power = power.pow(exp)

		return power
	},
	eff() {
		if (tmp.challActive ? tmp.challActive.ge[22] : true) return new Decimal(0)
		
		let eff = player.l.power.add(1).log10();
		if (tmp.mb) eff = eff.times(tmp.mb.lbBoost)
		if (player.ma.unl && MACHINES[3].unl()) eff = eff.times(MACHINES[3].currently())
		return eff;
	},
	req(x) {
		let mult = this[x].reqMult
		if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 9 && x <= 8) mult = mult.times(Decimal.sub(1, tmp.l.lbEff[9]))
		return tmp.l.lb[x].times(mult).add(this[x].req)
	},
	reqTarget(x) {
		let mult = this[x].reqMult
		if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 9 && x <= 8) mult = mult.times(Decimal.sub(1, tmp.l.lbEff[9]))
		return player.ps.points.sub(this[x].req).div(mult).add(1).floor()
	},
	1: {
		req: new Decimal(1),
		reqMult: new Decimal(1),
		eff(str) {
			return str.pow(0.15).div(3)
		},
		effDesc(x) {
			return "Add " + format(x) + " Hyper-Boosters to their effect"
		}
	},
	2: {
		req: new Decimal(1.5),
		reqMult: new Decimal(1.5),
		eff(str) {
			let x = Decimal.pow(1e20, str.pow(0.75))
			if (x.gte("1e400")) x = Decimal.pow(10, x.log10().times(400).sqrt())
			return x
		},
		effDesc(x) {
			return "Gain " + format(x) + "x more Hexes"
		}
	},
	3: {
		req: new Decimal(3.5),
		reqMult: new Decimal(2.5),
		eff(str) {
			return str.div(1.5).max(1).log10().add(1)
		},
		effDesc(x) {
			return "Multiply the base of Time Capsule effect by " + format(x) + "x"
		}
	},
	4: {
		req: new Decimal(10),
		reqMult: new Decimal(3),
		eff(str) {
			return str.div(40).add(1)
		},
		effDesc(x) {
			return "Reduce the requirement of Super-Boosters, Super-Generators, and Hyper-Boosters by " + format(x) + "x"
		}
	},
	5: {
		req: new Decimal(5),
		reqMult: new Decimal(6),
		eff(str) {
			return Decimal.pow(3, str.sqrt())
		},
		effDesc(x) {
			return "Gain " + format(x) + "x more Hyperspace Energy"
		}
	},
	6: {
		req: new Decimal(10),
		reqMult: new Decimal(10),
		eff(str) {
			return str.plus(1).log10().plus(1).log10().div(4).plus(1);
		},
		effDesc(x) {
			return "All Spells are "+(x=="X"?"X":format(x.sub(1).times(100)))+"% stronger"
		},
	},
	7: {
		req: new Decimal(12),
		reqMult: new Decimal(3),
		eff(str) {
			return Decimal.pow(1e125, str.sqrt());
		},
		effDesc(x) {
			return "Multiply Positivity & Negativity gain by "+format(x)
		},
	},
	8: {
		req: new Decimal(20),
		reqMult: new Decimal(20),
		eff(str) {
			return str.plus(1).log10().plus(1).log10();
		},
		effDesc(x) {
			return "Add "+format(x)+" extra Super-Upgrades to all Space Buildings"
		},
	},
	9: {
		req: new Decimal(30),
		reqMult: new Decimal(15),
		eff(str) {
			if (str.gte(10)) str = str.times(10).sqrt();
			return Decimal.sub(1, Decimal.div(1, str.plus(1).log10().plus(1)));
		},
		effDesc(x) {
			return "All previous Life Booster costs scale "+(x=="X"?"X":format(x.times(100)))+"% slower"
		},
	},
	10: {
		req: new Decimal(36),
		reqMult: new Decimal(12),
		eff(str) {
			return str.plus(1).log10().sqrt().plus(1);
		},
		effDesc(x) {
			return "The post-12 Phantom Soul cost scaling is "+(x=="X"?"X":format(x.sub(1).times(100)))+"% weaker"
		},
	},
}

let HYPERSPACE = {
	cost(x) {
		if (x === undefined) x = player.hs.space
		if (tmp.s !== undefined && tmp.s.trueSbUnl >= 9) x = x.div(tmp.s.sbEff[9])
		let reduction = this.costReduction()
		return {
			hs: Decimal.pow(2, x.sqr()).div(reduction).floor(),
			ba: Decimal.pow(10, x.max(x.div(2).sqr()).times(20).add(150)).div(reduction).floor()
		}
	},
	target() {
		let reduction = this.costReduction()
		let targetHS = player.hs.points.times(reduction).max(1).log2().sqrt().plus(1).floor()
		let targetBA = player.ba.points.times(reduction).max(1).log10().sub(150).div(20).plus(1).floor()
		let target = targetHS.min(targetBA)
		return target;
	},
	costReduction() {
		let r = new Decimal(1)
		if (player.ba.upgrades.includes(45)) r = LAYER_UPGS.ba[45].currently()
		return r
	},
	canBuy() {
		let cost = this.cost()
		return player.hs.points.gte(cost.hs) && player.ba.points.gte(cost.ba)
	},
	buy() {
		let cost = this.cost()
		if (!this.canBuy()) return
		player.ba.points = player.ba.points.sub(cost.ba)
		player.hs.points = player.hs.points.sub(cost.hs)
		player.hs.space = player.hs.space.add(1)
	},
	canSuperUpg(x) {
		return player.hs.space.gt(player.hs.spent) && tmp.hs.su[x].lt(player.hs.superUpgradeCap)
	},
	superUpg(x) {
		if (!this.canSuperUpg(x)) return
		player.hs.spent = player.hs.spent.add(1)
		tmp.hs.su[x] = tmp.hs.su[x].add(1)
		player.hs.superUpgrades[x] = tmp.hs.su[x]
	},
	respec(x) {
		if (!player.hs.unl || !confirm("Are you sure?")) return
		player.hs.spent = new Decimal(0)
		player.hs.superUpgrades = {}
		doReset("hs", true)
	},
	eff() {
		if (tmp.challActive ? tmp.challActive.ge[22] : true) return new Decimal(0)
		
		let r = new Decimal(1)
		if (player.ba.upgrades.includes(35)) r = r.times(1.25)
		if (tmp.s !== undefined && tmp.s.trueSbUnl >= 10) r = r.times(tmp.s.sbEff[10])
		if (player.ma.unl && MACHINES[5].unl()) r = r.times(MACHINES[5].currently())
		return r
	},
	nextCapReq(x) {
		if (x === undefined) x = player.hs.superUpgradeCap
		if (x.gte(5)) x = x.pow(2).div(5)
		let req = Decimal.times(x, 200).add(1300)
		if (player.ma.unl && MACHINES[2].unl()) req = req.sub(MACHINES[2].currently()).max(0)
		return req;
	},
	nextCapTarget() {
		let x = new Decimal(0)
		if (player.ma.unl && MACHINES[2].unl()) x = x.plus(MACHINES[2].currently())
		x = x.plus(player.g.points).sub(1300).div(200)
		return x.floor().add(1)
	},
	effs: {
		1(sb, su) {
			return sb.add(1).pow(su.sqrt().times(2.5))
		},
		2(sb, su) {
			return sb.pow(0.25).times(su.sqrt()).div(120).add(1)
		},
		3(sb, su) {
			return sb.cbrt().times(su.sqrt()).times(0.75).add(1)
		},
		4(sb, su) {
			return Decimal.pow(2.5, sb.cbrt().times(su.sqrt()))
		},
		5(sb, su) {
			return sb.add(10).log10().times(su.sqrt()).div(1.75).max(1)
		},
		6(sb, su) {
			return Decimal.pow(sb.div(1e3).add(1), su)
		},
		7(sb, su) {
			return sb.add(1).log10().times(su.cbrt()).div(25).add(1)
		},
		8(sb, su) {
			return sb.times(su.sqr()).div(100).max(1).log10().add(1)
		},
		9(sb, su) {
			return sb.times(su).max(1).log10().add(1)
		},
		10(sb, su) {
			return sb.add(1).pow(su.cbrt().div(5))
		}
	}
}

function maxHyperspace() {
	if (!HYPERSPACE.canBuy()) return;
	let target = HYPERSPACE.target();
	if (target.lte(player.hs.space)) return;
	player.hs.space = player.hs.space.max(target)
}

let IMPERIUM = {
	lifeReq() {
		let bricks = player.i.lifeBricks
		if (bricks.gte(50)) bricks = Decimal.pow(1.02, bricks.sub(50)).times(50)
		return Decimal.pow(10, bricks.times(2).sqr().add(15))
	},
	lifeTarget() {
		let target = player.l.power.max(1).log10().sub(15).sqrt().div(2)
		if (target.gte(50)) target = target.div(50).log(1.02).plus(50)
		return target.add(1).floor();
	},
	canBuild() {
		let cost = this.cost()
		return (player.i.building || (player.i.points.gte(cost.i) && player.i.lifeBricks.gte(cost.l))) && tmp.s.sbUnl.gte(IMPERIUM.minSB)
	},
	build() {
		if (!this.canBuild()) return
		if (player.i.building) {
			if (!confirm("Are you sure?")) return
			delete player.i.building
		} else {
			let cost = this.cost()
			player.i.points = player.i.points.sub(cost.i)
			player.i.lifeBricks = player.i.lifeBricks.sub(cost.l)
			player.i.building = 1
			doReset("i", true)
		}
		player.i.progress = 0
	},
	cost(x) {
		if (x === undefined) x = player.i.extraBuildings
		let sub = player.sp.upgrades.includes(45) ? 3 : 0
		if (x.gte(20)) x = Decimal.pow(1.05, x.sub(20)).times(20)
		let ret = {
			i: x.times(1.75).add(0.5).sub(sub).ceil().max(0),
			l: x.times(1.5).add(1).sub(sub).ceil().max(0)
		}
		if (ret.l.gte(35)) ret.l = ret.l.pow(3).div(Math.pow(35, 2)).ceil()
		return ret;
	},
	target() {
		let sub = player.sp.upgrades.includes(45) ? 3 : 0
		let i = player.i.points.plus(sub).sub(0.5).div(1.75)
		if (i.gte(20)) i = i.div(20).log(1.05).plus(20)
		let targetI = i.plus(1).floor()
	
		let l = player.i.lifeBricks
		if (l.gte(35)) l = l.times(Math.pow(35, 2)).cbrt();
		l = l.plus(sub).sub(1).div(1.5)
		if (l.gte(20)) l = l.div(20).log(1.05).plus(20)
		let targetL = l.plus(1).floor()
	
		return targetI.min(targetL)
	},
	speed() {
		let x = Decimal.pow(3.75, player.i.extraBuildings.add(5)).recip()
		x = x.times(IMPERIUM.sgSpeedBoost())
		if (player.sp.upgrades.includes(45)) x = x.times(5)
		if (player.sp.upgrades.includes(52)) x = x.times(LAYER_UPGS.sp[52].currently())
		if (player.sp.upgrades.includes(53)) x = x.times(LAYER_UPGS.sp[53].currently())
		return x
	},
	sgSpeedBoost() {
		let boost = player.sg.points.add(1).pow(2);
		if (player.sp.upgrades.includes(51)) boost = boost.pow(1.5).times(Decimal.pow(1.4, player.sg.points.sqrt()))
		return boost
	},
	collapsed(row) {
		return tmp.i !== undefined && tmp.i.collapse !== undefined && tmp.i.collapse[row]
	},
	maxCollapseRows: 1,
	minSB: 5,
}

function maxImperiumBuildings() {
	if (!IMPERIUM.canBuild()) return
	let target = IMPERIUM.target()
	if (target.lte(player.i.extraBuildings)) return;
	player.i.extraBuildings = player.i.extraBuildings.max(target);
}