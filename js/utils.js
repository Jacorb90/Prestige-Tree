// ************ Number formatting ************

function exponentialFormat(num, precision) {
	let e = num.exponent;
	let m = num.mantissa;
	if (Number(new Decimal(m).toStringWithDecimalPlaces(precision))==10) {
		m = 1
		e++;
	}
	e = ((e>=1000) ? commaFormat(new Decimal(e), 0) : new Decimal(e).toStringWithDecimalPlaces(0))
	return new Decimal(m).toStringWithDecimalPlaces(precision)+"e"+e
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return num.toStringWithDecimalPlaces(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function regularFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return num.toStringWithDecimalPlaces(precision)
}

function fixValue(x, y = 0) {
	return x || new Decimal(y)
}

function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision=2, whole=false) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign)||isNaN(decimal.layer)||isNaN(decimal.mag)) {
		player.hasNaN = true;
		return "NaN"
	}
	if (decimal.sign<0) return "-"+format(decimal.neg(), precision)
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.eq(0)) return "0"
	if (decimal.gte("eeee1000")) {
		var slog = decimal.slog()
		if (slog.gte(1e3)) return "10^^" + formatWhole(slog)
		else return "10^^" + regularFormat(slog, 3)
	} else if (decimal.gte("eee100000")) return "eee"+format(decimal.log10().log10().log10(), 3)
	else if (decimal.gte("ee100000")) return "ee"+format(decimal.log10().log10(), 3)
	else if (decimal.gte("1e100000")) return "e"+format(decimal.log10(), 3)
	else if (decimal.gte("1e1000")) return exponentialFormat(decimal, 0)
	else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
	else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
	else if (decimal.gte(Decimal.pow(0.1, precision)) || whole) return regularFormat(decimal, precision)
	else if (decimal.gt("1e-100000")) return exponentialFormat(decimal, decimal.gte("1e-1000")?precision:0)
	else return "1/("+format(decimal.pow(-1), precision)+")"
}

function formatWhole(decimal, reallyWhole=false) {
	decimal = new Decimal(decimal)
	if (decimal.gte(1e9)) return format(decimal, 2)
	if (decimal.lte(0.95) && !decimal.eq(0) && !reallyWhole) return format(decimal, 2)
	else return format(decimal, 0, true)
}

function formatTime(s) {
	s = new Decimal(s);
	if (s.gte(1/0)) return "Forever"
	else if (s.lt(60)) return format(s)+"s"
	else if (s.lt(3600)) return formatWhole(s.div(60).floor())+"m "+format(s.toNumber()%60)+"s"
	else if (s.lt(86400)) return formatWhole(s.div(3600).floor())+"h "+format(s.div(60).floor().toNumber()%60)+"m"
	else if (s.lt(31536000)) return formatWhole(s.div(84600).floor())+"d " + formatWhole(s.div(3600).floor().toNumber()%24)+"h"
	else if (s.lt(31536000000)) return formatWhole(s.div(31536000).floor())+"y "+formatWhole(s.div(84600).floor().toNumber()%365)+"d"
	else return formatWhole(s.div(31536000).floor())+"y"
}

