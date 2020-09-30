function getEnhancerPow() {
	if (tmp.challActive ? tmp.challActive.h[22] : true) return new Decimal(0);
	if (tmp.challActive ? tmp.challActive.h[41] : true) return new Decimal(0);
	let pow = new Decimal(1)
	if (player.e.upgrades.includes(25)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.e[25].currently())
	if (player.e.upgrades.includes(31)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.e[31].currently())
	if (player.h.challs.includes(31)) pow = pow.times(2)
	if (player.q.upgrades.includes(42)) pow = pow.times(1.4)
	if (player.ba.upgrades.includes(32)) pow = pow.times(LAYER_UPGS.ba[32].currently())
	return pow
}

function getEnhancerEff() {
	if (!player.e.unl) return new Decimal(1)
	if (tmp.challActive ? tmp.challActive.ge[31] : true) return new Decimal(1)
	let e = player.e.enhancers.sub(tmp.subbedEnh).times(tmp.enhPow)
	let eff;
	if (e.gte(0)) eff = Decimal.pow(25, e.pow(1.1))
	else eff = Decimal.pow(1/25, e.times(-1).pow(1.1))
	return eff
}

function getEnhancerEff2() {
	if (!player.e.unl) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.ge[31] : true) return new Decimal(1)
	let e = player.e.enhancers.sub(tmp.subbedEnh).times(tmp.enhPow)
	let eff;
	if (e.gte(0)) eff = e.pow(0.8)
	else eff = e.times(-1).pow(0.8).times(-1)
	return eff;
}

function getEnhancerCost() {
	let e = player.e.enhancers
	if (e.gte(25)) e = e.pow(2).div(25)
	let cost = Decimal.pow(2, e.pow(1.5))
	return cost.floor()
}

function buyEnhancer() {
	let cost = getEnhancerCost()
	if (player.e.points.lt(cost)) return
	player.e.points = player.e.points.sub(cost)
	player.e.enhancers = player.e.enhancers.add(1)
}

function maxEnhancers() {
	let target = player.e.points.max(1).log(2).root(1.5)
	if (target.gte(25)) target = target.times(25).sqrt()
	target = target.add(1).floor()
	if (target.lte(player.e.enhancers)) return
	player.e.enhancers = player.e.enhancers.max(target)
}

function getFreeExtCapsules() {
	let amt = new Decimal(0)
	if (player.t.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) amt = amt.add(1)
	if (player.h.unl) amt = amt.add(tmp.layerEffs.h)
	return amt
}

function getCapPow() {
	if (tmp.challActive ? tmp.challActive.h[41] : true) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.ge[31] : true) return new Decimal(0)
	let pow = new Decimal(1)
	if (player.q.upgrades.includes(33)) pow = pow.times(LAYER_UPGS.q[33].currently())
	if (spellActive(2)) pow = pow.times(tmp.spellEffs[2])
	return pow
}

function getFreeExtPow() {
	if (tmp.challActive ? tmp.challActive.h[22] : true) return new Decimal(0)
	let pow = new Decimal(1)
	return pow
}

function getTimeEnergyEff() {
	if (!player.t.unl) return new Decimal(1)
	let exp = 1.2
	if (player.t.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = 1.75
	let eff = player.t.energy.add(1).pow(exp)
	return eff;
}

function getTimeEnergyGainMult() {
	if (!player.t.unl) return new Decimal(1)
	let mult = new Decimal(1);
	if (player.t.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[21].currently())
	if (player.t.upgrades.includes(22)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[22].currently())
	if (player.t.upgrades.includes(23)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[23].currently())
	if (player.t.upgrades.includes(34)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[34].currently())
	return mult;
}

function getTimeEnergyLimitMult() {
	if (!player.t.unl) return new Decimal(1)
	let mult = new Decimal(1);
	if (player.t.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[12].currently())
	if (player.t.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[21].currently())
	if (player.t.upgrades.includes(22)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[22].currently())
	if (player.t.upgrades.includes(23)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[23].currently())
	if (player.t.upgrades.includes(34)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.t[34].currently())
	if (player.q.upgrades.includes(23)) mult = mult.times(1e10)
	if (player.q.upgrades.includes(24)) mult = mult.times(LAYER_UPGS.q[24].currently())
	if (player.m.upgrades.includes(23)) mult = mult.times("1e500")
	return mult;
}

function getExtCapsuleCost() {
	let amt = player.t.extCapsules
	if (amt.gte(25) && !player.ba.upgrades.includes(43)) amt = amt.pow(2).div(25)
	let cost = amt.times(0.4).pow(1.2).add(1).times(10)
	return cost.floor()
}

function buyExtCapsule() {
	if (!player.t.unl) return
	let cost = getExtCapsuleCost()
	if (player.b.points.lt(cost)) return
	player.b.points = player.b.points.sub(cost)
	player.t.extCapsules = player.t.extCapsules.add(1)
}

function maxExtTimeCapsules() {
	let target = player.b.points.add(1).div(10).sub(1).root(1.2).div(0.4)
	if (target.gte(25)&&!player.ba.upgrades.includes(43)) target = target.times(25).sqrt()
	target = target.add(1).floor().max(0)
	player.t.extCapsules = player.t.extCapsules.max(target)
}

function addToTimeBase() {
	let toAdd = new Decimal(0)
	if (player.m.upgrades.includes(44)) toAdd = toAdd.add(LAYER_UPGS.m[44].currently())
	return toAdd
}

function multiplyToTimeBase() {
	let x = new Decimal(1)
	if (player.l.unl && tmp.l !== undefined) x = x.times(tmp.l.lbEff[3])
	return x
}

function getSpace() {
	let baseSpace = player.s.best.pow(1.1).times(3).floor()
	if (player.s.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true)) baseSpace = baseSpace.add(2);
	if (player.s.upgrades.includes(24)&&!(tmp.challActive?tmp.challActive.h[12]:true)) baseSpace = baseSpace.add(3);
	if (player.ss.unl) baseSpace = baseSpace.add(tmp.ssEff1)
	if (player.ss.upgrades.includes(11)) baseSpace = baseSpace.add(LAYER_UPGS.ss[11].currently())
	return baseSpace.sub((player.hs.best.gte(1e150)) ? 0 : player.s.spent).max(0)
}

