var layers = {}

function layerShown(layer){
    return layers[layer].layerShown();
}

var LAYERS = Object.keys(layers);

var hotkeys = {};

var maxRow = 0;

function updateHotkeys()
{
    hotkeys = {};
    for (layer in layers){
        hk = layers[layer].hotkeys
        if (hk){
            for (id in hk){
				hotkeys[hk[id].key] = hk[id]
				hotkeys[hk[id].key].layer = layer
            }
        }
    }
}

var ROW_LAYERS = {}
var TREE_LAYERS = {}
var OTHER_LAYERS = {}

function updateLayers(){
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    TREE_LAYERS = {}
    OTHER_LAYERS = {}
    for (layer in layers){
        layers[layer].layer = layer
        if (layers[layer].upgrades){
            for (thing in layers[layer].upgrades){
                if (!isNaN(thing)){
                    layers[layer].upgrades[thing].id = thing
                    layers[layer].upgrades[thing].layer = layer
                    if (layers[layer].upgrades[thing].unlocked === undefined)
                        layers[layer].upgrades[thing].unlocked = true
                }
            }
        }
        if (layers[layer].milestones){
            for (thing in layers[layer].milestones){
                if (!isNaN(thing)){
                    layers[layer].milestones[thing].id = thing
                    layers[layer].milestones[thing].layer = layer
                    if (layers[layer].milestones[thing].unlocked === undefined)
                        layers[layer].milestones[thing].unlocked = true
                }
            }
        }
        if (layers[layer].achievements){
            for (thing in layers[layer].achievements){
                if (!isNaN(thing)){
                    layers[layer].achievements[thing].id = thing
                    layers[layer].achievements[thing].layer = layer
                    if (layers[layer].achievements[thing].unlocked === undefined)
                        layers[layer].achievements[thing].unlocked = true
                }
            }
        }
        if (layers[layer].challenges){
            for (thing in layers[layer].challenges){
                if (!isNaN(thing)){
                    layers[layer].challenges[thing].id = thing
                    layers[layer].challenges[thing].layer = layer
                    if (layers[layer].challenges[thing].unlocked === undefined)
                        layers[layer].challenges[thing].unlocked = true
                    if (layers[layer].challenges[thing].completionLimit === undefined)
                        layers[layer].challenges[thing].completionLimit = 1

                }
            }
        }
        if (layers[layer].buyables){
            layers[layer].buyables.layer = layer
            for (thing in layers[layer].buyables){
                if (!isNaN(thing)){
                    layers[layer].buyables[thing].id = thing
                    layers[layer].buyables[thing].layer = layer
                    if (layers[layer].buyables[thing].unlocked === undefined)
                        layers[layer].buyables[thing].unlocked = true
                }
            }  
        }

        if (layers[layer].clickables){
            layers[layer].clickables.layer = layer
            for (thing in layers[layer].clickables){
                if (!isNaN(thing)){
                    layers[layer].clickables[thing].id = thing
                    layers[layer].clickables[thing].layer = layer
                    if (layers[layer].clickables[thing].unlocked === undefined)
                        layers[layer].clickables[thing].unlocked = true
                }
            }  
        }

        if (layers[layer].bars){
            layers[layer].bars.layer = layer
            for (thing in layers[layer].bars){
                layers[layer].bars[thing].id = thing
                layers[layer].bars[thing].layer = layer
                if (layers[layer].bars[thing].unlocked === undefined)
                    layers[layer].bars[thing].unlocked = true
            }  
        }

        if (layers[layer].infoboxes){
            for (thing in layers[layer].infoboxes){
                layers[layer].infoboxes[thing].id = thing
                layers[layer].infoboxes[thing].layer = layer
                if (layers[layer].infoboxes[thing].unlocked === undefined)
                    layers[layer].infoboxes[thing].unlocked = true
            }  
        }

        if(!layers[layer].componentStyles) layers[layer].componentStyles = {}
        if(layers[layer].symbol === undefined) layers[layer].symbol = layer.charAt(0).toUpperCase() + layer.slice(1)
        if(layers[layer].unlockOrder === undefined) layers[layer].unlockOrder = []
        if(layers[layer].gainMult === undefined) layers[layer].gainMult = new Decimal(1)
        if(layers[layer].gainExp === undefined) layers[layer].gainExp = new Decimal(1)
        if(layers[layer].type === undefined) layers[layer].type = "none"
        if(layers[layer].base === undefined || layers[layer].base <= 1) layers[layer].base = 2

        let row = layers[layer].row
        if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
        if(!TREE_LAYERS[row] && !isNaN(row)) TREE_LAYERS[row] = []
        if(!OTHER_LAYERS[row] && isNaN(row)) OTHER_LAYERS[row] = []

        ROW_LAYERS[row][layer]=layer;
        let position = (layers[layer].position !== undefined ? layers[layer].position : layer)
        
        if (!isNaN(row)) TREE_LAYERS[row].push({layer: layer, position: position})
        else OTHER_LAYERS[row].push({layer: layer, position: position})

        if (maxRow < layers[layer].row) maxRow = layers[layer].row
        
    }
    for (row in OTHER_LAYERS) {
        OTHER_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
    }
    for (row in TREE_LAYERS) {
        TREE_LAYERS[row].sort((a, b) => (a.position > b.position) ? 1 : -1)
    }
    updateHotkeys()
}

function addLayer(layerName, layerData){ // Call this to add layers from a different file!
    layers[layerName] = layerData
}

// If data is a function, return the result of calling it. Otherwise, return the data.
function readData(data, args=null){
	if (!!(data && data.constructor && data.call && data.apply))
		return data(args);
	else
		return data;
}

function someLayerUnlocked(row){
    for (layer in ROW_LAYERS[row])
        if (player[layer].unlocked)
            return true
    return false
}


// This isn't worth making a .ts file over
const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3