function toPlaces(x, precision, maxAccepted) {
	x = new Decimal(x)
	let result = x.toStringWithDecimalPlaces(precision)
	if (new Decimal(result).gte(maxAccepted)) {
		result = new Decimal(maxAccepted-Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
	}
	return result
}
// ************ Save stuff ************

const saveRegexCode = /[^\w ]|_/g // \w = word library (i.e. all numbers & letters, not case-specific)

function setLocalStorage() {
	localStorage.setItem(modInfo.id, btoa(JSON.stringify(allSaves)));
}

function save(name=allSaves.set) {
	allSaves[name] = player;
	setLocalStorage();
}

function showAllSaves() {
	player.saveMenuOpen = true;
}

function startPlayerBase() {
	return {
		tab: layoutInfo.startTab,
		navTab: (layoutInfo.showTree ? "tree-tab" : "none"),
		time: Date.now(),
		autosave: true,
		notify: {},
		msDisplay: "always",
		offlineProd: true,
		versionType: modInfo.id,
		version: VERSION.num,
		beta: VERSION.beta,
		timePlayed: 0,
		keepGoing: false,
		hasNaN: false,
		hideChallenges: false,
		tapNerd: false,
		anim: true,
		grad: true,
		milNotify: true,
		optTab: "mainOpt",
		slightGlow: "normal",
		redGlowActive: true,
		spaceGlow: "normal",
		solGlow: "normal",
		majGlow: "uncasted",
		shellGlow: true,
		scShown: true,
		oldStyle: false,
		hideStars: false,
		showStory: true,
		saveMenuOpen: false,
		points: modInfo.initialStartPoints,
		subtabs: {},
		lastSafeTab: (layoutInfo.showTree ? "none" : layoutInfo.startTab)
	}
}

function getStartPlayer() {
	playerdata = startPlayerBase()
	
	if (addedPlayerData) {
		extradata = addedPlayerData()
		for (thing in extradata)
			playerdata[thing] = extradata[thing]
	}

	playerdata.infoboxes = {}
	for (layer in layers){
		playerdata[layer] = {}
		if (layers[layer].startData) 
			playerdata[layer] = layers[layer].startData()
		else playerdata[layer].unlocked = true
		playerdata[layer].buyables = getStartBuyables(layer)
		if(playerdata[layer].clickables == undefined) playerdata[layer].clickables = getStartClickables(layer)
		playerdata[layer].spentOnBuyables = new Decimal(0)
		playerdata[layer].upgrades = []
		playerdata[layer].milestones = []
		playerdata[layer].primeMiles = []
		playerdata[layer].achievements = []
		playerdata[layer].challenges = getStartChallenges(layer)
		if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
			playerdata.subtabs[layer] = {}
			playerdata.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0]
		}
		if (layers[layer].microtabs) {
			if (playerdata.subtabs[layer] == undefined) playerdata.subtabs[layer] = {}
			for (item in layers[layer].microtabs)
			playerdata.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0]
		}
		if (layers[layer].infoboxes) {
			if (playerdata.infoboxes[layer] == undefined) playerdata.infoboxes[layer] = {}
			for (item in layers[layer].infoboxes)
				playerdata.infoboxes[layer][item] = false
		}
	}
	return playerdata
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

function getStartClickables(layer){
	let data = {}
	if (layers[layer].clickables) {
		for (id in layers[layer].clickables)
			if (!isNaN(id))
				data[id] = new Decimal(0)
	}
	return data
}

function getStartChallenges(layer){
	let data = {}
	if (layers[layer].challenges) {
		for (id in layers[layer].challenges)
			if (!isNaN(id))
				data[id] = 0
	}
	return data
}

function fixSave() {
	defaultData = getStartPlayer()
	fixData(defaultData, player)

	for(layer in layers)
	{
		if (player[layer].best !== undefined) player[layer].best = new Decimal (player[layer].best)
		if (player[layer].total !== undefined) player[layer].total = new Decimal (player[layer].total)

		if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
		
			if(!Object.keys(layers[layer].tabFormat).includes(player.subtabs[layer].mainTabs)) player.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0]
		}
		if (layers[layer].microtabs) {
			for (item in layers[layer].microtabs)
				if(!Object.keys(layers[layer].microtabs[item]).includes(player.subtabs[layer][item])) player.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0]
		}
	}
}