let SPACE_BUILDINGS = {
	max: 10,
	1: {
		cost: new Decimal(1e3),
		eff(x) {
			let ret = Decimal.pow(Decimal.add(1, x.pow((player.s.upgrades.includes(31)&&!(tmp.challActive?tmp.challActive.h[12]:true))?2.75:1)), player.s.points.sqrt()).times(Decimal.mul(4, x.pow((player.s.upgrades.includes(31)&&!(tmp.challActive?tmp.challActive.h[12]:true))?2.75:1))).max(1)
			if (player.ba.upgrades.includes(42)) ret = ret.pow(LAYER_UPGS.ba[42].currently())
			return ret
		},
		effDesc(x) {
			return "Space Energy boosts Point gain & Prestige Point gain ("+format(x)+"x)"
		}
	},
	2: {
		cost: new Decimal(1e10),
		eff(x) {
			if (player.s.upgrades.includes(43)) {
				x = Decimal.pow(1.0001, x).times(x.sqrt())
				if (x.gte("e600")) x = Decimal.pow(10, x.log10().times(600).sqrt())
				return x
			} else return x.sqrt()
		},
		effDesc(x) {
			return "Adds to base of Booster/Generator effects by "+format(x)
		}
	},
	3: {
		cost: new Decimal(1e25),
		eff(x) {
			x = Decimal.pow(1e18, x.pow(0.9))
			if (x.gte("e3e9")) x = Decimal.pow(10, x.log10().times(9e18).cbrt())
			return x
		},
		effDesc(x) {
			return "Makes Boosters/Generators cheaper by "+format(x)+"x"
		}
	},
	4: {
		cost: new Decimal(1e48),
		eff(x) {
			let ret = x.add(1).pow(1.25)
			if (ret.gte(1e6)) ret = ret.log10().times(1e6/6)
			return ret;
		},
		effDesc(x) {
			return "Booster Upgrade 6's effect is raised to the power of "+format(x)
		}
	},
	5: {
		cost: new Decimal(1e100),
		eff(x) {
			return x.sqrt().times(2)
		},
		effDesc(x) {
			return "Add "+format(x)+" free levels to all previous Space Buildings"
		}
	},
	6: {
		cost: new Decimal("e6000000"),
		eff(x) {
			return x.div(1e3).add(1).sqrt()
		},
		effDesc(x) {
			return "You produce Life Power " + format(x) + "x faster"
		}
	},
	7: {
		cost: new Decimal("e6500000"),
		eff(x) {
			return Decimal.pow(1.05, x)
		},
		effDesc(x) {
			return "Reduce the requirement of Phantom Souls by " + format(x) + "x"
		}
	},
	8: {
		cost: new Decimal("e7000000"),
		eff(x) {
			return x.sqrt().div(100)
		},
		effDesc(x) {
			return "Gain " + format(x) + " free extra Quirk layers"
		}
	},
	9: {
		cost: new Decimal("e8000000"),
		eff(x) {
			return x.max(1).log10().div(3).max(1).cbrt()
		},
		effDesc(x) {
			return "Reduce the cost scaling of Hyperspace by " + (x=="X"?"X":format(Decimal.sub(1, x.recip()).times(100))) + "%"
		}
	},
	10: {
		cost: new Decimal("e9500000"),
		eff(x) {
			return x.max(1).log10().div(5).max(1)
		},
		effDesc(x) {
			return "Super-Upgrades are " + (x=="X"?"X":format(x.sub(1).times(100))) + "% stronger"
		}
	},
}

