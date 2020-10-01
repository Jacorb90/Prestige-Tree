var layers = {
    c: {
        startData() { return {
            unl: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            order: 0, // Used for tracking other relevant layers unlocked before this one
            beep:false,
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
        doReset(layer){
            if(layers[layer].row > layers["c"].row) fullLayerReset('c') // This is actually the default behavior
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
                effDisp(fx) { return format(fx)+"x" },
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
                ["f", "boop"]
            ],
            }
        },
        challs: {
            rows: 1,
    		cols: 1,
		    11: {
			    name: "Fun",
			    desc: "Makes the game 0% harder",
			    unl() { return player.c.best.gt(0) },
                goal: new Decimal("20"),
                currencyDisplayName: "lollipops", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLayer: "c", // Leave empty if not in a layer
                effect() {
                    let ret = player.c.points.add(1).tetrate(0.02)
                    return ret;
                },
                effDisp(x) { return format(x)+"x" },
                countsAs: [12, 21], // Use this for if a challenge includes the effects of other challenges. Being in this challenge "counts as" being in these.
                reward: "Says hi",
                onComplete() {console.log("hiii")} // Called when you complete the challenge
            },
        }, 
        buyables: {
            rows: 1,
            cols: 1,
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                player.c.points = player.c.points.add(player.c.spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
                resetBuyables("c")
                doReset("c", true) // Force a reset
            },
            respecText: "Respec Thingies", // Text on Respec button, optional
            11: {
                title: "Exhancers", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25)) x = x.pow(2).div(25)
                    let cost = Decimal.pow(2, x.pow(1.5))
                    return cost.floor()
                },
                effects(x) { // Effects of owning x of the items, x is a decimal
                    let eff = {}
                    if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(1.1))
                    else eff.first = Decimal.pow(1/25, x.times(-1).pow(1.1))
                
                    if (x.gte(0)) eff.second = x.pow(0.8)
                    else eff.second = x.times(-1).pow(0.8).times(-1)
                    return eff;
                },
                display (){
                    let data = tmp.buyables.c["11"]
                    return "Cost: " + format(data.cost) + " lollipops\n\
                    Amount: " + player.c.buyables["11"] + "\n\
                    Adds + " + format(data.effects.first) + " things and multiplies stuff by " + format(data.effects.second)
                },
                unl() { return player.c.unl },
                canAfford() {return player.c.points.gte(tmp.buyables.c[11].cost)},
                buy() {
                    cost = tmp.buyables.c[11].cost
                    player.c.points = player.c.points.sub(cost)	
                    player.c.buyables[11] = player.c.buyables[11].add(1)
                    player.c.spentOnBuyables = player.c.spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        convertToDecimal() {
            // Convert any layer-specific values (besides points, total, and best) to Decimal after loading
        },
        layerShown() {return true}, // Condition for when layer appears
        update(diff) {
            if (player.c.upgrades.includes(11)) player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
        automate() {}, // Do any automation inherent to this layer if appropriate
        updateTemp() {}, // Do any necessary temp updating
        resetsNothing() {return false},
        onPrestige(gain) {
            return
        }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
        hotkeys: [
            {key: "c", desc: "C: reset for lollipops or whatever", onPress(){if (player.c.unl) doReset("c")}},
            {key: "ctrl+c", desc: "Ctrl+c: respec things", onPress(){if (player.c.unl) respecBuyables("c")}},
        ],
        incr_order: [], // Array of layer names to have their order increased when this one is first unlocked
        branches: [], // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
        
        // Optional, lets you format the tab yourself by listing components. You can create more in v.js.
        tabFormat: ["main-display",
                    ["prestige-button", function(){return "Melt your points into "}],
                    ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}],
                    ["display-text",
                        function() {return 'I have ' + format(player.points) + ' pointy points!'},
                        {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
                    "blank",
                    ["toggle", ["c", "beep"]],
                    "milestones", "blank", "blank", "upgrades"] ,
        style: {
            'background-color': 'blue'
        },
   }, 
    f: { // This layer contains a more minimal set of things, besides a branch and "boop"
        startData() { return {
            unl: false,
			points: new Decimal(0),
            boop: false,
        }},
        color: "#FE0102",
        requires() {return new Decimal(200)}, 
        resource: "stuff", 
        baseResource: "points", 
        baseAmount() {return player.points},
        type: "normal",
        exponent: 0.5,
        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, // Condition for when layer appears
        branches: [["c", 1]] // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default
    }, 
} 

function layerShown(layer){
    return layers[layer].layerShown();
}

const LAYERS = Object.keys(layers);