function setupTemp(){
	if (!tmp.challActive) {tmp.challActive = {}}
	if (!tmp.challs) tmp.challs = {}
	for (layer in layers) {
		if(layers[layer].challs !== undefined){
			tmp.challActive[layer] = {}
			setupChallTemp(layer)
		}
	}

	if (!tmp.upgrades) tmp.upgrades = {}
	for (layer in layers) {
		if(layers[layer].upgrades !== undefined){
			setupUpgradeTemp(layer)
		}
	}
	
	if (!tmp.milestones) tmp.milestones = {}
	for (layer in layers) {
		if(layers[layer].milestones !== undefined){
			setupMilestoneTemp(layer)
		}
	}
	if (!tmp.buyables) tmp.buyables = {}
	for (layer in layers) if (layers[layer].buyables) {
		if(layers[layer].buyables !== undefined){
			setupBuyableTemp(layer)
		}
	}
}

function updateTemp() {
	if (tmp.genPoints == undefined) tmp.genPoints = false


	if (!tmp.layerReqs) tmp.layerReqs = {}
	for (layer in layers) tmp.layerReqs[layer] = layers[layer].requires()

	if (!tmp.layerEffs) tmp.layerEffs = {}
	for (layer in layers) if (layers[layer].effect) tmp.layerEffs[layer] = layers[layer].effect()

	if (!tmp.gainMults) tmp.gainMults = {}
	if (!tmp.gainExp) tmp.gainExp = {}
	if (!tmp.resetGain) tmp.resetGain = {}
	if (!tmp.nextAt) tmp.nextAt = {}
	if (!tmp.layerAmt) tmp.layerAmt = {}
	if (!tmp.layerColor) tmp.layerColor = {}
	if (!tmp.layerShown) tmp.layerShown = {}
	if (!tmp.effectDescription) tmp.effectDescription = {}
	if (!tmp.style) tmp.style = {}
	if (!tmp.nodeStyle) tmp.nodeStyle = {}
	if (!tmp.notify) tmp.notify = {}
	if (!tmp.nextAtDisp) tmp.nextAtDisp = {}
	if (!tmp.prestigeButtonText) tmp.prestigeButtonText = {}
	if (!tmp.canReset) tmp.canReset = {}
	if (!tmp.tooltips) tmp.tooltips = {}
	if (!tmp.tooltipsLocked) tmp.tooltipsLocked = {}

	for (layer in layers) {
		if (layers[layer].color) tmp.layerColor[layer] = layers[layer].color()
		if (layers[layer].style) tmp.style[layer] = layers[layer].style()
		tmp.layerShown[layer] = layers[layer].layerShown()
		tmp.layerAmt[layer] = layers[layer].baseAmount()
		tmp.gainMults[layer] = layers[layer].gainMult()
		tmp.gainExp[layer] = layers[layer].gainExp()
		tmp.resetGain[layer] = getResetGain(layer)
		tmp.nextAt[layer] = getNextAt(layer)
		tmp.notify[layer] = shouldNotify(layer)
		tmp.nextAtDisp[layer] = getNextAt(layer, true)
		if (layers[layer].effectDescription) tmp.effectDescription[layer] = layers[layer].effectDescription()
		if (layers[layer].canReset) tmp.canReset[layer] = layers[layer].canReset()
		if (layers[layer].prestigeButtonText) tmp.prestigeButtonText[layer] = layers[layer].prestigeButtonText()
		if (layers[layer].tooltip) tmp.tooltips[layer] = layers[layer].tooltip()
		if (layers[layer].tooltipLocked) tmp.tooltipsLocked[layer] = layers[layer].tooltipLocked()
		if (layers[layer].nodeStyle) tmp.nodeStyle[layer] = layers[layer].nodeStyle()
	}

	tmp.pointGen = getPointGen()

	for (layer in layers){
		if (layers[layer].updateTemp) layers[layer].updateTemp()
	}

	if (!tmp.componentStyles) tmp.componentStyles = {}
	for (layer in layers) if (layers[layer].componentStyles) {
		if(layers[layer].componentStyles !== undefined){
			tmp.componentStyles[layer] = {}
			for (item in layers[layer].componentStyles)
				tmp.componentStyles[layer][item] = layers[layer].componentStyles[item]()
		}
	}


	if (!tmp.microtabs) tmp.microtabs = {}
	for (layer in layers) {
		if (!tmp.microtabs[layer]) tmp.microtabs[layer] = {}
		if (layers[layer].microtabs) {
			if(layers[layer].microtabs !== undefined){
				updateMicrotabTemp(layer)
			}
		}
		if(layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)){
			let data2 = layers[layer].tabFormat
			let set = "mainTabs"
			if (!tmp.microtabs[layer][set]) tmp.microtabs[layer][set] = {}
			for (tab in data2) {
				if (!tmp.microtabs[layer][set][tab])
					tmp.microtabs[layer][set][tab] = {}
				if(data2[tab].style)
					tmp.microtabs[layer][set][tab].style = data2[tab].style()
				if(data2[tab].buttonStyle)
					tmp.microtabs[layer][set][tab].buttonStyle = data2[tab].buttonStyle()
			}
		}	
	}


	if (!tmp.challActive) {tmp.challActive = {}}
	if (!tmp.challs) tmp.challs = {}
	for (layer in layers) {
		if(layers[layer].challs !== undefined){
			tmp.challActive[layer] = {}
			updateChallTemp(layer)
		}
	}

	if (!tmp.upgrades) tmp.upgrades = {}
	for (layer in layers) {
		if(layers[layer].upgrades !== undefined){
			updateUpgradeTemp(layer)
		}
	}
	
	if (!tmp.milestones) tmp.milestones = {}
	for (layer in layers) {
		if(layers[layer].milestones !== undefined){
			updateMilestoneTemp(layer)
		}
	}
	if (!tmp.buyables) tmp.buyables = {}
	for (layer in layers) if (layers[layer].buyables) {
		if(layers[layer].buyables !== undefined){
			updateBuyableTemp(layer)
		}
	}
}



