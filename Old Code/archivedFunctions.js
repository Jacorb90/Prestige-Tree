
function getScaling12Boosters() {
	let x = new Decimal(1)
	if (player.ps.upgrades.includes(22)) x = x.times(LAYER_UPGS.ps[22].currently())
	return x
}

function addToBoosterBase() {
	let toAdd = new Decimal(0)
	if (player.b.upgrades.includes(12)) toAdd = toAdd.add(LAYER_UPGS.b[12].currently())
	if (player.b.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.b[13].currently())
	if (player.t.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.t[11].currently())
	if (player.t.upgrades.includes(31)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(25)
	if (player.t.upgrades.includes(33)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(40)
	if (player.e.unl) toAdd = toAdd.add(tmp.enhEff2)
	if (player.e.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.e[11].currently().b)
	if (player.s.unl && tmp.s !== undefined) toAdd = toAdd.add(tmp.s.sbEff[2])
	if (player.sb.upgrades.includes(21)) toAdd = toAdd.add(LAYER_UPGS.sb[21].currently())
	
	if (player.b.upgrades.includes(31)) toAdd = toAdd.times(LAYER_UPGS.b[31].currently())
	if (player.q.upgrades.includes(53)) toAdd = toAdd.times(tmp.enhEff2)
	if (player.sb.unl) toAdd = toAdd.times(tmp.layerEffs.sb)
	return toAdd
}

function getFreeBoosters() {
	let free = new Decimal(0)
	if (player.t.upgrades.includes(24)&&!(tmp.challActive?tmp.challActive.h[12]:true)) free = free.add(18)
	if (player.b.upgrades.includes(32)) free = free.add(LAYER_UPGS.b[32].currently())
	if (player.b.upgrades.includes(33)) free = free.add(100)
	return free
}

function getBoosterPower() {
	let power = new Decimal(1)
	if (spellActive(1)) power = power.times(tmp.spellEffs[1])
	if (player.sp.upgrades.includes(34)) power = power.times(1.25)
	return power
}

function addToGenBase() {
	let toAdd = new Decimal(0)
	if (player.g.upgrades.includes(12)) toAdd = toAdd.add(LAYER_UPGS.g[12].currently())
	if (player.g.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.g[13].currently())
	if (player.g.upgrades.includes(33)) toAdd = toAdd.add(LAYER_UPGS.g[33].currently())
	if (player.e.unl) toAdd = toAdd.add(tmp.enhEff2)
	if (player.e.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.e[11].currently().g)
	if (player.s.unl && tmp.s !== undefined) toAdd = toAdd.add(tmp.s.sbEff[2])
		
	if (player.h.challs.includes(51)) toAdd = toAdd.times(LAYER_CHALLS.h[51].currently())
	if (player.q.upgrades.includes(53)) toAdd = toAdd.times(tmp.enhEff2)
	return toAdd
}

function getGenPow() {
	let pow = new Decimal(1)
	if (player.g.upgrades.includes(34)) pow = pow.times(LAYER_UPGS.g[34].currently())
	if (player.sp.upgrades.includes(34)) pow = pow.times(1.25)
	return pow
}

function getGenPowerGainMult() {
	let mult = new Decimal(1)
	if (player.g.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.g[21].currently())
	if (player.g.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.g[25].currently())
	if (player.e.upgrades.includes(35)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.e[35].currently())
	if (player.s.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.s[12].currently())
	if (player.s.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.s[13].currently())
	if (player.q.unl && tmp.quirkEff) mult = mult.times(tmp.quirkEff)
	if (player.g.upgrades.includes(35)) mult = mult.times(LAYER_UPGS.g[35].currently())
	return mult
}

function getGenPowerEffExp() {
	let exp = new Decimal(1/3)
	if (player.s.upgrades.includes(34)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = exp.add(LAYER_UPGS.s[34].currently())
	if (player.b.upgrades.includes(21)) exp = exp.times(2)
	if (player.b.upgrades.includes(22)) exp = exp.times(1.2)
	if (player.e.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = exp.times(1.15)
	if (player.h.challs.includes(11)) exp = exp.times(1.25)
	if (player.h.challs.includes(42)) exp = exp.times(3)
	return exp;
}

function getGenPowerEff() {
	if (tmp.challActive ? tmp.challActive.h[11] : true) return new Decimal(1)
	let eff = player.g.power.add(1).pow(getGenPowerEffExp());
	return eff
}


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
	let e = player.e.enhancers.sub(tmp.subbedEnh).times(tmp.enhPow)
	let eff;
	if (e.gte(0)) eff = Decimal.pow(25, e.pow(1.1))
	else eff = Decimal.pow(1/25, e.times(-1).pow(1.1))
	return eff
}

function getEnhancerEff2() {
	if (!player.e.unl) return new Decimal(0)
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
	return baseSpace.sub(player.s.spent).max(0)
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
			return "Reduce the cost scaling of Hyperspace by " + format(Decimal.sub(1, x.recip()).times(100)) + "%"
		}
	},
	10: {
		cost: new Decimal("e9500000"),
		eff(x) {
			return x.max(1).log10().div(5).max(1)
		},
		effDesc(x) {
			return "Super-Upgrades are " + format(x.sub(1).times(100)) + "% stronger"
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
	return lvl
}

function getSpaceBuildingEff(x) {
	let bought
	if (!player.s.unl) bought = new Decimal(0)
	else {
		bought = tmp.s.sb[x].add(tmp.s.sbExtra)
		if (x < 5 && tmp.s.trueSbUnl >= 5) bought = bought.add(tmp.s.sbEff[5])

		var compressLvl = new Decimal(1)
		if (tmp.i !== undefined && layerUnl("i") && tmp.i.compressed >= x) compressLvl = tmp.s.sbUnl.sub(x - SPACE_BUILDINGS.max - 1).div(SPACE_BUILDINGS.max).ceil().cbrt()

		bought = bought.times(tmp.s.sbPow).times(compressLvl)
		if (tmp.hs !== undefined && layerUnl("hs")) {
			tmp.hs.suEff[x] = HYPERSPACE.effs[x](bought, fixValue(tmp.hs.su[x]).times(tmp.hs.eff).times(compressLvl))
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
	if (player.q.best.lt(2500)) return
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
		x = new Decimal(x)
		if (player.i.unl) x = x.add(player.i.extraBuildings)
	}
	return x;
}


function getSuperBoosterPow() {
	if (tmp.challActive ? tmp.challActive.h[41] : true) return new Decimal(0)
	let pow = new Decimal(1)
	if (player.sb.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.sb[11].currently())
	if (player.sb.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) pow = pow.times(LAYER_UPGS.sb[12].currently())
	if (player.hb.upgrades.includes(11)) pow = pow.times(LAYER_UPGS.hb[11].currently())
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

function getQuirkLayerCostBase() {
	let base = new Decimal(2)
	if (player.ba.upgrades.includes(31)) base = LAYER_UPGS.ba[31].currently()
	return base
}

function getQuirkLayerCost(layers) {
	if (layers === undefined) layers = player.q.layers
	if (layers.gte(20)) layers = Decimal.pow(1.05, layers.sub(20)).times(20)
	if (player.ba.upgrades.includes(55)) layers = layers.sub(LAYER_UPGS.ba[55].currently())
	let cost = Decimal.pow(tmp.qCB, Decimal.pow(tmp.qCB, layers).sub(1))
	return cost.max(1);
}

function getQuirkLayerTarg() {
	let targ = player.q.points.log(tmp.qCB).add(1).log(tmp.qCB)
	if (player.ba.upgrades.includes(55)) targ = targ.add(LAYER_UPGS.ba[55].currently())
	if (targ.gte(20)) targ = targ.div(20).log(1.05).add(20)
	return targ.add(1).floor()
}

function getQuirkLayerMult() {
	let mult = new Decimal(1)
	if (player.q.upgrades.includes(13)) mult = mult.times(2)
	if (player.q.upgrades.includes(14)) mult = mult.times(3)
	if (player.q.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.q[21].currently())
	if (player.q.upgrades.includes(52)) mult = mult.times(LAYER_UPGS.q[52].currently())
	if (player.h.challs.includes(52)) mult = mult.times(LAYER_CHALLS.h[52].currently())
	if (player.ba.upgrades.includes(13)) mult = mult.times(LAYER_UPGS.ba[13].currently())
	return mult
}

function getExtraQuirkLayers() {
	let layers = new Decimal(0);
	if (player.q.upgrades.includes(51)) layers = layers.add(LAYER_UPGS.q[51].currently())
	if (player.m.upgrades.includes(24)) layers = layers.add(LAYER_UPGS.m[24].currently())
	if (player.m.upgrades.includes(34)) layers = layers.add(1)
	if (tmp.s !== undefined && tmp.s.trueSbUnl >= 8) layers = layers.add(tmp.s.sbEff[8])
	return layers;
}

function getQuirkEnergyGainExp() {
	let mult = new Decimal(1)
	if (spellActive(3)) mult = mult.times(tmp.spellEffs[3])
	return player.q.layers.add(getExtraQuirkLayers()).sub(1).times(mult)
}

function getQuirkEnergyEff() {
	let eff = player.q.energy.add(1).pow(2)
	if (player.q.upgrades.includes(12)) {
		let mod = player.q.energy.add(1).log10().add(1).log10().add(1)
		if (mod.gte(2)) {
			eff = eff.times(mod.div(2).pow(10))
			mod = new Decimal(2)
		}
		eff = eff.pow(mod)
	}
	if (player.q.upgrades.includes(32)) eff = eff.pow(2)
	if (player.h.challs.includes(61)) eff = eff.pow(1.2)
	if (player.ba.upgrades.includes(13)) eff = eff.pow(3)
	return eff;
}

function buyQuirkLayer() {
	if (!player.q.unl) return
	let cost = getQuirkLayerCost()
	if (player.q.points.lt(cost)) return
	player.q.points = player.q.points.sub(cost)
	player.q.layers = player.q.layers.add(1)
}

function maxQuirkLayers() {
	if (!player.q.unl) return
	let cost = getQuirkLayerCost()
	if (player.q.points.lt(cost)) return
	let target = getQuirkLayerTarg()
	if (target.lte(player.q.layers)) return
	player.q.points = player.q.points.sub(cost)
	player.q.layers = player.q.layers.max(target)
}


function getSubspaceEff1() {
	if (!player.ss.unl) return new Decimal(0)
	let eff = player.ss.subspace.times(player.ss.points).add(1).log10().times(100)
	if (player.sp.upgrades.includes(35)) eff = eff.times(LAYER_UPGS.sp[35].currently())
	return eff.floor();
}

function getSubspaceEff2() {
	if (!player.ss.unl) return new Decimal(1)
	let eff = player.ss.subspace.add(1).pow(750)
	if (player.sp.upgrades.includes(35)) eff = eff.pow(LAYER_UPGS.sp[35].currently())
	return eff;
}

function getSubspaceEff3() {
	if (!player.ss.unl) return new Decimal(1)
	let eff = player.ss.subspace.add(1).log10().add(1).log10().div(2.5).add(1)
	if (player.ss.upgrades.includes(13)) eff = eff.times(1.5)
	if (player.sp.upgrades.includes(35)) eff = eff.times(LAYER_UPGS.sp[35].currently())
	if (eff.gte(2)) eff = eff.log2().add(1)
	return eff;
}

function getSubspaceGainMult() {
	let mult = new Decimal(1)
	if (player.ss.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.ss[12].currently())
	if (player.ss.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ss[22].currently())
	if (player.ss.upgrades.includes(24)) mult = mult.times(LAYER_UPGS.ss[24].currently())
	if (player.ss.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.ss[25].currently())
	if (player.ba.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.ba[12].currently())
	return mult
}

function addToHBBase() {
	let toAdd = new Decimal(0)
	if (player.m.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.m[13].currently())
	if (player.m.upgrades.includes(33)) toAdd = toAdd.add(LAYER_UPGS.m[33].currently())
	return toAdd
}

function getHyperBoosterExp() {
	let exp = new Decimal(1)
	if (player.hb.order>0) exp = new Decimal(0.5)
	return exp
}

function getExtraHyperBoosters() {
	let x = new Decimal(0)
	if (player.l.unl && tmp.l !== undefined) x = x.add(tmp.l.lbEff[1])
	return x
}

function getHyperBoosterPow() {
	let pow = new Decimal(1)
	if (player.hb.upgrades.includes(12)) pow = pow.times(LAYER_UPGS.hb[12].currently())
	return pow;
}

function getBalancePowerEff() {
	let eff = player.ba.power.times(2).add(1).pow(2/3)
	if (player.ba.upgrades.includes(14)) eff = eff.pow(3.85)
	if (player.ba.upgrades.includes(33)) eff = eff.pow(2)
	return eff;
}

function getBalanceTypesEff() {
	let mod = player.ba.positivity.add(1).log10().add(1).div(player.ba.negativity.add(1).log10().add(1)).log10().abs().add(1).pow(-1)
	let pos = player.ba.positivity.add(1).log10().add(1)
	let neg = player.ba.negativity.add(1).log10().add(1)
	if (player.ba.upgrades.includes(34)) mod = mod.times(1.5)
	if (player.ba.upgrades.includes(53)) mod = mod.times(LAYER_UPGS.ba[53].currently())
	let eff = pos.times(neg).pow(mod)
	return eff;
}

function getBalanceEnergyExp() {
	let exp = new Decimal(1)
	if (player.ba.unl) exp = exp.times(1.5)
	return exp;
}

function getPosGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ba[22].currently())
	return mult;
}

function getNegGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ba[22].currently())
	return mult;
}

function getBalPowGainMult() {
	let mult = new Decimal(1)
	if (player.sp.upgrades.includes(14)) mult = mult.times(LAYER_UPGS.sp[14].currently())
	return mult;
}


const MAX_SPELLS = 4

const SPELL_NAMES = {
	1: "Booster Launch",
	2: "Time Warp",
	3: "Quirk Amplification",
	4: "Spacial Compression",
}

const SPELL_DESCS = {
	1: "Boosters are X% stronger",
	2: "Time Capsules are X% stronger",
	3: "Quirk Layers are X% more efficient",
	4: "Space Buildings cost scale X% slower",
}

const SPELL_BASE = {
	1: 1.25,
	2: 1.1,
	3: 1.04,
	4: 1.01,
}

function getSpellPower(x) {
	let power = new Decimal(1);
	if (player.m.upgrades.includes(11)) power = power.times(LAYER_UPGS.m[11].currently())
	if (player.m.upgrades.includes(21) && (x==2||x==3)) power = power.times(LAYER_UPGS.m[21].currently())
	if (player.m.upgrades.includes(22) && (x==2)) power = power.times(10)
	if (player.m.upgrades.includes(41)) {
		let casted = player.m.casted[x]
		power = power.times(casted.max(1).log10().add(1).log10().div(5).add(1))
	}
	if (player.sp.upgrades.includes(23)) power = power.times(LAYER_UPGS.sp[23].currently())
	if (player.ps.upgrades.includes(13)) power = power.times(LAYER_UPGS.ps[13].currently())
	
	if (power.gte(50)) power = power.log10().times(50/Math.log10(50)).min(power)
	return power.max(1);
}

function getSpellEff(x) {
	let base = SPELL_BASE[x]
	let power = getSpellPower(x)
	let eff = Decimal.pow(base, power)
	if (x==4) eff = Decimal.sub(2, Decimal.div(base, power.log2().add(1)))
	return eff
}

function getSpellDesc(x) {
	let desc = SPELL_DESCS[x]
	let eff = tmp.spellEffs[x]
	return desc.replace("X", format(eff.sub(1).times(100)))
}

function getSpellTime() {
	let time = 60
	if (player.m.total.gte(2.5e9)) time *= 4
	if (player.m.upgrades.includes(43)) time *= LAYER_UPGS.m[43].currently().toNumber()
	return time
}

function spellActive(x) {
	if (!player.m.unl) return false
	if (!tmp.spellEffs) return false
	if (tmp.spellsUnl<x) return false
	return player.m.spellTimes[x]>0
}

function activateSpell(x, force=false) {
	if (tmp.spellsUnl<x) return;
	let toCast = setToCast(player.m.toCast[x]).max(1)
	if (!force) {
		if (!player.m.unl) return
		if (spellActive(x)) return
		if (player.m.points.lt(toCast)) return
	}
	if (player.sp.total.lt(2)) player.m.points = player.m.points.sub(toCast).max(0)
	player.m.casted[x] = toCast
	player.m.spellTimes[x] = getSpellTime()
	if (!force) player.m.hexes = player.m.hexes.add(getHexGain())
}

function getHexGain() {
	let gain = new Decimal(1)
	if (player.m.upgrades.includes(14)) gain = gain.times(LAYER_UPGS.m[14].currently())
	if (player.sp.upgrades.includes(14)) gain = gain.times(LAYER_UPGS.sp[14].currently())
	if (player.l.unl && tmp.l !== undefined) gain = gain.times(tmp.l.lbEff[2])
	return gain.floor()
}

function getHexEff() {
	let eff = player.m.hexes.times(2).max(1).pow(5)
	return eff;
}

function isToCastValid(val) {
	try {
		val = new Decimal(val).floor()
		if (val.eq(undefined) || val.eq(null)) return false
		if (val.lt(1)) return false
		if (val.gt(player.m.points)) return false
		return val;
	} catch(e) {
		return false;
	}
}

function setToCast(val) {
	if (!player.m.upgrades.includes(41)) return new Decimal(1)
	let validVal = isToCastValid(val)
	if (!validVal) return new Decimal(1)
	else return validVal
}

function updateToCast(id) {
	activateSpell(id, true)
}

function getSGenPowEff() {
	if (!player.sg.unl) return new Decimal(1)
	let eff = player.sg.power.add(1).pow(3)
	return eff
}

function getSuperGenPowerGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.ba[21].currently())
	return mult
}