function fixData(defaultData, newData) {
	for (item in defaultData){
		if (defaultData[item] == null) {
			if (newData[item] === undefined)
				newData[item] = null
		}
		else if (Array.isArray(defaultData[item])) {
			if (newData[item] === undefined)
				newData[item] = defaultData[item]
			else
				fixData(defaultData[item], newData[item])
		}
		else if (defaultData[item] instanceof Decimal) { // Convert to Decimal
			if (newData[item] === undefined)
				newData[item] = defaultData[item]
			else
				newData[item] = new Decimal(newData[item])
		}
		else if ((!!defaultData[item]) && (defaultData[item].constructor === Object)) {
			if (newData[item] === undefined || (defaultData[item].constructor !== Object))
				newData[item] = defaultData[item]
			else
				fixData(defaultData[item], newData[item])
		}
		else {
			if (newData[item] === undefined)
				newData[item] = defaultData[item]
		}
	}	
}

function loadSave(name) {
	allSaves.set = name;
	setLocalStorage();
	window.location.reload();
}

function renameSave(name) {
	let newName = prompt("Enter save name: ")
	newName = newName.replace(saveRegexCode, ""); // Removes all non-alphanumeric characters
	if (newName=="set") {
		alert("Sorry, that name is used in the game's data, so you can't use it personally or it will cause terrible glitches!");
		return;
	} else if (allSaves[newName] !== undefined) {
		alert("That name is taken already, sorry!");
		return;
	} else if (newName.length>20) {
		alert("This name is too long!");
		return;
	} else {
		if (name==allSaves.set) save();
		allSaves[newName] = allSaves[name];
		allSaves[name] = undefined;
		if (name==allSaves.set) loadSave(newName);
		else setLocalStorage();
	}
	resetSaveMenu();
}

function deleteSave(name) {
	if (Object.keys(allSaves).filter(x => (x!="set" && allSaves[x]!==undefined)).length==1) {
		hardReset();
		return;
	}
	if (!confirm("Are you sure you wish to delete this save?")) return;
	allSaves[name] = undefined;
	if (name==allSaves.set) {
		let valid = Object.keys(allSaves).filter(x => (x!="set" && (allSaves[x]!==undefined||x==name)));
		let toLoad = valid[(valid.indexOf(name)+1)%valid.length];
		loadSave(toLoad);
	}
	setLocalStorage();
	resetSaveMenu();
}

function newSave() {
	let newName = prompt("Enter save name: ");
	newName = newName.replace(saveRegexCode, ""); // Removes all non-alphanumeric characters
	if (newName=="set") {
		alert("Sorry, that name is used in the game's data, so you can't use it personally or it will cause terrible glitches!");
		return;
	} else if (allSaves[newName] !== undefined) {
		alert("That name is taken already, sorry!");
		return;
	} else if (newName.length>20) {
		alert("This name is too long!");
		return;
	} else {
		allSaves[newName] = getStartPlayer();
		loadSave(newName);
	}
}

function moveSave(name, dir) {
	let valid = Object.keys(allSaves).filter(x => (x!="set" && allSaves[x]!==undefined));
	let oldPos = valid.indexOf(name);
	let newPos = Math.min(Math.max(oldPos+dir, 0), valid.length-1);
	console.log("Old: "+oldPos+", New: "+newPos);
	if (oldPos==newPos) return;
	
	let name1 = valid[oldPos];
	let name2 = valid[newPos];
	let active1 = name1==allSaves.set;
	let active2 = name2==allSaves.set;
	
	if (active1 || active2) save();
	let newAllSaves = {set: allSaves.set};
	for (let n of Object.keys(allSaves).sort((x,y) => ((x==name1&&y==name2)||(x==name2&&y==name1))?-1:1)) newAllSaves[n] = allSaves[n]
	allSaves = newAllSaves;
	
	setLocalStorage();
	resetSaveMenu();
}

function showMoveSaveBtn(name, dir) {
	let valid = Object.keys(allSaves).filter(x => (x!="set" && allSaves[x]!==undefined));
	if (dir=="up") return valid.indexOf(name)>0
	else return valid.indexOf(name)<(valid.length-1);
}

function resetSaveMenu() {
	player.saveMenuOpen = false;
	player.saveMenuOpen = true;
}

