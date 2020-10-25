var tmp = {}

// Tmp will not call these
var activeFunctions = [
	"startData", "onPrestige", "doReset", "update", "automate",
	"buy", "buyMax", "respec", "onComplete", "onPurchase", "onPress", "onClick", "masterButtonPress",
	"sellOne", "sellAll",
]

var noCall = doNotCallTheseFunctionsEveryTick
for (item in noCall) {
	activeFunctions.push(noCall[item])
}

function setupTemp() {
	tmp = {}
	tmp.pointGen = {}
	tmp.displayThings = []

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
	tmp.displayThings = []
	for (thing in displayThings){
		let text = displayThings[thing]
		if (isFunction(text)) text = text()
		tmp.displayThings.push(text) 
	}

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
			bar.progress = (1 -Math.min(Math.max(bar.progress, 0), 1)) * 100

			bar.dims = {'width': bar.width + "px", 'height': bar.height + "px"}
			let dir = bar.direction
			bar.fillDims = {'width': (bar.width + 0.5) + "px", 'height': (bar.height + 0.5)  + "px"}
			if (dir !== undefined)
			{
				bar.fillDims['clip-path'] = 'inset(0% 50% 0% 0%)'
				if(dir == UP){
					bar.fillDims['clip-path'] = 'inset(' + bar.progress + '% 0% 0% 0%)'
				}
				else if(dir == DOWN){
					bar.fillDims['clip-path'] = 'inset(0% 0% ' + bar.progress + '% 0%)'
				}
				else if(dir == RIGHT){
					bar.fillDims['clip-path'] = 'inset(0% ' + bar.progress + '% 0% 0%)'
				}
				else if(dir == LEFT){
					bar.fillDims['clip-path'] = 'inset(0% 0% 0% ' + bar.progress + '%)'
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