function addToSGBase() {
	let toAdd = new Decimal(0)
	if (player.ba.upgrades.includes(23)) toAdd = toAdd.add(LAYER_UPGS.ba[23].currently())
	if (player.sp.upgrades.includes(21)) toAdd = toAdd.add(LAYER_UPGS.sp[21].currently())
	return toAdd
}

function getLifePowerMult() {
	let x = tmp.layerEffs.ps.mult.div(30)
	if (player.sp.upgrades.includes(42)) x = x.times(LAYER_UPGS.sp[42].currently())
	if (tmp.s !== undefined && tmp.s.trueSbUnl >= 6) x = x.times(tmp.s.sbEff[6])
	return x
}

function getLifePowerExp() {
	let x = tmp.layerEffs.ps.exp
	return x
}

function getLifePowerSoftcapStart() {
	let x = tmp.layerEffs.l
	return x
}

function getLifePowerSoftcapExp() {
	let x = 1/3
	return x
}

let LIFE_BOOSTERS = {
	max: 5,
	unl() {
		if (player.ps.upgrades.includes(21)) return 5
		return 4
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
		return player.l.power.add(1).log10()
	},
	req(x) {
		return tmp.l.lb[x].times(this[x].reqMult).add(this[x].req)
	},
	reqTarget(x) {
		return player.ps.points.sub(this[x].req).div(this[x].reqMult).add(1).floor()
	},
	1: {
		req: new Decimal(1),
		reqMult: new Decimal(1),
		eff(str) {
			return str.pow(0.15).div(3)
		},
		effDesc(x) {
			return "Add " + format(x) + " Hyper-Boosters to its effect"
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
		let r = new Decimal(1)
		if (player.ba.upgrades.includes(35)) r = r.times(1.25)
		if (tmp.s !== undefined && tmp.s.trueSbUnl >= 10) r = r.times(tmp.s.sbEff[10])
		return r
	},
	nextCapReq(x) {
		if (x === undefined) x = player.hs.superUpgradeCap
		return Decimal.times(x, 200).add(1300)
	},
	nextCapTarget() {
		let x = player.g.points.sub(1300).div(200)
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


let IMPERIUM = {
	lifeReq() {
		return Decimal.pow(10, player.i.lifeBricks.times(2).sqr().add(15))
	},
	lifeTarget() {
		return player.l.power.log10().sub(15).sqrt().div(2).add(1).floor()
	},
	canBuild() {
		let cost = this.cost()
		return player.i.building || (player.i.points.gte(cost.i) && player.i.lifeBricks.gte(cost.l))
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
		return {
			i: x.times(1.75).add(0.5).sub(sub).ceil(),
			l: x.times(1.5).add(1).sub(sub).ceil()
		}
	},
	speed() {
		let x = Decimal.pow(3.75, player.i.extraBuildings.add(5)).recip()
		x = x.times(IMPERIUM.sgSpeedBoost())
		if (player.sp.upgrades.includes(45)) x = x.times(5)
		return x
	},
	sgSpeedBoost() {
		return player.sg.points.add(1).pow(2)
	},
	collapsed(row) {
		return tmp.i !== undefined && tmp.i.collapse !== undefined && tmp.i.collapse[row]
	},
	maxCollapseRows: 1
}

/*case 1: 
			var keepUpgrades = 0
			if (player.h.best.gte(1) || player.q.best.gte(1)) keepUpgrades = 1
			else if (LAYER_ROW[layer] == 2 && player[layer].best.gte(layer == "e" ? 10 : 3)) keepUpgrades = 1
			else if (LAYER_ROW[layer] == 1 && player[layer].best.gte(8)) keepUpgrades = 1

			player.points = new Decimal(10)
			player.p.points = new Decimal(0)
			if (!keepUpgrades) player.p.upgrades = []
			player.g.power = new Decimal(0)
			break;
		case 2: 
			var keepMilestones = 0
			if (player.h.best.gte(2) || player.q.best.gte(2)) keepMilestones = 1
			else if (LAYER_ROW[layer] == 2 && player[layer].best.gte(layer == "sb" ? 4 : 2)) keepMilestones = 1

			var keepUpgrades = 0
			if (player.sp.total.gte(1)) keepUpgrades = 1

			player.b.points = new Decimal(0)
			if (!keepMilestones) player.b.best = new Decimal(0)
			if (!keepUpgrades && !player.t.best.gte(4)) player.b.upgrades = []

			player.g.points = new Decimal(0)
			player.g.power = new Decimal(0)
			if (!keepMilestones) player.g.best = new Decimal(0)
			if (!keepUpgrades && !player.s.best.gte(4)) player.g.upgrades = []

			player.t.energy = new Decimal(0)
			break
		case 3: 
			player.t.points = new Decimal(0);
			player.t.order = 0
			if (player.h.best.lt(2)&&player.m.total.lt(1)) player.t.best = new Decimal(0);
			if (player.h.best.lt(4)&&!player.sp.total.gte(1)) player.t.upgrades = [];
			player.t.extCapsules = new Decimal(0);
			player.e.order = 0
			player.e.points = new Decimal(0);
			if (player.h.best.lt(2)&&player.m.total.lt(1)) player.e.best = new Decimal(0);
			player.e.enhancers = new Decimal(0);
			if (player.h.best.lt(4)&&!player.sp.total.gte(1)) player.e.upgrades = [];
			player.s = {
				unl: player.s.unl,
				order: 0,
				points: new Decimal(0),
				best: (player.h.best.gte(2)||player.m.total.gte(1)) ? player.s.best : new Decimal(0),
				spent: (player.q.best.gte(4)&&(layer=="h"||layer=="q"||layer=="ss"||layer=="hb")) ? player.s.spent : new Decimal(0),
				buildings: (player.q.best.gte(4)&&(layer=="h"||layer=="q"||layer=="ss"||layer=="hb")) ? player.s.buildings : ({}),
				upgrades: (player.h.best.gte(4)||player.sp.total.gte(1)) ? player.s.upgrades : [],
				auto: player.s.auto,
				autoBuild: player.s.autoBuild,
			}
			player.sb = {
				unl: player.sb.unl,
				auto: player.sb.auto,
				order: 0,
				points: new Decimal(0),
				best: (player.h.best.gte(2)||player.m.total.gte(1)) ? player.sb.best : new Decimal(0),
				upgrades: (player.h.best.gte(10)||player.sp.total.gte(1)) ? player.sb.upgrades : [],
			}
			player.sg = {
				unl: player.sg.unl,
				auto: player.sg.auto,
				points: new Decimal(0),
				best: player.sg.best,
				power: new Decimal(0),
				upgrades: player.sg.upgrades,
			}
			player.h.time = 0
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			break;
		case 4: 
			player.h = {
				unl: player.h.unl,
				time: 0,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1))?player.h.best:new Decimal(0),
				challs: (player.m.total.gte(2)||player.sp.total.gte(1))?player.h.challs:[],
			}
			player.q = {
				unl: player.q.unl,
				auto: player.q.auto,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1))?player.q.best:new Decimal(0),
				layers: new Decimal(0),
				energy: new Decimal(0),
				time: new Decimal(0),
				upgrades: (player.ba.best.gte(2)||player.sp.total.gte(1))?player.q.upgrades:[],
			}
			player.hb = {
				unl: player.hb.unl,
				auto: player.hb.auto,
				order: player.hb.order,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1))?player.hb.best:new Decimal(0),
				upgrades: (player.ba.best.gte(5)||player.sp.total.gte(1))?player.hb.upgrades:[],
			}
			player.ss = {
				unl: player.ss.unl,
				auto: player.ss.auto,
				order: player.ss.order,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1))?player.ss.best:new Decimal(0),
				subspace: new Decimal(0),
				upgrades: (player.ba.best.gte(5)||player.sp.total.gte(1))?player.ss.upgrades:[],
			}
			break;
		case 5: 
			player.m = {
				unl: player.m.unl,
				auto: player.m.auto,
				autoIns: player.m.autoIns,
				points: new Decimal(0),
				best: new Decimal(0),
				total: player.sp.total.gte(2) ? player.m.total : new Decimal(0),
				spellTimes: {
					1: 0,
					2: 0,
					3: 0,
					4: 0,
				},
				hexes: new Decimal(0),
				toCast: player.m.toCast,
				casted: {
					1: new Decimal(1),
					2: new Decimal(1),
					3: new Decimal(1),
					4: new Decimal(1),
				},
				upgrades: player.sp.total.gte(1) ? player.m.upgrades : [],
			}
			player.ba = {
				unl: player.ba.unl,
				points: new Decimal(0),
				best: player.sp.total.gte(5) ? player.ba.best : new Decimal(0),
				power: new Decimal(0),
				positivity: new Decimal(0),
				negativity: new Decimal(0),
				upgrades: player.sp.total.gte(1) ? player.ba.upgrades : [],
			}
			player.ps = {
				unl: player.ps.unl,
				auto: player.ps.auto,
				points: new Decimal(0),
				best: player.ps.best,
				upgrades: player.ps.upgrades,
			}
			player.l.power = new Decimal(0)
			break;
		case 6:
			var start = getStartPlayer()
			player.sp = start.sp
			player.l = start.l
			player.hs = start.hs
			player.i = start.i
			break;*/