function load() {
	let get = localStorage.getItem(modInfo.id);
	if (get===null || get===undefined) {
		player = getStartPlayer()
		allSaves = {set: "save1", save1: player}
	} else {
		let data = JSON.parse(atob(get));
		if (data.set !== undefined) {
			player = Object.assign(getStartPlayer(), data[data.set]);
			allSaves = data;
		} else {
			player = Object.assign(getStartPlayer(), data);
			allSaves = {set: "save1", save1: player}
		}
	}
	fixSave()

	if (player.offlineProd) {
		if (player.offTime === undefined || player.offTime === null) player.offTime = { remain: 0 }
		player.offTime.remain += (Date.now() - player.time) / 1000
	}
	player.time = Date.now();
	versionCheck();
	changeTheme();
	changeTreeQuality();
	updateLayers()

	setupTemp();
	updateTemp();
	updateTemp();
	updateTemp();
	loadVue();
	
	player.saveMenuOpen = false; // Slight quality of life :)
}


function fixNaNs() {
	NaNcheck(player)
}

function NaNcheck(data) {
	for (item in data){
		if (data[item] == null) {
		}
		else if (Array.isArray(data[item])) {
			NaNcheck(data[item])
		}
		else if (data[item] !== data[item] || data[item] === decimalNaN){
			console.log("DATA: "+JSON.stringify(data));
			if (NaNalert === true || confirm ("Invalid value found in player, named '" + item + "'. Please let the creator of this mod know! Would you like to try to auto-fix the save and keep going?")){
				NaNalert = true
				data[item] = (data[item] !== data[item] ? 0 : decimalZero)
			}
			else {
				clearInterval(interval);
				player.autosave = false;
				NaNalert = true;
			}
		}
		else if (data[item] instanceof Decimal) { // Convert to Decimal
		}
		else if ((!!data[item]) && (data[item].constructor === Object)) {
			NaNcheck(data[item])
		}
	}	
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
		let tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)))
		if(tempPlr.versionType != modInfo.id && !forced && !confirm("This save appears to be for a different mod! Are you sure you want to import?")) // Wrong save (use "Forced" to force it to accept.)
			return
		player = tempPlr;
		player.versionType = modInfo.id
		fixSave()
		save()
		loadSave(allSaves.set)
	} catch(e) {
		return;
	}
}

function versionCheck() {
	let setVersion = true
	
	if (player.versionType===undefined||player.version===undefined) {
		player.versionType = modInfo.id
		player.version = 0
	}
	
	if (setVersion) {
		if (player.versionType == modInfo.id && VERSION.num > player.version) player.keepGoing = false
		player.versionType = getStartPlayer().versionType
		player.version = VERSION.num
		player.beta = VERSION.beta
	}
}

var saveInterval = setInterval(function() {
	if (player===undefined || allSaves===undefined) return;
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
	document.body.style.setProperty("--locked", aqua ? "#c4a7b3" : "#bf8f8f")
}

function getThemeName() {
	return player.theme ? theme_names[player.theme] : "Default"
}

function switchTheme() {
	if (player.theme === undefined || player.theme === null) player.theme = themes[1]
	else {
		player.theme = themes[Object.keys(themes)[player.theme] + 1]
		if (!player.theme) player.theme = null;
	}
	changeTheme()
	resizeCanvas()
}

// ************ Options ************

function toggleOpt(name) {
	if (name == "oldStyle" && styleCooldown>0) return;

	player[name] = !player[name]
	if (name == "hqTree") changeTreeQuality()
	if (name == "oldStyle") updateStyle()
}

function adjustGlow(type) {
	let glowData = {
		slight() { return ["normal", "never"] },
		space() { 
			let data = ["normal", "2+", "3"];
			if (hasUpgrade("s", 14)) {
				data[2] = "3+"
				data.push("4")
				if (hasUpgrade("s", 25)) {
					data[3] = "4+"
					data.push("5")
				}
			}
			data.push("never")
			return data;
		},
		sol() { 
			let data = ["normal"]
			if (player.ss.unlocked) {
				data.push("tachoclinal plasma onward")
				if (hasUpgrade("ss", 41)) {
					data.push("convectional energy onward")
					data.push("coronal waves")
				} else data.push("convectional energy")
			} else data.push("tachoclinal plasma")
			data.push("never")
			return data;
		},
		maj() { return ["normal", "uncasted", "never"] },
	}
	let data = glowData[type]()
	let index = data.indexOf(player[type+"Glow"]);
	player[type+"Glow"] = data[(index+1)%data.length]
}

var styleCooldown = 0;


function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff")
	css.href = player.oldStyle?"oldStyle.css":"style.css"
	needCanvasUpdate = true;
}

