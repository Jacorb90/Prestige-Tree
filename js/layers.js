const ROWS = 7

const LAYER_DATA = {
	p: {
		branches: [],
		getReq() { return new Decimal(10) },
		res: "prestige points",
		type: "normal",
		exp: new Decimal(.5),
		row: 1,
		amtName: "points",
		getAmt() { return player.points },
		shown() { return true },
	},
	b: {
		branches: ["p"],
		getReq() { 
			let req = new Decimal(200);
			if (player.g.unl && !player.b.unl) req = req.times(5000)
			return req;
		},
		res: "boosters",
		type: "static",
		exp: new Decimal(1.25),
		base: new Decimal(5),
		row: 2,
		eff() {
			if (tmp.challActive ? tmp.challActive.h[11] : true) return new Decimal(1);
			let ret = Decimal.pow(Decimal.add(2, tmp.atbb).max(0), player.b.points.add(getFreeBoosters()).times(getBoosterPower())).max(0);
			return ret;
		},
		effDesc(eff) { return "translated to a "+format(eff)+"x multiplier to point gain" },
		amtName: "points",
		getAmt() { return player.points },
		canBuyMax() { return player.b.best.gte(15) },
		shown() { return player.p.unl },
	},
	g: {
		branches: ["p"],
		getReq() { 
			let req = new Decimal(200);
			if (player.b.unl && !player.g.unl) req = req.times(5000)
			return req;
		},
		res: "generators",
		type: "static",
		exp: new Decimal(1.25),
		base: new Decimal(5),
		row: 2,
		eff() {
			let ret = Decimal.pow(Decimal.add(2, tmp.atgb).times(tmp.sGenPowEff).times((player.ss.upgrades.includes(23) ? LAYER_UPGS.ss[23].currently() : 1)).max(0), player.g.points.times(getGenPow())).sub(1).times(getGenPowerGainMult()).max(0);
			return ret;
		},
		effDesc(eff) { return "which are generating "+format(eff)+" Generator Power/sec" },
		amtName: "points",
		getAmt() { return player.points },
		canBuyMax() { return player.g.best.gte(15) },
		shown() { return player.p.unl },
	},
	e: {
		branches: ["b","g"],
		getReq() {
			return new Decimal(1e120).times(Decimal.pow("1e200", Decimal.pow(player.e.order, 2)))
		},
		orderUp: true,
		res: "enhance points",
		type: "normal",
		exp: new Decimal(.02),
		row: 3,
		amtName: "points",
		getAmt() { return player.points },
		shown() { return player.b.unl && player.g.unl },
	},
	t: {
		branches: ["b"],
		getReq() {
			return new Decimal(1e120).times(Decimal.pow("1e200", Decimal.pow(player.t.order, 2)))
		},
		orderUp: true,
		res: "time capsules",
		type: "static",
		exp: new Decimal(1.85),
		base: new Decimal(1e15),
		row: 3,
		eff() { return {
			gain: Decimal.pow(Decimal.add(3, tmp.attb).times(tmp.mttb), player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap).times(getFreeExtPow())).times(getCapPow())).sub(1).times(getTimeEnergyGainMult()),
			limit: Decimal.pow(Decimal.add(2, tmp.attb).times(tmp.mttb), player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap).times(getFreeExtPow())).times(getCapPow())).sub(1).times(100).times(getTimeEnergyLimitMult()),
		}},
		effDesc(eff) { return "which are generating "+format(eff.gain)+" Time Energy/sec, but with a limit of "+format(eff.limit)+" Time Energy" },
		amtName: "points",
		getAmt() { return player.points },
		canBuyMax() { return player.q.total.gte(2) },
		shown() { return player.b.unl },
	},
	s: {
		branches: ["g"],
		getReq() {
			return new Decimal(1e120).times(Decimal.pow("1e200", Decimal.pow(player.s.order, 2)))
		},
		orderUp: true,
		res: "space energy",
		type: "static",
		exp: new Decimal(1.85),
		base: new Decimal(1e15),
		row: 3,
		amtName: "points",
		getAmt() { return player.points },
		canBuyMax() { return player.q.total.gte(2) },
		shown() { return player.g.unl },
	},
	sb: {
		branches: ["b"],
		getReq() { return new Decimal(180) },
		orderUp: true,
		res: "super-boosters",
		type: "static",
		exp: new Decimal(1.25),
		base: new Decimal(1.05),
		row: 3,
		eff() { return Decimal.pow(Decimal.add(1.5, addToSBBase()), player.sb.points.plus(getExtraSB()).times(getSuperBoosterPow())) },
		effDesc(eff) { return "which are multiplying the Booster effect base by "+format(eff) },
		amtName: "boosters",
		getAmt() { return player.b.points },
		ceilAmt: true,
		canBuyMax() { return player.hb.best.gte(1) },
		shown() { return player.e.unl && player.t.unl && player.s.unl },
	},
	sg: {
		branches: ["g"],
		getReq() { return new Decimal(1000) },
		res: "super-generators",
		type: "static",
		exp: new Decimal(1.4),
		base: new Decimal(1.2),
		row: 3,
		eff() { return Decimal.pow(Decimal.add(2, addToSGBase()), player.sg.points.plus(getExtraSG()).times(getSuperGenPow())).sub(1).times(getSuperGenPowerGainMult()).max(0) },
		effDesc(eff) { return "which are generating "+format(eff)+" Super-Generator Power/sec" },
		amtName: "generators",
		getAmt() { return player.g.points },
		ceilAmt: true,
		canBuyMax() { return player.sg.best.gte(1) },
		shown() { return player.h.challs.includes(62) },
	},
	h: {
		branches: ["t"],
		getReq() { return new Decimal(1e220) },
		res: "hindrance spirit",
		type: "normal",
		exp: new Decimal(.015),
		row: 4,
		eff() {
			let ret = player.h.points.add(1).times(player.points.times(player.h.points).add(1).log10().add(1).log10().add(1)).log10().times(5).root(player.q.upgrades.includes(12)?1.25:2);
			if (player.h.challs.includes(61)) ret = ret.times(1.2);
			if (ret.gte(100)) ret = ret.log10().times(50).min(ret);
			if (spellActive(7)) ret = ret.times(tmp.spellEffs[7]);
			return ret;
		},
		effDesc(eff) { return "which are providing "+format(eff)+" free extra Time Capsules (boosted by your points)" },
		amtName: "time energy",
		getAmt() { return player.t.energy },
		shown() { return player.t.unl && player.sb.unl },
	},
	q: {
		branches: ["e"],
		getReq() { return new Decimal("1e512") },
		res: "quirks",
		type: "normal",
		exp: new Decimal(.0075),
		row: 4,
		amtName: "generator power",
		getAmt() { return player.g.power },
		shown() { return player.e.unl && player.sb.unl },
	},
	hb: {
		branches: ["sb","t"],
		getReq() { 
			let req = new Decimal(12);
			if (player.hb.order>0) req = new Decimal(15)
			return req;
		},
		orderUp: true,
		res: "hyper-boosters",
		type: "static",
		exp: new Decimal(2.5),
		base: new Decimal(1.05),
		row: 4,
		eff() { return Decimal.pow(Decimal.add(1.6, addToHBBase()), player.hb.points.add(getExtraHyperBoosters()).pow(getHyperBoosterExp()).times(getHyperBoosterPow())) },
		effDesc(eff) { return "which are multiplying the Super-Booster effect base by "+format(eff) },
		amtName: "super-boosters",
		getAmt() { return player.sb.points },
		ceilAmt: true,
		canBuyMax() { return player.ba.best.gte(8) },
		shown() { return player.sb.unl && player.h.unl && player.q.unl },
	},
	ss: {
		branches: ["e","s"],
		getReq() { 
			let req = new Decimal(36);
			if (player.ss.order>0) req = new Decimal(45)
			return req;
		},
		orderUp: true,
		res: "subspace energy",
		type: "static",
		exp: new Decimal(1.1),
		base: new Decimal(1.15),
		row: 4,
		eff() { return player.ss.points.pow(2.5).times(getSubspaceGainMult()) },
		effDesc(eff) { return "which are generating "+format(eff)+" Subspace/sec" },
		amtName: "space energy",
		getAmt() { return player.s.points },
		ceilAmt: true,
		canBuyMax() { return player.ba.best.gte(8) },
		shown() { return player.s.unl && player.h.unl && player.q.unl },
	},
	m: {
		branches: ["hb","h","q"],
		getReq() { return new Decimal(2e78) },
		res: "magic",
		type: "normal",
		exp: new Decimal(.01),
		row: 5,
		amtName: "hindrance spirit",
		getAmt() { return player.h.points },
		shown() { return player.h.unl && player.hb.unl },
	},
	ba: {
		branches: [["h",2],"q","ss"],
		getReq() { return new Decimal(5e129) },
		res: "balance energy",
		type: "normal",
		exp: new Decimal(.00667),
		row: 5,
		eff() {
			let points1 = player.ba.points
			if (points1.gte(1e12)) points1 = points1.log10().pow(2).times(1e12/144).min(points1)
			return {
				power: points1.pow(0.2).pow(tmp.baExp ? tmp.baExp : 1).pow(player.ba.upgrades.includes(41)?2:1).times(player.ba.upgrades.includes(54) ?  LAYER_UPGS.ba[54].currently() : 1),
				pos: player.ba.points.pow(0.7).pow(tmp.baExp ? tmp.baExp : 1),
				neg: player.ba.points.pow(0.65).times(0.4).pow(tmp.baExp ? tmp.baExp : 1),
			}
		},
		effDesc(eff) { return "which are generating "+format(eff.power)+" Balance Power, "+format(eff.pos)+" Positivity, and "+format(eff.neg)+" Negativity every second" },
		amtName: "quirks",
		getAmt() { return player.q.points },
		shown() { return player.q.unl && player.ss.unl },
	},
	ps: {
		branches: [["h",3],["q",3]],
		getReq() { 
			return new Decimal("1e5000")
		},
		res: "phantom souls",
		type: "static",
		exp: new Decimal(1.2),
		base: new Decimal("1e250"),
		row: 5,
		eff() { 
			let x = player.ps.points
			if (player.ps.upgrades.includes(12)) x = x.times(1.2)
			return {
				exp: x.div(2).add(1),
				mult: x.div(3).add(1).sqrt()
			}
		},
		effDesc(eff) { return "which are speeding up the Life Power production by " + format(eff.mult) + "x and raising the Life Power amount to the power of " + format(eff.exp) },
		amtName: "quirk energy",
		getAmt() { return player.q.energy },
		canBuyMax() { return player.ps.best.gte(5) },
		shown() { return player.l.unl },
	},
	sp: {
		branches: ["m","ba"],
		getReq() { return new Decimal("1e8500000") },
		res: "super-prestige points",
		type: "normal",
		exp: new Decimal(2e-7),
		row: 6,
		amtName: "prestige points",
		getAmt() { return player.p.points },
		shown() { return player.m.unl && player.ba.unl },
	},
	l: {
		branches: ["hb","m"],
		getReq() { 
			let req = new Decimal(1e195) 
			if (player.l.order>0) req = new Decimal("1e345")
			return req;
		},
		orderUp: true,
		res: "life essence",
		type: "normal",
		exp: new Decimal(.012),
		row: 6,
		eff() { return player.l.points.times(5).max(1).log10().max(1) },
		effDesc(eff) { return "which makes the Life Power softcap start at " + format(eff.pow(tmp.layerEffs.ps.exp)) },
		amtName: "hexes",
		getAmt() { return player.m.hexes },
		shown() { return player.sp.unl },
	},
	hs: {
		branches: ["ss","ba"],
		getReq() { 
			let req = new Decimal(725) 
			if (player.hs.order>0) req = new Decimal(910)
			return req;
		},
		orderUp: true,
		res: "hyperspace energy",
		type: "normal",
		exp: new Decimal(40),
		row: 6,
		amtName: "space energy",
		getAmt() { return player.s.points },
		ceilAmt: true,
		shown() { return player.sp.unl },
	},
	i: {
		branches: ["ss","sg"],
		getReq() { 
			return new Decimal("1e285")
		},
		res: "imperium bricks",
		type: "static",
		exp: new Decimal(1),
		base: new Decimal(1e20),
		row: 6,
		amtName: "subspace",
		getAmt() { return player.ss.subspace },
		canBuyMax() { return player.i.best.gte(3) },
		shown() { return player.ps.unl && player.hs.unl },
	},
	mb: {
		branches: ["l", ["ps", 2]],
		getReq() { return new Decimal(29) },
		res: "mastery bricks",
		type: "static",
		useTotal: true,
		exp: new Decimal(1.07),
		base: new Decimal(1.03),
		row: 7,
		amtName: "phantom souls",
		getAmt() { return player.ps.points },
		ceilAmt: true,
		canBuyMax() { return player.mb.total.gte(32) },
		shown() { return player.i.unl },
	},
	ge: {
		branches: [["sp", 2]],
		getReq() { return new Decimal(1e50) },
		res: "gears",
		type: "normal",
		exp: new Decimal(.05),
		row: 7,
		amtName: "super-prestige points",
		getAmt() { return player.sp.points },
		shown() { return player.mb.unl },
	},
	ma: {
		branches: ["hs", "i"],
		getReq() { return new Decimal(1e160) },
		res: "machine power",
		type: "normal",
		exp: new Decimal(.0075),
		row: 7,
		amtName: "hyperspace energy",
		getAmt() { return player.hs.points },
		shown() { return player.mb.unl },
	},
}

