addLayer("c", {
        layer: "c", // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
        name: "Candies", // This is optional, only used in a few places, If absent it just uses the layer id.
        startData() { return {
            unl: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            buyables: {}, // You don't actually have to initialize this one
            beep: false,
        }},
        color:() => "#4BDC13",
        requires:() => new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "lollipops", // Name of prestige currency
        baseResource: "candies", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
        canBuyMax() {}, // Only needed for static layers with buy max
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (hasUpg(this.layer, 166)) mult = mult.times(2) // These upgrades don't exist
			if (hasUpg(this.layer, 120)) mult = mult.times(upgEffect(this.layer, 120))
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        effect() {
            return { // Formulas for any boosts inherent to resources in the layer. Can return a single value instead of an object if there is just one effect
            waffleBoost: (true == false ? 0 : Decimal.pow(player[this.layer].points, 0.2)),
            icecreamCap: (player[this.layer].points * 10)
        }},
        effectDescription() { // Optional text to describe the effects
            eff = this.effect();
            eff.waffleBoost = eff.waffleBoost.times(buyableEffect(this.layer, 11).first)
            return "which are boosting waffles by "+format(eff.waffleBoost)+" and increasing the Ice Cream cap by "+format(eff.icecreamCap)
        },
        milestones: {
            0: {requirementDesc:() => "3 Lollipops",
                done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
                effectDesc:() => "Unlock the next milestone",
            },
            1: {requirementDesc:() => "4 Lollipops",
                unl() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(4)},
                effectDesc:() => "You can toggle beep and boop (which do nothing)",
                toggles: [
                    ["c", "beep"], // Each toggle is defined by a layer and the data toggled for that layer
                    ["f", "boop"]],
                style() {                     
                    if(hasMilestone(this.layer, this.id)) return {
                        'background-color': '#1111DD' 
                }},
        
                },
        },
        challs: {
            rows: 1,
    		cols: 1,
		    11: {
			    name:() => "Fun",
			    desc:() => "Makes the game 0% harder",
			    unl() { return player[this.layer].best.gt(0) },
                goal:() => new Decimal("20"),
                currencyDisplayName: "lollipops", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLayer: this.layer, // Leave empty if not in a layer
                effect() {
                    let ret = player[this.layer].points.add(1).tetrate(0.02)
                    return ret;
                },
                effectDisplay(x) { return format(x)+"x" },
                countsAs: [12, 21], // Use this for if a challenge includes the effects of other challenges. Being in this challenge "counts as" being in these.
                reward:() => "Says hi",
                onComplete() {console.log("hiii")} // Called when you complete the challenge
            },
        }, 
        upgrades: {
            rows: 1,
            cols: 3,
            11: {
                title:() => "Generator of Genericness",
                desc:() => "Gain 1 Point every second.",
                cost:() => new Decimal(1),
                unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
            },
            12: {
                desc:() => "Candy generation is faster based on your unspent Lollipops.",
                cost:() => new Decimal(1),
                unl() { return (hasUpg(this.layer, 11))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effectDisplay(fx) { return format(fx)+"x" }, // Add formatting to the effect
            },
            13: {
                desc:() => "Unlock a <b>secret subtab</b> and make this layer act if you unlocked it first.",
                cost:() => new Decimal(69),
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLayer: "", // Leave empty if not in a layer "e.g. points"
                unl() { return (hasUpg(this.layer, 12))},
                onPurchase() { // This function triggers when the upgrade is purchased
                    player[this.layer].order = 0
                },
                style() {
                    if (hasUpg(this.layer, this.id)) return {
                    'background-color': '#1111dd' 
                    }
                    else if (!canAffordUpg(this.layer, this.id)) {
                        return {
                            'background-color': '#dd1111' 
                        }
                    } // Otherwise use the default
                },
            },
        },
        buyables: {
            rows: 1,
            cols: 1,
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
            respecText:() => "Respec Thingies", // Text on Respec button, optional
            11: {
                title:() => "Exhancers", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25)) x = x.pow(2).div(25)
                    let cost = Decimal.pow(2, x.pow(1.5))
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = {}
                    if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(1.1))
                    else eff.first = Decimal.pow(1/25, x.times(-1).pow(1.1))
                
                    if (x.gte(0)) eff.second = x.pow(0.8)
                    else eff.second = x.times(-1).pow(0.8).times(-1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp.buyables[this.layer][this.id]
                    return "Cost: " + format(data.cost) + " lollipops\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Adds + " + format(data.effect.first) + " things and multiplies stuff by " + format(data.effect.second)
                },
                unl() { return player[this.layer].unl }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp.buyables[this.layer][this.id].cost)},
                buy() { 
                    cost = tmp.buyables[this.layer][this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
            },
        },
        doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
            if(layers[resettingLayer].row > this.row) fullLayerReset(this.layer) // This is actually the default behavior
        },
        convertToDecimal() {
            // Convert any layer-specific Decimal values (besides points, total, and best) from String to Decimal (used when loading save)
        },
        layerShown() {return true}, // Condition for when layer appears on the tree
        update(diff) {
            if (player[this.layer].upgrades.includes(11)) player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
        }, // Do any gameloop things (e.g. resource generation) inherent to this layer
        automate() {
        }, // Do any automation inherent to this layer if appropriate
        updateTemp() {
        }, // Do any necessary temp updating, not that important usually
        resetsNothing() {return false},
        onPrestige(gain) {
            return
        }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.

        hotkeys: [
            {key: "c", desc: "C: reset for lollipops or whatever", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
            {key: "ctrl+c" + this.layer, desc: "Ctrl+c: respec things", onPress(){if (player[this.layer].unl) respecBuyables(this.layer)}},
        ],
        incr_order: [], // Array of layer names to have their order increased when this one is first unlocked

        microtabs: {
            stuff: {
                first: {
                    content: ["upgrades", ["display-text", function() {return "confirmed"}]]
                },
                second: {
                    content: [["upgrade", 11],
                            ["row", [["upgrade", 11], "blank", "blank", ["upgrade", 11],]],
                        
                        ["display-text", function() {return "double confirmed"}]]
                },
            },
            otherStuff: {
                // There could be another set of microtabs here
            }
        },

        gagues: {
            longBoi: {
                fillColor:() => "#4BEC13",
                // fillStyle:(),
                baseColor:() => "#333333",
                // baseStyle:(),
                // textStyle:(),

                borderStyle() {return {'border-color': '#321188'}},
                direction:() => RIGHT,
                width:() => "250px",
                height:() => "250px",
                progress() {
                    return (player.points.log().div(10))
                },
                display() {
                    return format(player.points) + " / 1e10"
                },
                unl:() => true,

            },
        },

        // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
        tabFormat: {
            "main tab": {
                buttonStyle() {return  {'color': 'orange'}},
                content:
                    ["main-display",
                    ["prestige-button", function() {return "Melt your points into "}],
                    ["blank", "5px"], // Height
                    ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}],
                    ["display-text",
                        function() {return 'I have ' + format(player.points) + ' pointy points!'},
                        {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
                    "h-line", "milestones", "blank", "upgrades", "challs"],
            },
            thingies: {
                style() {return  {'background-color': '#222222'}},
                buttonStyle() {return {'border-color': 'orange'}},
                content:[
                    ["buyables", "150px"], "blank",
                    ["row", [
                        ["toggle", ["c", "beep"]], ["blank", ["30px", "10px"]], // Width, height
                        ["display-text", function() {return "Beep"}], "blank", ["v-line", "200px"],
                        ["column", [
                            ["prestige-button", function() {return "Be redundant for "}, {'width': '150px', 'height': '30px'}],
                            ["prestige-button", function() {return "Be redundant for "}, {'width': '150px', 'height': '30px'}],
                        ]], 
                    ], {'width': '600px', 'height': '350px', 'background-color': 'green', 'border-style': 'solid'}],
                    "blank",
                    ["display-image", "discord.png"],],
            },
            illuminati: {
                unl() {return (hasUpg("c", 13))},
                content:[
                    ["raw-html", function() {return "<h1> C O N F I R M E D </h1>"}],
                    ["microtabs", "stuff", {'width': '600px', 'height': '350px', 'background-color': 'brown', 'border-style': 'solid'}]
                ]
            }

        },
        style() {return {
            'background-color': '#3325CC' 
        }},
        nodeStyle() {return { // Style on the layer node
            'color': '#3325CC',
            'text-decoration': 'underline' 
        }},
        componentStyles: {
            "chall"() {return {'height': '200px'}},
            "prestige-button"() {return {'color': '#AA66AA'}},
        },
        tooltip() { // Optional, tooltip displays when the layer is unlocked
            let tooltip = formatWhole(player[this.layer].points) + " " + this.resource
            if (player[this.layer].buyables[11].gt(0)) tooltip += "\n" + formatWhole(player[this.layer].buyables[11]) + " Exhancers"
            return tooltip
        },
        shouldNotify() { // Optional, layer will be highlighted on the tree if true.
                         // Layer will automatically highlight if an upgrade is purchasable.
            return (player.c.buyables[11] == 1)
        }
})