function changeTreeQuality() {
	var on = player.hqTree && !player.oldStyle
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid")
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset")
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "")
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none")
}

function toggleAuto(toggle) {
	if (!(toggle instanceof Array)) {
		player[toggle.layer][toggle.varName] = toggle.options[(toggle.options.indexOf(player[toggle.layer][toggle.varName])+1)%toggle.options.length]
	} else player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]] 
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



// ************ Big Feature related ************

function respecBuyables(layer) {
	if (!layers[layer].buyables) return
	if (!layers[layer].buyables.respec) return
	if (!confirm("Are you sure you want to respec? This will force you to do a \"" + (tmp[layer].name ? tmp[layer].name : layer) + "\" reset as well!")) return
	layers[layer].buyables.respec()
	updateBuyableTemp(layer)
}

function canAffordUpgrade(layer, id, skipAfford=false) {
	let upg = tmp[layer].upgrades[id]
	if (layers[layer].upgrades[id].canAfford!==undefined && !skipAfford) return upg.canAfford;
	else if (upg.multiRes) {
		for (let i=0;i<upg.multiRes.length;i++) {
			let cost = upg.multiRes[i].cost
			if (!canAffordPurchase(layer, upg.multiRes[i], cost)) return false;
		}
		return true;
	} else {
		let cost = upg.cost
		return canAffordPurchase(layer, upg, cost) 
	}
}

function hasUpgrade(layer, id){
	return (player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString())) && unl(layer)
}

function hasMilestone(layer, id){
	return (player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString()))
}

function hasAchievement(layer, id){
	return (player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) && unl(layer)
}

function hasChallenge(layer, id){
	return (player[layer].challenges[id]>=tmp[layer].challenges[id].completionLimit) && unl(layer)
}

function maxedChallenge(layer, id){
	return (player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit)
}

function challengeCompletions(layer, id){
	return unl(layer)?(player[layer].challenges[id]||0):0
}

function getBuyableAmount(layer, id){
	return unl(layer)?(player[layer].buyables[id]):0
}

function setBuyableAmount(layer, id, amt){
	player[layer].buyables[id] = amt
}

function getClickableState(layer, id){
	return (player[layer].clickables[id])
}

function setClickableState(layer, id, state){
	player[layer].clickables[id] = state
}

function upgradeEffect(layer, id){
	return (tmp[layer].upgrades[id].effect);
}

function challengeEffect(layer, id){
	return (tmp[layer].challenges[id].rewardEffect)
}

function buyableEffect(layer, id){
	return (tmp[layer].buyables[id].effect)
}

function clickableEffect(layer, id){
	return (tmp[layer].clickables[id].effect)
}

function achievementEffect(layer, id){
	return (tmp[layer].achievements[id].effect)
}

function getImprovements(layer, id) {
	if (!unl(layer)) return new Decimal(0);
	return tmp[layer].impr[id].unlocked?(tmp[layer].impr.amount.sub(tmp[layer].impr[id].num).div(tmp[layer].impr.activeRows*tmp[layer].impr.activeCols).plus(1).floor().max(0)):new Decimal(0);
}

function getNextImpr(layer, id) {
	return layers[layer].impr.nextAt(id);
}

function improvementEffect(layer, id) {
	return tmp[layer].impr[id].effect
}