function rowReset(row, layer) {
	let keepRows1to4 = (player.mb.total.gte(1))
	let keepRow5 = (player.ge.total.gte(1))||(player.mb.total.gte(2))
	let keepRow5Milestones = (player.mb.total.gte(1))||keepRow5
	let keepRow6 = (player.mb.total.gte(3))
	let keepRow6Milestones = (player.mb.total.gte(2))
	switch(row) {
		case 0: 
			player.points = new Decimal(0);
			break;
		case 1: 
			var keepUpgrades = 0
			if (player.mb.total.gte(1) && keepRows1to4) keepUpgrades = 1
			else if (player.sp.total.gte(1)) keepUpgrades = 1
			else if (player.h.best.gte(1) || player.q.total.gte(1)) keepUpgrades = 1
			else if (LAYER_DATA[layer].row == 3 && player[layer].best.gte(layer == "e" ? 10 : 3)) keepUpgrades = 1
			else if (LAYER_DATA[layer].row == 2 && player[layer].best.gte(8)) keepUpgrades = 1

			player.points = new Decimal(10)
			player.p.points = new Decimal(0)
			if (!keepUpgrades) player.p.upgrades = []
			player.g.power = new Decimal(0)
			break;
		case 2: 
			var keepMilestones = 0
			if (keepRows1to4) keepMilestones = 1
			else if (player.h.best.gte(2) || player.q.total.gte(2)) keepMilestones = 1
			else if (LAYER_DATA[layer].row == 3 && player[layer].best.gte(layer == "sb" ? 4 : 2)) keepMilestones = 1

			var keepUpgrades = 0
			if (keepRows1to4) keepUpgrades = 1
			else if (player.sp.total.gte(1)) keepUpgrades = 1

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
			if (player.h.best.lt(2)&&player.m.total.lt(1)&&!(player.mb.total.gte(1) && (keepRows1to4))) player.t.best = new Decimal(0);
			if (player.h.best.lt(3)&&!player.sp.total.gte(1)&&!(keepRows1to4)) player.t.upgrades = [];
			player.t.extCapsules = new Decimal(0);
			player.e.order = 0
			player.e.points = new Decimal(0);
			if (player.h.best.lt(2)&&player.m.total.lt(1)&&!(keepRows1to4)) player.e.best = new Decimal(0);
			player.e.enhancers = new Decimal(0);
			if (player.h.best.lt(3)&&!player.sp.total.gte(1)&&!(keepRows1to4)) player.e.upgrades = [];
			player.s = {
				unl: player.s.unl,
				order: 0,
				points: new Decimal(0),
				best: (player.h.best.gte(2)||player.m.total.gte(1)||(keepRows1to4)) ? player.s.best : new Decimal(0),
				spent: (player.q.total.gte(3)&&(layer=="h"||layer=="q"||layer=="ss"||layer=="hb")) ? player.s.spent : new Decimal(0),
				buildings: (player.q.total.gte(3)&&(layer=="h"||layer=="q"||layer=="ss"||layer=="hb")) ? player.s.buildings : ({}),
				upgrades: (player.h.best.gte(3)||player.sp.total.gte(1)||(keepRows1to4)) ? player.s.upgrades : [],
				auto: player.s.auto,
				autoBuild: player.s.autoBuild,
			}
			player.sb = {
				unl: player.sb.unl,
				auto: player.sb.auto,
				order: 0,
				points: new Decimal(0),
				best: (player.h.best.gte(2)||player.m.total.gte(1)||(keepRows1to4)) ? player.sb.best : new Decimal(0),
				upgrades: (player.h.best.gte(10)||player.sp.total.gte(1)||(keepRows1to4)) ? player.sb.upgrades : [],
			}
			player.sg = {
				unl: player.sg.unl,
				auto: player.sg.auto,
				points: new Decimal(0),
				best: player.sg.best,
				power: new Decimal(0),
				upgrades: (keepRows1to4)?player.sg.upgrades:[],
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
				best: (player.ba.best.gte(1)||player.m.total.gte(1)||(keepRows1to4))?player.h.best:new Decimal(0),
				challs: (player.m.total.gte(2)||player.sp.total.gte(1)||(keepRows1to4))?player.h.challs:[],
			}
			player.q = {
				unl: player.q.unl,
				auto: player.q.auto,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1)||(keepRows1to4))?player.q.best:new Decimal(0),
				total: (player.ba.best.gte(1)||player.m.total.gte(1)||(keepRows1to4))?player.q.total:new Decimal(0),
				layers: new Decimal(0),
				energy: new Decimal(0),
				time: new Decimal(0),
				upgrades: (player.ba.best.gte(2)||player.sp.total.gte(1)||(keepRows1to4))?player.q.upgrades:[],
			}
			player.hb = {
				unl: player.hb.unl,
				auto: player.hb.auto,
				order: player.hb.order,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1)||(keepRows1to4))?player.hb.best:new Decimal(0),
				upgrades: (player.ba.best.gte(5)||player.sp.total.gte(1)||(keepRows1to4))?player.hb.upgrades:[],
			}
			player.ss = {
				unl: player.ss.unl,
				auto: player.ss.auto,
				order: player.ss.order,
				points: new Decimal(0),
				best: (player.ba.best.gte(1)||player.m.total.gte(1)||(keepRows1to4))?player.ss.best:new Decimal(0),
				subspace: new Decimal(0),
				upgrades: (player.ba.best.gte(5)||player.sp.total.gte(1)||(keepRows1to4))?player.ss.upgrades:[],
			}
			break;
		case 5: 
			player.m = {
				unl: player.m.unl,
				auto: player.m.auto,
				autoIns: player.m.autoIns,
				points: new Decimal(0),
				best: new Decimal(0),
				total: (player.sp.total.gte(2)||keepRow5||keepRow5Milestones) ? player.m.total : new Decimal(0),
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
				upgrades: (player.sp.total.gte(1)||keepRow5) ? player.m.upgrades : [],
			}
			for (let i=5;i<=MAX_SPELLS;i++) {
				player.m.spellTimes[i] = 0
				player.m.casted[i] = new Decimal(1);
			}
			player.ba = {
				unl: player.ba.unl,
				points: new Decimal(0),
				best: (player.sp.total.gte(5)||keepRow5||keepRow5Milestones) ? player.ba.best : new Decimal(0),
				power: new Decimal(0),
				positivity: new Decimal(0),
				negativity: new Decimal(0),
				upgrades: (player.sp.total.gte(1)||keepRow5) ? player.ba.upgrades : [],
			}
			player.ps = {
				unl: player.ps.unl,
				auto: player.ps.auto,
				points: new Decimal(0),
				best: (keepRow5||keepRow5Milestones||LAYER_DATA[layer].row<7)?player.ps.best:new Decimal(0),
				upgrades: player.ps.upgrades,
			}
			player.l.power = new Decimal(0)
			break;
		case 6:
			player.sp = {
				unl: player.sp.unl,
				points: new Decimal(0),
				best: new Decimal(0),
				total: (keepRow6Milestones||keepRow6) ? player.sp.total : new Decimal(0),
				upgrades: keepRow6 ? player.sp.upgrades : [],
			}
			player.l = {
				unl: player.l.unl,
				order: 0,
				points: new Decimal(0),
				best: (keepRow6Milestones||keepRow6) ? player.l.best : new Decimal(0),
				power: new Decimal(0),
				boosters: {},
			}
			player.hs = {
				unl: player.hs.unl,
				auto: player.hs.auto,
				order: 0,
				points: new Decimal(0),
				best: (keepRow6Milestones||keepRow6) ? player.hs.best : new Decimal(0),
				space: player.mb.total.gte(8) ? player.hs.space : new Decimal(0),
				spent: player.mb.total.gte(8) ? player.hs.spent : new Decimal(0),
				superUpgrades: player.mb.total.gte(8) ? player.hs.superUpgrades : {},
				superUpgradeCap: player.mb.total.gte(8) ? player.hs.superUpgradeCap : new Decimal(1),
			}
			player.i = {
				unl: player.i.unl,
				auto: player.i.auto,
				autoBuild: player.i.autoBuild,
				points: new Decimal(0),
				best: (keepRow6Milestones||keepRow6) ? player.i.best : new Decimal(0),
				lifeBricks: new Decimal(0),
				progress: 0,
				extraBuildings: (player.mb.total.gte(5)) ? player.i.extraBuildings : new Decimal(0)
			}
			break;
		case 7: 
			var start = getStartPlayer()
			player.mb = start.mb;
			player.ge = start.ge;
			player.ma = start.ma;
			break;
	}
}

