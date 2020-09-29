var layers = {
    c: {
        startData() { return {
            unl: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            upgrades: [],
            milestones: [],
            beep: false,
        }},
        color: "#4BEC13",
        requires() {return new Decimal(10)}, // Can be a function that takes requirement increases into account
        resource: "lollipops", // Name of prestige currency
        baseResource: "candies", // Name of resource prestige is based on
        baseAmount() {return player.points},
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        resCeil: false, // True if the resource needs to be rounded up
        canBuyMax() {}, // Only needed for static layers
        gainMult() {
            mult = new Decimal(1)
            if (player.c.upgrades.includes(21)) mult = mult.times(2)
			if (player.c.upgrades.includes(23)) mult = mult.times(LAYER_UPGS.c[23].currently())
            return mult
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 0,
        effect() {return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
            waffleBoost: (true == false ? 0 : Decimal.pow(player.c.points, 0.2)),
            icecreamCap: (player.c.points * 10)
        }},
        effectDescription() {
            eff = layers.c.effect();
            return "which are boosting waffles by "+format(eff.waffleBoost)+" and increasing the Ice Cream cap by "+format(eff.icecreamCap)
        },
        milestones: {
            0: {requirementDesc: "3 Lollipops",
            done() {return player.c.best.gte(3)},
            effectDesc: "Makes this green",
            },
            1: {requirementDesc: "4 Lollipops",
            done() {return player.c.best.gte(4)},
            effectDesc: "You can toggle beep and boop (which do nothing)",
            toggles: [
                ["c", "beep"], // Each toggle is defined by a layer and the data toggled for that layer
                ["f", "boop"]],
            }
        },
        upgrades: {
            rows: 1,
            cols: 3,
            11: {
                desc: "Gain 1 Candy every second.",
                cost: new Decimal(1),
                unl() { return player.c.unl },
            },
            12: {
                desc: "Candy generation is faster based on your unspent Lollipops.",
                cost: new Decimal(1),
                unl() { return player.c.upgrades.includes(11) },
                effect() {
                    let ret = player.c.points.add(1).pow(player.c.upgrades.includes(24)?1.1:(player.c.upgrades.includes(14)?0.75:0.5)) 
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
            },
            13: {
                desc: "Make this layer act like you bought it first.",
                cost: new Decimal(69),
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLayer: "", // Leave empty if not in a layer "e.g. points"
                unl() { return player.c.upgrades.includes(12) },
                onPurchase() {
                    player.c.order = 0
                }
            },
        },
        doReset(layer){
            if(layers[layer].row > layers["c"].row) fullLayerReset('c') // This is actually the default behavior
        },
        convertToDecimal() {
            // Convert any layer-specific values (besides points, total, and best) to Decimal
        },
        layerShown() {return true}, // Condition for when layer appears
        update(diff) {
            if (player.c.upgrades.includes(11)) player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
        automate() {
        }, // Do any automation inherent to this layer if appropriate
        updateTemp() {
        }, // Do any necessary temp updating
        resetsNothing() {return false},
        incr_order: [], // Array of layer names to have their order increased when this one is first unlocked
        
        // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
        tabFormat: ["main-display", ["prestige-button", function(){return "Melt your points into "}], ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}], ["display-text", function() {return 'I have ' + format(player.points) + ' pointy points!'}, {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}], "blank", ["toggle", ["c", "beep"]], "milestones", "blank", "blank", "upgrades"]
    }, 

    f: {
        startData() { return {
            unl: false,
			points: new Decimal(0),
            boop: false,
        }},
        color: "#FE0102",
        requires() {return new Decimal(200)}, 
        resource: "farm points", 
        baseResource: "candies", 
        baseAmount() {return player.points},
        type: "normal", 
        exponent: 0.5, 
        resCeil: false, 
        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, 
        branches: [["c", 1]] // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
    }, 
} 

function layerShown(layer){
    return layers[layer].layerShown();
}

var LAYERS = Object.keys(layers);

var ROW_LAYERS = {}
for (layer in layers){
    row = layers[layer].row
    if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}

    ROW_LAYERS[row][layer]=layer;
}

function addLayer(layerName, layerData){ // Call this to add layers from a different file!
    layers[layerName] = layerData
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    for (layer in layers){
        row = layers[layer].row
        if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
    
        ROW_LAYERS[row][layer]=layer;
    }
}