function getSpaceBuildingCostMod() {
	let mod = new Decimal(1)
	if (player.s.upgrades.includes(24)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mod = mod.times(0.5)
	if (player.s.upgrades.includes(42)) mod = mod.times(0.6)
	if (spellActive(4)) mod = mod.times(Decimal.sub(1, tmp.spellEffs[4].sub(1)))
	if (player.ba.upgrades.includes(15)) mod = mod.div(LAYER_UPGS.ba[15].currently())
	return mod;
}

function getSpaceBuildingCostMult() {
	let mult = new Decimal(1)
	if (player.ss.unl) mult = mult.div(tmp.ssEff2)
	if (player.s.upgrades.includes(41)) mult = mult.div(LAYER_UPGS.s[41].currently())
	return mult
}

function getSpaceBuildingCost(x) {
	let inputVal = SPACE_BUILDINGS[x].cost
	let bought = tmp.s.sb[x]
	if (bought.gte(100)) bought = bought.pow(2).div(100)
	let cost = Decimal.pow(inputVal, bought.times(tmp.s.sbCostMod).pow(1.35)).times(inputVal).times((bought.gt(0)||x>1)?1:0).times(tmp.s.sbCostMult)
	return cost
}

function getSpaceBuildingTarg(x) {
	let inputVal = SPACE_BUILDINGS[x].cost
	let target = player.g.power.div(tmp.s.sbCostMult).div(inputVal).max(1).log(inputVal).pow(1/1.35).div(tmp.s.sbCostMod)
	if (target.gte(100)) target = target.times(100).sqrt()
	return target.add(1).floor()
}

function getSpaceBuildingPow() {
	if (!player.s.unl) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.h[22] : true) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.h[41] : true) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.ge[31] : true) return new Decimal(0)
	let pow = new Decimal(1)
	if (player.s.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.s[21].currently())
	if (player.s.upgrades.includes(22)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.s[22].currently())
	if (player.s.upgrades.includes(23)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.s[23].currently())
	if (player.s.upgrades.includes(44)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(1.25)
	if (player.q.upgrades.includes(41)) pow = pow.times(1.4)
	if (player.ss.unl) pow = pow.times(tmp.ssEff3)
	if (player.ba.upgrades.includes(44)) pow = pow.times(1.5)
	return pow
}

function getExtraBuildingLevels() {
	let lvl = new Decimal(0)
	if (player.s.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) lvl = lvl.add(1);
	if (player.s.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true)) lvl = lvl.add(1);
	if (player.q.upgrades.includes(31)) lvl = lvl.add(1);
	if (player.m.upgrades.includes(32)) lvl = lvl.add(LAYER_UPGS.m[32].currently())
	if (player.ma.unl && MACHINES[1].unl()) lvl = lvl.add(MACHINES[1].currently())
	return lvl
}

function getSpaceBuildingEff(x) {
	let bought
	if (!player.s.unl) bought = new Decimal(0)
	else {
		bought = tmp.s.sb[x].add(tmp.s.sbExtra)
		if (x < 5 && tmp.s.trueSbUnl >= 5) bought = bought.add(tmp.s.sbEff[5])

		var compressLvl = new Decimal(1)
		if (tmp.i !== undefined && layerUnl("i") && tmp.i.compressed >= x) compressLvl = new Decimal(tmp.s.sbUnl).sub(x - SPACE_BUILDINGS.max - 1).div(SPACE_BUILDINGS.max).ceil().cbrt()
		if (tmp.challActive ? tmp.challActive.ge[22] : true) compressLvl = new Decimal(0);
		
		let extraSU = new Decimal(0)
		if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 8) extraSU = extraSU.plus(tmp.l.lbEff[8]);

		bought = bought.times(tmp.s.sbPow).times(compressLvl)
		if (tmp.hs !== undefined && layerUnl("hs")) {
			tmp.hs.suEff[x] = HYPERSPACE.effs[x](bought, fixValue(tmp.hs.su[x]).plus(extraSU).times(tmp.hs.eff).times(compressLvl))
			bought = bought.times(tmp.hs.suEff[x])
		}
	}
	return SPACE_BUILDINGS[x].eff(bought)
}

function getSpaceBuildingEffDesc(x) {
	let eff = tmp.s.sbEff[x]
	return SPACE_BUILDINGS[x].effDesc(eff)
}