function getLayerGainMult(layer) {
	let mult = new Decimal(1)
	switch(layer) {
		case "p":
			if (player.p.upgrades.includes(21)) mult = mult.times(2)
			if (player.p.upgrades.includes(23)) mult = mult.times(LAYER_UPGS.p[23].currently())
			if (player.p.upgrades.includes(31)) mult = mult.times(LAYER_UPGS.p[31].currently())
			if (player.b.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.b[11].currently())
			if (player.g.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.g[11].currently())
			if (player.e.unl) mult = mult.times(tmp.enhEff)
			if (player.e.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.e[12].currently())
			if (player.e.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(1e10)
			if (player.e.upgrades.includes(34)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(1e40)
			if (player.t.unl) mult = mult.times(tmp.timeEff)
			if (player.s.unl && tmp.s !== undefined) mult = mult.times(tmp.s.sbEff[1])
			if (player.q.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.q[11].currently())
			if (tmp.challActive ? tmp.challActive.h[62] : true) mult = mult.times(0)
			break;
		case "b": 
			if (player.b.upgrades.includes(23)) mult = mult.div(LAYER_UPGS.b[23].currently())
			if (player.s.unl && tmp.s !== undefined) mult = mult.div(tmp.s.sbEff[3])
			break;
		case "g":
			if (player.g.upgrades.includes(22)) mult = mult.div(LAYER_UPGS.g[22].currently())
			if (player.s.unl && tmp.s !== undefined) mult = mult.div(tmp.s.sbEff[3])
			break;
		case "e": 
			if (player.e.upgrades.includes(24)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.e[24].currently())
			if (player.h.best.gte(1)) mult = mult.times(100)
			if (player.q.total.gte(1)) mult = mult.times(100)
			if (player.q.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.q[11].currently())
			break;
		case "t":
			if (player.h.challs.includes(21)) mult = mult.div(LAYER_CHALLS.h[21].currently())
			break;
		case "s":
			if (player.h.challs.includes(21)) mult = mult.div(LAYER_CHALLS.h[21].currently())
			break;
		case "sb":
			if (player.ss.upgrades.includes(14)) mult = mult.div(1.0825)
			if (player.l.unl && tmp.l !== undefined) mult = mult.div(tmp.l.lbEff[4])
			break;
		case "sg": 
			if (player.sp.upgrades.includes(31)) mult = mult.div(1.45)
			if (player.sp.upgrades.includes(25)) mult = mult.div(LAYER_UPGS.sp[25].currently())
			if (player.l.unl && tmp.l !== undefined) mult = mult.div(tmp.l.lbEff[4])
			break;
		case "hb": 
			if (player.l.unl && tmp.l !== undefined) mult = mult.div(tmp.l.lbEff[4])
			break;
		case "h": 
			if (player.h.challs.includes(71)) mult = mult.times(LAYER_CHALLS.h[71].currently())
			if (player.q.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.q[22].currently().h)
			if (player.q.upgrades.includes(34)) mult = mult.times(LAYER_UPGS.q[34].currently())
			if (player.q.upgrades.includes(44)) mult = mult.times(LAYER_UPGS.q[44].currently())
			if (player.ba.unl) mult = mult.times(tmp.balEff)
			if (player.m.unl) mult = mult.times(tmp.hexEff)
			break;
		case "q": 
			if (player.h.challs.includes(12)) mult = mult.times(LAYER_CHALLS.h[12].currently())
			if (player.q.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.q[22].currently().q)
			if (player.q.upgrades.includes(34)) mult = mult.times(LAYER_UPGS.q[34].currently())
			if (player.ba.unl) mult = mult.times(tmp.balEff)
			if (player.m.unl) mult = mult.times(tmp.hexEff)
			break;
		case "m": 
			if (player.sp.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.sp[12].currently())
			break;
		case "ba": 
			if (player.sp.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.sp[12].currently())
			break;
		case "ps": 
			if (player.ps.upgrades.includes(11)) mult = mult.div(LAYER_UPGS.ps[11].currently())
			if (tmp.s !== undefined && tmp.s.trueSbUnl >= 7) mult = mult.div(tmp.s.sbEff[7])
			break;
		case "sp": 
			if (player.sp.upgrades.includes(24)) mult = mult.times(LAYER_UPGS.sp[24].currently())
			if (player.sp.upgrades.includes(33)) mult = mult.times(LAYER_UPGS.sp[33].currently())
			if (player.sp.upgrades.includes(55)) mult = mult.times(LAYER_UPGS.sp[55].currently())
			if (spellActive(9)) mult = mult.times(tmp.spellEffs[9]);
			if (player.ge.unl) mult = mult.times(LAYER_CHALLS.ge[22].currently());
			break;
		case "l": 
			if (player.sp.upgrades.includes(41)) mult = mult.times(LAYER_UPGS.sp[41].currently())
			break;
		case "hs": 
			if (player.sp.upgrades.includes(43)) mult = mult.times(LAYER_UPGS.sp[43].currently())
			if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 5) mult = mult.times(tmp.l.lbEff[5])
			if (player.ma.unl && MACHINES[6].unl()) mult = mult.times(MACHINES[6].currently());
			break;
		case "i": 
			if (player.ge.upgrades.includes(13)) mult = mult.div(LAYER_UPGS.ge[13].currently());
			break;
		case "mb":
			if (player.ma.unl && MACHINES[4].unl()) mult = mult.div(MACHINES[4].currently());
			break;
	}
	return mult
}

function getLayerGainExp(layer) {
	let exp = new Decimal(1)
	let row = LAYER_DATA[layer].row
	if (row < 6) exp = fixValue(tmp.i && tmp.i.workEff, 1).recip()
	if (IMPERIUM.collapsed(row)) exp = exp.times(Decimal.sub(1, tmp.i.collapse[row]))
	switch(layer) {
		case "p": 
			if (tmp.challActive ? tmp.challActive.h[21] : true) exp = exp.div(100)
			break;
		case "ps": 
			if (player.l.order > 0) exp = exp.div(2)
			break;
		case "l": 
			if (player.l.order > 0) exp = exp.div(2)
			break;
		case "hs":
			if (player.hs.order > 0) exp = exp.div(2)
			break;
	}
	return exp;
}

let ROW_LAYERS = []
for (let i=1;i<=ROWS;i++) {
	let newData = Object.keys(LAYER_DATA).filter(l => (i==LAYER_DATA[l].row))
	let newRow = []
	for (let l=0;l<newData.length;l++) newRow.push(newData[l])
	ROW_LAYERS.push(newRow)
}

function getResetGain(layer) {
	if (tmp.gainMults[layer].eq(0) || tmp.gainExp[layer].eq(0)) return new Decimal(0)
	if (LAYER_DATA[layer].type=="static") {
		if ((!LAYER_DATA[layer].canBuyMax()) || tmp.layerAmt[layer].lt(tmp.layerReqs[layer]) || tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return new Decimal(1)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).div(tmp.gainMults[layer]).max(1).log(LAYER_DATA[layer].base).times(tmp.gainExp[layer]).pow(Decimal.pow(LAYER_DATA[layer].exp, -1))
		if (layer=="sg" && gain.gte(16)) gain = gain.times(16).sqrt()
		if ((LAYER_DATA[layer].row < 5 && layer != "hb") || layer == "ps") {
			if (gain.gte(12)) {
				if (LAYER_DATA[layer].row < 5 && fixValue(tmp.scaling12b).gt(1)) gain = gain.times(tmp.scaling12b).add(tmp.scaling12b.sub(1).times(12))
				else if (layer=="ps" && fixValue(tmp.scaling12ps).gt(1)) gain = gain.times(tmp.scaling12ps).add(tmp.scaling12ps.sub(1).times(12))
				gain = gain.times(12).sqrt()
			}
			if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
		}
		return gain.floor().sub(player[layer][LAYER_DATA[layer].useTotal?"total":"points"]).add(1).max(1);
	} else {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(0)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).pow(LAYER_DATA[layer].exp).times(tmp.gainMults[layer]).pow(tmp.gainExp[layer])
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	}
}

