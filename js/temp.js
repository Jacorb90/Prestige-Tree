function updateTemp() {
	
	if (!tmp.challActive) {tmp.challActive = {}}
	for (layer in layers) {
		if(layers[layer].challs !== undefined){
			tmp.challActive[layer] = {}
			updateChallTemp(layer)
		}
	}

	
	if (!tmp.layerEffs) tmp.layerEffs = {}
	for (layer in layers) if (layers[layer].effect) tmp.layerEffs[layer] = layers[layer].effect()

	if (!tmp.layerReqs) tmp.layerReqs = {}
	for (layer in layers) tmp.layerReqs[layer] = layers[layer].requires()

	if (!tmp.buyables) tmp.buyables = {}
	for (layer in layers) if (layers[layer].buyables) {
		if (!tmp.buyables[layer]) tmp.buyables[layer] = {}
		for (id in player[layer].buyables){
			if (!tmp.buyables[layer][id]) tmp.buyables[layer][id] = {}
			tmp.buyables[layer][id]
			tmp.buyables[layer][id].cost = layers[layer].buyables[id].cost(player[layer].buyables[id])
			tmp.buyables[layer][id].effects = layers[layer].buyables[id].effects(player[layer].buyables[id])
		}
	}

	if (!tmp.gainMults) tmp.gainMults = {}
	if (!tmp.gainExp) tmp.gainExp = {}
	if (!tmp.resetGain) tmp.resetGain = {}
	if (!tmp.nextAt) tmp.nextAt = {}
	if (!tmp.layerAmt) tmp.layerAmt = {}

	for (layer in layers) {
		tmp.layerAmt[layer] = layers[layer].baseAmount()
		tmp.gainMults[layer] = layers[layer].gainMult()
		tmp.gainExp[layer] = layers[layer].gainExp()
		tmp.resetGain[layer] = getResetGain(layer)
		tmp.nextAt[layer] = getNextAt(layer)
	}

	tmp.pointGen = getPointGen()

	for (layer in layers){
		if (layers[layer].updateTemp) layers[layer].updateTemp()
	}
}

function updateChallTemp(layer) {
	if (player[layer] === undefined) return

	let data = tmp.challActive[layer]
	let data2 = layers[layer].challs
	let customActive = data2.active !== undefined
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			if (customActive ? data2.active(id) : player[layer].active == id) data[id] = 1
			else delete data[id]
		}
	}
}