function updateChallTemp(layer) {
	if (player[layer] === undefined) return
	if (!tmp.challs[layer]) tmp.challs[layer] = {}

	let data = tmp.challActive[layer]
	let data2 = layers[layer].challs
	let customActive = data2.active !== undefined
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			tmp.challs[layer][id] = {}

			if (customActive ? data2.active(id) : player[layer].active == id) data[id] = 1
			else delete data[id]

			tmp.challs[layer][id].unl = data2[id].unl()
			if(data2[id].name) tmp.challs[layer][id].name = data2[id].name()
			if(data2[id].desc) tmp.challs[layer][id].desc = data2[id].desc()
			if(data2[id].reward) tmp.challs[layer][id].reward = data2[id].reward()
			if(data2[id].effect) tmp.challs[layer][id].effect = data2[id].effect()
			if(data2[id].effectDisplay) tmp.challs[layer][id].effectDisplay = data2[id].effectDisplay(tmp.challs[layer][id].effect)
			tmp.challs[layer][id].goal = data2[id].goal()
			if(data2[id].style) tmp.challs[layer][id].style = data2[id].style()
		}
	}
}

function updateUpgradeTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.upgrades[layer]) tmp.upgrades[layer] = {}

	let data2 = layers[layer].upgrades
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			tmp.upgrades[layer][id] = {}
			tmp.upgrades[layer][id].unl = data2[id].unl()
			if(data2[id].effect) tmp.upgrades[layer][id].effect = data2[id].effect()
			tmp.upgrades[layer][id].cost = data2[id].cost()
			if(data2[id].effectDisplay) tmp.upgrades[layer][id].effectDisplay = data2[id].effectDisplay(tmp.upgrades[layer][id].effect)
			if(data2[id].desc) tmp.upgrades[layer][id].desc = data2[id].desc()
			if(data2[id].title) tmp.upgrades[layer][id].title = data2[id].title()
			if(data2[id].style) tmp.upgrades[layer][id].style = data2[id].style()
		}
	}
}

function updateMilestoneTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.milestones[layer]) tmp.milestones[layer] = {}

	let data2 = layers[layer].milestones
	for (id in data2) {
		tmp.milestones[layer][id] = {}
		if(data2[id].unl) tmp.milestones[layer][id].unl = data2[id].unl()
		tmp.milestones[layer][id].done = data2[id].done()
		if(data2[id].requirementDesc) tmp.milestones[layer][id].requirementDesc = data2[id].requirementDesc()
		if(data2[id].effectDesc) tmp.milestones[layer][id].effectDesc = data2[id].effectDesc()
		if(data2[id].style) tmp.milestones[layer][id].style = data2[id].style()
	
	}
}

function updateBuyableTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.buyables[layer]) tmp.buyables[layer] = {}
	let data2 = layers[layer].buyables
	if(data2.respecText) tmp.buyables[layer].respecText = data2.respecText()
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			let amt = player[layer].buyables[id]
			tmp.buyables[layer][id] = {}
			tmp.buyables[layer][id].unl = data2[id].unl()
			if(data2[id].effect) tmp.buyables[layer][id].effect = data2[id].effect(amt)
			tmp.buyables[layer][id].cost = data2[id].cost(amt)
			tmp.buyables[layer][id].canAfford = data2[id].canAfford()
			if(data2[id].title) tmp.buyables[layer][id].title = data2[id].title()
			if(data2[id].display) tmp.buyables[layer][id].display = data2[id].display()
			if(data2[id].style) tmp.buyables[layer][id].style = data2[id].style()

		}
	}
}

function updateMicrotabTemp(layer) {
	if (layers[layer] === undefined) return
	let data2 = layers[layer].microtabs
	for (set in data2) {
		if (!tmp.microtabs[layer][set]) tmp.microtabs[layer][set] = {}
		for (tab in data2[set]) {
			if (!tmp.microtabs[layer][set][tab])
				tmp.microtabs[layer][set][tab] = {}
			if(data2[set][tab].style)
				tmp.microtabs[layer][set][tab].style = data2[set][tab].style()
			if(data2[set][tab].buttonStyle)
				tmp.microtabs[layer][set][tab].buttonStyle = data2[set][tab].buttonStyle()

		}
	}
}


function setupChallTemp(layer) {
	if (player[layer] === undefined) return
	if (!tmp.challs[layer]) tmp.challs[layer] = {}

	let data = tmp.challActive[layer]
	let data2 = layers[layer].challs
	let customActive = data2.active !== undefined
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col

			tmp.challs[layer][id] = {}
			if(data2[id].effect) tmp.challs[layer][id].effect = {}
			if(data2[id].style) tmp.challs[layer][id].style = {}
		}
	}
}

function setupUpgradeTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.upgrades[layer]) tmp.upgrades[layer] = {}

	let data2 = layers[layer].upgrades
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			tmp.upgrades[layer][id] = {}
			if(data2[id].effect) tmp.upgrades[layer][id].effect = {}
			if(data2[id].style) tmp.upgrades[layer][id].style = {}
		}
	}
}

function setupMilestoneTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.milestones[layer]) tmp.milestones[layer] = {}

	let data2 = layers[layer].milestones
	for (id in data2) {
		tmp.milestones[layer][id] = {}
		if(data2[id].style) tmp.milestones[layer][id].style = {}
	}
}

function setupBuyableTemp(layer) {
	if (layers[layer] === undefined) return
	if (!tmp.buyables[layer]) tmp.buyables[layer] = {}
	let data2 = layers[layer].buyables
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			let amt = player[layer].buyables[id]
			tmp.buyables[layer][id] = {}
			if(data2[id].effect) tmp.buyables[layer][id].effect = {}
			tmp.buyables[layer][id].cost = {}
			if(data2[id].style) tmp.buyables[layer][id].style = {}

		}
	}
}