function getNextAt(layer, disp=false) {
	if (tmp.gainMults[layer].eq(0) || tmp.gainExp[layer].eq(0)) return new Decimal(1/0)
	if (LAYER_DATA[layer].type=="static") {
		if (!LAYER_DATA[layer].canBuyMax()) disp = false
		let amt = player[layer][LAYER_DATA[layer].useTotal?"total":"points"].plus((disp&&tmp.layerAmt[layer].gte(tmp.nextAt[layer]))?tmp.resetGain[layer]:0)
		if ((LAYER_DATA[layer].row < 5 && layer != "hb") || layer == "ps") {
			if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
			if (amt.gte(12)) {
				amt = amt.pow(2).div(12)
				if (LAYER_DATA[layer].row < 5 && fixValue(tmp.scaling12b).gt(1)) amt = amt.sub(tmp.scaling12b.sub(1).times(12)).div(tmp.scaling12b)
				else if (layer=="ps" && fixValue(tmp.scaling12ps).gt(1)) amt = amt.sub(tmp.scaling12ps.sub(1).times(12)).div(tmp.scaling12ps)
			}
		}
		if (layer=="sg" && amt.gte(16)) amt = amt.pow(2).div(16)
		let extraCost = Decimal.pow(LAYER_DATA[layer].base, amt.pow(LAYER_DATA[layer].exp).div(tmp.gainExp[layer])).times(tmp.gainMults[layer])
		let cost = extraCost.times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (LAYER_DATA[layer].ceilAmt) cost = cost.ceil()
		return cost;
	} else {
		let next = tmp.resetGain[layer].add(1)
		if (tmp.gainMults[layer].eq(0)) return new Decimal(1/0);
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp.gainExp[layer]).div(tmp.gainMults[layer]).root(LAYER_DATA[layer].exp).times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (LAYER_DATA[layer].ceilAmt) next = next.ceil()
		return next;
	}
}

