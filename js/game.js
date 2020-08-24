var player;
var tmp = {};
var needCanvasUpdate = true;
var NaNalert = false;

function getStartPlayer() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		versionType: "beta",
		version: 1.0,
		timePlayed: 0,
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
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			enhancers: new Decimal(0),
			upgrades: [],
		},
		t: {
			unl: false,
			order: 0,
			points: new Decimal(0),
			best: new Decimal(0),
			energy: new Decimal(0),
			extCapsules: new Decimal(0),
			upgrades: [],
		},
		s: {
			unl: false,
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
			points: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
		},
	}
}

const LAYERS = ["p", "b", "g", "e", "t", "s", "sb"]

const LAYER_REQS = {
	p: new Decimal(10),
	b: new Decimal(200),
	g: new Decimal(200),
	e: new Decimal(1e120),
	t: new Decimal(1e120),
	s: new Decimal(1e120),
	sb: new Decimal(180),
}

const LAYER_RES = {
	p: "prestige points",
	b: "boosters",
	g: "generators",
	e: "enhance points",
	t: "time capsules",
	s: "space energy",
	sb: "super-boosters",
}

const LAYER_TYPE = {
	p: "normal",
	b: "static",
	g: "static",
	e: "normal",
	t: "static",
	s: "static",
	sb: "static",
}

const LAYER_EXP = {
	p: new Decimal(0.5),
	b: new Decimal(1.25),
	g: new Decimal(1.25),
	e: new Decimal(0.02),
	t: new Decimal(1.85),
	s: new Decimal(1.85),
	sb: new Decimal(1.25),
}

const LAYER_BASE = {
	b: new Decimal(5),
	g: new Decimal(5),
	t: new Decimal(1e15),
	s: new Decimal(1e15),
	sb: new Decimal(1.05),
}

const LAYER_ROW = {
	p: 0,
	b: 1,
	g: 1,
	e: 2,
	t: 2,
	s: 2,
	sb: 2,
	future_layer: 3,
}

const ROW_LAYERS = [
	["p"],
	["b","g"],
	["e","t","s","sb"],
	["future_layer"],
]

const LAYER_EFFS = {
	b: function() { return Decimal.pow(Decimal.add(2, tmp.atbb), player.b.points.plus(getFreeBoosters())) },
	g: function() { return Decimal.pow(Decimal.add(2, tmp.atgb), player.g.points).sub(1).times(getGenPowerGainMult()) },
	t: function() { return {
		gain: Decimal.pow(3, player.t.points.plus(player.t.extCapsules.plus(tmp.freeExtCap))).sub(1).times(getTimeEnergyGainMult()),
		limit: Decimal.pow(2, player.t.points.plus(player.t.extCapsules.plus(tmp.freeExtCap))).sub(1).times(100).times(getTimeEnergyLimitMult()),
	}},
	sb: function() { return Decimal.pow(1.5, player.sb.points.times(getSuperBoosterPow())) },
}

