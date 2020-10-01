var player;
var tmp = {};
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;

let VERSION = {
	num: "1.1.1",
	name: "Enhanced Edition"
}

function startPlayerBase() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		notify: {},
		msDisplay: "always",
		offlineProd: true,
		versionType: "Modding",
		version: VERSION.num,
		beta: VERSION.beta,
		timePlayed: 0,
		keepGoing: false,
		hasNaN: false,
		points: new Decimal(10),
	}
}

function getStartPlayer() {
	playerdata = startPlayerBase()
	for (layer in layers){
		playerdata[layer] = layers[layer].startData()
		playerdata[layer].buyables = getStartBuyables(layer)
		playerdata[layer].spentOnBuyables = new Decimal(0)

	}
	return playerdata
}

function getPointGen() {
	let gain = new Decimal(1)
	if (player.c.upgrades.includes(12)) gain = gain.times(layers.c.upgrades["12"].effect())
	return gain
}

// Function to determine if the player is in a challenge
function inChallenge(layer, id){
	if (player.c.active==x) return true

	if (layers[layer].challs[id].countsAs)
		return layers[layer].challs[id].countsAs.includes(id)
}

function save() {
	localStorage.setItem("prestige-tree", btoa(JSON.stringify(player)))
}

function fixSave() {
	defaultData = startPlayerBase()
	for (datum in defaultData){
		if (player[datum] == undefined){
			player[datum] = defaultData[datum]
		}
	}
	for (layer in layers) {
		defaultData = layers[layer].startData()

		for (datum in defaultData){
			if (player[layer][datum] == undefined){
				player[layer][datum] = defaultData[datum]
			}
		}

		if (player[layer].spentOnBuyables == undefined)
			player[layer].spentOnBuyables = new Decimal(0)

		if (layers[layer].buyables) {
			if (player[layer].buyables == undefined) player[layer].buyables = {}

			for (id in layers[layer].buyables){
				if (player[layer].buyables[id] == undefined && !isNaN(id))
					player[layer].buyables[id] = new Decimal(0)
			}
		}
	}
}

function load() {
	let get = localStorage.getItem("prestige-tree");
	if (get===null || get===undefined) player = getStartPlayer()
	else player = Object.assign(getStartPlayer(), JSON.parse(atob(get)))
	fixSave()

	player.tab = "tree"
	if (player.offlineProd) {
		if (player.offTime === undefined) player.offTime = { remain: 0 }
		player.offTime.remain += (Date.now() - player.time) / 1000
	}
	player.time = Date.now();
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

function importSave(imported=undefined, forced=false) {
	if (imported===undefined) imported = prompt("Paste your save here")
	try {
		tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)))
		if(tempPlr.versionType != modInfo.id && !forced) // Wrong save (use "Forced" to force it to accept.)
			return
		player = tempPlr;
		player.versionType = modInfo.id
		fixSave()	
		save()
		window.location.reload()
	} catch(e) {
		return;
	}
}

function versionCheck() {
	let setVersion = true
	
	if (player.versionType===undefined||player.version===undefined) {
		player.versionType = "Modding"
		player.version = 0
	}
	
	if (setVersion) {
		if (player.versionType == "Modding" && VERSION.num > player.version) player.keepGoing = false
		player.versionType = getStartPlayer().versionType
		player.version = VERSION.num
		player.beta = VERSION.beta
	}
}


function convertToDecimal() {
	player.points = new Decimal(player.points)
	for (layer in layers) {
		player[layer].points = new Decimal(player[layer].points)
		if (player[layer].best != undefined) player[layer].best = new Decimal(player[layer].best)
		if (player[layer].total !== undefined) player[layer].total = new Decimal(player[layer].total)
		player[layer].spentOnBuyables = new Decimal(player[layer].spentOnBuyables)

		if (player[layer].buyables != undefined) {
			for (id in player[layer].buyables)
				player[layer].buyables[id] = new Decimal(player[layer].buyables[id])
		}
		player[layer].best = new Decimal(player[layer].best)

		if (layers[layer].convertToDecimal) layers[layer].convertToDecimal();
	}
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

function format(decimal, precision=2) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN"
	}
	if (decimal.sign<0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.gte("eeee1000")) {
		var slog = decimal.slog()
		if (slog.gte(1e6)) return "F" + format(slog.floor())
		else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
	} else if (decimal.gte("1e1000")) return (Math.floor(decimal.mantissa + 0.01) + ("e"+formatWhole(decimal.log10())))
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

