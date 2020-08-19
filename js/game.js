var player;
var needCanvasUpdate = true;

function getStartPlayer() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
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
		},
		g: {
			unl: false,
			points: new Decimal(0),
			power: new Decimal(0),
			best: new Decimal(0),
			upgrades: [],
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
				3: new Decimal(0)
			},
			upgrades: [],
		},
	}
}

const LAYERS = ["p", "b", "g", "e", "t", "s"]

const LAYER_REQS = {
	p: new Decimal(10),
	b: new Decimal(200),
	g: new Decimal(200),
	e: new Decimal(1e120),
	t: new Decimal(1e120),
	s: new Decimal(1e120),
}

const LAYER_RES = {
	p: "prestige points",
	b: "boosters",
	g: "generators",
	e: "enhance points",
	t: "time capsules",
	s: "space energy",
}

const LAYER_TYPE = {
	p: "normal",
	b: "static",
	g: "static",
	e: "normal",
	t: "static",
	s: "static",
}

const LAYER_EXP = {
	p: new Decimal(0.5),
	b: new Decimal(1.25),
	g: new Decimal(1.25),
	e: new Decimal(0.02),
	t: new Decimal(2),
	s: new Decimal(2),
}

const LAYER_BASE = {
	b: new Decimal(5),
	g: new Decimal(5),
	t: new Decimal(1e15),
	s: new Decimal(1e15),
}

const LAYER_ROW = {
	p: 0,
	b: 1,
	g: 1,
	e: 2,
	t: 2,
	s: 2,
	future_layer: 3,
}

const ROW_LAYERS = [
	["p"],
	["b","g"],
	["e","t","s"],
	["future_layer"],
]

const LAYER_EFFS = {
	b: function() { return Decimal.pow(Decimal.add(2, addToBoosterBase()), player.b.points) },
	g: function() { return Decimal.pow(Decimal.add(2, addToGenBase()), player.g.points).sub(1).times(getGenPowerGainMult()) },
	t: function() { return {
		gain: Decimal.pow(3, player.t.points.plus(player.t.extCapsules)).sub(1),
		limit: Decimal.pow(2, player.t.points.plus(player.t.extCapsules)).sub(1).times(100),
	}},
}

