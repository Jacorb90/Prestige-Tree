var player;
let allSaves;
var needCanvasUpdate = true;
var gameEnded = false;

// Don't change this
const TMT_VERSION = {
	tmtNum: "2.2.1",
	tmtName: "Uprooted"
}

function getResetGain(layer, useType = null) {
	let type = useType
	if (!useType) type = tmp[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (0)
	if (tmp[layer].gainExp.eq(0)) return new Decimal(0)
	if (type=="static") {
		if ((!tmp[layer].canBuyMax) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(tmp[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(tmp[layer].exponent, -1))
		gain = softcapStaticGain(gain, tmp[layer].row)
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else if (type=="normal"){
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(0)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		gain = softcap("normal_layers_2", softcap("normal_layers", gain));
		if (layer=="e") gain = softcap("epGain", gain);
		return gain.floor().max(0);
	} else if (type=="custom"){
		return layers[layer].getResetGain()
	} else {
		return new Decimal(0)
	}
}

function getNextAt(layer, canMax=false, useType = null) {
	let type = useType
	if (!useType) type = tmp[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (Infinity)

	if (tmp[layer].gainMult.lte(0)) return new Decimal(Infinity)
	if (tmp[layer].gainExp.lte(0)) return new Decimal(Infinity)

	if (type=="static") 
	{
		if (!tmp[layer].canBuyMax) canMax = false
		let amt = player[layer].points.plus((canMax&&tmp[layer].baseAmount.gte(tmp[layer].nextAt))?tmp[layer].resetGain:0)
		amt = scaleStaticCost(amt, tmp[layer].row)
		let extraCost = Decimal.pow(tmp[layer].base, amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
		let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) cost = cost.ceil()
		return cost;
	} else if (type=="normal"){
		let next = tmp[layer].resetGain.add(1)
		next = reverse_softcap("normal_layers", reverse_softcap("normal_layers_2", next));
		next = next.root(tmp[layer].gainExp).div(tmp[layer].gainMult).root(tmp[layer].exponent).times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) next = next.ceil()
		return next;
	} else if (type=="custom"){
		return layers[layer].getNextAt(canMax)
	} else {
		return new Decimal(0)
	}}

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	if (player.tab == layer || player.navTab == layer) return false
	if (!player.redGlowActive) return false;
	for (id in tmp[layer].upgrades){
		if (!isNaN(id)){
			if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
				return true
			} else if (tmp[layer].upgrades[id].pseudoUnl && tmp[layer].upgrades[id].pseudoCan && !tmp[layer].upgrades[id].unlocked) return true;
		}
	}
	
	for (id in tmp[layer].buyables){
		if (!isNaN(id)){
			if (tmp[layer].buyables[id].autoed) continue;
			if (tmp[layer].buyables[id].unlocked && tmp[layer].buyables[id].canAfford){
				if (layer=="s") {
					if (player.spaceGlow=="never") continue;
					if (player.spaceGlow!="normal") {
						let str = player.spaceGlow
						if (str.includes("+")) str = str.split("+")[0];
						str = Number(str);
						let trueId = id-10;
						if (str>trueId) continue;
					}
				} else if (layer=="o") {
					if (player.solGlow=="never") continue;
					if (player.solGlow!="normal") {
						let buyableData = { "solar cores onward": 11, "tachoclinal plasma onward": 12, "convectional energy": 13, "convectional energy onward": 13, "coronal waves": 21 }
						let str = buyableData[player.solGlow]
						if (str>id) continue;
					}
				} else if (layer=="m") {
					if (player.majGlow=="never" || (player.m.auto && hasMilestone("hn", 2))) continue;
					if (player.majGlow=="uncasted") if (Object.values(player.m.spellTimes).some(x => Decimal.eq(x, 0))) continue;
				} else if (layer=="mc" && id==11 && !player.shellGlow) continue;
				return true
			}
		}
	}

	if (tmp[layer].shouldNotify){
		return tmp[layer].shouldNotify
	}
	else 
		return false
}

function canReset(layer)
{
	if(tmp[layer].type == "normal")
		return tmp[layer].baseAmount.gte(tmp[layer].requires) && getResetGain(layer).gt(0)
	else if(tmp[layer].type== "static")
		return tmp[layer].baseAmount.gte(tmp[layer].nextAt)
	if(tmp[layer].type == "none")
		return false
	else
		return layers[layer].canReset()
}

function rowReset(row, layer) {
	for (lr in ROW_LAYERS[row]){
		if(layers[lr].doReset) {

			player[lr].activeChallenge = null // Exit challenges on any row reset on an equal or higher row
			layers[lr].doReset(layer)
		}
		else
			if(tmp[layer].row > tmp[lr].row && row !== "side") layerDataReset(lr)
	}
}

function layerDataReset(layer, keep = []) {
	let storedData = {unlocked: player[layer].unlocked, first: player[layer].first} // Always keep unlocked & time unlocked
	for (let i=0;i<alwaysKeepTheseVariables.length;i++) {
		let name = alwaysKeepTheseVariables[i];
		if (player[layer][name]) storedData[name] = player[layer][name];
	}

	for (thing in keep) {
		if (player[layer][keep[thing]] !== undefined && player[layer][keep[thing]] !== null) {
			if (player[layer][keep[thing]] instanceof Decimal) storedData[keep[thing]] = new Decimal(JSON.parse(JSON.stringify(player[layer][keep[thing]])));
			else storedData[keep[thing]] = player[layer][keep[thing]];
		}
	}

	layOver(player[layer], layers[layer].startData());
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].challenges = getStartChallenges(layer)
	resetBuyables(layer)
	if (layers[layer].clickables && !player[layer].clickables) 
		player[layer].clickables = getStartClickables(layer)

	for (thing in storedData) {
		player[layer][thing] = storedData[thing]
	}
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
	let row = tmp[layer].row
	if (!force) {
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
		if (!canReset(layer)) return;
		let gain = tmp[layer].resetGain.max(0)
		if (tmp[layer].type=="static") {
			if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
			gain =(tmp[layer].canBuyMax ? gain : 1)
		} 
		if (tmp[layer].type=="custom") {
			if (!tmp[layer].canReset) return;
		} 

		if (layers[layer].onPrestige)
			layers[layer].onPrestige(gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)
		updateAchievements(layer)

		if (!player[layer].unlocked) {
			player[layer].unlocked = true;
			needCanvasUpdate = true;

			if (tmp[layer].increaseUnlockOrder){
				lrs = tmp[layer].increaseUnlockOrder
				for (lr in lrs)
					if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder = (player[lrs[lr]].unlockOrder||0)+1
			}
		}
	
		tmp[layer].baseAmount = new Decimal(0) // quick fix
	}

	if (tmp[layer].resetsNothing) return


	for (layerResetting in layers) {
		if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChallenge(layerResetting)
	}

	prevOnReset = {...player} //Deep Copy
	player.points = (row == 0 ? new Decimal(0) : getStartPoints())

	for (let x = row; x >= 0; x--) rowReset(x, layer)
	rowReset("side", layer)
	prevOnReset = undefined

	updateTemp()
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
		player[layer].unlocked = false
		if (player[layer].unlockOrder) player[layer].unlockOrder = 0
	}
	player.points = getStartPoints()
	updateTemp()
	updateTemp()
	updateTemp()
	resizeCanvas();
}

