var player;
var tmp = {};
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;

function getStartPlayer() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		notify: {},
		msDisplay: "always",
		offlineProd: true,
		versionType: "real",
		version: VERSION.num,
		beta: VERSION.beta,
		timePlayed: 0,
		keepGoing: false,
		hasNaN: false,
		points: new Decimal(10),
		p: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
		},
		b: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
			auto: false,
		},
		g: {
			unl: false,
			points: new Decimal(0),
			power: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
			auto: false,
		},
		e: {
			unl: false,
			auto: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			enhancers: new Decimal(0),
			upgrades: [],
		},
		t: {
			unl: false,
			auto: false,
			autoCap: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			energy: new Decimal(0),
			extCapsules: new Decimal(0),
			upgrades: [],
		},
		s: {
			unl: false,
			auto: false,
			autoBuild: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			spent: new Decimal(0),
			buildings: {
				1: new Decimal(0),
				2: new Decimal(0),
				3: new Decimal(0),
				4: new Decimal(0),
				5: new Decimal(0)
			},
			upgrades: [],
		},
		sb: {
			unl: false, 
			order: 0,
			auto: false,
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
		},
		sg: {
			unl: false,
			auto: false,
			points: new Decimal(0),
			best: new Decimal(0),
			power: new Decimal(0),
		},
		h: {
			unl: false,
			time: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			challs: [],
		},
		q: {
			unl: false,
			auto: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			layers: new Decimal(0),
			energy: new Decimal(0),
			time: new Decimal(0),
			upgrades: [],
		},
		hb: {
			unl: false,
			auto: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
		},
		ss: {
			unl: false,
			auto: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			subspace: new Decimal(0),
			upgrades: [],
		},
		m: {
			unl: false,
			auto: false,
			autoIns: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spellTimes: {
				1: 0,
				2: 0,
				3: 0,
				4: 0,
			},
			hexes: new Decimal(0),
			toCast: {
				1: "1",
				2: "1",
				3: "1",
				4: "1",
			},
			casted: {
				1: new Decimal(1),
				2: new Decimal(1),
				3: new Decimal(1),
				4: new Decimal(1),
			},
			upgrades: [],
		},
		ba: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			power: new Decimal(0),
			positivity: new Decimal(0),
			negativity: new Decimal(0),
			upgrades: [],
		},
		ps: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
		},
		sp: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			upgrades: [],
		},
		l: {
			unl: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			power: new Decimal(0),
			boosters: {},
		},
		hs: {
			unl: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			space: new Decimal(0),
			spent: new Decimal(0),
			superUpgrades: {},
			superUpgradeCap: new Decimal(1),
		},
		i: {
			unl: false,
			auto: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			lifeBricks: new Decimal(0),
			progress: 0,
			extraBuildings: new Decimal(0)
		},
		mb: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spent: new Decimal(0),
			extraSpells: new Decimal(0),
			extraBoosters: new Decimal(0),
		},
		ge: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			challs: [],
			upgrades: [],
		},
		ma: {
			unl: false,
			points: new Decimal(0),
			best: new Decimal(0),
			built: new Decimal(0),
			active: {
				1: false, 
				2: false, 
				3: false, 
				4: false, 
				5: false
			},
			enhancements: new Decimal(0),
		},
	}
}

const LAYERS = ["p", "b", "g", "e", "t", "s", "sb", "sg", "h", "q", "hb", "ss", "m", "ba", "ps", "sp", "l", "hs", "i", "mb", "ge", "ma"]

const LAYER_REQS = {
	p: new Decimal(10),
	b: new Decimal(200),
	g: new Decimal(200),
	e: new Decimal(1e120),
	t: new Decimal(1e120),
	s: new Decimal(1e120),
	sb: new Decimal(180),
	sg: new Decimal(1000),
	h: new Decimal(1e220),
	q: new Decimal("1e512"),
	hb: new Decimal(12),
	ss: new Decimal(36),
	m: new Decimal(2e78),
	ba: new Decimal(5e129),
	ps: new Decimal("1e5000"),
	sp: new Decimal("1e8500000"),
	l: new Decimal(1e195),
	hs: new Decimal(725),
	i: new Decimal("1e285"),
	mb: new Decimal(29),
	ge: new Decimal(1e50),
	ma: new Decimal(1/0),
}

const LAYER_RES = {
	p: "prestige points",
	b: "boosters",
	g: "generators",
	e: "enhance points",
	t: "time capsules",
	s: "space energy",
	sb: "super-boosters",
	sg: "super-generators",
	h: "hindrance spirit",
	q: "quirks",
	hb: "hyper-boosters",
	ss: "subspace energy",
	m: "magic",
	ba: "balance energy",
	ps: "phantom souls",
	sp: "super-prestige points",
	l: "life essence",
	hs: "hyperspace energy",
	i: "imperium bricks",
	mb: "mastery bricks",
	ge: "gears",
	ma: "machine power",
}

const LAYER_RES_CEIL = ["sb", "sg", "hb", "ss", "hs", "mb"]

const LAYER_TYPE = {
	p: "normal",
	b: "static",
	g: "static",
	e: "normal",
	t: "static",
	s: "static",
	sb: "static",
	sg: "static",
	h: "normal",
	q: "normal",
	hb: "static", 
	ss: "static",
	m: "normal",
	ba: "normal",
	ps: "static",
	sp: "normal",
	l: "normal",
	hs: "normal",
	i: "static",
	mb: "static",
	ge: "normal",
	ma: "normal",
}

const LAYER_EXP = {
	p: new Decimal(0.5),
	b: new Decimal(1.25),
	g: new Decimal(1.25),
	e: new Decimal(0.02),
	t: new Decimal(1.85),
	s: new Decimal(1.85),
	sb: new Decimal(1.25),
	sg: new Decimal(1.4),
	h: new Decimal(0.015),
	q: new Decimal(0.0075),
	hb: new Decimal(2.5),
	ss: new Decimal(1.1),
	m: new Decimal(0.01),
	ba: new Decimal(0.00667),
	ps: new Decimal(1.2),
	sp: new Decimal(2e-7),
	l: new Decimal(0.012),
	hs: new Decimal(40),
	i: new Decimal(1),
	mb: new Decimal(1.075),
	ge: new Decimal(0.05),
	ma: new Decimal(0.0075),
}

const LAYER_BASE = {
	b: new Decimal(5),
	g: new Decimal(5),
	t: new Decimal(1e15),
	s: new Decimal(1e15),
	sb: new Decimal(1.05),
	sg: new Decimal(1.2),
	hb: new Decimal(1.05),
	ss: new Decimal(1.15),
	ps: new Decimal("1e250"),
	i: new Decimal("1e20"),
	mb: new Decimal(1.033),
}

const LAYER_USE_TOTAL = ["mb"]

const LAYER_ROW = {
	p: 0,
	b: 1,
	g: 1,
	e: 2,
	t: 2,
	s: 2,
	sb: 2,
	sg: 2,
	h: 3,
	q: 3,
	hb: 3,
	ss: 3,
	m: 4,
	ba: 4,
	ps: 4,
	sp: 5,
	l: 5,
	hs: 5,
	i: 5,
	mb: 6,
	ge: 6,
	ma: 6,
	future_layer: 7,
}

const ROW_LAYERS = [
	["p"],
	["b","g"],
	["e","t","s","sb","sg"],
	["h","q","hb","ss"],
	["m","ba","ps"],
	["sp","l","hs","i"],
	["mb", "ge", "ma"],
	["future_layer"],
]

const ORDER_UP = [
	[],
	[],
	["e","t","s","sb"],
	["hb","ss"],
	[],
	["l","hs"],
	[],
]

const LAYER_EFFS = {
	b() { 
		if (tmp.challActive ? tmp.challActive.h[11] : true) return new Decimal(1);
		let ret = Decimal.pow(Decimal.add(2, tmp.atbb).max(0), player.b.points.add(getFreeBoosters()).times(getBoosterPower())).max(0);
		return ret;
	},
	g() { 
		let ret = Decimal.pow(Decimal.add(2, tmp.atgb).times(tmp.sGenPowEff).times((player.ss.upgrades.includes(23) ? LAYER_UPGS.ss[23].currently() : 1)).max(0), player.g.points.times(getGenPow())).sub(1).times(getGenPowerGainMult()).max(0);
		return ret;
	},
	t() { return {
		gain: Decimal.pow(Decimal.add(3, tmp.attb).times(tmp.mttb), player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap).times(getFreeExtPow())).times(getCapPow())).sub(1).times(getTimeEnergyGainMult()),
		limit: Decimal.pow(Decimal.add(2, tmp.attb).times(tmp.mttb), player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap).times(getFreeExtPow())).times(getCapPow())).sub(1).times(100).times(getTimeEnergyLimitMult()),
	}},
	sb() { return Decimal.pow(Decimal.add(1.5, addToSBBase()), player.sb.points.times(getSuperBoosterPow())) },
	sg() { return Decimal.pow(Decimal.add(2, addToSGBase()), player.sg.points.times(getSuperGenPow())).sub(1).times(getSuperGenPowerGainMult()).max(0) },
	h() { 
		let ret = player.h.points.add(1).times(player.points.times(player.h.points).add(1).log10().add(1).log10().add(1)).log10().times(5).root(player.q.upgrades.includes(12)?1.25:2);
		if (player.h.challs.includes(61)) ret = ret.times(1.2);
		if (ret.gte(100)) ret = ret.log10().times(50).min(ret);
		if (spellActive(7)) ret = ret.times(tmp.spellEffs[7]);
		return ret;
	},
	hb() {
		return Decimal.pow(Decimal.add(1.6, addToHBBase()), player.hb.points.add(getExtraHyperBoosters()).pow(getHyperBoosterExp()).times(getHyperBoosterPow()))
	},
	ss() { return player.ss.points.pow(2.5).times(getSubspaceGainMult()) },
	ba() { 
		let points1 = player.ba.points
		if (points1.gte(1e12)) points1 = points1.log10().pow(2).times(1e12/144).min(points1)
		return {
			power: points1.pow(0.2).pow(tmp.baExp ? tmp.baExp : 1).pow(player.ba.upgrades.includes(41)?2:1).times(player.ba.upgrades.includes(54) ?  LAYER_UPGS.ba[54].currently() : 1),
			pos: player.ba.points.pow(0.7).pow(tmp.baExp ? tmp.baExp : 1),
			neg: player.ba.points.pow(0.65).times(0.4).pow(tmp.baExp ? tmp.baExp : 1),
		}
	},
	ps() { 
		let x = player.ps.points
		if (player.ps.upgrades.includes(12)) x = x.times(1.2)
		return {
			exp: x.div(2).add(1),
			mult: x.div(3).add(1).sqrt()
		}
	},
	l() { 
		return player.l.points.times(5).max(1).log10().max(1)
	},
}