const LAYER_UPGS = {
	p: {
		rows: 2,
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
				return ret;
			},
			effDisp: function(x) { return format(x)+"x" },
		},
	},
	b: {
		rows: 2,
		cols: 3,
		11: {
			desc: "Boosters boost Prestige Point gain.",
			cost: new Decimal(3),
			unl: function() { return player.b.unl },
			currently: function() { return player.b.points.sqrt().plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		12: {
			desc: "Generators add to the Booster effect.",
			cost: new Decimal(7),
			unl: function() { return player.g.unl },
			currently: function() { return player.g.points.plus(1).log10().sqrt().div(3) },
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
			currently: function() { return player.points.plus(1).log10().plus(1).pow(3.2) },
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
			currently: function() { return player.g.points.sqrt().plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
		12: {
			desc: "Boosters boost Generator Power gain.",
			cost: new Decimal(7),
			unl: function() { return player.b.unl },
			currently: function() { return player.b.points.plus(1).log10().sqrt().div(3) },
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
			currently: function() { return player.g.points.sqrt().plus(1) },
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
			currently: function() { return player.p.points.plus(1).log10().sqrt().plus(1) },
			effDisp: function(x) { return format(x)+"x" },
		},
	},
	e: {
		rows: 0,
		cols: 0,
	},
	t: {
		rows: 0,
		cols: 0,
	},
	s: {
		rows: 0,
		cols: 0,
	},
}

const TAB_REQS = {
	tree: function() { return true },
	options: function() { return true },
	p: function() { return (player.p.unl||player.points.gte(getLayerReq('p')))&&layerUnl('p') },
	b: function() { return (player.b.unl||player.points.gte(getLayerReq('b')))&&layerUnl('b') },
	g: function() { return (player.g.unl||player.points.gte(getLayerReq('g')))&&layerUnl('g') },
	e: function() { return (player.e.unl||player.points.gte(getLayerReq('e')))&&layerUnl('e') },
	t: function() { return (player.t.unl||player.points.gte(getLayerReq('t')))&&layerUnl('t') },
	s: function() { return (player.s.unl||player.points.gte(getLayerReq('s')))&&layerUnl('s') },
}

function getLayerEffDesc(layer) {
	if (!Object.keys(LAYER_EFFS).includes(layer)) return "???"
	let eff = LAYER_EFFS[layer]()
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
	}
}

function save() {
	localStorage.setItem("prestige-tree", btoa(JSON.stringify(player)))
}

function load() {
	let get = localStorage.getItem("prestige-tree");
	if (get==null) player = getStartPlayer()
	else player = JSON.parse(atob(get))
	player.tab = "tree"
	checkForVars();
	convertToDecimal();
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

function importSave() {
	let imported = prompt("Paste your save here")
	try {
		player = JSON.parse(atob(imported))
		save()
		window.location.reload()
	} catch(e) {
		return;
	}
}

function checkForVars() {
	if (player.autosave===undefined) player.autosave = true;
	if (player.b===undefined) player.b = getStartPlayer().b
	if (player.g===undefined) player.g = getStartPlayer().g
	if (player.p.best===undefined) player.p.best = player.p.points
	if (player.b.best===undefined) player.b.best = player.b.points
	if (player.g.best===undefined) player.g.best = player.g.points
	if (player.e === undefined) player.e = getStartPlayer().e
	if (player.e.order === undefined) player.e.order = 0
	if (player.t === undefined) player.t = getStartPlayer().t
	if (player.s === undefined) player.s = getStartPlayer().s
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
	for (let i=1;i<=3;i++) player.s.buildings[i] = new Decimal(player.s.buildings[i])
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
	if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
	else return commaFormat(decimal, precision)
}

function formatWhole(decimal) {
	return format(decimal, 0)
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
			req = req.times(Decimal.pow("10^^1000", player.e.order))
			break;
		case "t": 
			req = req.times(Decimal.pow("10^^1000", player.t.order))
			break;
		case "s": 
			req = req.times(Decimal.pow("10^^1000", player.s.order))
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
			if (player.b.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.b[11].currently())
			if (player.g.upgrades.includes(11)) mult = mult.times(LAYER_UPGS.g[11].currently())
			if (player.e.unl) mult = mult.times(getEnhancerEff())
			if (player.t.unl) mult = mult.times(getTimeEnergyEff())
			if (player.s.unl) mult = mult.times(getSpaceBuildingEff(1))
			break;
		case "b": 
			if (player.b.upgrades.includes(23)) mult = mult.div(LAYER_UPGS.b[23].currently())
			if (player.s.unl) mult = mult.div(getSpaceBuildingEff(3))
			break;
		case "g":
			if (player.g.upgrades.includes(22)) mult = mult.div(LAYER_UPGS.g[22].currently())
			if (player.s.unl) mult = mult.div(getSpaceBuildingEff(3))
			break;
	}
	return mult
}

function getResetGain(layer) {
	if (LAYER_TYPE[layer]=="static") {
		if ((!canBuyMax(layer)) || player.points.lt(getLayerReq(layer))) return new Decimal(1)
		let gain = player.points.div(getLayerReq(layer)).div(getLayerGainMult(layer)).max(1).log(LAYER_BASE[layer]).pow(Decimal.pow(LAYER_EXP[layer], -1))
		if (gain.gte(12)) gain = gain.times(12).sqrt()
		return gain.floor().sub(player[layer].points).plus(1).max(1);
	}
	if (player.points.lt(getLayerReq(layer))) return new Decimal(0)
	let gain = player.points.div(getLayerReq(layer)).pow(LAYER_EXP[layer]).times(getLayerGainMult(layer))
	return gain.floor().max(0);
}

function getNextAt(layer) {
	if (LAYER_TYPE[layer]=="static") {
		let amt = player[layer].points
		if (amt.gte(12)) amt = amt.pow(2).div(12)
		let extraCost = Decimal.pow(LAYER_BASE[layer], amt.pow(LAYER_EXP[layer])).times(getLayerGainMult(layer))
		return extraCost.times(getLayerReq(layer)).max(getLayerReq(layer))
	} else return getResetGain(layer).plus(1).div(getLayerGainMult(layer)).root(LAYER_EXP[layer]).times(getLayerReq(layer)).max(getLayerReq(layer))
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
			} else player.p.upgrades = [];
			player.g.power = new Decimal(0);
			break;
		case 2: 
			player.b.points = new Decimal(0);
			player.b.best = new Decimal(0);
			player.b.upgrades = [];
			player.g.points = new Decimal(0);
			player.g.power = new Decimal(0);
			player.g.best = new Decimal(0);
			player.g.upgrades = [];
			player.t.energy = new Decimal(0);
			if (layer=="t"||layer=="e"||layer=="s") {
				if (player[layer].best.gte(2)) {
					player.b.best = new Decimal(prev.b.best)
					player.g.best = new Decimal(prev.g.best)
				}
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
					3: new Decimal(0)
				},
				upgrades: [],
			}
			break;
	}
}

function doReset(layer, force=false) {
	if (!force) {
		if (player.points.lt(getLayerReq(layer))) return;
		let gain = getResetGain(layer)
		if (LAYER_TYPE[layer]=="static") {
			if (player.points.lt(getNextAt(layer))) return;
			player[layer].points = player[layer].points.plus(canBuyMax(layer)?gain:1)
		} else player[layer].points = player[layer].points.plus(gain)
		player[layer].best = player[layer].best.max(player[layer].points)
	
		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;
			
			let layers = ROW_LAYERS[LAYER_ROW[layer]]
			for (let i in layers) if (!player[layers[i]].unl) player[layers[i]].order++
		}
	}
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
}