// This layer is mostly minimal but it uses a custom prestige type
addLayer("f", {
        startData() { return {
            unl: false,
			points: new Decimal(0),
            boop: false,
        }},
        color:() => "#FE0102",
        requires() {return new Decimal(10)}, 
        resource: "farm points", 
        baseResource: "candies", 
        baseAmount() {return player.points},
        type: "custom", // A "Custom" type which is effectively static
        exponent: 0.5,
        base: 3,
        resCeil: true,
        canBuyMax:() => true,
        gainMult() {
            return new Decimal(1)
        },
        gainExp() {
            return new Decimal(1)
        },
        row: 1,
        layerShown() {return true}, 
        branches: [["c", 1]], // Each pair corresponds to a line added to the tree when this node is unlocked. The letter is the other end of the line, and the number affects the color, 1 is default

        tooltipLocked() { // Optional, tooltip displays when the layer is locked
            return ("This weird farmer dinosaur will only see you if you have at least " + this.requires() + " candies. You only have " + formatWhole(player.points))
        },

        midsection: [
            "blank", ['display-image', 'https://images.beano.com/store/24ab3094eb95e5373bca1ccd6f330d4406db8d1f517fc4170b32e146f80d?auto=compress%2Cformat&dpr=1&w=390'],
            ["display-text", "Bork bork!"]
        ],

        // The following are only currently used for "custom" Prestige type:
        prestigeButtonText() { //Is secretly HTML
            if (!this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you a Farm Point in exchange for all of your candies and lollipops! (At least " + formatWhole(tmp.nextAt[layer]) + " candies)"
            if (this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you <b>" + formatWhole(tmp.resetGain[this.layer]) + "</b> Farm Points in exchange for all of your candies and lollipops! (You'll get another one at " + formatWhole(tmp.nextAtDisp[layer]) + " candies)"
        },
        getResetGain() {
            return getResetGain(this.layer, useType = "static")
        },
        getNextAt(canMax=false) { //  
            return getNextAt(this.layer, canMax, useType = "static")
        },
        canReset() {
            return tmp.layerAmt[this.layer].gte(tmp.nextAt[this.layer])
        },
    }, 
)


