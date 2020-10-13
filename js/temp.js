var tmp = {}

// Tmp will not call these
var activeFunctions = [
	"startData", "onPrestige", "doReset", "update", "automate",
	"buy", "buyMax", "respec", "onComplete", "onPurchase", "onPress", "onClick", "masterButtonPress"
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
		setupBarStyles(layer)
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
		constructBarStyles(layer)
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

function updateChallengeTemp(layer)
{
	updateTempData(layers[layer].challenges, tmp[layer].challenges)
}

function updateBuyableTemp(layer)
{
	updateTempData(layers[layer].buyables, tmp[layer].buyables)
}

function updateClickableTemp(layer)
{
	updateTempData(layers[layer].clickables, tmp[layer].clickables)
}


var DIR_MARGINS = ["margin-bottom", "margin-top", "margin-right", "margin-left"]

function constructBarStyles(layer){
	if (layers[layer].bars === undefined)
		return
	for (id in layers[layer].bars){
		if (id !== "layer") {
			let bar = tmp[layer].bars[id]
			if (bar.progress instanceof Decimal)
				bar.progress = bar.progress.toNumber()
			bar.progress = Math.min(Math.max(bar.progress, 0), 1)

			bar.dims = {'width': bar.width + "px", 'height': bar.height + "px"}
			let dir = bar.direction
			bar.fillDims = {'width': bar.width + "px", 'height': bar.height + "px"}
			if (dir !== undefined)
			{
				bar.fillDims[DIR_MARGINS[dir]] = "0px"
				if (dir == UP || dir == DOWN)
				{
					bar.fillDims.height = bar.height * bar.progress + "px"
					if (dir == UP) bar.fillDims['margin-top'] =  bar.height * (1 - Math.min(bar.progress, 1)) + "px"
				}
				else
				{
					bar.fillDims.width = bar.width * bar.progress + "px"
					if (dir == LEFT) bar.fillDims['margin-left'] =  bar.width * (1 - Math.min(bar.progress, 1)) + "px"
				}
			}
		}

	}
}

function setupBarStyles(layer){
	if (layers[layer].bars === undefined)
		return
	for (id in layers[layer].bars){
		let bar = tmp[layer].bars[id]
		bar.dims = {}
		let dir = bar.direction
		bar.fillDims = {}
	}
}