function buyBuilding(x) {
	if (!player.s.unl) return
	if (tmp.s.trueSbUnl<x) return
	if (getSpace().lt(1)) return
	let cost = getSpaceBuildingCost(x)
	if (player.g.power.lt(cost)) return
	player.g.power = player.g.power.sub(cost)
	addSpaceBuilding(x, 1)
}

function maxSpaceBuilding(x) {
	if (!player.s.unl) return
	if (tmp.s.trueSbUnl<x) return
	let space = getSpace()
	if (space.lt(1)) return
	let target = getSpaceBuildingTarg(x)
	let bulk = target.sub(tmp.s.sb[x]).min(space)
	if (bulk.lt(1)) return
	addSpaceBuilding(x, bulk)
}

function destroyBuilding(x, all=false) {
	if (!player.s.unl) return
	if (tmp.s.trueSbUnl<x) return
	if (tmp.s.sb[x].lt(1)) return
	if (player.q.total.lt(2500)) return
	addSpaceBuilding(x, all ? tmp.s.sb[x].neg() : -1)
}

function addSpaceBuilding(x, amt) {
	amt = getSpace().min(amt)
	player.s.spent = player.s.spent.add(amt)
	tmp.s.sb[x] = tmp.s.sb[x].add(amt)
	player.s.buildings[x] = tmp.s.sb[x]
}

function respecSpaceBuildings() {
	if (!player.s.unl) return;
	if (!confirm("Are you sure you want to reset your Space Buildings? This will force you to do a Space reset as well!")) return
	player.s.buildings = {}
	player.s.spent = new Decimal(0)
	doReset("s", true)
}

function getSpaceBuildingsUnl() {
	let x = 3
	if (player.s.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true)) x++;
	if (player.s.upgrades.includes(32)&&!(tmp.challActive?tmp.challActive.h[12]:true)) x++;
	if (layerUnl("i")) {
		if (tmp.challActive ? tmp.challActive.ge[22] : true) return new Decimal(x);
		
		x = new Decimal(x)
		if (player.i.unl) x = x.add(player.i.extraBuildings)
	}
	return x;
}

function getSuperBoosterPow() {
	if (tmp.challActive ? tmp.challActive.h[41] : true) return new Decimal(0)
	if (tmp.challActive ? tmp.challActive.ge[11] : true) return new Decimal(0)
	let pow = new Decimal(1)
	if (player.sb.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.sb[11].currently())
	if (player.sb.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.sb[12].currently())
	if (player.hb.upgrades.includes(11)) pow = pow.times(LAYER_UPGS.hb[11].currently())
	if (player.ge.unl) pow = pow.times(LAYER_CHALLS.ge[11].currently())
	return pow;
}

function addToSBBase() {
	let toAdd = new Decimal(0)
	if (player.h.challs.includes(22)) toAdd = toAdd.add(0.25)
	if (player.h.challs.includes(41)) toAdd = toAdd.add(0.25)
	if (player.sb.upgrades.includes(22)) toAdd = toAdd.add(LAYER_UPGS.sb[22].currently())
	if (player.hb.unl) toAdd = toAdd.times(tmp.layerEffs.hb)
	return toAdd
}

function getExtraSB() {
	let amt = new Decimal(0)
	if (player.sg.upgrades.includes(12)) amt = amt.plus(LAYER_UPGS.sg[12].currently().sb)
	return amt
}

function getSGenPowEff() {
	if (!player.sg.unl) return new Decimal(1)
	let power = player.sg.power
	if (power.gte("1e625")) power = Decimal.pow(10, power.log10().pow(0.5).times(25))
	let eff = power.add(1).pow(3)
	return eff
}

function getSuperGenPowerGainMult() {
	if (tmp.challActive ? tmp.challActive.ge[11] : true) return new Decimal(0)
	
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.ba[21].currently())
	return mult
}

function addToSGBase() {
	let toAdd = new Decimal(0)
	if (player.ba.upgrades.includes(23)) toAdd = toAdd.add(LAYER_UPGS.ba[23].currently())
	if (player.sp.upgrades.includes(21)) toAdd = toAdd.add(LAYER_UPGS.sp[21].currently())
	
	if (spellActive(6)) toAdd = toAdd.times(tmp.spellEffs[6])
	if (player.sg.upgrades.includes(11)) toAdd = toAdd.times(LAYER_UPGS.sg[11].currently())
	return toAdd
}

function getSuperGenPow() {
	let pow = new Decimal(1)
	if (player.ge.unl) pow = pow.times(LAYER_CHALLS.ge[11].currently())
	return pow
}

function getExtraSG() {
	let amt = new Decimal(0)
	if (player.sg.upgrades.includes(12)) amt = amt.plus(LAYER_UPGS.sg[12].currently().sg)
	return amt;
}