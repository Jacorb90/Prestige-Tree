var player;
var tmp = {};
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;
var styleCooldown = 0;
let VERSION = {
	num: 1.2,
	name: "The Mechanical Update"
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.beta ? " Beta " + VERSION.beta : "") + (VERSION.patch ? (" Patch " + VERSION.patch) : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")

const ENDGAME = new Decimal("e1e11");

function getStartPlayer() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		notify: {},
		msDisplay: "always",
		offlineProd: true,
		hideHindrances: false,
		oldStyle: false,
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
			upgrades: [],
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
			auto: false,
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
			autoBuild: false,
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
			enhancements: new Decimal(0),
		},
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
	updateStyle();
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
	if (player.notify === undefined) player.notify = {}
	for (var i=0; i<Object.keys(LAYER_DATA).length; i++) {
		var layer = Object.keys(LAYER_DATA)[i]

		if (player[layer] === undefined) player[layer] = start[layer]
		else if (player[layer].total === undefined && start[layer].total !== undefined) player[layer].total = Decimal.max(player[layer].points, player[layer].best).max(0)

		if (LAYER_UPGS[layer] !== undefined && player[layer].upgrades === undefined) player[layer].upgrades = []
		if (LAYER_UPGS[layer] === undefined && player[layer].upgrades !== undefined) delete player[layer].upgrades

		if (LAYER_CHALLS[layer] !== undefined && player[layer].challs === undefined) player[layer].challs = []
		if (LAYER_CHALLS[layer] === undefined && player[layer].challs !== undefined) delete player[layer].challs
		
		if (player.notify[layer] === undefined) player.notify[layer] = 0
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
	if (player.hideHindrances === undefined) player.hideHindrances = false
}

function convertToDecimal() {
	player.points = new Decimal(player.points)
	for (var i=0; i<Object.keys(LAYER_DATA).length; i++) {
		var data = player[Object.keys(LAYER_DATA)[i]]
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
	if (name == "oldStyle" && styleCooldown>0) return;
	
	player[name] = !player[name]
	if (name == "hqTree") changeTreeQuality()
	if (name == "oldStyle") updateStyle()
}

function changeTreeQuality() {
	var on = player.hqTree
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid")
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset")
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "")
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none")
}

function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff")
	css.href = player.oldStyle?"oldStyle.css":"style.css"
	needCanvasUpdate = true;
}

function toPlaces(x, precision, maxAccepted) {
	x = new Decimal(x)
	let result = x.toStringWithDecimalPlaces(precision)
	if (new Decimal(result).gte(maxAccepted)) {
		result = new Decimal(maxAccepted-Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
	}
	return result
}

function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	return toPlaces(m, precision, 10)+"e"+formatWhole(e)
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return toPlaces(num, precision, 1e9).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function fixValue(x, y = 0) {
	return x || new Decimal(y)
}

function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision=2) {
	if (decimal=="X") return "X"
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
		else return "10^^" + commaFormat(slog, 2)
	} else if (decimal.gte("e1e6")) return "e"+formatWhole(decimal.log10(), 2)
	else if (decimal.gte("1e1000")) return exponentialFormat(decimal, Math.max(3-(decimal.log10().log10().toNumber()-3), 0))
	else if (decimal.gte(1e9)) return exponentialFormat(decimal, 3)
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
	if (LAYER_DATA[name] && !layerUnl(name)) return

	var toTreeTab = name == "tree"
	player.tab = name
	
	if (toTreeTab != onTreeTab) {
		document.getElementById("treeTab").className = toTreeTab ? "fullWidth" : "col left"
		onTreeTab = toTreeTab
		resizeCanvas()
	}
	player.notify[name] = 0
}

function notifyLayer(name) {
	if (player.tab == name || !layerUnl(name)) return
	player.notify[name] = 1
}

function updateNotifies() {
	// Excuse my gross spaghetti code
	for (let layer in LAYER_DATA) if (LAYER_UPGS[layer]) for (let r=1;r<=LAYER_UPGS[layer].rows;r++) for (let c=1;c<=LAYER_UPGS[layer].cols;c++) if (player[layer][LAYER_UPGS[layer].varType||'points'].gte(LAYER_UPGS[layer][r*10+c].cost)&&!player[layer].upgrades.includes(r*10+c)&&LAYER_UPGS[layer][r*10+c].unl()) notifyLayer(layer)
	
	for (let i=1;i<=SPACE_BUILDINGS.max;i++) if (HYPERSPACE.canSuperUpg(i)) notifyLayer("hs")
}

function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(new Decimal(gain).max(0)).max(0)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp.resetGain[layer].times(diff))
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

function toggleAuto(layer, end="") {
	player[layer]["auto"+end] = !player[layer]["auto"+end]
}

function keepGoing() {
	player.keepGoing = true;
	needCanvasUpdate = true;
	onTreeTab = true;
	showTab("tree")
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

function gameLoop(diff) {
	if (player.points.gte(ENDGAME) || gameEnded) gameEnded = 1

	if (isNaN(diff)) diff = 0
	if (gameEnded && !player.keepGoing) {
		diff = 0
		player.tab = "gameEnded"
	}
	styleCooldown = Math.max(styleCooldown-diff, 0)
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
		if ((player.i.progress >= 1)||(player.ma.best.gte(5)&&player.i.building)) {
			player.i.progress = 0
			player.i.extraBuildings = player.i.extraBuildings.add(1)
			delete player.i.building
		}
	}
	if (player.mb.total.gte(3)) generatePoints("l", diff)
	if (player.mb.total.gte(5)) generatePoints("hs", diff)
	if (player.mb.total.gte(10)) generatePoints("sp", diff)
	if (player.ge.best.gte(1e200)) {
		generatePoints("ge", Decimal.div(diff, 100))
		generatePoints("ma", Decimal.div(diff, 100))
	}

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
	if (player.hs.auto&&player.ma.best.gte(1e15)) maxHyperspace()
	if (player.i.autoBuild&&player.ma.best.gte(1e15)) maxImperiumBuildings()

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

var notifyInterval = setInterval(function() {
	updateNotifies();
}, 1000)

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
	document.body.style.setProperty("--locked", aqua ? "#c4a7b3" : "#bf8f8f")
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
	} else if ((!LAYER_DATA[key]) || ctrlDown || shiftDown) {
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