function canAffordPurchase(layer, thing, cost) {

	if (thing.currencyInternalName){
		let name = thing.currencyInternalName
		if (thing.currencyLocation){
			return !(thing.currencyLocation[name].lt(cost)) 
		}
		else if (thing.currencyLayer){
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

function buyUpgrade(layer, id) {
	buyUpg(layer, id)
}

function buyUpg(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].upgrades[id].unlocked) return
	if (player[layer].upgrades.includes(id)) return
	if (!canAffordUpgrade(layer, id)) return;
	let upg = tmp[layer].upgrades[id]
	let cost = tmp[layer].upgrades[id].cost
	let orig = player;

	if (upg.multiRes) {
		let doReturn = false;
		for (let i=0;i<upg.multiRes.length;i++) {
			let data = upg.multiRes[i]
			let cost = data.cost;
			if (data.currencyInternalName){
				let name = data.currencyInternalName
				if (data.currencyLocation){
					if (data.currencyLocation[name].lt(cost)) doReturn = true;
					data.currencyLocation[name] = data.currencyLocation[name].sub(cost)
				}
				else if (data.currencyLayer){
					let lr = data.currencyLayer
					if (player[lr][name].lt(cost)) doReturn = true;
					player[lr][name] = player[lr][name].sub(cost)
				}
				else {
					if (player[name].lt(cost)) doReturn = true;
					player[name] = player[name].sub(cost)
				}
			}
			else {
				if (player[layer].points.lt(cost)) doReturn = true;
				player[layer].points = player[layer].points.sub(cost)	
			}
		}
		if (doReturn) {
			player = orig;
			return;
		}
	} else {
		if (upg.currencyInternalName){
			let name = upg.currencyInternalName
			if (upg.currencyLocation){
				if (upg.currencyLocation[name].lt(cost)) return
				upg.currencyLocation[name] = upg.currencyLocation[name].sub(cost)
			}
			else if (upg.currencyLayer){
				let lr = upg.currencyLayer
				if (player[lr][name].lt(cost)) return
				player[lr][name] = player[lr][name].sub(cost)
			}
			else {
				if (player[name].lt(cost)) return
				player[name] = player[name].sub(cost)
			}
		}
		else {
			if (player[layer].points.lt(cost)) return
			player[layer].points = player[layer].points.sub(cost)	
		}
	}
	player[layer].upgrades.push(id);
	if (upg.onPurchase != undefined)
		upg.onPurchase()
}

function unlockUpg(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].upgrades[id].pseudoUnl) return
	if (tmp[layer].upgrades[id].unlocked) return
	if (player[layer].pseudoUpgs.includes(id)) return
	let upg = tmp[layer].upgrades[id]
	if (!upg.pseudoCan) return;
	player[layer].pseudoUpgs.push(id);
}

function pseudoUnl(layer, id) {
	return tmp[layer].upgrades[id].pseudoUnl && !tmp[layer].upgrades[id].unlocked;
}

function buyMaxBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canAfford) return
	if (!layers[layer].buyables[id].buyMax) return

	layers[layer].buyables[id].buyMax()
	updateBuyableTemp(layer)
}

function buyBuyable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].buyables[id].unlocked) return
	if (!tmp[layer].buyables[id].canAfford) return

	layers[layer].buyables[id].buy()
	updateBuyableTemp(layer)
}

function clickClickable(layer, id) {
	if (!player[layer].unlocked) return
	if (!tmp[layer].clickables[id].unlocked) return
	if (!tmp[layer].clickables[id].canClick) return

	layers[layer].clickables[id].onClick()
	updateClickableTemp(layer)
}

// Function to determine if the player is in a challenge
function inChallenge(layer, id){
	let challenge = player[layer].activeChallenge
	if (!challenge) return false
	id = toNumber(id)
	if (challenge==id) return true

	if (layers[layer].challenges[challenge].countsAs)
		return tmp[layer].challenges[challenge].countsAs.includes(id)
}