const LAYER_UPGS = {
	p: {
		rows: 3,
		cols: 3,
		11: {
			desc: "Gain 1 Point every second.",
			cost: new Decimal(1),
			unl: function() { return player.p.unl },
		},
		12: {
			desc: "Point generation is faster based on your unspent Prestige Points.",
			cost: new Decimal(1),
			unl: function() { return player.p.upgrades.includes(11) },
			currently: function() { return player.p.points.plus(1).pow(player.g.upgrades.includes(24)?1.1:(player.g.upgrades.includes(14)?0.75:0.5)) },
			effDisp: function(x) { return format(x)+"x" },
		},
		13: {
			desc: "Point generation is faster based on your Point amount.",
			cost: new Decimal(5),
			unl: function() { return player.p.upgrades.includes(12) },
			currently: function() { 
				let ret = player.points.plus(1).log10().pow(0.75).plus(1)
				if (player.g.upgrades.includes(15)) ret = ret.pow(LAYER_UPGS.g[15].currently())
				return ret;
			},
			effDisp: function(x) { return format(x)+"x" },
		},
		21: {
			desc: "Prestige Point gain is doubled.",
			cost: new Decimal(20),
			unl: function() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(11) },
		},
		22: {
			desc: "Point generation is faster based on your Prestige Upgrades bought.",
			cost: new Decimal(75),
			unl: function() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(12) },
			currently: function() { return Decimal.pow(1.4, player.p.upgrades.length) },
			effDisp: function(x) { return format(x)+"x" },
		},
		23: {
			desc: "Prestige Point gain is boosted by your Point amount.",
			cost: new Decimal(5e3),
			unl: function() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(13) },
			currently: function() { 
				let ret = player.points.plus(1).log10().cbrt().plus(1) 
				if (player.g.upgrades.includes(23)) ret = ret.pow(LAYER_UPGS.g[23].currently())
				if (player.p.upgrades.includes(33)) ret = ret.pow(1.25)
				return ret;
			},
			effDisp: function(x) { return format(x)+"x" },
		},
		31: {
			desc: "Prestige Point gain is boosted by your Prestige Point amount.",
			cost: new Decimal("1e4450"),
			unl: function() { return player.e.upgrades.includes(33) },
			currently: function() { return player.p.points.plus(1).log10().plus(1).pow(player.p.points.plus(1).log10().div(200).plus(1)).pow(player.p.upgrades.includes(32) ? LAYER_UPGS.p[32].currently() : 1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		32: {
			desc: "The upgrade to the left is stronger based on your Points.",
			cost: new Decimal("1e5140"),
			unl: function() { return player.e.upgrades.includes(33) },
			currently: function() { return player.points.plus(1).log10().plus(1).root(16) },
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		33: {
			desc: "The above upgrade is 25% stronger.",
			cost: new Decimal("1e5500"),
			unl: function() { return player.e.upgrades.includes(33) },
		},
	},
	b: {
		rows: 2,
		cols: 3,
		11: {
			desc: "Boosters boost Prestige Point gain.",
			cost: new Decimal(3),
			unl: function() { return player.b.unl },
			currently: function() { return player.b.points.sqrt().plus(1).max(1.5) },
			effDisp: function(x) { return format(x)+"x" },
		},
		12: {
			desc: "Generators add to the Booster effect.",
			cost: new Decimal(7),
			unl: function() { return player.g.unl },
			currently: function() { return player.g.points.plus(1).log10().sqrt().div(3).times(player.t.upgrades.includes(14)?8.5:1) },
			effDisp: function(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points add to the Booster effect.",
			cost: new Decimal(8),
			unl: function() { return player.b.best.gte(8) },
			currently: function() { return player.p.points.plus(1).log10().plus(1).log10().div(3) },
			effDisp: function(x) { return "+"+format(x)+" to base" },
		},
		21: {
			desc: "Square the Generator Power effect.",
			cost: new Decimal(10),
			unl: function() { return player.b.upgrades.includes(11) && player.b.upgrades.includes(12) },
		},
		22: {
			desc: "The Generator Power effect is raised to the power of 1.2.",
			cost: new Decimal(15),
			unl: function() { return player.b.upgrades.includes(12) && player.b.upgrades.includes(13) },
		},
		23: {
			desc: "Boosters are cheaper based on your points.",
			cost: new Decimal(18),
			unl: function() { return player.b.upgrades.includes(21) || player.b.upgrades.includes(22) },
			currently: function() { return player.points.plus(1).log10().plus(1).pow(3.2).pow(tmp.spaceBuildEff?tmp.spaceBuildEff[4]:1) },
			effDisp: function(x) { return "/"+format(x) },
		},
	},
	g: {
		rows: 2,
		cols: 5,
		11: {
			desc: "Generators boost Prestige Point gain.",
			cost: new Decimal(3),
			unl: function() { return player.g.unl },
			currently: function() { return player.g.points.sqrt().plus(1).max(1.5) },
			effDisp: function(x) { return format(x)+"x" },
		},
		12: {
			desc: "Boosters boost Generator Power gain.",
			cost: new Decimal(7),
			unl: function() { return player.b.unl },
			currently: function() { return player.b.points.plus(1).log10().sqrt().div(3).times(player.t.upgrades.includes(14)?3.75:1) },
			effDisp: function(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(8),
			unl: function() { return player.g.best.gte(8) },
			currently: function() { return player.p.points.plus(1).log10().plus(1).log10().div(3) },
			effDisp: function(x) { return "+"+format(x)+" to base" },
		},
		14: {
			desc: "Prestige Upgrade 2 uses a better formula.",
			cost: new Decimal(13),
			unl: function() { return player.g.best.gte(10) },
		},
		15: {
			desc: "Prestige Upgrade 3 is stronger based on your Generators.",
			cost: new Decimal(15),
			unl: function() { return player.g.upgrades.includes(13) },
			currently: function() { return player.g.points.sqrt().plus(1).times((player.e.upgrades.includes(32)) ? LAYER_UPGS.e[32].currently() : 1) },
			effDisp: function(x) { return "^"+format(x) },
		},
		21: {
			desc: "Generator Power generates faster based on its amount.",
			cost: new Decimal(18),
			unl: function() { return player.g.upgrades.includes(15) },
			currently: function() { return player.g.power.plus(1).log10().plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		22: {
			desc: "Generators are cheaper based on your Prestige Points.",
			cost: new Decimal(19),
			unl: function() { return player.g.upgrades.includes(15) },
			currently: function() { return player.p.points.plus(1).pow(0.25) },
			effDisp: function(x) { return "/"+format(x) },
		},
		23: {
			desc: "Prestige Upgrade 6 is stronger based on your Boosters.",
			cost: new Decimal(20),
			unl: function() { return player.b.unl && player.g.upgrades.includes(15) },
			currently: function() { return player.b.points.pow(0.75).plus(1) },
			effDisp: function(x) { return "^"+format(x) },
		},
		24: {
			desc: "Prestige Upgrade 2 uses an even better formula.",
			cost: new Decimal(22),
			unl: function() { return player.g.upgrades.includes(14) && (player.g.upgrades.includes(21)||player.g.upgrades.includes(22)) },
		},
		25: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(28),
			unl: function() { return player.g.upgrades.includes(23) && player.g.upgrades.includes(24) },
			currently: function() { return player.p.points.plus(1).log10().sqrt().plus(1).pow(player.t.upgrades.includes(14)?2.75:1) },
			effDisp: function(x) { return format(x)+"x" },
		},
	},
	e: {
		rows: 3,
		cols: 5,
		11: {
			desc: "Boosters & Generators boost each other.",
			cost: new Decimal(40),
			unl: function() { return player.e.unl },
			currently: function() { 
				let exp = 1
				if (player.e.upgrades.includes(14)) exp = 1.5
				return {g: player.b.points.plus(1).log10().pow(exp), b: player.g.points.plus(1).log10().pow(exp)} 
			},
			effDisp: function(x) { return "+"+format(x.g)+" to Generator base, +"+format(x.b)+" to Booster base" },
		},
		12: {
			desc: "Unspent Enhance Points boost Prestige Point gain.",
			cost: new Decimal(150),
			unl: function() { return player.e.unl&&player.e.best.gte(40) },
			currently: function() { return player.e.points.plus(1).pow(player.e.upgrades.includes(15)?3.25:1.5) },
			effDisp: function(x) { return format(x)+"x" },
		},
		13: {
			desc: "You gain 1e10x as many Prestige Points.",
			cost: new Decimal(1000),
			unl: function() { return player.e.upgrades.includes(11)||player.e.upgrades.includes(12) },
		},
		14: {
			desc: "Enhance Upgrade 1 uses a better formula.",
			cost: new Decimal(5e7),
			unl: function() { return player.e.upgrades.includes(13)&&(player.t.unl||player.s.unl) },
		},
		15: {
			desc: "Enhance Upgrade 2 uses a better formula.",
			cost: new Decimal(2e10),
			unl: function() { return player.e.upgrades.includes(14)&&(player.t.unl||player.s.unl)&&player.e.best.gte(1e9) },
		},
		21: {
			desc: "The Generator Power effect is raised to the power of 1.15.",
			cost: new Decimal(1e15),
			unl: function() { return player.t.unl&&(player.t.order==1||player.s.unl)&&player.e.upgrades.includes(14) },
		},
		22: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e22),
			unl: function() { return (player.t.unl&&player.s.unl&&player.e.order==2)||player.e.upgrades.includes(22)||player.e.upgrades.includes(23) },
		},
		23: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e40),
			unl: function() { return (player.t.unl&&player.s.unl)||player.e.upgrades.includes(22)||player.e.upgrades.includes(23) },
		},
		24: {
			desc: "Prestige Points boost Enhance Point gain.",
			cost: new Decimal(1e65),
			unl: function() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e50) },
			currently: function() { return player.p.points.plus(1).pow(0.002) },
			effDisp: function(x) { return format(x)+"x" },
		},
		25: {
			desc: "Enhancers are stronger based on your Space Energy & Time Capsules.",
			cost: new Decimal(7.777e77),
			unl: function() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e60) },
			currently: function() { 
				let ret = player.s.points.plus(player.t.points).div(32).plus(1);
				if (ret.gte(2)) ret = ret.log(2).plus(1).times(2).sqrt();
				return ret;
			},
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		31: {
			desc: "Enhancers are stronger based on your Super-Boosters.",
			cost: new Decimal(1e90),
			unl: function() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently: function() { return player.sb.points.pow(0.75).div(4).plus(1) },
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		32: {
			desc: "Generator Upgrade 5 is stronger based on your Enhance Points.",
			cost: new Decimal(7.5e108),
			unl: function() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently: function() { 
				let ret = Decimal.pow(10, player.e.points.plus(1).log10().pow(0.085)).div(10).max(1);
				return ret;
			},
			effDisp: function(x) { return format(x)+"x" },
		},
		33: {
			desc: "Unlock 3 new Prestige Upgrades.",
			cost: new Decimal(2.5e139),
			unl: function() { return player.e.upgrades.includes(31)||player.e.upgrades.includes(32) },
		},
		34: {
			desc: "You gain 1e40x as many Prestige Points.",
			cost: new Decimal(1e152),
			unl: function() { return player.e.upgrades.includes(31)&&player.e.upgrades.includes(32) },
		},
		35: {
			desc: "Points boost Generator Power gain.",
			cost: new Decimal(2e189),
			unl: function() { return player.e.upgrades.includes(33)||player.e.upgrades.includes(34) },
			currently: function() { return player.points.plus(1).pow(0.004) },
			effDisp: function(x) { return format(x)+"x" },
		},
	},
	t: {
		rows: 3,
		cols: 4,
		11: {
			desc: "Non-extra Time Capsules boost the Booster effect.",
			cost: new Decimal(2),
			unl: function() { return player.t.unl },
			currently: function() { return player.t.points.pow(0.9).plus(0.5).plus(player.t.upgrades.includes(13)?LAYER_UPGS.t[13].currently():0) },
			effDisp: function(x) { return "+"+format(x)+" to base" },
		},
		12: {
			desc: "The Time Energy cap starts later based on your Boosters, and you get a free Extra Time Capsule.",
			cost: new Decimal(3),
			unl: function() { return player.t.best.gte(2)&&player.t.unl },
			currently: function() { return player.b.points.pow(0.95).plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		13: {
			desc: "Extra Time Capsules are added to the first Time Upgrade's effect formula, but at a reduced amount.",
			cost: new Decimal(3),
			unl: function() { return player.t.upgrades.includes(11) },
			currently: function() { return player.t.extCapsules.plus(tmp.freeExtCap).pow(0.95) },
			effDisp: function(x) { return "+"+format(x) },
		},
		14: {
			desc: "Generator Upgrades 2 & 10 are 275% stronger, and Booster Upgrade 2 is 750% stronger.",
			cost: new Decimal(4),
			unl: function() { return player.t.upgrades.includes(12)||player.t.upgrades.includes(13) },
		},
		21: {
			desc: "Time Energy boosts its own production & limit, and the Time Energy effect uses a better formula.",
			cost: new Decimal(4),
			unl: function() { return player.t.upgrades.includes(14) },
			currently: function() { return player.t.energy.plus(1).log10().pow(1.1).plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		22: {
			desc: "Time Energy production & limit are boosted by your Enhance Points.",
			cost: new Decimal(5),
			unl: function() { return player.t.upgrades.includes(14)&&player.e.unl },
			currently: function() { return player.e.points.plus(1).pow(0.8/(1+player.t.order)) },
			effDisp: function(x) { return format(x)+"x" },
		},
		23: {
			desc: "Time Energy production & limit are boosted by your Space Energy.",
			cost: new Decimal(5),
			unl: function() { return player.t.upgrades.includes(14)&&player.s.unl },
			currently: function() { return Decimal.pow(3, player.s.points.pow(0.9)) },
			effDisp: function(x) { return format(x)+"x" },
		},
		24: {
			desc: "Get 18 free boosters added to their effect.",
			cost: new Decimal(7),
			unl: function() { return player.t.upgrades.includes(21)&&player.t.best.gte(5) },
		},
		31: {
			desc: "Add 25 to the booster effect base.",
			cost: new Decimal(8),
			unl: function() { return (player.t.upgrades.includes(22)&&(player.e.order==1||player.s.unl))||(player.t.upgrades.includes(23)&&(player.s.order==1||player.e.unl)) },
		},
		32: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl: function() { return (player.s.unl&&player.e.unl)||player.t.upgrades.includes(32) },
		},
		33: {
			desc: "Add 40 to the booster effect base.",
			cost: new Decimal(16),
			unl: function() { return player.s.unl&&player.e.unl&&player.t.upgrades.includes(32) },
		},
		34: {
			desc: "Time Energy caps later and generates faster based on your non-free Time Capsules.",
			cost: new Decimal(18),
			unl: function() { return player.t.upgrades.includes(33)&&player.sb.unl },
			currently: function() { return Decimal.pow(10, player.t.points.pow(1.2)) },
			effDisp: function(x) { return format(x)+"x" },
		},
	},
	s: {
		rows: 3,
		cols: 4,
		11: {
			desc: "Add a free level to all Space Buildings.",
			cost: new Decimal(2),
			unl: function() { return player.s.unl },
		},
		12: {
			desc: "Generator Power boosts its own generation.",
			cost: new Decimal(3),
			unl: function() { return player.s.best.gte(2)&&player.s.unl },
			currently: function() { return player.g.power.plus(1).log10().plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		13: {
			desc: "Space Building Levels boost Generator Power gain, and get 2 extra Space.",
			cost: new Decimal(3),
			unl: function() { return player.s.upgrades.includes(11) },
			currently: function() { return Decimal.pow(20, Object.values(player.s.buildings).reduce((a,b) => Decimal.add(a,b))) },
			effDisp: function(x) { return format(x)+"x" },
		},
		14: {
			desc: "Unlock a 4th Space Building, and add a free level to all Space Buildings.",
			cost: new Decimal(4),
			unl: function() { return player.s.upgrades.includes(12)&&player.s.upgrades.includes(13) },
		},
		21: {
			desc: "All Space Buildings are stronger based on your Generators.",
			cost: new Decimal(4),
			unl: function() { return player.s.upgrades.includes(14) },
			currently: function() { return player.g.points.plus(1).log10().div(1.5).plus(1) },
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		22: {
			desc: "Space Buildings are stronger based on your Time Energy.",
			cost: new Decimal(6),
			unl: function() { return player.s.upgrades.includes(14)&&player.t.unl },
			currently: function() { return player.t.energy.plus(1).log10().plus(1).log10().div(5).plus(1) },
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		23: {
			desc: "Space Buildings are stronger based on your Enhancers.",
			cost: new Decimal(5),
			unl: function() { return player.s.upgrades.includes(14)&&player.e.unl },
			currently: function() { return player.e.enhancers.sqrt().div((player.s.order==0)?5:7).plus(1) },
			effDisp: function(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		24: {
			desc: "Space Building costs scale half as fast, and you have 3 more Space.",
			cost: new Decimal(7),
			unl: function() { return player.s.upgrades.includes(21)&&(player.t.unl||player.e.unl) },
		},
		31: {
			desc: "Space Building 1 uses a better formula.",
			cost: new Decimal(7),
			unl: function() { return (player.s.upgrades.includes(22)&&(player.t.order==0||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==0||player.t.unl)) },
		},
		32: {
			desc: "Unlock a 5th Space Building.",
			cost: new Decimal(8),
			unl: function() { return (player.s.upgrades.includes(22)&&(player.t.order==1||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==1||player.t.unl)) },
		},
		33: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl: function() { return (player.t.unl&&player.e.unl)||player.s.upgrades.includes(33) },
		},
		34: {
			desc: "Space Buildings boost the Generator Power effect (before all other boosts).",
			cost: new Decimal(15),
			unl: function() { return player.t.unl&&player.e.unl&&player.t.order==0&&player.e.order==0&&player.s.order==0 },
			currently: function() { return Decimal.pow(Object.values(player.s.buildings).reduce((a,b) => Decimal.add(a,b)), 0.2).div(17.5) },
			effDisp: function(x) { return "Add "+format(x)+" to exponent" },
		},
	},
	sb: {
		rows: 1,
		cols: 2,
		11: {
			desc: "Super-Boosters are stronger based on your Prestige Points.",
			cost: new Decimal(2),
			unl: function() { return player.sb.unl },
			currently: function() { 
				let ret = Decimal.pow(10, player.p.points.plus(1).log10().div(1e5).sqrt());
				if (ret.gte(2.5)) ret = ret.log(2.5).plus(1.5).min(ret);
				return ret.max(1);
			},
			effDisp: function(x) { return format(x)+"x" },
		},
		12: {
			desc: "Super-Boosters are stronger based on your Generators.",
			cost: new Decimal(4),
			unl: function() { return player.sb.upgrades.includes(11) },
			currently: function() { return player.g.points.div(10).pow(0.04).max(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
	},
}

const TAB_REQS = {
	tree: function() { return true },
	options: function() { return true },
	info: function() { return true },
	changelog: function() { return true },
	p: function() { return (player.p.unl||player.points.gte(tmp.layerReqs.p))&&layerUnl('p') },
	b: function() { return (player.b.unl||player.points.gte(tmp.layerReqs.b))&&layerUnl('b') },
	g: function() { return (player.g.unl||player.points.gte(tmp.layerReqs.g))&&layerUnl('g') },
	e: function() { return (player.e.unl||player.points.gte(tmp.layerReqs.e))&&layerUnl('e') },
	t: function() { return (player.t.unl||player.points.gte(tmp.layerReqs.t))&&layerUnl('t') },
	s: function() { return (player.s.unl||player.points.gte(tmp.layerReqs.s))&&layerUnl('s') },
	sb: function() { return (player.sb.unl||player.b.points.gte(tmp.layerReqs.sb))&&layerUnl('sb') },
}

const LAYER_AMT_NAMES = {
	p: "points",
	b: "points",
	g: "points",
	t: "points",
	e: "points",
	s: "points",
	sb: "boosters"
}

function getLayerAmt(layer) {
	let amt = player.points
	switch(layer) {
		case "sb": 
			return player.b.points;
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
	checkForVars();
	convertToDecimal();
	versionCheck();
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
	
	if (setVersion) {
		player.versionType = getStartPlayer().versionType
		player.version = getStartPlayer().version
	}
}

function checkForVars() {
	if (player.autosave===undefined) player.autosave = true;
	if (player.b===undefined) player.b = getStartPlayer().b
	if (player.g===undefined) player.g = getStartPlayer().g
	if (player.p.best===undefined) player.p.best = player.p.points
	if (player.b.best===undefined) player.b.best = player.b.points
	if (player.b.auto===undefined) player.b.auto = false
	if (player.g.best===undefined) player.g.best = player.g.points
	if (player.g.auto===undefined) player.g.auto = false
	if (player.e === undefined) player.e = getStartPlayer().e
	if (player.e.order === undefined) player.e.order = 0
	if (player.t === undefined) player.t = getStartPlayer().t
	if (player.s === undefined) player.s = getStartPlayer().s
	if (player.s.buildings[4] === undefined) player.s.buildings[4] = new Decimal(0);
	if (player.s.buildings[5] === undefined) player.s.buildings[5] = new Decimal(0);
	if (player.sb === undefined) player.sb = getStartPlayer().sb
	if (player.timePlayed === undefined) player.timePlayed = 0
	if (player.hasNaN === undefined) player.hasNaN = false
}

function convertToDecimal() {
	player.points = new Decimal(player.points)
	player.p.points = new Decimal(player.p.points)
	player.p.best = new Decimal(player.p.best)
	player.b.points = new Decimal(player.b.points)
	player.b.best = new Decimal(player.b.best)
	player.g.points = new Decimal(player.g.points)
	player.g.best = new Decimal(player.g.best)
	player.g.power = new Decimal(player.g.power)
	player.e.points = new Decimal(player.e.points)
	player.e.best = new Decimal(player.e.best)
	player.e.enhancers = new Decimal(player.e.enhancers)
	player.t.points = new Decimal(player.t.points)
	player.t.best = new Decimal(player.t.best)
	player.t.energy = new Decimal(player.t.energy)
	player.t.extCapsules = new Decimal(player.t.extCapsules)
	player.s.points = new Decimal(player.s.points)
	player.s.best = new Decimal(player.s.best)
	player.s.spent = new Decimal(player.s.spent)
	for (let i=1;i<=5;i++) player.s.buildings[i] = new Decimal(player.s.buildings[i])
	player.sb.points = new Decimal(player.sb.points)
	player.sb.best = new Decimal(player.sb.best)
}

function toggleOpt(name) {
	player[name] = !player[name]
}

function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	return m.toStringWithDecimalPlaces(3)+"e"+e.toStringWithDecimalPlaces(0)
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	return num.toStringWithDecimalPlaces(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function format(decimal, precision=3) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN"
	}
	if (decimal.eq(1/0)) return "Infinity"
	if (decimal.gte("eee1000")) return exponentialFormat(decimal, precision)
	else if (decimal.gte("ee1000")) return "ee"+format(decimal.log10().log10())
	else if (decimal.gte("1e1000")) return decimal.div(Decimal.pow(10, decimal.log10().floor())).toStringWithDecimalPlaces(3)+"e"+format(decimal.log10().floor())
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

function showTab(name) {
	if (!TAB_REQS[name]()) return
	player.tab = name
	if (name=="tree") needCanvasUpdate = true;
}

function canBuyMax(layer) {
	switch(layer) {
		case "b": 
			return player.b.best.gte(15)
			break;
		case "g":
			return player.g.best.gte(15)
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
			if (player.e.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.e[12].currently())
			if (player.e.upgrades.includes(13)) mult = mult.times(1e10)
			if (player.e.upgrades.includes(34)) mult = mult.times(1e40)
			if (player.t.unl) mult = mult.times(tmp.timeEff)
			if (player.s.unl && tmp.spaceBuildEff) mult = mult.times(tmp.spaceBuildEff[1])
			break;
		case "b": 
			if (player.b.upgrades.includes(23)) mult = mult.div(LAYER_UPGS.b[23].currently())
			if (player.s.unl && tmp.spaceBuildEff) mult = mult.div(tmp.spaceBuildEff[3])
			break;
		case "g":
			if (player.g.upgrades.includes(22)) mult = mult.div(LAYER_UPGS.g[22].currently())
			if (player.s.unl && tmp.spaceBuildEff) mult = mult.div(tmp.spaceBuildEff[3])
			break;
		case "e": 
			if (player.e.upgrades.includes(24)) mult = mult.times(LAYER_UPGS.e[24].currently())
			break;
	}
	return mult
}

function getResetGain(layer) {
	if (LAYER_TYPE[layer]=="static") {
		if ((!canBuyMax(layer)) || tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(1)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).div(tmp.gainMults[layer]).max(1).log(LAYER_BASE[layer]).pow(Decimal.pow(LAYER_EXP[layer], -1))
		if (gain.gte(12)) gain = gain.times(12).sqrt()
		return gain.floor().sub(player[layer].points).plus(1).max(1);
	}
	if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(0)
	let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).pow(LAYER_EXP[layer]).times(tmp.gainMults[layer])
	return gain.floor().max(0);
}

function getNextAt(layer) {
	if (LAYER_TYPE[layer]=="static") {
		let amt = player[layer].points
		if (amt.gte(12)) amt = amt.pow(2).div(12)
		let extraCost = Decimal.pow(LAYER_BASE[layer], amt.pow(LAYER_EXP[layer])).times(tmp.gainMults[layer])
		return extraCost.times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
	} else return tmp.resetGain[layer].plus(1).div(tmp.gainMults[layer]).root(LAYER_EXP[layer]).times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
}

function layerUnl(layer) {
	switch(layer) {
		case "p":
			return true;
			break;
		case "b":
			return player.p.unl;
			break;
		case "g":
			return player.p.unl;
			break;
		case "e":
			return player.b.unl&&player.g.unl;
			break;
		case "t":
			return player.b.unl;
			break;
		case "s":
			return player.g.unl;
			break;
		case "sb":
			return player.e.unl&&player.t.unl&&player.s.unl;
			break;
	}
}

function rowReset(row, layer) {
	let prev = JSON.parse(JSON.stringify(player)) // Deep Copy
	switch(row) {
		case 0: 
			player.points = new Decimal(0);
			break;
		case 1: 
			player.points = new Decimal(10);
			player.p.points = new Decimal(0);
			if (layer=="b"||layer=="g") {
				if (player[layer].best.lt(8)) player.p.upgrades = [];
			} else if (layer=="t"||layer=="s"||layer=="sb") {
				if (player[layer].best.lt(3)) player.p.upgrades = [];
			} else if (layer=="e") {
				if (player[layer].best.lt(10)) player.p.upgrades = [];
			} else player.p.upgrades = [];
			player.g.power = new Decimal(0);
			break;
		case 2: 
			player.b.points = new Decimal(0);
			player.b.best = new Decimal(0);
			if (!player.t.best.gte(4)) player.b.upgrades = [];
			player.g.points = new Decimal(0);
			player.g.power = new Decimal(0);
			player.g.best = new Decimal(0);
			if (!player.s.best.gte(4)) player.g.upgrades = [];
			player.t.energy = new Decimal(0);
			if (layer=="t"||layer=="e"||layer=="s") {
				if (player[layer].best.gte(2)) {
					player.b.best = new Decimal(prev.b.best)
					player.g.best = new Decimal(prev.g.best)
				}
			} else if (player.sb.best.gte(4)&&layer=="sb") {
				player.b.best = new Decimal(prev.b.best)
				player.g.best = new Decimal(prev.g.best)
			}
			break;
		case 3: 
			player.t.points = new Decimal(0);
			player.t.order = 0
			player.t.best = new Decimal(0);
			player.t.upgrades = [];
			player.t.extCapsules = new Decimal(0);
			player.e.order = 0
			player.e.points = new Decimal(0);
			player.e.best = new Decimal(0);
			player.e.enhancers = new Decimal(0);
			player.e.upgrades = [];
			player.s = {
				unl: player.s.unl,
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
			}
			player.sb = {
				unl: player.sb.unl,
				order: 0,
				points: new Decimal(0),
				best: new Decimal(0),
				upgrades: [],
			}
			break;
	}
}

function doReset(layer, force=false) {
	if (!force) {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return;
		let gain = tmp.resetGain[layer]
		if (LAYER_TYPE[layer]=="static") {
			if (tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return;
			player[layer].points = player[layer].points.plus(canBuyMax(layer)?gain:1)
		} else player[layer].points = player[layer].points.plus(gain)
		player[layer].best = player[layer].best.max(player[layer].points)
	
		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;
			
			let layers = ROW_LAYERS[LAYER_ROW[layer]]
			for (let i in layers) if (!player[layers[i]].unl) player[layers[i]].order++
		}
		
		tmp.layerAmt[layer] = new Decimal(0) // quick fix
	}
	
	if ((layer=="b"&&player.t.best.gte(12))||(layer=="g"&&player.s.best.gte(12))) return;
	let row = LAYER_ROW[layer]
	if (row==0) rowReset(0, layer)
	else for (let x=row;x>=1;x--) rowReset(x, layer)
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
}

function getPointGen() {
	let gain = new Decimal(1)
	if (player.p.upgrades.includes(12)) gain = gain.times(LAYER_UPGS.p[12].currently())
	if (player.p.upgrades.includes(13)) gain = gain.times(LAYER_UPGS.p[13].currently())
	if (player.p.upgrades.includes(22)) gain = gain.times(LAYER_UPGS.p[22].currently())
	if (player.b.unl) gain = gain.times(tmp.layerEffs.b)
	if (player.g.unl) gain = gain.times(tmp.genPowEff)
	if (player.t.unl) gain = gain.times(tmp.timeEff)
	if (player.s.unl && tmp.spaceBuildEff) gain = gain.times(tmp.spaceBuildEff[1])
	return gain
}

function addToBoosterBase() {
	let toAdd = new Decimal(0)
	if (player.b.upgrades.includes(12)) toAdd = toAdd.plus(LAYER_UPGS.b[12].currently())
	if (player.b.upgrades.includes(13)) toAdd = toAdd.plus(LAYER_UPGS.b[13].currently())
	if (player.t.upgrades.includes(11)) toAdd = toAdd.plus(LAYER_UPGS.t[11].currently())
	if (player.t.upgrades.includes(31)) toAdd = toAdd.plus(25)
	if (player.t.upgrades.includes(33)) toAdd = toAdd.plus(40)
	if (player.e.unl) toAdd = toAdd.plus(tmp.enhEff2)
	if (player.e.upgrades.includes(11)) toAdd = toAdd.plus(LAYER_UPGS.e[11].currently().b)
	if (player.s.unl && tmp.spaceBuildEff) toAdd = toAdd.plus(tmp.spaceBuildEff[2])
	if (player.sb.unl) toAdd = toAdd.times(tmp.layerEffs.sb)
	return toAdd
}

function getFreeBoosters() {
	let free = new Decimal(0)
	if (player.t.upgrades.includes(24)) free = free.plus(18)
	return free
}

function addToGenBase() {
	let toAdd = new Decimal(0)
	if (player.g.upgrades.includes(12)) toAdd = toAdd.plus(LAYER_UPGS.g[12].currently())
	if (player.g.upgrades.includes(13)) toAdd = toAdd.plus(LAYER_UPGS.g[13].currently())
	if (player.e.unl) toAdd = toAdd.plus(tmp.enhEff2)
	if (player.e.upgrades.includes(11)) toAdd = toAdd.plus(LAYER_UPGS.e[11].currently().g)
	if (player.s.unl && tmp.spaceBuildEff) toAdd = toAdd.plus(tmp.spaceBuildEff[2])
	return toAdd
}

function getGenPowerGainMult() {
	let mult = new Decimal(1)
	if (player.g.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.g[21].currently())
	if (player.g.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.g[25].currently())
	if (player.e.upgrades.includes(35)) mult = mult.times(LAYER_UPGS.e[35].currently())
	if (player.s.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.s[12].currently())
	if (player.s.upgrades.includes(13)) mult = mult.times(LAYER_UPGS.s[13].currently())
	return mult
}

function getGenPowerEffExp() {
	let exp = new Decimal(1/3)
	if (player.s.upgrades.includes(34)) exp = exp.plus(LAYER_UPGS.s[34].currently())
	if (player.b.upgrades.includes(21)) exp = exp.times(2)
	if (player.b.upgrades.includes(22)) exp = exp.times(1.2)
	if (player.e.upgrades.includes(21)) exp = exp.times(1.15)
	return exp;
}

function getGenPowerEff() {
	let eff = player.g.power.plus(1).pow(getGenPowerEffExp());
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

function getEnhancerCost() {
	let e = player.e.enhancers
	if (e.gte(25)) e = e.pow(2).div(25)
	let cost = Decimal.pow(2, e.pow(1.5))
	return cost.floor()
}

function getEnhancerPow() {
	let pow = new Decimal(1)
	if (player.e.upgrades.includes(25)) pow = pow.times(LAYER_UPGS.e[25].currently())
	if (player.e.upgrades.includes(31)) pow = pow.times(LAYER_UPGS.e[31].currently())
	return pow
}

function getEnhancerEff() {
	if (!player.e.unl) return new Decimal(1)
	let eff = Decimal.pow(25, player.e.enhancers.times(tmp.enhPow).pow(1.1))
	return eff
}

function getEnhancerEff2() {
	if (!player.e.unl) return new Decimal(0)
	let eff = player.e.enhancers.times(tmp.enhPow).pow(0.8)
	return eff;
}

function buyEnhancer() {
	let cost = getEnhancerCost()
	if (player.e.points.lt(cost)) return
	player.e.points = player.e.points.sub(cost)
	player.e.enhancers = player.e.enhancers.plus(1)
}

function getFreeExtCapsules() {
	let amt = new Decimal(0)
	if (player.t.upgrades.includes(12)) amt = amt.plus(1)
	return amt
}

function getTimeEnergyEff() {
	if (!player.t.unl) return new Decimal(1)
	let exp = 1.2
	if (player.t.upgrades.includes(21)) exp = 1.75
	let eff = player.t.energy.plus(1).pow(exp)
	return eff;
}

function getTimeEnergyGainMult() {
	if (!player.t.unl) return new Decimal(1)
	let mult = new Decimal(1);
	if (player.t.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.t[21].currently())
	if (player.t.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.t[22].currently())
	if (player.t.upgrades.includes(23)) mult = mult.times(LAYER_UPGS.t[23].currently())
	if (player.t.upgrades.includes(34)) mult = mult.times(LAYER_UPGS.t[34].currently())
	return mult;
}

function getTimeEnergyLimitMult() {
	if (!player.t.unl) return new Decimal(1)
	let mult = new Decimal(1);
	if (player.t.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.t[12].currently())
	if (player.t.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.t[21].currently())
	if (player.t.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.t[22].currently())
	if (player.t.upgrades.includes(23)) mult = mult.times(LAYER_UPGS.t[23].currently())
	if (player.t.upgrades.includes(34)) mult = mult.times(LAYER_UPGS.t[34].currently())
	return mult;
}

function getExtCapsuleCost() {
	let amt = player.t.extCapsules
	if (amt.gte(25)) amt = amt.pow(2).div(25)
	let cost = amt.times(0.4).pow(1.2).plus(1).times(10)
	return cost.floor()
}

function buyExtCapsule() {
	if (!player.t.unl) return
	let cost = getExtCapsuleCost()
	if (player.b.points.lt(cost)) return
	player.b.points = player.b.points.sub(cost)
	player.t.extCapsules = player.t.extCapsules.plus(1)
}

function getSpace() {
	let baseSpace = player.s.best.pow(1.1).times(3).floor()
	if (player.s.upgrades.includes(13)) baseSpace = baseSpace.plus(2);
	if (player.s.upgrades.includes(24)) baseSpace = baseSpace.plus(3);
	return baseSpace.sub(player.s.spent)
}

function getSpaceBuildingCostMod() {
	let mod = new Decimal(1)
	if (player.s.upgrades.includes(24)) mod = new Decimal(0.5)
	return mod;
}

function getSpaceBuildingCost(x) {
	let inputVal = new Decimal([1e3,1e10,1e25,1e48,1e100][x-1])
	let bought = player.s.buildings[x]
	let cost = Decimal.pow(inputVal, bought.times(getSpaceBuildingCostMod()).pow(1.35)).times(inputVal).times((bought.gt(0)||x>1)?1:0)
	return cost
}

function getSpaceBuildingPow() {
	if (!player.s.unl) return new Decimal(0)
	let pow = new Decimal(1)
	if (player.s.upgrades.includes(21)) pow = pow.times(LAYER_UPGS.s[21].currently())
	if (player.s.upgrades.includes(22)) pow = pow.times(LAYER_UPGS.s[22].currently())
	if (player.s.upgrades.includes(23)) pow = pow.times(LAYER_UPGS.s[23].currently())
	return pow
}

function getExtraBuildingLevels(x) {
	let lvl = new Decimal(0)
	if (player.s.upgrades.includes(11)) lvl = lvl.plus(1);
	if (player.s.upgrades.includes(14)) lvl = lvl.plus(1);
	if (x<5) lvl = lvl.plus(tmp.spaceBuildEff[5])
	return lvl
}

function getSpaceBuildingEff(x) {
	let bought = player.s.buildings[x].plus(getExtraBuildingLevels(x));
	if (!player.s.unl) bought = new Decimal(0);
	if (tmp.sbUnl<x) bought = new Decimal(0);
	let power = getSpaceBuildingPow()
	bought = bought.times(power)
	switch(x) {
		case 1: 
			return Decimal.pow(Decimal.add(1, bought.pow(player.s.upgrades.includes(31)?2.75:1)), player.s.points.sqrt()).times(Decimal.mul(4, bought.pow(player.s.upgrades.includes(31)?2.75:1))).max(1)
			break;
		case 2: 
			return bought.sqrt()
			break;
		case 3: 
			return Decimal.pow(1e18, bought.pow(0.9))
			break;
		case 4: 
			return bought.plus(1).pow(1.25)
			break;
		case 5: 
			return bought.sqrt().times(2)
			break;
	}
}

function getSpaceBuildingEffDesc(x) {
	let eff = tmp.spaceBuildEff[x]
	switch(x) {
		case 1: 
			return "Space Energy boosts Point gain & Prestige Point gain ("+format(eff)+"x)"
			break;
		case 2: 
			return "Adds to base of Booster/Generator effects by "+format(eff)
			break;
		case 3: 
			return "Makes Boosters/Generators cheaper by "+format(eff)+"x"
			break;
		case 4: 
			return "Booster Upgrade 6's effect is raised to the power of "+format(eff)
			break;
		case 5: 
			return "Add "+format(eff)+" free levels to all previous Space Buildings."
			break;
	}
}

function buyBuilding(x) {
	if (!player.s.unl) return
	if (tmp.sbUnl<x) return
	if (getSpace().lt(1)) return
	let cost = getSpaceBuildingCost(x)
	if (player.g.power.lt(cost)) return
	player.g.power = player.g.power.sub(cost)
	player.s.spent = player.s.spent.plus(1)
	player.s.buildings[x] = player.s.buildings[x].plus(1)
}

function respecSpaceBuildings() {
	if (!player.s.unl) return;
	if (!confirm("Are you sure you want to reset your Space Buildings? This will force you to do a Space reset as well!")) return
	for (let i=1;i<=5;i++) player.s.buildings[i] = new Decimal(0)
	player.s.spent = new Decimal(0)
	doReset("s", true)
}

function getSpaceBuildingsUnl() {
	let x = 3
	if (player.s.upgrades.includes(14)) x++;
	if (player.s.upgrades.includes(32)) x++;
	return x;
}

function toggleAuto(layer) {
	if (player[layer].auto===undefined) return;
	player[layer].auto = !player[layer].auto
}

function getSuperBoosterPow() {
	let pow = new Decimal(1)
	if (player.sb.upgrades.includes(11)) pow = pow.times(LAYER_UPGS.sb[11].currently())
	if (player.sb.upgrades.includes(12)) pow = pow.times(LAYER_UPGS.sb[12].currently())
	return pow;
}

function gameLoop(diff) {
	if (isNaN(diff)) diff = 0;
	player.timePlayed += diff
	if (player.p.upgrades.includes(11)) player.points = player.points.plus(tmp.pointGen.times(diff))
	if (player.g.unl) player.g.power = player.g.power.plus(tmp.layerEffs.g.times(diff))
	if (player.g.best.gte(10)) player.p.points = player.p.points.plus(tmp.resetGain.p.times(diff))
	if (player.t.unl) {
		let data = tmp.layerEffs.t
		player.t.energy = player.t.energy.plus(data.gain.times(diff)).min(data.limit)
	}
	if (player.b.auto&&player.t.best.gte(5)) doReset("b")
	if (player.g.auto&&player.s.best.gte(5)) doReset("g")
	
	if (player.hasNaN&&!NaNalert) {
		alert("We have detected a corruption in your save. Please visit https://discord.gg/wwQfgPa for help.")
		NaNalert = true;
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
	if (player.autosave) save();
}, 5000)

var interval = setInterval(function() {
	if (player===undefined) return;
	let diff = (Date.now()-player.time)/1000
	player.time = Date.now()
	if (needCanvasUpdate) resizeCanvas();
	updateTemp();
	gameLoop(diff)
}, 50)

document.onkeydown = function(e) {
	if (player===undefined) return;
	let shiftDown = e.shiftKey
	let key = e.key
	if (!LAYERS.includes(key)) {
		switch(key) {
			case "B": 
				if (player.sb.unl) doReset("sb")
				break;
		}
	} else if (player[key].unl) doReset(key)
}