const LAYER_UPGS = {
	p: {
		rows: 3,
		cols: 3,
		11: {
			desc: "Gain 1 Point every second.",
			cost: new Decimal(1),
			unl() { return player.p.unl },
		},
		12: {
			desc: "Point generation is faster based on your unspent Prestige Points.",
			cost: new Decimal(1),
			unl() { return player.p.upgrades.includes(11) },
			currently() {
				if (tmp.challActive ? tmp.challActive.h[32] : true) return new Decimal(1)
				let ret = player.p.points.add(1).pow(player.g.upgrades.includes(24)?1.1:(player.g.upgrades.includes(14)?0.75:0.5)) 
				if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
				if (ret.gte("1e75000000")) ret = ret.log10().pow(8e6).times(Decimal.div("1e75000000", Decimal.pow(75e6, 8e6))).min(ret)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Point generation is faster based on your Point amount.",
			cost: new Decimal(5),
			unl() { return player.p.upgrades.includes(12) },
			currently() { 
				let ret = player.points.add(1).log10().pow(0.75).add(1)
				if (player.g.upgrades.includes(15)) ret = ret.pow(LAYER_UPGS.g[15].currently())
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Prestige Point gain is doubled.",
			cost: new Decimal(20),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(11) },
		},
		22: {
			desc: "Point generation is faster based on your Prestige Upgrades bought.",
			cost: new Decimal(75),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(12) },
			currently() {
				let ret = Decimal.pow(1.4, player.p.upgrades.length)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret
			},
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Prestige Point gain is boosted by your Point amount.",
			cost: new Decimal(5e3),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(13) },
			currently() { 
				let ret = player.points.add(1).log10().cbrt().add(1) 
				if (player.g.upgrades.includes(23)) ret = ret.pow(LAYER_UPGS.g[23].currently())
				if (player.p.upgrades.includes(33)) ret = ret.pow(1.25)
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Prestige Point gain is boosted by your Prestige Point amount.",
			cost: new Decimal("1e4450"),
			unl() { return player.e.upgrades.includes(33) },
			currently() { 
				let ret = player.p.points.add(1).log10().add(1).pow(player.p.points.add(1).log10().div(200).add(1)).pow(player.p.upgrades.includes(32) ? LAYER_UPGS.p[32].currently() : 1) 
				let capStart = new Decimal("1e1000")
				if (player.sp.upgrades.includes(32)) capStart = capStart.times(LAYER_UPGS.sp[32].currently())
				if (ret.gte(capStart)) ret = ret.log10().times(capStart.div(1e3))
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		32: {
			desc: "The upgrade to the left is stronger based on your Points.",
			cost: new Decimal("1e5140"),
			unl() { return player.e.upgrades.includes(33) },
			currently() {
				let ret = player.points.add(1).log10().add(1).root(16);
				return ret;
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		33: {
			desc: "The above upgrade is 25% stronger.",
			cost: new Decimal("1e5500"),
			unl() { return player.e.upgrades.includes(33) },
		},
	},
	b: {
		rows: 3,
		cols: 3,
		11: {
			desc: "Boosters boost Prestige Point gain.",
			cost: new Decimal(3),
			unl() { return player.b.unl },
			currently() { return player.b.points.sqrt().add(1).max(1.5) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Generators add to the Booster effect.",
			cost: new Decimal(7),
			unl() { return player.g.unl },
			currently() { return player.g.points.add(1).log10().sqrt().div(3).times((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?8.5:1) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points add to the Booster effect.",
			cost: new Decimal(8),
			unl() { return player.b.best.gte(8) },
			currently() { return player.p.points.add(1).log10().add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		21: {
			desc: "Square the Generator Power effect.",
			cost: new Decimal(10),
			unl() { return player.b.upgrades.includes(11) && player.b.upgrades.includes(12) },
		},
		22: {
			desc: "The Generator Power effect is raised to the power of 1.2.",
			cost: new Decimal(15),
			unl() { return player.b.upgrades.includes(12) && player.b.upgrades.includes(13) },
		},
		23: {
			desc: "Boosters are cheaper based on your points.",
			cost: new Decimal(18),
			unl() { return player.b.upgrades.includes(21) || player.b.upgrades.includes(22) },
			currently() { return player.points.add(1).log10().add(1).pow(3.2).pow(tmp.s !== undefined && tmp.s.trueSbUnl >= 4 ? tmp.s.sbEff[4] : 1) },
			effDisp(x) { return "/"+format(x) },
		},
		31: {
			desc: "Hyper-Boosters multiply the Booster base.",
			cost: new Decimal(1250),
			unl() { return player.hb.upgrades.includes(14) },
			currently() { return Decimal.pow(4, player.hb.points.pow(2)) },
			effDisp(x) { return format(x)+"x" },
		},
		32: {
			desc: "Add free Boosters based on your Generator Power.",
			cost: new Decimal(1260),
			unl() { return player.hb.upgrades.includes(14) },
			currently() {
				let ret = player.g.power.add(1).log10().sqrt().floor();
				if (ret.gte(1e3)) ret = ret.log10().times(1e3/3)
				return ret;
			},
			effDisp(x) { return "+"+formatWhole(x) },
		},
		33: {
			desc: "Add 100 free Boosters.",
			cost: new Decimal(1269),
			unl() { return player.hb.upgrades.includes(14) },
		},
	},
	g: {
		rows: 3,
		cols: 5,
		11: {
			desc: "Generators boost Prestige Point gain.",
			cost: new Decimal(3),
			unl() { return player.g.unl },
			currently() { return player.g.points.sqrt().add(1).max(1.5) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Boosters boost Generator Power gain.",
			cost: new Decimal(7),
			unl() { return player.b.unl },
			currently() { return player.b.points.add(1).log10().sqrt().div(3).times((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?3.75:1) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(8),
			unl() { return player.g.best.gte(8) },
			currently() { return player.p.points.add(1).log10().add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		14: {
			desc: "Prestige Upgrade 2 uses a better formula.",
			cost: new Decimal(13),
			unl() { return player.g.best.gte(10) },
		},
		15: {
			desc: "Prestige Upgrade 3 is stronger based on your Generators.",
			cost: new Decimal(15),
			unl() { return player.g.upgrades.includes(13) },
			currently() { 
				let ret = player.g.points.sqrt().add(1).times((player.e.upgrades.includes(32)&&!(tmp.challActive?tmp.challActive.h[12]:true)) ? LAYER_UPGS.e[32].currently() : 1) 
				if (ret.gte(400)) ret = ret.cbrt().times(Math.pow(400, 2/3))
				return ret;
			},
			effDisp(x) { return "^"+format(x) },
		},
		21: {
			desc: "Generator Power generates faster based on its amount.",
			cost: new Decimal(18),
			unl() { return player.g.upgrades.includes(15) },
			currently() { return player.g.power.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Generators are cheaper based on your Prestige Points.",
			cost: new Decimal(19),
			unl() { return player.g.upgrades.includes(15) },
			currently() { return player.p.points.add(1).pow(0.25).pow(player.g.upgrades.includes(32)?2.5:1) },
			effDisp(x) { return "/"+format(x) },
		},
		23: {
			desc: "Prestige Upgrade 6 is stronger based on your Boosters.",
			cost: new Decimal(20),
			unl() { return player.b.unl && player.g.upgrades.includes(15) },
			currently() { return player.b.points.pow(0.75).add(1) },
			effDisp(x) { return "^"+format(x) },
		},
		24: {
			desc: "Prestige Upgrade 2 uses an even better formula.",
			cost: new Decimal(22),
			unl() { return player.g.upgrades.includes(14) && (player.g.upgrades.includes(21)||player.g.upgrades.includes(22)) },
		},
		25: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(28),
			unl() { return player.g.upgrades.includes(23) && player.g.upgrades.includes(24) },
			currently() { return player.p.points.add(1).log10().sqrt().add(1).pow((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?2.75:1).pow(player.g.upgrades.includes(31) ? LAYER_UPGS.g[31].currently() : 1) },
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Generator Upgrade 10 is stronger based on your Generators.",
			cost: new Decimal(950),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.points.add(1).log10().pow(3.6).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		32: {
			desc: "Generator Upgrade 7 is 150% stronger.",
			cost: new Decimal(960),
			unl() { return player.ss.upgrades.includes(21) },
		},
		33: {
			desc: "Generator Power adds to the Generator base.",
			cost: new Decimal(1025),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.power.add(1).log10().div(15).add(1) },
			effDisp(x) { return "+"+format(x) },
		},
		34: {
			desc: "Generators are stronger based on their amount.",
			cost: new Decimal(1068),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.points.add(1).log10().add(1).log10().add(1).sqrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		35: {
			desc: "Subspace boosts Generator Power gain.",
			cost: new Decimal(1130),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.ss.subspace.add(1).pow(40).pow(player.q.upgrades.includes(54)?20:1) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	e: {
		rows: 3,
		cols: 5,
		11: {
			desc: "Boosters & Generators boost each other.",
			cost: new Decimal(40),
			unl() { return player.e.unl },
			currently() { 
				let exp = 1
				if (player.e.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = 1.5
				return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp)} 
			},
			effDisp(x) { return "+"+format(x.g)+" to Generator base, +"+format(x.b)+" to Booster base" },
		},
		12: {
			desc: "Unspent Enhance Points boost Prestige Point gain.",
			cost: new Decimal(150),
			unl() { return player.e.unl&&player.e.best.gte(40) },
			currently() { 
				let ret = player.e.points.add(1).pow((player.e.upgrades.includes(15)&&!(tmp.challActive?tmp.challActive.h[12]:true))?3.25:1.5) 
				if (ret.gte("1e1500")) ret = ret.sqrt().times("1e750")
				return ret
			},
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "You gain 1e10x as many Prestige Points.",
			cost: new Decimal(1000),
			unl() { return player.e.upgrades.includes(11)||player.e.upgrades.includes(12) },
		},
		14: {
			desc: "Enhance Upgrade 1 uses a better formula.",
			cost: new Decimal(5e7),
			unl() { return player.e.upgrades.includes(13)&&(player.t.unl||player.s.unl) },
		},
		15: {
			desc: "Enhance Upgrade 2 uses a better formula.",
			cost: new Decimal(2e10),
			unl() { return player.e.upgrades.includes(14)&&(player.t.unl||player.s.unl)&&player.e.best.gte(1e9) },
		},
		21: {
			desc: "The Generator Power effect is raised to the power of 1.15.",
			cost: new Decimal(1e15),
			unl() { return player.t.unl&&(player.t.order==1||player.s.unl)&&player.e.upgrades.includes(14) },
		},
		22: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e22),
			unl() { return (player.t.unl&&player.s.unl&&player.e.order==2)||player.e.upgrades.includes(22) },
		},
		23: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e40),
			unl() { return (player.t.unl&&player.s.unl&&player.e.order==1)||player.e.upgrades.includes(23) },
		},
		24: {
			desc: "Prestige Points boost Enhance Point gain.",
			cost: new Decimal(1e65),
			unl() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e50) },
			currently() { return player.p.points.add(1).pow(0.002) },
			effDisp(x) { return format(x)+"x" },
		},
		25: {
			desc: "Enhancers are stronger based on your Space Energy & Time Capsules.",
			cost: new Decimal(7.777e77),
			unl() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e60) },
			currently() { 
				let ret = player.s.points.add(player.t.points).div(32).add(1);
				if (ret.gte(2)) ret = ret.log(2).add(1).times(2).sqrt();
				return ret;
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		31: {
			desc: "Enhancers are stronger based on your Super-Boosters.",
			cost: new Decimal(1e90),
			unl() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently() { return player.sb.points.pow(0.75).div(4).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		32: {
			desc: "Generator Upgrade 5 is stronger based on your Enhance Points.",
			cost: new Decimal(7.5e108),
			unl() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently() { 
				let ret = Decimal.pow(10, player.e.points.add(1).log10().pow(0.085)).div(10).max(1).min(10);
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		33: {
			desc: "Unlock 3 new Prestige Upgrades.",
			cost: new Decimal(2.5e139),
			unl() { return player.e.upgrades.includes(31)||player.e.upgrades.includes(32) },
		},
		34: {
			desc: "You gain 1e40x as many Prestige Points.",
			cost: new Decimal(1e152),
			unl() { return player.e.upgrades.includes(31)&&player.e.upgrades.includes(32) },
		},
		35: {
			desc: "Points boost Generator Power gain.",
			cost: new Decimal(2e189),
			unl() { return player.e.upgrades.includes(33)||player.e.upgrades.includes(34) },
			currently() { return player.points.add(1).pow(0.004) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	t: {
		rows: 3,
		cols: 4,
		11: {
			desc: "Non-extra Time Capsules boost the Booster effect.",
			cost: new Decimal(2),
			unl() { return player.t.unl },
			currently() { return player.t.points.pow(0.9).add(0.5).add((player.t.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true))?LAYER_UPGS.t[13].currently():0) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		12: {
			desc: "The Time Energy cap starts later based on your Boosters, and you get a free Extra Time Capsule.",
			cost: new Decimal(3),
			unl() { return player.t.best.gte(2)&&player.t.unl },
			currently() { return player.b.points.pow(0.95).add(1).pow(player.q.upgrades.includes(43)?16:1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Extra Time Capsules are added to the first Time Upgrade's effect formula, but at a reduced amount.",
			cost: new Decimal(3),
			unl() { return player.t.upgrades.includes(11) },
			currently() { return player.t.extCapsules.add(tmp.freeExtCap).pow(0.95) },
			effDisp(x) { return "+"+format(x) },
		},
		14: {
			desc: "Generator Upgrades 2 & 10 are 275% stronger, and Booster Upgrade 2 is 750% stronger.",
			cost: new Decimal(4),
			unl() { return player.t.upgrades.includes(12)||player.t.upgrades.includes(13) },
		},
		21: {
			desc: "Time Energy boosts its own production & limit, and the Time Energy effect uses a better formula.",
			cost: new Decimal(4),
			unl() { return player.t.upgrades.includes(14) },
			currently() { return player.t.energy.add(1).log10().pow(1.1).add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Time Energy production & limit are boosted by your Enhance Points.",
			cost: new Decimal(5),
			unl() { return player.t.upgrades.includes(14)&&player.e.unl },
			currently() { 
				let ret = player.e.points.add(1).pow(0.8/(1+player.t.order))
				if (ret.gte("1e400")) ret = ret.log10().times(Decimal.div("1e400", 400)).min(ret)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Time Energy production & limit are boosted by your Space Energy.",
			cost: new Decimal(5),
			unl() { return player.t.upgrades.includes(14)&&player.s.unl },
			currently() { return Decimal.pow(3, player.s.points.pow(0.9)) },
			effDisp(x) { return format(x)+"x" },
		},
		24: {
			desc: "Get 18 free boosters added to their effect.",
			cost: new Decimal(7),
			unl() { return player.t.upgrades.includes(21)&&player.t.best.gte(5) },
		},
		31: {
			desc: "Add 25 to the booster effect base.",
			cost: new Decimal(8),
			unl() { return (player.t.upgrades.includes(22)&&(player.e.order==1||player.s.unl))||(player.t.upgrades.includes(23)&&(player.s.order==1||player.e.unl)) },
		},
		32: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl() { return (player.s.unl&&player.e.unl)||player.t.upgrades.includes(32) },
		},
		33: {
			desc: "Add 40 to the booster effect base.",
			cost: new Decimal(16),
			unl() { return player.s.unl&&player.e.unl&&player.t.upgrades.includes(32) },
		},
		34: {
			desc: "Time Energy caps later and generates faster based on your non-free Time Capsules.",
			cost: new Decimal(18),
			unl() { return player.t.upgrades.includes(33)&&player.sb.unl },
			currently() { return Decimal.pow(10, player.t.points.pow(1.2)) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	s: {
		rows: 4,
		cols: 4,
		11: {
			desc: "Add a free level to all Space Buildings.",
			cost: new Decimal(2),
			unl() { return player.s.unl },
		},
		12: {
			desc: "Generator Power boosts its own generation.",
			cost: new Decimal(3),
			unl() { return player.s.best.gte(2)&&player.s.unl },
			currently() { return player.g.power.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Space Building Levels boost Generator Power gain, and get 2 extra Space.",
			cost: new Decimal(3),
			unl() { return player.s.upgrades.includes(11) },
			currently() { return Decimal.pow(20, tmp.s !== undefined ? tmp.s.sbSum : 0) },
			effDisp(x) { return format(x)+"x" },
		},
		14: {
			desc: "Unlock a 4th Space Building, and add a free level to all Space Buildings.",
			cost: new Decimal(4),
			unl() { return player.s.upgrades.includes(12)&&player.s.upgrades.includes(13) },
		},
		21: {
			desc: "All Space Buildings are stronger based on your Generators.",
			cost: new Decimal(4),
			unl() { return player.s.upgrades.includes(14) },
			currently() { return player.g.points.add(1).log10().div(1.5).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		22: {
			desc: "Space Buildings are stronger based on your Time Energy.",
			cost: new Decimal(6),
			unl() { return player.s.upgrades.includes(14)&&player.t.unl },
			currently() { return player.t.energy.add(1).log10().add(1).log10().div(5).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		23: {
			desc: "Space Buildings are stronger based on your Enhancers.",
			cost: new Decimal(5),
			unl() { return player.s.upgrades.includes(14)&&player.e.unl },
			currently() { return player.e.enhancers.sqrt().div((player.s.order==0)?5:7).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		24: {
			desc: "Space Building costs scale half as fast, and you have 3 more Space.",
			cost: new Decimal(7),
			unl() { return player.s.upgrades.includes(21)&&(player.t.unl||player.e.unl) },
		},
		31: {
			desc: "Space Building 1 uses a better formula.",
			cost: new Decimal(7),
			unl() { return (player.s.upgrades.includes(22)&&(player.t.order==0||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==0||player.t.unl)) },
		},
		32: {
			desc: "Unlock a 5th Space Building.",
			cost: new Decimal(8),
			unl() { return (player.s.upgrades.includes(22)&&(player.t.order==1||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==1||player.t.unl)) },
		},
		33: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl() { return (player.t.unl&&player.e.unl)||player.s.upgrades.includes(33) },
		},
		34: {
			desc: "Space Buildings boost the Generator Power effect (before all other boosts).",
			cost: new Decimal(15),
			unl() { return player.t.unl&&player.e.unl&&player.t.order==0&&player.e.order==0&&player.s.order==0 },
			currently() { return Decimal.pow(tmp.s !== undefined ? tmp.s.sbSum : 0, 0.2).div(17.5) },
			effDisp(x) { return "Add "+format(x)+" to exponent" },
		},
		41: {
			desc: "Total Space cheapens Space Buildings.",
			cost: new Decimal(128),
			unl() { return player.ba.upgrades.includes(51) },
			currently() { return Decimal.pow("1e4000", getSpace().add(player.s.spent).sqrt()) },
			effDisp(x) { return "/"+format(x) },
		},
		42: {
			desc: "The Space Building cost formula is 40% weaker.",
			cost: new Decimal(131),
			unl() { return player.ba.upgrades.includes(51) },
		},
		43: {
			desc: "Space Building 2 uses a better formula.",
			cost: new Decimal(133),
			unl() { return player.ba.upgrades.includes(51) },
		},
		44: {
			desc: "All Space Buildings are 25% stronger.",
			cost: new Decimal(140),
			unl() { return player.ba.upgrades.includes(51) },
		},
	},
	sb: {
		rows: 2,
		cols: 2,
		11: {
			desc: "Super-Boosters are stronger based on your Prestige Points.",
			cost: new Decimal(2),
			unl() { return player.sb.unl },
			currently() { 
				let ret = Decimal.pow(10, player.p.points.add(1).log10().div(1e5).sqrt());
				if (ret.gte(2.5)) ret = ret.log(2.5).add(1.5).min(ret);
				if (ret.gte(40)) ret = ret.log(40).times(40);
				return ret.max(1);
			},
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Super-Boosters are stronger based on your Generators.",
			cost: new Decimal(4),
			unl() { return player.sb.upgrades.includes(11) },
			currently() { return player.g.points.div(10).pow(0.04).max(1) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Super-Boosters add to the Booster base.",
			cost: new Decimal(8),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.sb.points.pow(2.15) },
			effDisp(x) { return "+"+format(x) },
		},
		22: {
			desc: "Super-Boosters add to the Super-Booster base.",
			cost: new Decimal(12),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.sb.points.add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x) },
		},
	},
	q: {
		rows: 5,
		cols: 4,
		11: {
			desc: "Quirks & Hindrance Spirit boost Point, Prestige Point, and Enhance Point gain.",
			cost: new Decimal(1),
			unl() { return player.q.unl&&player.q.layers.gt(0) },
			currently() { return player.q.points.add(1).times(player.h.points.add(1)).pow(0.75) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "The Quirk Energy and Hindrance Spirit effects use better formulas.",
			cost: new Decimal(3),
			unl() { return player.q.upgrades.includes(11)&&player.h.best.gte(3) },
		},
		13: {
			desc: "Quirk Layers are twice as fast.",
			cost: new Decimal(50),
			unl() { return player.q.upgrades.includes(11)&&player.h.challs.includes(11) },
		},
		14: {
			desc: "Quirk Layers are thrice as fast.",
			cost: new Decimal(2e10),
			unl() { return player.h.challs.includes(32) },
		},
		21: {
			desc: "Quirk Layers are faster based on your Quirks.",
			cost: new Decimal(160),
			unl() { return (player.q.upgrades.includes(12)||player.q.upgrades.includes(13))&&player.h.challs.includes(12) },
			currently() { return player.q.points.add(1).log10().add(1).pow(player.m.upgrades.includes(42)?1.5:1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Quirk & Hindrance Spirit gain boost each other.",
			cost: new Decimal(400),
			unl() { return player.q.upgrades.includes(12)&&player.q.upgrades.includes(13)&&player.h.challs.includes(12) },
			currently() { return {
				q: player.h.points.div(10).add(1).sqrt(),
				h: player.q.points.div(10).add(1).sqrt(),
			}},
			effDisp(x) { return format(x.q)+"x to Quirk gain, "+format(x.h)+"x to Hindrance Spirit gain" },
		},
		23: {
			desc: "The Time Energy limit is 1e10x higher.",
			cost: new Decimal(5000),
			unl() { return player.q.upgrades.includes(21)||player.q.upgrades.includes(22) },
		},
		24: {
			desc: "The Time Energy limit is higher based on your Quirk Energy.",
			cost: new Decimal(5e10),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.q.energy.div(1e6).add(1).pow(0.9) },
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Get 1 of each Space Building for free.",
			cost: new Decimal(150000),
			unl() { return player.q.upgrades.includes(21)&&player.q.upgrades.includes(22) },
		},
		32: {
			desc: "The Quirk Energy effect is squared.",
			cost: new Decimal(500000),
			unl() { return player.q.upgrades.includes(23)||player.q.upgrades.includes(31) },
		},
		33: {
			desc: "Time Capsules are stronger based on their amount.",
			cost: new Decimal(2e9),
			unl() { return player.q.upgrades.includes(23)&&player.q.upgrades.includes(31) },
			currently() { return player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap)).add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		34: {
			desc: "Enhance Points boost Hindrance Spirit & Quirk gain.",
			cost: new Decimal(1e11),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.e.points.add(1).log10().cbrt().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		41: {
			desc: "Space Buildings are 40% stronger.",
			cost: new Decimal(2.5e13),
			unl() { return player.h.challs.includes(32) },
		},
		42: {
			desc: "Enhancers are 40% stronger.",
			cost: new Decimal(2e14),
			unl() { return player.h.challs.includes(32) },
		},
		43: {
			desc: "Time Upgrade 2 is 1,500% stronger.",
			cost: new Decimal(1e16),
			unl() { return player.h.challs.includes(32) },
		},
		44: {
			desc: "You gain more Hindrance Spirit based on your Quirk Energy.",
			cost: new Decimal(4e16),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.q.energy.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		51: {
			desc: "Get free Quirk Layers based on your Quirk Energy.",
			cost: new Decimal("1e2100"),
			unl() { return player.ba.upgrades.includes(52) },
			currently() { return player.q.energy.add(1).log10().add(1).log10() },
			effDisp(x) { return "+"+format(x) },
		},
		52: {
			desc: "Quirk Layers are faster based on your Quirk Layers.",
			cost: new Decimal("1e2400"),
			unl() { return player.ba.upgrades.includes(52) },
			currently() { return Decimal.pow(10, player.q.layers) },
			effDisp(x) { return format(x)+"x" },
		},
		53: {
			desc: "The second Enhancer effect also multiplies the Booster/Generator base.",
			cost: new Decimal("1e2750"),
			unl() { return player.ba.upgrades.includes(52) },
		},
		54: {
			desc: "Generator Upgrade 15's effect is raised to the power of 20.",
			cost: new Decimal("1e3125"),
			unl() { return player.ba.upgrades.includes(52) },
		},
	},
	hb: {
		rows: 1,
		cols: 4,
		11: {
			desc: "Super-Boosters are stronger based on your Hyper-Boosters.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
			currently() { return player.hb.points.sqrt().div(4).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		12: {
			desc: "Hyper-Boosters are stronger based on your Super-Boosters.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
			currently() { return player.sb.points.div(10).add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		13: {
			desc: "This layer behaves as if you chose it first.",
			cost: new Decimal(2),
			unl() { return player.hb.order>0||(player.ss.upgrades.includes(15))||player.hb.upgrades.includes(13)||(player.m.unl||player.ba.unl) },
		},
		14: {
			desc: "Unlock 3 new Booster Upgrades.",
			cost: new Decimal(3),
			unl() { return player.hb.upgrades.includes(13)&&player.ss.upgrades.includes(15) },
		},
	},
	ss: {
		rows: 2,
		cols: 5,
		11: {
			desc: "You get more Space based on your Subspace Energy.",
			cost: new Decimal(1),
			unl() { return player.ss.unl },
			currently() { return player.ss.points.sqrt().times(150).floor() },
			effDisp(x) { return formatWhole(x)+" more Space" },
		},
		12: {
			desc: "You generate Subspace faster based on your Points.",
			cost: new Decimal(2),
			unl() { return player.ss.unl },
			currently() { return player.points.add(1).log10().div(1e4).add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Subspace's third effect is 50% stronger.",
			cost: new Decimal(2),
			unl() { return player.ss.unl },
		},
		14: {
			desc: "Super-Boosters are 8.25% cheaper.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
		},
		15: {
			desc: "This layer behaves as if you chose it first.",
			cost: new Decimal(3),
			unl() { return player.ss.order>0||(player.hb.upgrades.includes(13))||player.ss.upgrades.includes(15)||(player.m.unl||player.ba.unl) },
		},
		21: {
			desc: "Unlock 5 new Generator Upgrades.",
			cost: new Decimal(4),
			unl() { return player.hb.upgrades.includes(13)&&player.ss.upgrades.includes(15) },
		},
		22: {
			desc: "You generate Subspace faster based on its amount.",
			cost: new Decimal(5),
			unl() { return player.ss.upgrades.includes(21)&&(player.h.challs.includes(51)||player.h.challs.includes(52)) },
			currently() { return player.ss.subspace.add(1).root(2.25) },
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Subspace beyond 1e20 multiplies the Generator Power base.",
			cost: new Decimal(6),
			unl() { return player.ba.upgrades.includes(24) },
			currently() { return player.ss.subspace.sub(1e20).max(0).div(1e20).add(1).sqrt() },
			effDisp(x) { return format(x)+"x" },
		},
		24: {
			desc: "Subspace Energy boosts Subspace gain.",
			cost: new Decimal(7),
			unl() { return player.ba.upgrades.includes(24) },
			currently() {
				let x = player.ss.points
				if (player.ba.upgrades.includes(25)) x = x.times(LAYER_UPGS.ba[25].currently())
				return Decimal.pow(2, x)
			},
			effDisp(x) { return format(x)+"x" },
		},
		25: {
			desc: "Subspace is generated faster based on your Quirk Layers.",
			cost: new Decimal(8),
			unl() { return player.ba.upgrades.includes(24) },
			currently() {
				let x = player.q.layers.sqrt()
				if (player.ba.upgrades.includes(25)) x = x.times(LAYER_UPGS.ba[25].currently())
				return Decimal.pow(10, x)
			},
			effDisp(x) { return format(x)+"x" },
		},
	},
	m: {
		rows: 4,
		cols: 4,
		11: {
			desc: "Hexes boost all Spells.",
			cost: new Decimal(5),
			unl() { return player.m.unl },
			currently() { return player.m.hexes.times(3).add(1).log10().add(1).log10().add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		12: {
			desc: "Unlock 2 new Hindrances.",
			cost: new Decimal(10),
			unl() { return player.m.upgrades.includes(11) },
		},
		13: {
			desc: "Hexes add to the Hyper-Booster base.",
			cost: new Decimal(15),
			unl() { return player.m.upgrades.includes(11) },
			currently() { return player.m.hexes.add(1).log10().add(1).log10().add(1).log10().div(2.5) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		14: {
			desc: "You get more Hexes based on your best Magic.",
			cost: new Decimal(20),
			unl() { return player.m.upgrades.includes(12) },
			currently() { return player.m.best.times(1.2).add(1).pow(0.8) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Spells 2 & 3 are stronger based on your Hindrance Spirit.",
			cost: new Decimal(1000),
			unl() { return player.m.upgrades.includes(13) },
			currently() { return player.h.points.add(1).log10().add(1).log10().add(1).log10().add(1).sqrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		22: {
			desc: "Spell 2 is 900% stronger.",
			cost: new Decimal(2500),
			unl() { return player.m.upgrades.includes(14) },
		},
		23: {
			desc: "The Time Energy cap starts 1e500x later.",
			cost: new Decimal(6500),
			unl() { return player.m.upgrades.includes(21) },
		},
		24: {
			desc: "Add free Quirk Layers based on your Boosters.",
			cost: new Decimal(80000),
			unl() { return player.m.upgrades.includes(22) },
			currently() { return player.b.points.add(1).log10().times(0.9) },
			effDisp(x) { return "+"+format(x) },
		},
		31: {
			desc: "Unlock a new Hindrance.",
			cost: new Decimal(2.5e6),
			unl() { return player.m.upgrades.includes(23)&&player.sg.unl },
		},
		32: {
			desc: "Hyper-Boosters add free Space Buildings.",
			cost: new Decimal(5e9),
			unl() { return player.m.upgrades.includes(24) },
			currently() { return player.hb.points.add(1).pow(3) },
			effDisp(x) { return "+"+formatWhole(x) },
		},
		33: {
			desc: "Hindrance Spirit adds to the Hyper-Booster base.",
			cost: new Decimal(2e10),
			unl() { return player.m.upgrades.includes(31) },
			currently() { return player.h.points.add(1).log10().add(1).log10().add(1).log10().div(2) },
			effDisp(x) { return "+"+format(x) },
		},
		34: {
			desc: "Add 1 free Quirk Layer.",
			cost: new Decimal(4e10),
			unl() { return player.m.upgrades.includes(32) },
		},
		41: {
			desc: "You can insert more Magic into Spells, making them stronger.",
			cost: new Decimal(2.5e14),
			unl() { return player.m.upgrades.includes(34) },
		},
		42: {
			desc: "Quirk Upgrade 5 is 50% stronger.",
			cost: new Decimal(6e14),
			unl() { return player.m.upgrades.includes(34) },
		},
		43: {
			desc: "Spells last longer based on your Hexes.",
			cost: new Decimal(1e15),
			unl() { return player.m.upgrades.includes(41) },
			currently() { return player.m.hexes.add(1).log10().add(1).sqrt().min(86400) },
			effDisp(x) { return format(x)+"x" },
		},
		44: {
			desc: "Magic adds to the Time Capsule base.",
			cost: new Decimal(1.5e15),
			unl() { return player.m.upgrades.includes(41) },
			currently() { return player.m.points.add(1).log10().div(10) },
			effDisp(x) { return "+"+format(x) },
		},
	},
	ba: {
		rows: 5,
		cols: 5,
		11: {
			desc: "All Balance Energy effects use better formulas.",
			cost: new Decimal(5),
			unl() { return player.ba.unl },
		},
		12: {
			desc: "Subspace is generated faster based on your Positivity & Negativity.",
			cost: new Decimal(10),
			unl() { return player.ba.upgrades.includes(11) },
			currently() { return (tmp.balEff2?tmp.balEff2:new Decimal(1)).max(1).pow(4) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Multiply all Quirk Layers based on your Balance Power, and the Quirk Energy effect is cubed.",
			cost: new Decimal(25),
			unl() { return player.ba.upgrades.includes(11) },
			currently() { 
				let ret = player.ba.power.add(1).pow(1.25);
				if (ret.gte("1e1000")) ret = ret.log10().pow(10).times("1e970").min(ret);
				if (ret.gte("1e2000")) ret = ret.log10().pow(10).times("1e1967").min(ret);
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		14: {
			desc: "The Balance Power effect uses a better formula.",
			cost: new Decimal(120),
			unl() { return player.ba.upgrades.includes(12) },
		},
		21: {
			desc: "Negativity boosts Super-Generator Power gain.",
			cost: new Decimal(300),
			unl() { return player.ba.upgrades.includes(13)&&player.sg.unl },
			currently() {
				let x = player.ba.negativity.add(1).sqrt()
				if (x.gte("1e400")) x = Decimal.pow(10, x.log10().times(20).pow(2/3))
				if (x.gte("1e555")) x = x.log10().pow(2).times(Decimal.div("1e555", Math.pow(555, 2))).min(x)
				return x
			},
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Balance Power boosts Positivity & Negativity gain.",
			cost: new Decimal(2000),
			unl() { return player.ba.upgrades.includes(14) },
			currently() { return player.ba.power.add(1).pow(0.15) },
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Super-Generators add to their base.",
			cost: new Decimal(7500),
			unl() { return player.ba.upgrades.includes(21) },
			currently() { return player.sg.points.pow(2).div(2) },
			effDisp(x) { return "+"+format(x) },
		},
		24: {
			desc: "Unlock 3 new Subspace Upgrades.",
			cost: new Decimal(2e4),
			unl() { return player.ba.upgrades.includes(22) },
		},
		31: {
			desc: "The Quirk Layer cost is adjusted based on your Balance Upgrades bought.",
			cost: new Decimal(4e5),
			unl() { return player.ba.upgrades.includes(23) },
			currently() { return Decimal.div(0.8, Math.pow(player.ba.upgrades.length+1, 0.1)).add(1.2) },
			effDisp(x) { return "2 -> "+format(x) },
		},
		32: {
			desc: "Enhancers are stronger based on your Positivity.",
			cost: new Decimal(5e5),
			unl() { return player.ba.upgrades.includes(24) },
			currently() { return player.ba.positivity.add(1).log10().add(1).log10().add(1).pow(2) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		33: {
			desc: "The Balance Power effect is squared.",
			cost: new Decimal(1e6),
			unl() { return player.ba.upgrades.includes(31) },
		},
		34: {
			desc: "The Positivity & Negativity effect uses a better formula.",
			cost: new Decimal(2e6),
			unl() { return player.ba.upgrades.includes(32) },
		},
		41: {
			desc: "The first Balance Energy effect is squared.",
			cost: new Decimal(2e10),
			unl() { return player.ba.upgrades.includes(33)&&player.ba.upgrades.includes(34) },
		},
		42: {
			desc: "The Space Building 1 effect is stronger based on your Space Building 1 amount.",
			cost: new Decimal(3e11),
			unl() { return player.ba.upgrades.includes(33)&&player.ba.upgrades.includes(34) },
			currently() { return tmp.s.sb[1].add(1).pow(0.8) },
			effDisp(x) { return "^"+format(x) },
		},
		43: {
			desc: "The post-25 Extra Time Capsule cost scaling is disabled.",
			cost: new Decimal(1e12),
			unl() { return player.ba.upgrades.includes(41)||player.ba.upgrades.includes(42) },
		},
		44: {
			desc: "Space Buildings are 50% stronger.",
			cost: new Decimal(2e12),
			unl() { return player.ba.upgrades.includes(42)||player.ba.upgrades.includes(43) },
		},
		51: {
			desc: "Unlock 4 new Space Upgrades.",
			cost: new Decimal(2e13),
			unl() { return player.ba.upgrades.includes(43) },
		},
		52: {
			desc: "Unlock 4 new Quirk Upgrades.",
			cost: new Decimal(1e14),
			unl() { return player.ba.upgrades.includes(51) },
		},
		53: {
			desc: "The Positivity & Negativity boost to Balance Power gain is stronger based on your Super-Generator Power.",
			cost: new Decimal(2e19),
			unl() { return player.ba.upgrades.includes(51)&&player.sg.unl },
			currently() { return player.sg.power.add(1).log10().div(25).add(1).sqrt() },
			effDisp(x) { return "^"+format(x) },
		},
		54: {
			desc: "Balance Power boosts the first Balance Energy effect. (stronger based on your Best Balance Power)",
			cost: new Decimal(5e25),
			unl() { return player.ba.upgrades.includes(53) },
			currently() { return player.ba.power.add(1).times(player.ba.best.add(1).sqrt()).cbrt() },
			effDisp(x) { return format(x)+"x" },
		},
		15: {
			desc: "Positivity and Negativity reduce the cost scaling of Space Buildings.",
			cost: new Decimal(1e200),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ba.positivity.add(1).div(player.ba.negativity.add(1)).log10().div(20).add(0.5).max(1) },
			effDisp(x) { return format(Decimal.sub(1, x.recip()).times(100))+"%" },
		},
		25: {
			desc: "Balance Power boosts Subspace Upgrades 9 and 10.",
			cost: new Decimal(1e245),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ba.power.add(1).log10().div(10).max(1).cbrt() },
			effDisp(x) { return "^"+format(x) },
		},
		35: {
			desc: "Super-Upgrades are 25% stronger.",
			cost: new Decimal(1e260),
			unl() { return player.sp.upgrades.includes(44) },
		},
		45: {
			desc: "Subspace reduces both Hyperspace costs.",
			cost: new Decimal("6.66e666"),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ss.subspace.add(1).pow(0.02) },
			effDisp(x) { return format(x)+"x" },
		},
		55: {
			desc: "Super-Prestige Points cheapen Quirk Layers.",
			cost: new Decimal("1e920"),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.sp.points.max(1).log10().pow(0.75).div(2) },
			effDisp(x) { return "-"+format(x)+" layers" },
		},
	},
	ps: {
		rows: 2,
		cols: 4,
		11: {
			desc: "Hindrance Spirits reduce the requirement of Phantom Souls.",
			cost: new Decimal(2),
			unl() { return true },
			currently() { return player.h.points.add(1).pow(0.01) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Phantom Souls are 20% stronger.",
			cost: new Decimal(5),
			unl() { return true },
		},
		13: {
			desc: "Phantom Souls strengthen all Spells.",
			cost: new Decimal(7),
			unl() { return true },
			currently() { return player.ps.points.div(2).max(1).log10().div(10).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"%" },
		},
		14: {
			desc: "The Life Essence layer acts like you choose it first.",
			cost: new Decimal(8),
			unl() { return player.l.order > 0 || player.ps.upgrades.includes(14) },
		},
		21: {
			desc: "Unlock the fifth Life Booster.",
			cost: new Decimal(5),
			unl() { return player.hs.unl },
		},
		22: {
			desc: "Phantom Souls reduce the post-12 scaling of all row 1 - 4 layer requirements.",
			cost: new Decimal(19),
			unl() { return player.hs.unl },
			currently() { return player.ps.points.div(100).add(1) },
			effDisp(x) { return format(x) + "x" },
		},
		23: {
			desc: "Unlock 4 new Super-Prestige Upgrades.",
			cost: new Decimal(21),
			unl() { return player.hs.unl },
		},
		24: {
			desc: "The Hyperspace layer acts like you choose it first.",
			cost: new Decimal(17),
			unl() { return (player.hs.unl && player.hs.order > 0) || player.ps.upgrades.includes(24) },
		},
	},
	sp: {
		rows: 5,
		cols: 5,
		11: {
			desc: "The Prestige Upgrade 3, 6, & 7 effects are raised to the power of 100.",
			cost: new Decimal(1),
			unl() { return player.sp.unl },
		},
		12: {
			desc: "Total Super-Prestige Points boost Magic & Balance Power gain.",
			cost: new Decimal(2),
			unl() { return player.sp.upgrades.includes(11) },
			currently() { return player.sp.total.add(1).pow(2.5) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Unlock a new Spell.",
			cost: new Decimal(2),
			unl() { return player.sp.upgrades.includes(11) },
		},
		14: {
			desc: "Your Best Super-Prestige Points boost Hex & Balance Energy gain.",
			cost: new Decimal(3),
			unl() { return player.sp.upgrades.includes(12) || player.sp.upgrades.includes(13) },
			currently() { return player.sp.best.add(1).pow(1.9) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Super-Prestige Points add to the Super-Generator base.",
			cost: new Decimal(4),
			unl() { return player.sp.upgrades.includes(11) },
			currently() { return player.sp.points.add(1).log10().add(1).log10().times(1.5) },
			effDisp(x) { return "+"+format(x) },
		},
		22: {
			desc: 'The effects of "Anti-Upgrades" & "Prestigeless" Hindrances are 24,900% stronger.',
			cost: new Decimal(6),
			unl() { return player.sp.upgrades.includes(12) || player.sp.upgrades.includes(21) },
		},
		23: {
			desc: "Spells are stronger based on your Total Super-Prestige Points.",
			cost: new Decimal(8),
			unl() { return player.sp.upgrades.includes(13) || player.sp.upgrades.includes(22) },
			currently() {
				let sp = player.sp.total
				if (sp.gte(250)) sp = sp.log10().times(250/Math.log10(250)).min(sp)
				return sp.add(1).log10().div(5).add(1) 
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		24: {
			desc: "Super-Prestige Points boost Super-Prestige Point gain.",
			cost: new Decimal(15),
			unl() { return player.sp.upgrades.includes(14) || player.sp.upgrades.includes(23) },
			currently() {
				let sp = player.sp.points
				if (sp.gte(2e4)) sp = sp.cbrt().times(Math.pow(2e4, 2/3));
				return sp.times(2).add(1).sqrt() 
			},
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Super-Generators are 45% cheaper.",
			cost: new Decimal(1000),
			unl() { return player.sp.upgrades.includes(22) },
		},
		32: {
			desc: "Prestige Upgrade 7 softcaps later based on your Super-Prestige Points.",
			cost: new Decimal(4000),
			unl() { return player.sp.upgrades.includes(23) && player.sp.upgrades.includes(31) },
			currently() { return player.sp.points.add(1).log10().add(1).pow(1e4) },
			effDisp(x) { return format(x.pow(player.sp.upgrades.includes(11)?100:1))+"x later" },
		},
		33: {
			desc: "Points boost Super-Prestige Point gain.",
			cost: new Decimal(1e4),
			unl() { return player.sp.upgrades.includes(24) && player.sp.upgrades.includes(32) },
			currently() { return player.points.add(1).log10().pow(0.1) },
			effDisp(x) { return format(x)+"x" },
		},
		34: {
			desc: "Boosters & Generators are 25% stronger.",
			cost: new Decimal(1.5e5),
			unl() { return player.sp.upgrades.includes(33) },
		},
		41: {
			desc: "Gain more Life Essence based on total SP.",
			cost: new Decimal(1e6),
			unl() { return player.l.unl },
			currently() { return player.sp.total.div(5e5).add(1).sqrt() },
			effDisp(x) { return format(x)+"x" },
		},
		42: {
			desc: "Life Essence speeds up the Life Power production.",
			cost: new Decimal(1.5e6),
			unl() { return player.l.unl },
			currently() {
				if (player.sp.upgrades.includes(15)) return Decimal.pow(8, player.l.points.max(1).log10().pow(0.4))
				return player.l.points.add(1).log10().add(1).pow(0.75)
			},
			effDisp(x) { return format(x)+"x" },
		},
		43: {
			desc: "Gain more Hyperspace Energy based on total SP.",
			cost: new Decimal(8e5),
			unl() { return player.hs.unl },
			currently() { return player.sp.total.div(7.5e5).add(1).sqr() },
			effDisp(x) { return format(x)+"x" },
		},
		44: {
			desc: "Unlock 5 new Balance Upgrades.",
			cost: new Decimal(1.5e6),
			unl() { return player.hs.unl },
		},
		15: {
			desc: "Life Essence speeds up the Life Power production more.",
			cost: new Decimal(3e16),
			unl() { return player.ps.upgrades.includes(23) },
		},
		25: {
			desc: "Super-Upgrades of Space Building 4 divides the Super-Generator requirement.",
			cost: new Decimal(2e17),
			unl() { return player.ps.upgrades.includes(23) },
			currently() { return fixValue(tmp.hs !== undefined && tmp.hs.su[4]).add(1).sqr() },
			effDisp(x) { return format(x)+"x" },
		},
		35: {
			desc: "Super-Prestige Points strengthen all Subspace effects.",
			cost: new Decimal(6e17),
			unl() { return player.ps.upgrades.includes(23) },
			currently() { return player.sp.points.max(1).log10().div(15).add(1).cbrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"%" },
		},
		45: {
			desc: "Subtract the cost of Imperium Buildings by 3.",
			cost: new Decimal(1e22),
			unl() { return player.ps.upgrades.includes(23) },
		},
		51: {
			desc: "The Super-Generator boost to Imperium Building progression speed uses a better formula.",
			cost: new Decimal(1e38),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(52) },
		},
		52: {
			desc: "Imperium Buildings progress faster based on your Prestige Points.",
			cost: new Decimal(1e30),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(53) },
			currently() { return player.p.points.plus(1).log10().plus(1).log10().plus(1).log10().times(3).plus(1) },
			effDisp(x) { return format(x)+"x" },
		},
		53: {
			desc: "Imperium Buildings progress faster based on your Super-Prestige Points.",
			cost: new Decimal(1e16),
			unl() { return player.mb.unl },
			currently() { return player.sp.points.plus(1).log10().plus(1).log10().times(4).plus(1) },
			effDisp(x) { return format(x)+"x" },
		},
		54: {
			desc: "The Life Power softcap is 15% weaker.",
			cost: new Decimal(1e30),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(53) },
		},
		55: {
			desc: "Imperium Bricks & Hyperspace Energy boost Super-Prestige Point gain.",
			cost: new Decimal(2.5e41),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(54) },
			currently() { return player.hs.points.plus(1).pow(0.02).times(Decimal.pow(2, player.i.points)) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	ge: {
		rows: 0,
		cols: 0,
	},
	ma: {
		rows: 0,
		cols: 0,
	},
}

const LAYER_AMT_NAMES = {
	p: "points",
	b: "points",
	g: "points",
	t: "points",
	e: "points",
	s: "points",
	sb: "boosters",
	sg: "generators",
	h: "time energy",
	q: "generator power",
	hb: "super-boosters",
	ss: "space energy",
	m: "hindrance spirit",
	ba: "quirks",
	ps: "quirk energy",
	sp: "prestige points",
	l: "hexes",
	hs: "space energy",
	i: "subspace",
	mb: "phantom souls",
	ge: "super-prestige points",
	ma: "hyperspace energy",
}

function getLayerAmt(layer) {
	let amt = player.points
	switch(layer) {
		case "sb": 
			return player.b.points;
			break;
		case "sg": 
			return player.g.points;
			break;
		case "h": 
			return player.t.energy;
			break;
		case "q": 
			return player.g.power;
			break;
		case "hb": 
			return player.sb.points;
			break;
		case "ss":
			return player.s.points;
			break;
		case "m": 
			return player.h.points;
			break;
		case "ba":
			return player.q.points;
			break;
		case "ps": 
			return player.q.energy;
			break;
		case "sp": 
			return player.p.points;
			break;
		case "l": 
			return player.m.hexes;
			break;
		case "hs": 
			return player.s.points;
			break;
		case "i": 
			return player.ss.subspace;
			break;
		case "mb": 
			return player.ps.points;
			break;
		case "ge": 
			return player.sp.points;
			break;
		case "ma": 
			return player.hs.points;
			break;
	}
	return amt
}

function getLayerEffDesc(layer) {
	if (!Object.keys(LAYER_EFFS).includes(layer)) return "???"
	let eff = tmp.layerEffs[layer]
	switch(layer) {
		case "b":
			return "translated to a "+format(eff)+"x multiplier to point gain"
			break;
		case "g":
			return "which are generating "+format(eff)+" Generator Power/sec"
			break;
		case "t":
			return "which are generating "+format(eff.gain)+" Time Energy/sec, but with a limit of "+format(eff.limit)+" Time Energy"
			break;
		case "sb": 
			return "which are multiplying the Booster effect base by "+format(eff)
			break;
		case "sg":
			return "which are generating "+format(eff)+" Super-Generator Power/sec"
			break;
		case "h": 
			return "which are providing "+format(eff)+" free extra Time Capsules (boosted by your points)"
			break; 
		case "hb": 
			return "which are multiplying the Super-Booster effect base by "+format(eff)
			break;
		case "ss": 
			return "which are generating "+format(eff)+" Subspace/sec"
			break;
		case "ba":
			return "which are generating "+format(eff.power)+" Balance Power, "+format(eff.pos)+" Positivity, and "+format(eff.neg)+" Negativity every second"
			break;
		case "ps":
			return "which are speeding up the Life Power production by " + format(eff.mult) + "x and raising the Life Power amount to the power of " + format(eff.exp)
			break;
		case "l":
			return "which makes the Life Power softcap start at " + format(eff.pow(tmp.layerEffs.ps.exp))
			break;
		case "ge":
			return "which are multiplying Super-Prestige Point gain by "+format(eff)
			break;
	}
}

function save() {
	localStorage.setItem("prestige-tree", btoa(JSON.stringify(player)))
}

function load() {
	let get = localStorage.getItem("prestige-tree");
	if (get===null||get===undefined) player = getStartPlayer()
	else player = JSON.parse(atob(get))
	player.tab = "tree"
	if (player.offlineProd) {
		if (player.offTime === undefined) player.offTime = { remain: 0 }
		player.offTime.remain += (Date.now() - player.time) / 1000
	}
	player.time = Date.now()
	checkForVars();
	convertToDecimal();
	versionCheck();
	changeTheme();
	changeTreeQuality();
	updateTemp();
	updateTemp();
	loadVue();
}

function exportSave() {
	let str = btoa(JSON.stringify(player))
	
	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
    el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
}

function importSave(imported=undefined) {
	if (imported===undefined) imported = prompt("Paste your save here")
	try {
		player = JSON.parse(atob(imported))
		save()
		window.location.reload()
	} catch(e) {
		return;
	}
}

function versionCheck() {
	let setVersion = true
	
	if (player.versionType===undefined||player.version===undefined) {
		player.versionType = "alpha"
		player.version = 0
	}
	if (player.versionType=="alpha") {
		if (player.version<10&&player.sb.unl) {
			if (confirm("Since the last time you played, several changes to Super-Booster effects have been made. Would you like to roll back your save to that point in the progression, in order for you to experience the new features properly?")) importSave(SAVES.PRE_SUPER_BOOSTERS)
			setVersion = false;
		}
	}
	if (player.versionType=="beta") {
		if (player.version<=1.1) if (!(player.hb.unl||player.ss.unl)) {
			player.hb.order = 0
			player.ss.order = 0
		}
	}
	
	if (setVersion) {
		if (player.versionType == "real" && VERSION.num > player.version) player.keepGoing = false
		player.versionType = getStartPlayer().versionType
		player.version = VERSION.num
		player.beta = VERSION.beta
	}
}

function checkForVars() {
	let start = getStartPlayer()
	for (var i=0; i<LAYERS.length; i++) {
		var layer = LAYERS[i]

		if (player[layer] === undefined) player[layer] = start[layer]
		else if (player[layer].total === undefined && start[layer].total !== undefined) player[layer].total = Decimal.max(player[layer].points, player[layer].best).max(0)

		if (LAYER_UPGS[layer] !== undefined && player[layer].upgrades === undefined) player[layer].upgrades = []
		if (LAYER_UPGS[layer] === undefined && player[layer].upgrades !== undefined) delete player[layer].upgrades

		if (LAYER_CHALLS[layer] !== undefined && player[layer].challs === undefined) player[layer].challs = []
		if (LAYER_CHALLS[layer] === undefined && player[layer].challs !== undefined) delete player[layer].challs
	}
	if (player.autosave===undefined) player.autosave = true;
	if (player.p.best===undefined) player.p.best = player.p.points
	if (player.b.best===undefined) player.b.best = player.b.points
	if (player.b.auto===undefined) player.b.auto = false
	if (player.g.best===undefined) player.g.best = player.g.points
	if (player.g.auto===undefined) player.g.auto = false
	if (player.e.order === undefined) player.e.order = 0
	if (player.e.auto===undefined) player.e.auto = false
	if (player.t.auto===undefined) player.t.auto = false
	if (player.t.autoCap===undefined) player.t.autoCap = false
	if (player.s.auto === undefined) player.s.auto = false
	if (player.s.autoBuild === undefined) player.s.autoBuild = false
	if (player.sb.auto === undefined) player.sb.auto = false
	if (player.timePlayed === undefined) player.timePlayed = 0
	if (player.hasNaN === undefined) player.hasNaN = false
	if (player.h.time === undefined) player.h.time = player.timePlayed
	if (player.q.auto === undefined) player.q.auto = false
	if (player.msDisplay === undefined) player.msDisplay = "always"
	if (player.hb.auto === undefined) player.hb.auto = false
	if (player.ss.auto === undefined) player.ss.auto = false
	if (player.m.auto === undefined) player.m.auto = false
	if (player.m.toCast === undefined) player.m.toCast = start.m.toCast
	if (player.m.casted === undefined) player.m.casted = start.m.casted
	if (player.m.autoIns === undefined) {
		player.m.autoIns = false
		player.m.spellTimes[4] = 0
		player.m.toCast[4] = "1"
		player.m.casted[4] = new Decimal(1)
	}
	for (let i=5;i<=MAX_SPELLS;i++) {
		if (player.m.spellTimes[i]===undefined) player.m.spellTimes[i] = 0
		if (player.m.toCast[i]===undefined) player.m.toCast[i] = "1"
		if (player.m.casted[i]===undefined) player.m.casted[i] = new Decimal(1)
	}
	if (player.offlineProd === undefined) player.offlineProd = true
	if (player.notify === undefined) player.notify = {}
	if (player.keepGoing === undefined) player.keepGoing = false
	if (player.i.lifeBricks === undefined) {
		player.l = start.l
		player.i = start.i
		delete player.c
	}
	if (player.hs.space === undefined) {
		var order = player.hs.order
		player.hs = start.hs
		player.hs.order = order
	}
	if (player.mb.spent === undefined) player.mb.spent = new Decimal(0);
	if (player.i.auto === undefined) player.i.auto = false
}

function convertToDecimal() {
	player.points = new Decimal(player.points)
	for (var i=0; i<LAYERS.length; i++) {
		var data = player[LAYERS[i]]
		data.points = new Decimal(data.points)
		data.best = new Decimal(data.best)
		if (data.total !== undefined) data.total = new Decimal(data.total)
	}
	player.g.power = new Decimal(player.g.power)
	player.e.enhancers = new Decimal(player.e.enhancers)
	player.t.energy = new Decimal(player.t.energy)
	player.t.extCapsules = new Decimal(player.t.extCapsules)
	player.s.spent = new Decimal(player.s.spent)
	for (let i=1;i<=SPACE_BUILDINGS.max;i++) if (player.s.buildings[i] !== undefined) player.s.buildings[i] = new Decimal(player.s.buildings[i])
	player.sg.power = new Decimal(player.sg.power)
	player.q.layers = new Decimal(player.q.layers)
	player.q.energy = new Decimal(player.q.energy)
	player.q.time = new Decimal(player.q.time)
	player.ss.subspace = new Decimal(player.ss.subspace)
	player.m.hexes = new Decimal(player.m.hexes)
	for (let i=1;i<=MAX_SPELLS;i++) if (player.m.casted[i]) player.m.casted[i] = new Decimal(player.m.casted[i])
	player.ba.power = new Decimal(player.ba.power)
	player.ba.positivity = new Decimal(player.ba.positivity)
	player.ba.negativity = new Decimal(player.ba.negativity)
	player.l.power = new Decimal(player.l.power)
	for (let i=1;i<=5;i++) if (player.l.boosters[i]) player.l.boosters[i] = new Decimal(player.l.boosters[i])
	player.hs.space = new Decimal(player.hs.space)
	player.hs.spent = new Decimal(player.hs.spent)
	for (let i=1;i<=SPACE_BUILDINGS.max;i++) if (player.hs.superUpgrades[i] !== undefined) player.hs.superUpgrades[i] = new Decimal(player.hs.superUpgrades[i])
	player.hs.superUpgradeCap = new Decimal(player.hs.superUpgradeCap)
	player.i.lifeBricks = new Decimal(player.i.lifeBricks)
	player.i.extraBuildings = new Decimal(player.i.extraBuildings)
	player.mb.extraSpells = new Decimal(player.mb.extraSpells)
	player.mb.extraBoosters = new Decimal(player.mb.extraBoosters)
	player.mb.spent = new Decimal(player.mb.spent);
	player.ma.built = new Decimal(player.ma.built)
	player.ma.enhancements = new Decimal(player.ma.enhancements)
}

function toggleOpt(name) {
	player[name] = !player[name]
	if (name == "hqTree") changeTreeQuality()
}

function changeTreeQuality() {
	var on = player.hqTree
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid")
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset")
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "")
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none")
}

function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	return m.toStringWithDecimalPlaces(3)+"e"+e.toStringWithDecimalPlaces(0)
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return num.toStringWithDecimalPlaces(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function fixValue(x, y = 0) {
	return x || new Decimal(y)
}

function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision=3) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN"
	}
	if (decimal.sign<0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.gte("eeee10")) {
		var slog = decimal.slog()
		if (slog.gte(1e9)) return "10^^" + format(slog.floor())
		else if (slog.gte(1000)) return "10^^"+commaFormat(slog, 0)
		else return "10^^" + commaFormat(slog, 3)
	} else if (decimal.gte("1e1000")) return "e"+formatWhole(decimal.log10())
	else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
	else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
	else return commaFormat(decimal, precision)
}

function formatWhole(decimal) {
	return format(decimal, 0)
}

function formatTime(s) {
	if (s<60) return format(s)+"s"
	else if (s<3600) return formatWhole(Math.floor(s/60))+"m "+format(s%60)+"s"
	else return formatWhole(Math.floor(s/3600))+"h "+formatWhole(Math.floor(s/60)%60)+"m "+format(s%60)+"s"
}

var onTreeTab = true
function showTab(name) {
	if (LAYERS.includes(name) && !layerUnl(name)) return

	var toTreeTab = name == "tree"
	player.tab = name
	
	if (toTreeTab != onTreeTab) {
		document.getElementById("treeTab").className = toTreeTab ? "fullWidth" : "col left"
		onTreeTab = toTreeTab
		resizeCanvas()
	}
	delete player.notify[name]
}

function notifyLayer(name) {
	if (player.tab == name || !layerUnl(name)) return
	player.notify[name] = 1
}

function canBuyMax(layer) {
	switch(layer) {
		case "b": 
			return player.b.best.gte(15)
			break;
		case "g":
			return player.g.best.gte(15)
			break;
		case "t":
			return player.q.total.gte(2)
			break;
		case "s": 
			return player.q.total.gte(2)
			break;
		case "sb":
			return player.hb.best.gte(1)
			break;
		case "sg": 
			return player.sg.best.gte(1)
			break;
		case "hb":
			return player.ba.best.gte(8)
			break;
		case "ss": 
			return player.ba.best.gte(8)
			break;
		case "ps": 
			return player.ps.best.gte(5)
			break;
		case "i": 
			return player.i.best.gte(3)
			break;
	}
	return false;
}

function getLayerReq(layer) {
	let req = LAYER_REQS[layer]
	switch(layer) {
		case "b":
			if (player.g.unl && !player.b.unl) req = req.times(5000)
			break;
		case "g":
			if (player.b.unl && !player.g.unl) req = req.times(5000)
			break;
		case "e": 
			req = req.times(Decimal.pow("1e200", Decimal.pow(player.e.order, 2)))
			break;
		case "t": 
			req = req.times(Decimal.pow("1e200", Decimal.pow(player.t.order, 2)))
			break;
		case "s": 
			req = req.times(Decimal.pow("1e200", Decimal.pow(player.s.order, 2)))
			break;
		case "hb":
			if (player.hb.order>0) req = new Decimal(15)
			break;
		case "ss":
			if (player.ss.order>0) req = new Decimal(45)
			break;
		case "l":
			if (player.l.order>0) req = new Decimal("1e345")
			break;
		case "hs":
			if (player.hs.order>0) req = new Decimal(910)
			break;
	}
	return req
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
			break;
	}
	return mult
}

function getLayerGainExp(layer) {
	let exp = new Decimal(1)
	let row = LAYER_ROW[layer] + 1
	if (LAYER_ROW[layer] < 5) exp = fixValue(tmp.i && tmp.i.workEff, 1).recip()
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

function getResetGain(layer) {
	if (tmp.gainMults[layer].eq(0) || tmp.gainExp[layer].eq(0)) return new Decimal(0)
	if (LAYER_TYPE[layer]=="static") {
		if ((!canBuyMax(layer)) || tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(1)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).div(tmp.gainMults[layer]).max(1).log(LAYER_BASE[layer]).times(tmp.gainExp[layer]).pow(Decimal.pow(LAYER_EXP[layer], -1))
		if ((LAYER_ROW[layer] < 4 && layer != "hb") || layer == "ps") {
			if (gain.gte(12)) {
				if (LAYER_ROW[layer] < 4 && fixValue(tmp.scaling12b).gt(1)) gain = gain.times(tmp.scaling12b).add(tmp.scaling12b.sub(1).times(12))
				else if (layer=="ps" && fixValue(tmp.scaling12ps).gt(1)) gain = gain.times(tmp.scaling12ps).add(tmp.scaling12ps.sub(1).times(12))
				gain = gain.times(12).sqrt()
			}
			if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
		}
		return gain.floor().sub(player[layer][LAYER_USE_TOTAL.includes(layer)?"total":"points"]).add(1).max(1);
	} else {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(0)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).pow(LAYER_EXP[layer]).times(tmp.gainMults[layer]).pow(tmp.gainExp[layer])
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	}
}

function getNextAt(layer, disp=false) {
	if (tmp.gainMults[layer].eq(0) || tmp.gainExp[layer].eq(0)) return new Decimal(1/0)
	if (LAYER_TYPE[layer]=="static") {
		if (!canBuyMax(layer)) disp = false
		let amt = player[layer][LAYER_USE_TOTAL.includes(layer)?"total":"points"].plus((disp&&tmp.layerAmt[layer].gte(tmp.nextAt[layer]))?tmp.resetGain[layer]:0)
		if ((LAYER_ROW[layer] < 4 && layer != "hb") || layer == "ps") {
			if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
			if (amt.gte(12)) {
				amt = amt.pow(2).div(12)
				if (LAYER_ROW[layer] < 4 && fixValue(tmp.scaling12b).gt(1)) amt = amt.sub(tmp.scaling12b.sub(1).times(12)).div(tmp.scaling12b)
				else if (layer=="ps" && fixValue(tmp.scaling12ps).gt(1)) amt = amt.sub(tmp.scaling12ps.sub(1).times(12)).div(tmp.scaling12ps)
			}
		}
		if (layer=="sg" && amt.gte(16)) amt = amt.pow(2).div(16)
		let extraCost = Decimal.pow(LAYER_BASE[layer], amt.pow(LAYER_EXP[layer]).div(tmp.gainExp[layer])).times(tmp.gainMults[layer])
		let cost = extraCost.times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (LAYER_RES_CEIL.includes(layer)) cost = cost.ceil()
		return cost;
	} else {
		let next = tmp.resetGain[layer].add(1)
		if (tmp.gainMults[layer].eq(0)) return new Decimal(1/0);
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp.gainExp[layer]).div(tmp.gainMults[layer]).root(LAYER_EXP[layer]).times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (LAYER_RES_CEIL.includes(layer)) next = next.ceil()
		return next;
	}
}

function nodeShown(layer) {
	if (layerShown(layer)) return true
	switch(layer) {
		case "i":
			return player.l.unl
			break;
	}
	return false
}

function layerShown(layer) {
	switch(layer) {
		case "p":
			return true
			break
		case "b":
			return player.p.unl
			break
		case "g":
			return player.p.unl
			break
		case "e":
			return player.b.unl && player.g.unl
			break
		case "t":
			return player.b.unl
			break
		case "s":
			return player.g.unl
			break
		case "sb":
			return player.e.unl && player.t.unl && player.s.unl
			break
		case "sg":
			return player.h.challs.includes(62)
			break
		case "h": 
			return player.t.unl && player.sb.unl
			break
		case "q": 
			return player.e.unl && player.sb.unl
			break
		case "hb": 
			return player.sb.unl && player.h.unl && player.q.unl
			break
		case "ss": 
			return player.s.unl && player.h.unl && player.q.unl
			break
		case "hg": 
			return false
			break
		case "m": 
			return player.h.unl && player.hb.unl
			break
		case "ba":
			return player.q.unl && player.ss.unl
			break
		case "sp": 
			return player.m.unl && player.ba.unl
			break
		case "l":
			return player.sp.unl
			break
		case "ps":
			return player.l.unl
			break
		case "hs":
			return player.sp.unl
			break
		case "i":
			return player.ps.unl && player.hs.unl
			break
		case "mb":
			return player.i.unl
			break
		case "ge":
			return player.mb.unl
			break
		case "ma":
			return player.mb.unl
			break
	}
	return
}

function layerUnl(layer) {
	return LAYERS.includes(layer) && (player[layer].unl || (tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) && layerShown(layer)))
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
			else if (player.h.best.gte(1) || player.q.total.gte(1)) keepUpgrades = 1
			else if (LAYER_ROW[layer] == 2 && player[layer].best.gte(layer == "e" ? 10 : 3)) keepUpgrades = 1
			else if (LAYER_ROW[layer] == 1 && player[layer].best.gte(8)) keepUpgrades = 1

			player.points = new Decimal(10)
			player.p.points = new Decimal(0)
			if (!keepUpgrades) player.p.upgrades = []
			player.g.power = new Decimal(0)
			break;
		case 2: 
			var keepMilestones = 0
			if (keepRows1to4) keepMilestones = 1
			else if (player.h.best.gte(2) || player.q.total.gte(2)) keepMilestones = 1
			else if (LAYER_ROW[layer] == 2 && player[layer].best.gte(layer == "sb" ? 4 : 2)) keepMilestones = 1

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
				best: (keepRow5||keepRow5Milestones||LAYER_ROW[layer]<6)?player.ps.best:new Decimal(0),
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

function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain).max(0)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp.resetGain[layer].times(diff))
}

var prevOnReset
function doReset(layer, force=false) {
	if (!force) {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return;
		let gain = tmp.resetGain[layer]
		if (LAYER_TYPE[layer]=="static") {
			if (tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return;
			addPoints(layer, canBuyMax(layer) ? gain : 1)
		} else addPoints(layer, gain)

		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;

			let layers = ROW_LAYERS[LAYER_ROW[layer]]
			for (let i in layers) if (!player[layers[i]].unl && player[layers[i]]!==undefined) player[layers[i]].order += ORDER_UP[LAYER_ROW[layer]].includes(layer)?1:0
		}
	
		tmp.layerAmt[layer] = new Decimal(0) // quick fix
	}

	if ((layer=="b"&&player.t.best.gte(12))||(layer=="g"&&player.s.best.gte(12))) return;
	if ((layer=="t"&&player.h.best.gte(25))||(layer=="s"&&player.q.total.gte(25))||(layer=="sb"&&player.h.best.gte(2500))||(layer=="sg"&&player.sg.best.gte(1))) return;
	if ((layer=="hb"&&player.ba.best.gte(8))||(layer=="ss"&&player.ba.best.gte(8))) return;
	if (layer=="ps"&&player.ps.best.gte(5)) return;
	if (layer=="i"&&player.mb.total.gte(10)&&!force) return;
	let row = LAYER_ROW[layer]

	var layersWithChalls = Object.keys(LAYER_CHALLS)
	for (let y = 0; y < layersWithChalls.length; y++) {
		var layerResetting = layersWithChalls[y]
		if (row >= LAYER_ROW[layerResetting] && (!force || layerResetting != layer)) completeChall(layerResetting)
	}

	prevOnReset = JSON.parse(JSON.stringify(player)) //Deep Copy
	if (row == 0) rowReset(0, layer)
	else for (let x = row; x >= 1; x--) rowReset(x, layer)
	prevOnReset = undefined

	updateTemp()
	updateTemp()
}

function buyUpg(layer, id) {
	if (!player[layer].unl) return
	if (!LAYER_UPGS[layer][id].unl()) return
	if (player[layer].upgrades.includes(id)) return
	if (player[layer].points.lt(LAYER_UPGS[layer][id].cost)) return
	player[layer].points = player[layer].points.sub(LAYER_UPGS[layer][id].cost)
	player[layer].upgrades.push(id);
	if (layer=="t"&&id==32) player.t.order = 0;
	if (layer=="e"&&(id==22||id==23)) {
		player.e.order = 0;
		if (!player.e.upgrades.includes(22)) player.e.upgrades.push(22)
		if (!player.e.upgrades.includes(23)) player.e.upgrades.push(23)
	}
	if (layer=="s"&&id==33) player.s.order = 0;
	if (layer=="hb"&&id==13) player.hb.order = 0;
	if (layer=="ss"&&id==15) player.ss.order = 0;
	if (layer=="m"&&id==43) for (let i=1;i<=3;i++) player.m.spellTimes[i] *= LAYER_UPGS.m[43].currently().toNumber()
	if (layer=="ps"&&id==14) player.l.order = 0;
	if (layer=="ps"&&id==24) player.hs.order = 0;
}

function getPointGen() {
	if (tmp.challActive ? tmp.challActive.ge[12] : true) return tmp.quirkEff
	
	let gain = new Decimal(1)
	if (player.p.upgrades.includes(12)) gain = gain.times(LAYER_UPGS.p[12].currently())
	if (player.p.upgrades.includes(13)) gain = gain.times(LAYER_UPGS.p[13].currently())
	if (player.p.upgrades.includes(22)) gain = gain.times(LAYER_UPGS.p[22].currently())
	if (player.b.unl) gain = gain.times(tmp.layerEffs.b)
	if (player.g.unl) gain = gain.times(tmp.genPowEff)
	if (player.t.unl) gain = gain.times(tmp.timeEff)
	if (player.s.unl && tmp.s !== undefined) gain = gain.times(tmp.s.sbEff[1])
	if (player.q.unl && tmp.quirkEff) gain = gain.times(tmp.quirkEff)
	if (player.q.upgrades.includes(11)) gain = gain.times(LAYER_UPGS.q[11].currently())
		
	if (tmp.challActive ? tmp.challActive.h[31] : true) gain = gain.tetrate(0.1)
	return gain
}

function getScaling12Boosters() {
	let x = new Decimal(1)
	if (player.ps.upgrades.includes(22)) x = x.times(LAYER_UPGS.ps[22].currently())
	return x
}

function getScaling12PS() {
	let x = new Decimal(1)
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 10) x = x.times(tmp.l.lbEff[10])
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

function resetRow(row) {
	if (prompt('Are you sure you want to reset this row? It is highly recommended that you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm')!="I WANT TO RESET THIS") return
	let pre_layers = ROW_LAYERS[row-1]
	let layers = ROW_LAYERS[row]
	let post_layers = ROW_LAYERS[row+1]
	rowReset(row+1, post_layers[0])
	doReset(pre_layers[0], true)
	for (let layer in layers) {
		player[layers[layer]].unl = false
		if (player[layers[layer]].order) player[layers[layer]].order = 0
	}
	updateTemp();
	resizeCanvas();
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

function toggleAuto(layer, end="") {
	player[layer]["auto"+end] = !player[layer]["auto"+end]
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
	if (player.ge.unl) mult = mult.times(LAYER_CHALLS.ge[12].currently())
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

const LAYER_CHALLS = {
	h: {
		rows: 7,
		cols: 2,
		res() { return player.points },
		resDisp: "Points",
		choose: 1,
		active(x) {
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
			name: "You shouldn't be seeing this",
			desc: "Never gonna give you up, never gonna let you down, never gonna run around and dessert you",
			unl() { return false },
			goal: new Decimal(1/0),
			reward: "???",
		},
	},
	ge: {
		rows: 2,
		cols: 2,
		res() { return player.p.points },
		resDisp: "Prestige Points",
		choose: 2,
		11: {
			name: "Unique Gameplay",
			desc: "All Super & Hyper layers do nothing (but their upgrades still work).",
			unl() { return true },
			goal: new Decimal("1e10000"),
			reward: "Gears boost the efficiency of all Super & Hyper layers.",
			currently() { return player.ge.points.plus(1).log2().plus(1).log10().plus(1).log10().div(2).times(tmp.challActive?tmp.challActive.ge.combos[11]:0).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% more efficient" },
		},
		12: {
			name: "All for Nothing",
			desc: "Quirk Energy's boost to Point gain is the only source of Point generation.",
			unl() { return true },
			goal: new Decimal("1e1930"),
			reward: "Gears make Quirk Layers more efficient.",
			currently() { return player.ge.points.plus(1).log2().plus(1).log2().plus(1).log10().div(5).times(tmp.challActive?tmp.challActive.ge.combos[12]:0).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% more efficient" },
		},
		21: {
			name: "Mechanical Exhaustion",
			desc: "Work is increased by 0.75.",
			unl() { return true },
			goal: new Decimal("1e2750"),
			reward: "Gears raise Life Power to an exponent.",
			currently() { return player.ge.points.plus(1).log10().plus(1).log10().times(tmp.challActive?tmp.challActive.ge.combos[21]:0).plus(1) },
			effDisp(x) { return "^"+format(x) },
		},
		22: {
			name: "The Olden Days",
			desc: "All row 6 layers other than Super-Prestige do nothing.",
			unl() { return true },
			goal: new Decimal("1e3875"),
			reward: "Gears boost Super-Prestige Point gain.",
			currently() { return player.ge.points.plus(1).pow(tmp.challActive?tmp.challActive.ge.combos[21]:0).pow(1.25) },
			effDisp(x) { return format(x)+"x" },
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
		} else if (player[layer].choices.includes(x)&&player[layer].choices.length<LAYER_CHALLS[layer].choose) return;
		else if (player[layer].choices.length<LAYER_CHALLS[layer].choose) {
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
	if (tmp.challActive ? tmp.challActive.ge[11] : true) return new Decimal(0)
	
	let pow = new Decimal(1)
	if (player.hb.upgrades.includes(12)) pow = pow.times(LAYER_UPGS.hb[12].currently())
	if (player.ge.unl) pow = pow.times(LAYER_CHALLS.ge[11].currently())
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
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 7) mult = mult.times(tmp.l.lbEff[7])
	return mult;
}

function getNegGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ba[22].currently())
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 7) mult = mult.times(tmp.l.lbEff[7])
	return mult;
}

function getBalPowGainMult() {
	let mult = new Decimal(1)
	if (player.sp.upgrades.includes(14)) mult = mult.times(LAYER_UPGS.sp[14].currently())
	return mult;
}

const MAX_SPELLS = 10

const SPELL_NAMES = {
	1: "Booster Launch",
	2: "Time Warp",
	3: "Quirk Amplification",
	4: "Spatial Compression",
	5: "Stockade Multiplication",
	6: "Generator Augmentation",
	7: "Shatter Serum",
	8: "Revival Energy",
	9: "Prestigial Ascension",
	10: "Voodoo Empowerment"
}

const SPELL_DESCS = {
	1: "Boosters are X% stronger",
	2: "Time Capsules are X% stronger",
	3: "Quirk Layers are X% more efficient",
	4: "Space Buildings cost scale X% slower",
	5: "The Final Stockade's effect is X% more efficient",
	6: "Multiply the Super-Generator base by X",
	7: "The Hindrance Spirit effect is multiplied by X",
	8: "Multiply Life Power gain by X",
	9: "Multiply Super-Prestige Point gain by X",
	10: "All previous Spells are X% stronger",
}

const SPELL_BASE = {
	1: 1.25,
	2: 1.1,
	3: 1.04,
	4: 1.01,
	5: 1.175,
	6: 1.45,
	7: 1.1,
	8: 5,
	9: 2,
	10: 1.008,
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
	
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 6) power = power.times(tmp.l.lbEff[6])
	if (spellActive(10) && x<10) power = power.times(tmp.spellEffs[10]);
	if (tmp.mb) power = power.times(tmp.mb.spellBoost)
	
	if (power.gte(100)) power = power.log10().times(50).min(power)
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
	if (desc.includes("X%")) return desc.replace("X", format(eff.sub(1).times(100)))
	else return desc.replace("X", format(eff))
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
	return toAdd
}

function getSuperGenPow() {
	let pow = new Decimal(1)
	if (player.ge.unl) pow = pow.times(LAYER_CHALLS.ge[11].currently())
	return pow
}

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
			return "All Spells are "+format(x.sub(1).times(100))+"% stronger"
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
			return "All previous Life Booster costs scale "+format(x.times(100))+"% slower"
		},
	},
	10: {
		req: new Decimal(36),
		reqMult: new Decimal(12),
		eff(str) {
			return str.plus(1).log10().sqrt().plus(1);
		},
		effDesc(x) {
			return "The post-12 Phantom Soul cost scaling is "+format(x.sub(1).times(100))+"% weaker"
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

let VERSION = {
	beta: 2,
	num: 1.2,
	name: "The Mechanical Update"
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.beta ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")

let IMPERIUM = {
	lifeReq() {
		return Decimal.pow(10, player.i.lifeBricks.times(2).sqr().add(15))
	},
	lifeTarget() {
		return player.l.power.max(1).log10().sub(15).sqrt().div(2).add(1).floor()
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
		return {
			i: x.times(1.75).add(0.5).sub(sub).ceil().max(0),
			l: x.times(1.5).add(1).sub(sub).ceil().max(0)
		}
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

const MASTERY = {
	spellCost() {
		let bought = player.mb.extraSpells.plus(player.mb.extraBoosters.times(0.5));
		if (bought.gte(6)) bought = player.mb.extraSpells.times(1.5)
		let cost = bought.pow(2).plus(1);
		return cost.floor();
	},
	boosterCost() {
		let bought = player.mb.extraBoosters.plus(player.mb.extraSpells.times(0.5));
		if (bought.gte(5)) bought = player.mb.extraBoosters.times(1.5)
		let cost = bought.pow(3).plus(1).times(2);
		return cost.floor();
	},
	respec() {
		if (!player.mb.unl || !confirm("Are you sure? This will perform a Row 7 reset and will reset your Mastery Buildings!")) return
		player.mb.extraSpells = new Decimal(0)
		player.mb.extraBoosters = new Decimal(0)
		player.mb.points = player.mb.points.plus(player.mb.spent)
		player.mb.best = player.mb.best.max(player.mb.points)
		player.mb.spent = new Decimal(0)
		doReset("mb", true)
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

const ENDGAME = new Decimal(1/0); // Previously e280,000,000

function keepGoing() {
	player.keepGoing = true;
	showTab("tree")
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
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

function gameLoop(diff) {
	if (player.points.gte(ENDGAME) || gameEnded) gameEnded = 1

	if (isNaN(diff)) diff = 0
	if (gameEnded && !player.keepGoing) {
		diff = 0
		player.tab = "gameEnded"
	}
	if (player.devSpeed) diff *= player.devSpeed

	addTime(diff)
	addTime(diff, "h")

	if (tmp.challActive ? tmp.challActive.h[42] : true) {
		if (player.h.time>=10) diff = 0
		else diff = Decimal.div(diff, Decimal.div(10, Decimal.sub(10, player.h.time + 1)).pow(1000))
	}
	if (diff === 0) return

	if (player.p.upgrades.includes(11)) player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
	if (player.g.unl) player.g.power = player.g.power.add(tmp.layerEffs.g.times(diff)).max(0)
	if (player.g.best.gte(10)) generatePoints("p", diff)
	if (player.t.unl) {
		let data = tmp.layerEffs.t
		player.t.energy = player.t.energy.add(data.gain.times(diff)).min(data.limit).max(0)
	}
	if (player.sg.unl) player.sg.power = player.sg.power.add(tmp.layerEffs.sg.times(diff)).max(0)
	if (player.q.unl) {
		let mult = getQuirkLayerMult()
		player.q.time = player.q.time.add(mult.times(diff)).max(0)
		let exp = getQuirkEnergyGainExp()
		if (exp.gte(0)) player.q.energy = player.q.energy.add(player.q.time.pow(exp).times(mult).times(diff)).max(0)
	}
	if (player.q.total.gte(15)) generatePoints("e", diff)
	if (player.ss.unl) player.ss.subspace = player.ss.subspace.add(tmp.layerEffs.ss.times(diff)).max(0)
	if (player.ba.unl) {
		player.ba.power = player.ba.power.add(tmp.layerEffs.ba.power.times(tmp.balEff2).times(getBalPowGainMult()).times(diff)).max(0)
		player.ba.positivity = player.ba.positivity.add(tmp.layerEffs.ba.pos.times(getPosGainMult()).times(diff)).max(0)
		player.ba.negativity = player.ba.negativity.add(tmp.layerEffs.ba.neg.times(getNegGainMult()).times(diff)).max(0)
	}
	if (player.m.unl) {
		for (let i=1;i<=tmp.spellsUnl;i++) {
			player.m.spellTimes[i] = Decimal.sub(player.m.spellTimes[i], diff).max(0).toNumber()
		}
	}
	if (player.m.total.gte(3)) {
		generatePoints("h", diff)
		generatePoints("q", diff)
	}
	if (player.m.total.gte(2.5e9)) player.m.hexes = player.m.hexes.add(getHexGain().times(diff)).max(0)
	if (player.sp.total.gte(10)) {
		generatePoints("m", diff)
		generatePoints("ba", diff)
	}
	if (player.hs.best.gte(2e4)) generatePoints("sp", Decimal.div(diff, 100))
	if (player.l.unl) {
		player.l.power = LIFE_BOOSTERS.calcNewPower(diff)
		for (var i=1; i<=tmp.l.lbUnl; i++) player.l.boosters[i] = LIFE_BOOSTERS.reqTarget(i).max(player.l.boosters[i])
	}
	if (player.hs.unl) player.hs.superUpgradeCap = player.hs.superUpgradeCap.max(HYPERSPACE.nextCapTarget())
	if (player.i.unl) {
		player.i.lifeBricks = player.i.lifeBricks.max(IMPERIUM.lifeTarget())
		if (player.i.building) player.i.progress += IMPERIUM.speed().times(diff).toNumber()
		if (player.i.progress >= 1) {
			player.i.progress = 0
			player.i.extraBuildings = player.i.extraBuildings.add(1)
			delete player.i.building
		}
	}
	if (player.mb.total.gte(3)) generatePoints("l", diff)
	if (player.mb.total.gte(5)) generatePoints("hs", diff)
	if (player.mb.total.gte(10)) generatePoints("sp", diff)

	if (player.b.auto&&player.t.best.gte(5)) doReset("b")
	if (player.g.auto&&player.s.best.gte(5)) doReset("g")
	if (player.e.auto&&player.q.total.gte(4)) maxEnhancers()
	if (player.t.autoCap&&player.h.best.gte(4)) maxExtTimeCapsules()
	if (player.t.auto&&player.q.total.gte(10)) doReset("t")
	if (player.s.auto&&player.q.total.gte(10)) doReset("s")
	if (player.s.autoBuild&&player.ss.best.gte(1)) for (let i=tmp.s.trueSbUnl;i>=1;i--) maxSpaceBuilding(i)
	if (player.sb.auto&&player.h.best.gte(15)) doReset("sb")
	if (player.sg.auto&&player.sg.best.gte(2)) doReset("sg")
	if (player.q.auto&&player.ba.best.gte(3)) maxQuirkLayers()
	if (player.hb.auto&&player.m.total.gte(4)) doReset("hb")
	if (player.ss.auto&&player.m.total.gte(4)) doReset("ss")
	if (player.m.autoIns&&player.sp.total.gte(2)) for (let i=1;i<=tmp.spellsUnl;i++) {
		player.m.casted[i] = player.m.points
		player.m.toCast[i] = player.m.points
	}
	if (player.m.auto&&player.m.total.gte(50)) for (let i=1;i<=tmp.spellsUnl;i++) activateSpell(i)
	if (player.ps.auto&&player.ps.best.gte(2)) doReset("ps")
	if (player.i.auto&&player.mb.total.gte(10)) doReset("i")

	if (player.hasNaN&&!NaNalert) {
		clearInterval(interval);
		player.autosave = false;
		NaNalert = true;

		alert("We have detected a corruption in your save. Please visit https://discord.gg/wwQfgPa for help.")
	}
}

function hardReset() {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return
	player = getStartPlayer()
	save();
	window.location.reload();
}

var saveInterval = setInterval(function() {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	if (player.autosave) save();
}, 5000)

var ticking = false
var interval = setInterval(function() {
	if (player===undefined||tmp===undefined) return;
	if (ticking) return;
	if (gameEnded&&!player.keepGoing) return;
	ticking = true
	let now = Date.now()
	let diff = (now - player.time) / 1e3
	if (player.offTime !== undefined) {
		if (player.offTime.remain > 0) {
			let offlineDiff = Math.max(player.offTime.remain / 10, diff)
			player.offTime.remain -= offlineDiff
			diff += offlineDiff
		}
		if (!player.offlineProd || player.offTime.remain <= 0) delete player.offTime
	}
	if (player.devSpeed) diff *= player.devSpeed
	player.time = now
	if (needCanvasUpdate) resizeCanvas();
	updateTemp();
	gameLoop(diff)
	ticking = false
}, 50)

const themes = {
	1: "aqua"
}
const theme_names = {
	aqua: "Aqua"
}

function changeTheme() {
	let aqua = player.theme == "aqua"
	colors_theme = colors[player.theme || "default"]
	document.body.style.setProperty('--background', aqua ? "#001f3f" : "#0f0f0f")
	document.body.style.setProperty('--background_tooltip', aqua ? "rgba(0, 15, 31, 0.75)" : "rgba(0, 0, 0, 0.75)")
	document.body.style.setProperty('--color', aqua ? "#bfdfff" : "#dfdfdf")
	document.body.style.setProperty('--points', aqua ? "#dfefff" : "#ffffff")
}

function getThemeName() {
	return player.theme ? theme_names[player.theme] : "Default"
}

function switchTheme() {
	if (player.theme === undefined) player.theme = themes[1]
	else {
		player.theme = themes[Object.keys(themes)[player.theme] + 1]
		if (!player.theme) delete player.theme
	}
	changeTheme()
	resizeCanvas()
}

document.onkeydown = function(e) {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	let shiftDown = e.shiftKey
	let ctrlDown = e.ctrlKey
	let key = e.key
	if (onFocused) return
	if (ctrlDown && key != "-" && key != "_" && key != "+" && key != "=" && key != "r" && key != "R" && key != "F5") e.preventDefault()
	if (player.m.unl && key >= 0 && key <= 9) {
		if (key == 0) activateSpell(10)
		else activateSpell(key)
		return
	} else if ((!LAYERS.includes(key)) || ctrlDown || shiftDown) {
		switch(key) {
			case "a": 
				if (player.ba.unl) doReset("ba")
				return
			case "b": 
				if (ctrlDown && player.hb.unl) doReset("hb")
				return
			case "B": 
				if (player.sb.unl) doReset("sb")
				return
			case "g": 
				if (ctrlDown && player.ge.unl) doReset("ge")
				return
			case "G": 
				if (player.sg.unl) doReset("sg")
				return
			case "m": 
				if (ctrlDown && player.ma.unl) doReset("ma")
				return
			case "M": 
				if (player.mb.unl) doReset("mb")
				return
			case "p": 
				if (ctrlDown && player.sp.unl) doReset("ps")
				return
			case "P": 
				if (player.sp.unl) doReset("sp")
				return
			case "s": 
				if (ctrlDown && player.hs.unl) doReset("hs")
				return
			case "S": 
				if (player.ss.unl) doReset("ss")
				return;
		}
	} else if (player[key].unl) doReset(key)
}

var onFocused = false
function focused(x) {
	onFocused = x
}