function startChallenge(layer, x) {
	let enter = false
	if (!player[layer].unlocked) return
	if (player[layer].activeChallenge == x) {
		completeChallenge(layer, x)
		player[layer].activeChallenge = null;
	} else {
		enter = true
	}	
	doReset(layer, true)
	if(enter) {
		player[layer].activeChallenge = x
		if (layers[layer].challenges[x].onStart) layers[layer].challenges[x].onStart(true);
	}

	updateChallengeTemp(layer)
	app.$forceUpdate();
}

function canCompleteChallenge(layer, x)
{
	if (x != player[layer].activeChallenge) return

	let challenge = tmp[layer].challenges[x]

	if (challenge.currencyInternalName){
		let name = challenge.currencyInternalName
		if (challenge.currencyLocation){
			return !(challenge.currencyLocation[name].lt(challenge.goal)) 
		}
		else if (challenge.currencyLayer){
			let lr = challenge.currencyLayer
			return !(player[lr][name].lt(readData(challenge.goal))) 
		}
		else {
			return !(player[name].lt(challenge.goal))
		}
	}
	else {
		return !(player.points.lt(challenge.goal))
	}

}

function completeChallenge(layer, x) {
	var x = player[layer].activeChallenge
	if (!x) return
	if (! canCompleteChallenge(layer, x)){
		player[layer].activeChallenge = null;
		return
	}
	if ((player[layer].challenges[x]||0) < tmp[layer].challenges[x].completionLimit) {
		needCanvasUpdate = true
		player[layer].challenges[x] += 1
		if (layers[layer].challenges[x].onComplete) layers[layer].challenges[x].onComplete()
	}
	player[layer].activeChallenge = null;
	updateChallengeTemp(layer)
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? (" Pre-Release " + VERSION.pre) : VERSION.beta ? (" Beta " + VERSION.beta) : "") + (VERSION.patch ? (" Patch "+VERSION.patch) : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")



function gameLoop(diff) {	
	styleCooldown = Math.max(styleCooldown-diff, 0);
	
	if (isEndgame() || gameEnded) gameEnded = 1

	if (isNaN(diff)) diff = 0
	if (gameEnded && !player.keepGoing) {
		diff = 0
		player.tab = "gameEnded"
	}
	if (player.devSpeed) diff *= player.devSpeed

	let limit = maxTickLength()
	if(diff > limit)
		diff = limit

	addTime(diff)
	player.points = player.points.add(tmp.pointGen.times(diff)).max(0)

	for (x = 0; x <= maxRow; x++){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item]
			if (!player[layer].unlocked) player[layer].first += diff;
			if (!unl(layer)) continue;
			let speed = (x<6&&layer!="en"&&layer!="ne"&&layer!="id"&&layer!="r")?tmp.row1to6spd:new Decimal(1)
			if (tmp[layer].passiveGeneration) generatePoints(layer, speed.times(diff*tmp[layer].passiveGeneration));
			if (layers[layer].update) layers[layer].update(speed.times(diff));
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item]
			if (tmp[layer].passiveGeneration) generatePoints(layer, diff*tmp[layer].passiveGeneration);
			if (layers[layer].update) layers[layer].update(diff);
		}
	}	

	for (x = maxRow; x >= 0; x--){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item]
			if (!unl(layer)) continue;
			if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
			if (layers[layer].automate) layers[layer].automate();
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item]
			if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
			if (layers[layer].automate) layers[layer].automate();
		}
	}

	for (layer in layers){
		if (layers[layer].milestones) updateMilestones(layer);
		if (layers[layer].achievements) updateAchievements(layer)
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
	let diff = Math.max((now - player.time) / 1e3, 0)
	if (player.offTime !== undefined && player.offTime !== null) {
		if (player.offTime.remain > modInfo.offlineLimit * 3600000) player.offTime.remain = modInfo.offlineLimit * 3600000
		if (player.offTime.remain > 0) {
			let offlineDiff = Math.max(player.offTime.remain / 10, diff)
			player.offTime.remain -= offlineDiff
			diff += Math.max(offlineDiff, 0)
		}
		if (!player.offlineProd || player.offTime.remain <= 0) player.offTime = null;
	}
	if (player.devSpeed) diff *= player.devSpeed
	player.time = now
	if (needCanvasUpdate) resizeCanvas();
	updateTemp();
	gameLoop(diff)
	fixNaNs()
	ticking = false
}, 50)

setInterval(function() {needCanvasUpdate = true}, 500)