// ************ Misc ************

var onTreeTab = true
function showTab(name) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return

	var toTreeTab = name == "none"
	player.tab = name
	if (player.navTab == "none") player.lastSafeTab = name
	player.notify[name] = false
	needCanvasUpdate = true
	updateTempData(layers[name], tmp[name], name)
}

function showNavTab(name) {
	if (LAYERS.includes(name) && !layerunlocked(name)) return

	var toTreeTab = name == "tree"
	player.navTab = name
	player.notify[name] = false
	needCanvasUpdate = true
}

function goBack() {
	if (player.navTab !== "none") showTab("none")
	else showTab(player.lastSafeTab)
}

function prestigeNotify(layer) {
	if (player.slightGlow=="never") return false;
	else if (layers[layer].prestigeNotify) return layers[layer].prestigeNotify()
	else if (tmp[layer].autoPrestige || tmp[layer].passiveGeneration) return false
	else if (tmp[layer].type == "static") return tmp[layer].canReset
	else if (tmp[layer].type == "normal") return (tmp[layer].canReset && (tmp[layer].resetGain.gte(player[layer].points.div(10))))
	else return false
}

function notifyLayer(name) {
	if (player.tab == name || !layerunlocked(name)) return
	player.notify[name] = 1
}

function subtabShouldNotify(layer, family, id){
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]
	if (player.subtabs[layer][family] === id) return false
	else if (subtab.embedLayer) return tmp[subtab.embedLayer].notify
	else return subtab.shouldNotify
}

function subtabResetNotify(layer, family, id){
	let subtab = {}
	if (family == "mainTabs") subtab = tmp[layer].tabFormat[id]
	else subtab = tmp[layer].microtabs[family][id]
	if (subtab.embedLayer) return tmp[subtab.embedLayer].prestigeNotify
	else return false
}

function nodeShown(layer) {
	if (tmp[layer].layerShown) return true
	switch(layer) {
		case "idk":
			return player.idk.unlocked
			break;
	}
	return false
}

function unl(layer) {
	if (Array.isArray(tmp.ma.canBeMastered)) if (player.ma.selectionActive&&tmp[layer].row<6&&!tmp.ma.canBeMastered.includes(layer)) return false;
	return player[layer].unlocked;
}

function layerunlocked(layer) {
	if (player.ma.selectionActive&&tmp[layer].row<6&&!tmp.ma.canBeMastered.includes(layer)) return false;
	if (tmp[layer] && tmp[layer].type == "none") return (player[layer].unlocked)
	return LAYERS.includes(layer) && (player[layer].unlocked || (tmp[layer].canReset && tmp[layer].layerShown))
}