function getPointGen() {
	let gain = new Decimal(1)
	if (player.p.upgrades.includes(12)) gain = gain.times(LAYER_UPGS.p[12].currently())
	if (player.p.upgrades.includes(13)) gain = gain.times(LAYER_UPGS.p[13].currently())
	if (player.p.upgrades.includes(22)) gain = gain.times(LAYER_UPGS.p[22].currently())
	if (player.b.unl) gain = gain.times(LAYER_EFFS.b())
	if (player.g.unl) gain = gain.times(getGenPowerEff())
	if (player.t.unl) gain = gain.times(getTimeEnergyEff())
	if (player.s.unl) gain = gain.times(getSpaceBuildingEff(1))
	return gain
}

function addToBoosterBase() {
	let toAdd = new Decimal(0)
	if (player.b.upgrades.includes(12)) toAdd = toAdd.plus(LAYER_UPGS.b[12].currently())
	if (player.b.upgrades.includes(13)) toAdd = toAdd.plus(LAYER_UPGS.b[13].currently())
	if (player.e.unl) toAdd = toAdd.plus(getEnhancerEff2())
	if (player.s.unl) toAdd = toAdd.plus(getSpaceBuildingEff(2))
	return toAdd
}

function addToGenBase() {
	let toAdd = new Decimal(0)
	if (player.g.upgrades.includes(12)) toAdd = toAdd.plus(LAYER_UPGS.g[12].currently())
	if (player.g.upgrades.includes(13)) toAdd = toAdd.plus(LAYER_UPGS.g[13].currently())
	if (player.e.unl) toAdd = toAdd.plus(getEnhancerEff2())
	if (player.s.unl) toAdd = toAdd.plus(getSpaceBuildingEff(2))
	return toAdd
}

function getGenPowerGainMult() {
	let mult = new Decimal(1)
	if (player.g.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.g[21].currently())
	if (player.g.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.g[25].currently())
	return mult
}

function getGenPowerEff() {
	let eff = player.g.power.plus(1).cbrt();
	if (player.b.upgrades.includes(21)) eff = eff.pow(2);
	if (player.b.upgrades.includes(22)) eff = eff.pow(1.2);
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
	}
	resizeCanvas();
}

function getEnhancerCost() {
	let cost = Decimal.pow(2, player.e.enhancers.pow(1.5))
	return cost
}

function getEnhancerEff() {
	if (!player.e.unl) return new Decimal(1)
	let eff = Decimal.pow(25, player.e.enhancers.pow(1.1))
	return eff
}

function getEnhancerEff2() {
	if (!player.e.unl) return new Decimal(0)
	let eff = player.e.enhancers.pow(0.8)
	return eff;
}

function buyEnhancer() {
	let cost = getEnhancerCost()
	if (player.e.points.lt(cost)) return
	player.e.points = player.e.points.sub(cost)
	player.e.enhancers = player.e.enhancers.plus(1)
}

function getTimeEnergyEff() {
	if (!player.t.unl) return new Decimal(1)
	let eff = player.t.energy.plus(1).pow(1.2)
	return eff;
}

function getExtCapsuleCost() {
	let cost = player.t.extCapsules.times(0.4).pow(1.2).plus(1).times(10)
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
	return baseSpace.sub(player.s.spent)
}

function getSpaceBuildingCost(x) {
	let inputVal = new Decimal([1e3,1e10,1e25][x-1])
	let bought = player.s.buildings[x]
	let cost = Decimal.pow(inputVal, bought.pow(1.35)).times(inputVal).times((bought.gt(0)||x>1)?1:0)
	return cost
}

function getSpaceBuildingEff(x) {
	let bought = player.s.buildings[x];
	if (!player.s.unl) bought = new Decimal(0);
	switch(x) {
		case 1: 
			return Decimal.pow(Decimal.add(1, bought), player.s.points.sqrt()).times(Decimal.mul(4, bought)).max(1)
			break;
		case 2: 
			return bought.sqrt()
			break;
		case 3: 
			return Decimal.pow(10, bought.pow(2.5))
			break;
	}
}

function getSpaceBuildingEffDesc(x) {
	let eff = getSpaceBuildingEff(x)
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
	}
}

function buyBuilding(x) {
	if (!player.s.unl) return
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
	for (let i=1;i<=3;i++) player.s.buildings[i] = new Decimal(0)
	player.s.spent = new Decimal(0)
	doReset("space", true)
}

function gameLoop(diff) {
	if (player.p.upgrades.includes(11)) player.points = player.points.plus(getPointGen().times(diff))
	if (player.g.unl) player.g.power = player.g.power.plus(LAYER_EFFS.g().times(diff))
	if (player.g.best.gte(10)) player.p.points = player.p.points.plus(getResetGain("p").times(diff))
	if (player.t.unl) {
		let data = LAYER_EFFS.t()
		player.t.energy = player.t.energy.plus(data.gain.times(diff)).min(data.limit)
	}
}

function hardReset() {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return
	player = getStartPlayer()
	save();
	window.location.reload();
}

var saveInterval = setInterval(function() {
	if (player.autosave) save();
}, 5000)

var interval = setInterval(function() {
	let diff = (Date.now()-player.time)/1000
	player.time = Date.now()
	if (needCanvasUpdate && player.tab=="tree") resizeCanvas();
	gameLoop(diff)
}, 50)