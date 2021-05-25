var tmp = {}
var NaNalert = false;

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
	tmp.helpTab = NaN;
	tmp.helpData = {};
	tmp.nerdMode = false
	tmp.pointGen = {}
	tmp.row1to6spd = new Decimal(1)
	tmp.displayThings = []

	setupTempData(layers, tmp)
	for (layer in layers){
		tmp[layer].resetGain = {}
		tmp[layer].nextAt = {}
		tmp[layer].nextAtDisp = {}
		tmp[layer].canReset = {}
		tmp[layer].notify = {}
		tmp[layer].prestigeNotify = {}
		tmp[layer].prestigeButtonText = {}
		setupBarStyles(layer)
	}
	if (typeof help_data != "undefined") setupTempData(help_data, tmp.helpData);
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
			tmpData[item] = new Decimal(1) // Safest thing to put probably?
		} else {
			tmpData[item] = layerData[item]
		}
	}	
}

function updateTemp() {
	if (tmp === undefined)
		setupTemp()

	for (layer in layers) {updateTempData(layers[layer], tmp[layer], layer)}

	for (layer in layers){
		tmp[layer].resetGain = getResetGain(layer)
		tmp[layer].nextAt = getNextAt(layer)
		tmp[layer].nextAtDisp = getNextAt(layer, true)
		tmp[layer].canReset = canReset(layer)
		tmp[layer].notify = shouldNotify(layer)
		tmp[layer].prestigeNotify = prestigeNotify(layer)
		tmp[layer].prestigeButtonText = prestigeButtonText(layer)
		constructBarStyles(layer)
	}

	tmp.pointGen = getPointGen()
	tmp.row1to6spd = getRow1to6Speed()
	tmp.displayThings = []
	for (thing in displayThings){
		let text = displayThings[thing]
		if (isFunction(text)) text = text()
		tmp.displayThings.push(text) 
	}
	
	if (typeof help_data != "undefined" && player.tab=='help') {
		updateTempData(help_data, tmp.helpData, "help");
	}
}

function updateTempData(layerData, tmpData, layer, pre, pre2, isArr) {
	
	for (item in layerData){
		if ((item.toLowerCase().includes("display") || (item.toLowerCase().includes("tabformat")&&layer!="tree-tab") || item.toLowerCase().includes("description") || (item == "unlocked" && pre2 != "upgrades")) && player.tab != layer) continue;
		if (Array.isArray(layerData[item])) {
			updateTempData(layerData[item], tmpData[item], layer, item, pre, true)
		}
		else if ((!!layerData[item]) && (layerData[item].constructor === Object)) {
			updateTempData(layerData[item], tmpData[item], layer, item, pre, isArr)
		}
		else if (isFunction(layerData[item]) && !activeFunctions.includes(item)){
			let value = layerData[item]()
			if (value !== value || value === decimalNaN){
				if (NaNalert === true || confirm ("Invalid value found in tmp, named '" + item + "'. Please let the creator of this mod know! Would you like to try to auto-fix the save and keep going?")){
					NaNalert = true
					value = (value !== value ? 0 : decimalZero)
				}
				else {
					clearInterval(interval);
					player.autosave = false;
					NaNalert = true;
				}
			}


			if (isArr) Vue.set(tmpData, item, value); else tmpData[item] = value
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