function getResetGain(layer) {
	if (tmp.gainExp[layer].eq(0)) return new Decimal(0)
	if (layers[layer].type=="static") {
		if ((!layers[layer].canBuyMax()) || tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(1)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).div(tmp.gainMults[layer]).max(1).log(layers[layer].base).times(tmp.gainExp[layer]).pow(Decimal.pow(layers[layer].exponent, -1))
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return new Decimal(0)
		let gain = tmp.layerAmt[layer].div(tmp.layerReqs[layer]).pow(layers[layer].exponent).times(tmp.gainMults[layer]).pow(tmp.gainExp[layer])
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	}
}

function getNextAt(layer) {
	if (tmp.gainExp[layer].eq(0)) return new Decimal(1/0)
	if (layers[layer].type=="static") {
		let amt = player[layer].points
		let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp.gainExp[layer])).times(tmp.gainMults[layer])
		let cost = extraCost.times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (layers[layer].resCeil) cost = cost.ceil()
		return cost;
	} else {
		let next = tmp.resetGain[layer].add(1)
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp.gainExp[layer]).div(tmp.gainMults[layer]).root(layers[layer].exponent).times(tmp.layerReqs[layer]).max(tmp.layerReqs[layer])
		if (layers[layer].resCeil) next = next.ceil()
		return next;
	}
}

function nodeShown(layer) {
	if (layers[layer].layerShown()) return true
	switch(layer) {
		case "idk":
			return player.l.unl
			break;
	}
	return false
}

function layerUnl(layer) {
	return LAYERS.includes(layer) && (player[layer].unl || (tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) && layers[layer].layerShown()))
}

function rowReset(row, layer) {
	for (lr in ROW_LAYERS[row]){
		if(layers[lr].doReset)
			layers[lr].doReset(layer)
		else
			if(layers[layer].row > layers[lr].row) fullLayerReset(lr)
	}
}

function fullLayerReset(layer) {
	player[layer] = layers[layer].startData();
	resetBuyables(layer)
}

function resetBuyables(layer){
	if (layers[layer].buyables) 
		player[layer].buyables = getStartBuyables(layer)
	player[layer].spentOnBuyables = new Decimal(0)
}

function getStartBuyables(layer){
	let data = {}
	if (layers[layer].buyables) {
		for (id in layers[layer].buyables)
			if (!isNaN(id))
				data[id] = new Decimal(0)
	}
	return data
}

function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp.resetGain[layer].times(diff))
}

var prevOnReset
function doReset(layer, force=false) {
	let row = layers[layer].row
	if (!force) {
		if (tmp.layerAmt[layer].lt(tmp.layerReqs[layer])) return;
		let gain = tmp.resetGain[layer]
		if (layers[layer].type=="static") {
			if (tmp.layerAmt[layer].lt(tmp.nextAt[layer])) return;
			gain =(layers[layer].canBuyMax() ? gain : 1)
		} 
		
		if (layers[layer].onPrestige)
			layers[layer].onPrestige(gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)

		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;

			if (layers[layer].incr_order){
				for (lr in layers[layer].incr_order)
					if (!player[lr].unl) player[lr].order++
			}
		}
	
		tmp.layerAmt[layer] = new Decimal(0) // quick fix
	}

	if (layers[layer].resetsNothing && layers[layer].resetsNothing()) return


	for (layerResetting in layers) {
		if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChall(layerResetting)
	}

	prevOnReset = {...player} //Deep Copy
	player.points = (row == 0 ? new Decimal(0) : new Decimal(10))

	for (let x = row; x >= 0; x--) rowReset(x, layer)
	prevOnReset = undefined

	updateTemp()
	updateTemp()
}

function respecBuyables(layer) {
	if (!layers[layer].buyables) return
	if (!layers[layer].buyables.respec) return
	if (!confirm("Are you sure you want to respec? This will force you to do a \"" + layer + "\" reset as well!")) return
	layers[layer].buyables.respec()
}

function canAffordUpg(layer, id) {
	upg = layers[layer].upgrades[id]
	cost = upg.cost
	return canAffordPurchase(layer, upg, cost) 
}

function canAffordPurchase(layer, thing, cost) {
	if (thing.currencyInternalName){
		let name = thing.currencyInternalName
		if (thing.currencyLayer){
			let lr = thing.currencyLayer
			return !(player[lr][name].lt(cost)) 
		}
		else {
			return !(player[name].lt(cost))
		}
	}
	else {
		return !(player[layer].points.lt(cost))
	}
}