function keepGoing() {
	player.keepGoing = true;
	needCanvasUpdate = true;
	player.tab = layoutInfo.startTab;
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

function updateMilestones(layer){
	for (id in layers[layer].milestones){
		let done = layers[layer].milestones[id].done();
		if (!player[layer].primeMiles.includes(id) && done) {
			player[layer].primeMiles.push(id);
			if (player.milNotify && !player[layer].milestones.includes(id)) addNotification("milestone", tmp[layer].milestones[id].requirementDescription, "Milestone Gotten!");
		}
		if (!(player[layer].milestones.includes(id)) && done) {
			player[layer].milestones.push(id)
		}
	}
}

function updateAchievements(layer){
	for (id in layers[layer].achievements){
		if (!isNaN(id) && !(player[layer].achievements.includes(id)) && layers[layer].achievements[id].done()) {
			player[layer].achievements.push(id)
			if (layers[layer].achievements[id].onComplete) layers[layer].achievements[id].onComplete()
			addNotification("achievement", layers[layer].achievements[id].name, "Achievement Gotten!");
		}
	}
}

function addTime(diff, layer) {
	let data = player
	let time = data.timePlayed
	if (!layer && !player.p.unlocked) return;
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

function layOver(obj1, obj2) {
	for (let x in obj2) {
		if (obj2[x] instanceof Object) layOver(obj1[x], obj2[x]);
		else obj1[x] = obj2[x];
	}
}

var minusHeld = false;

document.onkeydown = function(e) {
	if (player===undefined) return;
	if (gameEnded&&!player.keepGoing) return;
	let ctrlDown = e.ctrlKey
	let key = e.key
	tmp.nerdMode = player.tapNerd?((e.key=="-"&&!minusHeld) ? !tmp.nerdMode : tmp.nerdMode):(e.key=="-")
	if (e.shiftKey) minusHeld = true;
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && hotkeys[key]) e.preventDefault()
	if(hotkeys[key]){
		if (player[hotkeys[key].layer].unlocked)
			hotkeys[key].onPress()
	}
}

document.onkeyup = function(e) {
	if (e.key=="-" && !player.tapNerd) tmp.nerdMode = false;
	if (e.key=="-") minusHeld = false;
}

var onFocused = false
function focused(x) {
	onFocused = x
}

function gainFormulaNormal(layer) {
	let start = tmp[layer].requires;
	let mult = tmp[layer].gainMult;
	let exp1 = tmp[layer].exponent;
	let exp2 = tmp[layer].gainExp;
	let f = "(x / "+format(start)+")^"+format(exp1)+(mult.eq(1)?"":(mult.lt(1)?(" / "+format(mult.pow(-1))):(" * "+format(mult))));
	if (!exp2.eq(1)) f = "("+f+")^"+format(exp2)
	return f;
}

function costFormulaStatic(layer) {
	let start = tmp[layer].requires;
	let mult = tmp[layer].gainMult.times(start);
	if (!mult) mult = new Decimal(1);
	let exp = new Decimal(tmp[layer].exponent).times(tmp[layer].gainExp);
	let base = tmp[layer].base;
	let resDiv = new Decimal(1);
	
	for (let scale=STATIC_SCALE_DATA.length-1;scale>=0;scale--) {
		let scaleStart = getStaticScaleStart(scale, row+1)
		let scaleExp = getStaticScaleExp(scale, row+1)
		if (player[layer].points.gte(scaleStart)) {
			exp = exp.times(scaleExp);
			resDiv = resDiv.times(scaleStart.pow(exp.sub(1)));
		}
	}
	
	return "("+format(base)+"^(x^"+format(exp)+")"+(resDiv.eq(1)?"":(" / "+format(resDiv)))+")"+(mult.eq(1)?"":(mult.gt(1)?(" * ("+format(mult)+")"):(" / ("+format(mult.pow(-1))+")")))
}

function prestigeButtonText(layer)
{
	if(tmp[layer].type == "normal") {
		if (tmp.nerdMode) return "Gain Formula: "+gainFormulaNormal(layer);
		else return `${ player[layer].points.lt(1e3) ? (tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for ") : ""}+<b>${formatWhole(tmp[layer].resetGain)}</b> ${tmp[layer].resource} ${tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3) ? `<br><br>Next at ${ (tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAt) : format(tmp[layer].nextAt))} ${ tmp[layer].baseResource }` : ""}`
	} else if(tmp[layer].type== "static") {
		if (tmp.nerdMode) return "Cost Formula: "+costFormulaStatic(layer);
		else return `${tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for "}+<b>${formatWhole(tmp[layer].resetGain)}</b> ${tmp[layer].resource}<br><br>${player[layer].points.lt(30) ? (tmp[layer].baseAmount.gte(tmp[layer].nextAt)&&(tmp[layer].canBuyMax !== undefined) && tmp[layer].canBuyMax?"Next:":"Req:") : ""} ${formatWhole(tmp[layer].baseAmount)} / ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))} ${ tmp[layer].baseResource }		
		`
	} else if(tmp[layer].type == "none")
		return ""
	else
		return layers[layer].prestigeButtonText()
}

function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
  };
  
document.title = modInfo.name
