var layers = {}

function layerShown(layer){
    return layers[layer].layerShown();
}

var LAYERS = Object.keys(layers);

var hotkeys = {};

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

function updateLayers(){
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    for (layer in layers){
        layers[layer].layer = layer
        if (layers[layer].upgrades){
            for (thing in layers[layer].upgrades){
                if (!isNaN(thing)){
                    layers[layer].upgrades[thing].id = thing
                    layers[layer].upgrades[thing].layer = layer
                }
            }
        }
        if (layers[layer].milestones){
            for (thing in layers[layer].milestones){
                if (!isNaN(thing)){
                    layers[layer].milestones[thing].id = thing
                    layers[layer].milestones[thing].layer = layer
                }
            }
        }
        if (layers[layer].challs){
            for (thing in layers[layer].challs){
                if (!isNaN(thing)){
                    layers[layer].challs[thing].id = thing
                    layers[layer].challs[thing].layer = layer
                }
            }
        }
        if (layers[layer].buyables){
            layers[layer].buyables.layer = layer
            for (thing in layers[layer].buyables){
                if (!isNaN(thing)){
                    layers[layer].buyables[thing].id = thing
                    layers[layer].buyables[thing].layer = layer

                }
            }  
        }

        row = layers[layer].row
        if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
        ROW_LAYERS[row][layer]=layer;
    }
    updateHotkeys()
}

function addLayer(layerName, layerData){ // Call this to add layers from a different file!
    layers[layerName] = layerData
    updateLayers()
}

// If data is a function, return the result of calling it. Otherwise, return the data.
function readData(data, args=null){
	if (!!(data && data.constructor && data.call && data.apply))
		return data(args);
	else
		return data;
}