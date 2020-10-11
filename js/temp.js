var tmp = {}

// Tmp will not call these
var activeFunctions = [
	"startData", "onPrestige", "doReset", "update", "automate",
	"buy", "buyMax", "respec", "onComplete", "onPurchase", "onPress"
]

function setupTemp() {
	tmp = {}
	setupTempData(layers, tmp)

	for (layer in layers){
		tmp[layer].resetGain = {}
		tmp[layer].nextAt = {}
		tmp[layer].nextAtDisp = {}
		tmp[layer].notify = {}
		tmp[layer].canReset = {}
		tmp[layer].prestigeButtonText = {}
	}
}

function setupTempData(layerData, tmpData) {
	tmp.pointGen = {}


	for (item in layerData){
		if (layerData[item] == null) {
			tmpData[item] = null
		}
		else if (layerData[item] instanceof Decimal)
			tmpData[item] = layerData[item]
		else if (Array.isArray(layerData[item])) {
			tmpData[item] = []
			setupTempData(layerData[item], tmpData[item])
		}
		else if ((!!layerData[item]) && (layerData[item].constructor === Object)) {
			tmpData[item] = {}
			setupTempData(layerData[item], tmpData[item])
		}
		else if (isFunction(layerData[item]) && !activeFunctions.includes(item)){
			tmpData[item] = new Decimal(1) // The safest thing to put probably?
		} else {
			tmpData[item] = layerData[item]
		}
	}	
}

function updateTemp() {
	if (tmp === undefined)
		setupTemp()

	updateTempData(layers, tmp)

	for (layer in layers){
		tmp[layer].resetGain = getResetGain(layer)
		tmp[layer].nextAt = getNextAt(layer)
		tmp[layer].nextAtDisp = getNextAt(layer, true)
		tmp[layer].notify = shouldNotify(layer)
		tmp[layer].canReset = canReset(layer)
		tmp[layer].prestigeButtonText = prestigeButtonText(layer)

	}

	tmp.pointGen = getPointGen()
}

function updateTempData(layerData, tmpData) {
	
	for (item in layerData){
		if (Array.isArray(layerData[item])) {
			updateTempData(layerData[item], tmpData[item])
		}
		else if ((!!layerData[item]) && (layerData[item].constructor === Object)) {
			updateTempData(layerData[item], tmpData[item])
		}
		else if (isFunction(layerData[item]) && !activeFunctions.includes(item)){
			Vue.set(tmpData, item, layerData[item]())
		}
	}	
}

function updateChallTemp(layer)
{
	updateTempData(layers[layer].challs, tmp[layer].challs)
}

function updateBuyableTemp(layer)
{
	updateTempData(layers[layer].buyables, tmp[layer].buyables)
}