function buyUpg(layer, id) {
	if (!player[layer].unl) return
	if (!layers[layer].upgrades[id].unl()) return
	if (player[layer].upgrades.includes(id)) return
	upg = layers[layer].upgrades[id]

	if (upg.currencyInternalName){
		let name = upg.currencyInternalName
		if (upg.currencyLayer){
			let lr = upg.currencyLayer
			if (player[lr][name].lt(upg.cost)) return
			player[lr][name] = player[lr][name].sub(upg.cost)
		}
		else {
			if (player[name].lt(upg.cost)) return
			player[name] = player[name].sub(upg.cost)
		}
	}
	else {
		if (player[layer].points.lt(upg.cost)) return
		player[layer].points = player[layer].points.sub(upg.cost)	
	}
	player[layer].upgrades.push(id);
	if (upg.onPurchase != undefined)
		upg.onPurchase()
}

function buyBuyable(layer, id) {
	if (!player[layer].unl) return
	if (!layers[layer].buyables[id].unl()) return
	if (!layers[layer].buyables[id].canAfford()) return

	layers[layer].buyables[id].buy()
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
	player.points = new Decimal(10)
	updateTemp();
	resizeCanvas();
}


function toggleAuto(toggle) {
	player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]] 
}


function startChall(layer, x) {
	if (!player[layer].unl) return
	if (player[layer].active == x) {
		completeChall(layer, x)
		delete player[layer].active
	} else {
		player[layer].active = x
	}
	doReset(layer, true)
	updateChallTemp(layer)
}

function canCompleteChall(layer, x)
{
	if (x != player[layer].active) return

	let chall = layers[layer].challs[x]

	if (chall.currencyInternalName){
		let name = chall.currencyInternalName
		if (chall.currencyLayer){
			let lr = chall.currencyLayer
			return !(player[lr][name].lt(chall.goal)) 
		}
		else {
			return !(player[name].lt(chall.cost))
		}
	}
	else {
		return !(player[layer].points.lt(chall.cost))
	}

}

function completeChall(layer, x) {
	var x = player[layer].active
	if (!x) return
	if (! canCompleteChall(layer, x)) return
	if (!player[layer].challs.includes(x)) {
		needCanvasUpdate = true
		player[layer].challs.push(x);
		if (layers[layer].challs[x].onComplete) layers[layer].challs[x].onComplete()
	}
	delete player[layer].active
	updateChallTemp(layer)
}

function adjustMSDisp() {
	let displays = ["always", "automation", "incomplete", "never"];
	player.msDisplay = displays[(displays.indexOf(player.msDisplay)+1)%4]
}

function milestoneShown(layer, id) {
	complete = player[layer].milestones.includes(id)
	auto = layers[layer].milestones[id].toggles

	switch(player.msDisplay) {
		case "always": 
			return true;
			break;
		case "automation": 
			return (auto)||!complete
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



VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.pre ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")


const ENDGAME = new Decimal("e280000000");

function keepGoing() {
	player.keepGoing = true;
	showTab("tree")
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

function updateMilestones(layer){
	for (id in layers[layer].milestones){
		if (!(player[layer].milestones.includes(id)) && layers[layer].milestones[id].done())
			player[layer].milestones.push(id)
	}
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

	for (layer in layers){
		if (layers[layer].update) layers[layer].update(diff);
	}

	for (layer in layers){
		if (layers[layer].automate) layers[layer].automate();
	}

	for (layer in layers){
		if (layers[layer].milestones) updateMilestones(layer);
	}

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

function updateHotkeys()
{
    hotkeys = {};
    for (layer in layers){
        hk = layers[layer].hotkeys
        if (hk){
            for (id in hk){
				hotkeys[hk[id].key] = hk[id]
				hotkeys[hk[id].key].layer = layer
            }
        }
    }
}
updateHotkeys()

document.onkeydown = function(e) {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	let shiftDown = e.shiftKey
	let ctrlDown = e.ctrlKey
	let key = e.key
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && key != "-" && key != "_" && key != "+" && key != "=" && key != "r" && key != "R" && key != "F5") e.preventDefault()
	console.log(key)
	if(hotkeys[key]){
		if (player[hotkeys[key].layer].unl)
			hotkeys[key].onPress()
	}
}

var onFocused = false
function focused(x) {
	onFocused = x
}