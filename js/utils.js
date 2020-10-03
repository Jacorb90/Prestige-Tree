// ************ Number formatting ************

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

// ************ Save stuff ************

function save() {
	localStorage.setItem(modInfo.id, btoa(JSON.stringify(player)))
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
		if (player[layer].upgrades == undefined)
			player[layer].upgrades = []
		if (player[layer].milestones == undefined)
			player[layer].milestones = []
		if (player[layer].challs == undefined)
			player[layer].challs = []

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
	let get = localStorage.getItem(modInfo.id);
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

var saveInterval = setInterval(function() {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	if (player.autosave) save();
}, 5000)

// ************ Themes ************

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

// ************ Options ************

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

function toggleAuto(toggle) {
	player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]] 
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

// ************ Misc ************

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

function nodeShown(layer) {
	if (tmp.layerShown[layer]) return true
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

document.onkeydown = function(e) {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	let shiftDown = e.shiftKey
	let ctrlDown = e.ctrlKey
	let key = e.key
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && key != "-" && key != "_" && key != "+" && key != "=" && key != "r" && key != "R" && key != "F5") e.preventDefault()
	if(hotkeys[key]){
		if (player[hotkeys[key].layer].unl)
			hotkeys[key].onPress()
	}
}

var onFocused = false
function focused(x) {
	onFocused = x
}