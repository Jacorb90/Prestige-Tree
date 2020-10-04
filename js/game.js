var player;
var tmp = {};
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;

let VERSION = {
	num: "1.2.4",
	name: "This changes everything!"
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
		playerdata[layer].upgrades = []
		playerdata[layer].milestones = []
		playerdata[layer].challs = []
	}
	return playerdata
}

function getPointGen() {
	let gain = new Decimal(1)
	if (hasUpg("c", 12)) gain = gain.times(layers.c.upgrades[12].effect())
	return gain
}

// Function to determine if the player is in a challenge
function inChallenge(layer, id){
	let chall = player[layer].active
	if (chall==toNumber(id)) return true

	if (layers[layer].challs[chall].countsAs)
		return layers[layer].challs[id].countsAs.includes(id)
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

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	for (id in layers[layer].upgrades){
		if (!isNaN(id)){
			if (canAffordUpg(layer, id) && !hasUpg(layer, id) && tmp.upgrades[layer][id].unl){
				return true
			}
		}
	}

	if (layers[layer].shouldNotify){
		return layers[layer].shouldNotify()
	}
	else 
		return false
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
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].challs = []
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
	cost = tmp.upgrades[layer][id].cost
	return canAffordPurchase(layer, upg, cost) 
}

function hasUpg(layer, id){
	return (player[layer].upgrades.includes(toNumber(id)))
}

function hasMilestone(layer, id){
	return (player[layer].milestones.includes(toNumber(id)))
}

function hasChall(layer, id){
	return (player[layer].challs.includes(toNumber(id)))
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
	cost = tmp.upgrades[layer][id].cost

	if (upg.currencyInternalName){
		let name = upg.currencyInternalName
		if (upg.currencyLayer){
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
	player[layer].upgrades.push(id);
	if (upg.onPurchase != undefined)
		upg.onPurchase()
}

function buyBuyable(layer, id) {
	if (!player[layer].unl) return
	if (!tmp.buyables[layer][id].unl) return
	if (!tmp.buyables[layer][id].canAfford) return

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
			return !(player[lr][name].lt(readData(chall.goal))) 
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

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.pre ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")


const ENDGAME = new Decimal("e280000000");

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

var ticking = false

var interval = setInterval(function() {
	if (player===undefined||tmp===undefined) return;
	if (ticking) return;
	if (gameEnded&&!player.keepGoing) return;
	ticking = true
	let now = Date.now()
	let diff = (now - player.time) / 1e3
	if (player.offTime !== undefined) {
		if (player.offTime.remain > modInfo.offlineLimit * 3600000) player.offlineTime.remain = modInfo.offlineLimit * 3600000
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
