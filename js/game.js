var player;
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;


let modInfo = {
	name: "The Modding Tree",
	id: "modbase",
	pointsName: "points",
	discordName: "",
	discordLink: "",
	offlineLimit: 1  // In hours
}

let VERSION = {
	num: "1.3.5 maybe",
	name: "Tabception... ception!",
	tmtNum: "1.3.5 maybe",
	tmtName: "Tabception... ception!"
}

// Determines if it should show points/sec
function showPointGen(){
	return (tmp.pointGen.neq(new Decimal(0)))
} 

// Calculate points/sec!
function getPointGen() {
	if(!hasUpg("c", 11))
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpg("c", 12)) gain = gain.times(upgEffect("c", 12))
	return gain
}



// Function to determine if the player is in a challenge
function inChallenge(layer, id){
	let chall = player[layer].active
	if (chall==toNumber(id)) return true

	if (layers[layer].challs[chall].countsAs)
		return layers[layer].challs[id].countsAs.includes(id)
}

function getResetGain(layer, useType = null) {
	let type = useType
	if (!useType) type = layers[layer].type

	if (tmp[layer].gainExp.eq(0)) return new Decimal(0)
	if (type=="static") {
		if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else if (type=="normal"){
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(0)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(layers[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	} else if (type=="custom"){
		return layers[layer].getResetGain()
	} else {
		return new Decimal(0)
	}
}

function getNextAt(layer, canMax=false, useType = null) {
	let type = useType
	if (!useType) type = layers[layer].type

	if (tmp[layer].gainExp.eq(0)) return new Decimal(1/0)
	if (type=="static") 
	{
		if (!layers[layer].canBuyMax()) canMax = false
		let amt = player[layer].points.plus((canMax&&tmp[layer].baseAmount.gte(tmp[layer].nextAt))?tmp[layer].resetGain:0)
		let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
		let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
		if (layers[layer].resCeil) cost = cost.ceil()
		return cost;
	} else if (type=="normal"){
		let next = tmp[layer].resetGain.add(1)
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp[layer].gainExp.div(tmp[layer].gainMult).root(layers[layer].exponent).times(tmp[layer].requires).max(tmp[layer].requires))
		if (layers[layer].resCeil) next = next.ceil()
		return next;
	} else if (type=="custom"){
		return layers[layer].getNextAt(canMax)
	} else {
		return new Decimal(0)
	}}

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	for (id in layers[layer].upgrades){
		if (!isNaN(id)){
			if (canAffordUpg(layer, id) && !hasUpg(layer, id) && tmp[layer].upgrades[id].unl){
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

function canReset(layer)
{
	if(tmp[layer].type == "normal")
		return tmp[layer].baseAmount.gte(tmp[layer].requires)
	else if(tmp[layer].type== "static")
		return tmp[layer].baseAmount.gte(tmp[layer].nextAt) 
	else
		return layers[layer].canReset()
}

function rowReset(row, layer) {
	for (lr in ROW_LAYERS[row]){
		if(layers[lr].doReset) {
			player[lr].active = null // Exit challenges on any row reset on an equal or higher row
			layers[lr].doReset(layer)
		}
		else
			if(layers[layer].row > layers[lr].row) fullLayerReset(lr)
	}
}

function fullLayerReset(layer) {
	player[layer] = layers[layer].startData();
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].challs = []
	if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
		if (player.subtabs[layer] == undefined) player.subtabs[layer] = {}
		if (player.subtabs[layer].mainTabs == undefined) player.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0]
	}

	if (layers[layer].microtabs) {
		if (player.subtabs[layer] == undefined) player.subtabs[layer] = {}
		for (item in layers[layer].microtabs)
			if (player.subtabs[layer][item] == undefined) player.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0]
	}
	resetBuyables(layer)
}

function resetBuyables(layer){
	if (layers[layer].buyables) 
		player[layer].buyables = getStartBuyables(layer)
	player[layer].spentOnBuyables = new Decimal(0)
}


function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp[layer].resetGain.times(diff))
}

var prevOnReset

function doReset(layer, force=false) {
	let row = layers[layer].row
	if (!force) {
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
		let gain = tmp[layer].resetGain
		if (layers[layer].type=="static") {
			if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
			gain =(layers[layer].canBuyMax() ? gain : 1)
		} 
		if (layers[layer].type=="custom") {
			if (!tmp[layer].canReset) return;
		} 

		if (layers[layer].onPrestige)
			layers[layer].onPrestige(gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)

		if (!player[layer].unl) {
			player[layer].unl = true;
			needCanvasUpdate = true;

			if (layers[layer].incr_order){
				lrs = layers[layer].incr_order
				for (lr in lrs)
					if (!player[lrs[lr]].unl) player[lrs[lr]].order++
			}
		}
	
		tmp[layer].baseAmount = new Decimal(0) // quick fix
	}

	if (tmp[layer].resetsNothing) return


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
	let enter = false
	if (!player[layer].unl) return
	if (player[layer].active == x) {
		completeChall(layer, x)
		delete player[layer].active
	} else {
		enter = true
	}	
	doReset(layer, true)
	if(enter) player[layer].active = x

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
	if (! canCompleteChall(layer, x)){
		delete player[layer].active
		return
	}
	if (player[layer].challs[x] < tmp[layer].challs[x].completionLimit) {
		needCanvasUpdate = true
		player[layer].challs[x] += 1
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