function nodeShown(layer) {
	if (LAYER_DATA[layer].shown()) return true
	switch(layer) {
		case "i":
			return player.l.unl
			break;
	}
	return false
}

function layerUnl(layer) {
	return LAYER_DATA[layer] && (player[layer].unl || (tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) && LAYER_DATA[layer].shown()))
}

var prevOnReset
function doReset(layer, force=false) {
	if (!force) {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return;
		let gain = tmp.resetGain[layer]
		if (LAYER_DATA[layer].type=="static") {
			if (tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return;
			addPoints(layer, LAYER_DATA[layer].canBuyMax() ? gain : 1)
		} else addPoints(layer, gain)

		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;

			let layers = ROW_LAYERS[LAYER_DATA[layer].row-1]
			for (let i in layers) if (!player[layers[i]].unl && player[layers[i]]!==undefined) player[layers[i]].order += LAYER_DATA[layer].orderUp?1:0
		}
	
		tmp.layerAmt[layer] = new Decimal(0) // quick fix
	}

	if ((layer=="b"&&player.t.best.gte(12))||(layer=="g"&&player.s.best.gte(12))) return;
	if ((layer=="t"&&player.h.best.gte(25))||(layer=="s"&&player.q.total.gte(25))||(layer=="sb"&&player.h.best.gte(2500))||(layer=="sg"&&player.sg.best.gte(1))) return;
	if ((layer=="hb"&&player.ba.best.gte(8))||(layer=="ss"&&player.ba.best.gte(8))) return;
	if (layer=="ps"&&player.ps.best.gte(5)) return;
	if (layer=="i"&&player.mb.total.gte(10)&&!force) return;
	let row = LAYER_DATA[layer].row-1

	var layersWithChalls = Object.keys(LAYER_CHALLS)
	for (let y = 0; y < layersWithChalls.length; y++) {
		var layerResetting = layersWithChalls[y]
		if ((row >= LAYER_DATA[layerResetting].row-1) && (!force || layerResetting != layer)) completeChall(layerResetting)
	}

	prevOnReset = JSON.parse(JSON.stringify(player)) //Deep Copy
	if (row == 0) rowReset(0, layer)
	else for (let x = row; x >= 1; x--) rowReset(x, layer)
	prevOnReset = undefined

	updateTemp()
	updateTemp()
}

function adjustMSDisp() {
	let displays = ["always", "automation", "incomplete", "never"];
	player.msDisplay = displays[(displays.indexOf(player.msDisplay)+1)%4]
}

function milestoneShown(complete, auto=false) {
	switch(player.msDisplay) {
		case "always": 
			return true;
			break;
		case "automation": 
			return auto||!complete
			break;
		case "incomplete":
			return !complete
			break;
		case "never": 
			return false;
			break;
	}
	return false;
}

function addTime(diff, layer) {
	let data = player
	let time = data.timePlayed
	if (layer) {
		data = data[layer]
		time = data.time
	}

	//I am not that good to perfectly fix that leak. ~ DB Aarex
	if (time + 0 !== time) {
		console.log("Memory leak detected. Trying to fix...")
		time = toNumber(time)
		if (isNaN(time) || time == 0) {
			console.log("Couldn't fix! Resetting...")
			time = layer ? player.timePlayed : 0
			if (!layer) player.timePlayedReset = true
		}
	}
	time += toNumber(diff)

	if (layer) data.time = time
	else data.timePlayed = time
}