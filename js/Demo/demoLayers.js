var testTree = [["f", "c"],
["g", "spook", "h"]]

addLayer("c", {
        layer: "c", // This is assigned automatically, both to the layer and all upgrades, etc. Shown here so you know about it
        name: "Candies", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: true,
			points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            buyables: {}, // You don't actually have to initialize this one
            beep: false,
        }},
        color: "#4BDC13",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "lollipops", // Name of prestige currency
        baseResource: "candies", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
        roundUpCost: false, // True if the cost needs to be rounded up (use when baseResource is static?)
        canBuyMax() {}, // Only needed for static layers with buy max
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (hasUpgrade(this.layer, 166)) mult = mult.times(2) // These upgrades don't exist
			if (hasUpgrade(this.layer, 120)) mult = mult.times(upgradeEffect(this.layer, 120))
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
        infoboxes:{
            coolInfo: {
                title: "Lore",
                titleStyle: {'color': '#FE0000'},
                body: "DEEP LORE!",
                bodyStyle: {'background-color': "#0000EE"}
            }
        },
        milestones: {
            0: {requirementDescription: "3 Lollipops",
                done() {return player[this.layer].best.gte(3)}, // Used to determine when to give the milestone
                effectDescription: "Unlock the next milestone",
            },
            1: {requirementDescription: "4 Lollipops",
                unlocked() {return hasMilestone(this.layer, 0)},
                done() {return player[this.layer].best.gte(4)},
                effectDescription: "You can toggle beep and boop (which do nothing)",
                toggles: [
                    ["c", "beep"], // Each toggle is defined by a layer and the data toggled for that layer
                    ["f", "boop"]],
                style() {                     
                    if(hasMilestone(this.layer, this.id)) return {
                        'background-color': '#1111DD' 
                }},
        
                },
        },
        challenges: {
            rows: 2,
    		cols: 12,
		    11: {
                name: "Fun",
                completionLimit: 3,
			    challengeDescription() {return "Makes the game 0% harder<br>"+challengeCompletions(this.layer, this.id) + "/" + this.completionLimit + " completions"},
			    unlocked() { return player[this.layer].best.gt(0) },
                goal: new Decimal("20"),
                currencyDisplayName: "lollipops", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLayer: this.layer, // Leave empty if not in a layer
                rewardEffect() {
                    let ret = player[this.layer].points.add(1).tetrate(0.02)
                    return ret;
                },
                rewardDisplay() { return format(this.rewardEffect())+"x" },
                countsAs: [12, 21], // Use this for if a challenge includes the effects of other challenges. Being in this challenge "counts as" being in these.
                rewardDescription: "Says hi",
                onComplete() {console.log("hiii")} // Called when you complete the challenge
            },
        }, 
        upgrades: {
            rows: 2,
            cols: 3,
            11: {
                title: "Generator of Genericness",
                description: "Gain 1 Point every second.",
                cost: new Decimal(1),
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
            },
            12: {
                description: "Candy generation is faster based on your unspent Lollipops.",
                cost: new Decimal(1),
                unlocked() { return (hasUpgrade(this.layer, 11))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(1).pow(player[this.layer].upgrades.includes(24)?1.1:(player[this.layer].upgrades.includes(14)?0.75:0.5)) 
                    if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            13: {
                description: "Unlock a <b>secret subtab</b> and make this layer act if you unlocked it first.",
                cost: new Decimal(69),
                currencyDisplayName: "candies", // Use if using a nonstandard currency
                currencyInternalName: "points", // Use if using a nonstandard currency
                currencyLocation: "", // The object in player data that the currency is contained in
                unlocked() { return (hasUpgrade(this.layer, 12))},
                onPurchase() { // This function triggers when the upgrade is purchased
                    player[this.layer].unlockOrder = 0
                },
                style() {
                    if (hasUpgrade(this.layer, this.id)) return {
                    'background-color': '#1111dd' 
                    }
                    else if (!canAffordUpgrade(this.layer, this.id)) {
                        return {
                            'background-color': '#dd1111' 
                        }
                    } // Otherwise use the default
                },
            },
            22: {
                title: "This upgrade doesn't exist",
                description: "Or does it?.",
                currencyLocation() {return player[this.layer].buyables}, // The object in player data that the currency is contained in
                currencyDisplayName: "exhancers", // Use if using a nonstandard currency
                currencyInternalName: 11, // Use if using a nonstandard currency

                cost: new Decimal(3),
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
            },
        },
        buyables: {
            rows: 1,
            cols: 12,
            showRespec: true,
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables) // A built-in thing to keep track of this but only keeps a single value
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
            respecText: "Respec Thingies", // Text on Respec button, optional
            11: {
                title: "Exhancers", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25)) x = x.pow(2).div(25)
                    let cost = Decimal.pow(2, x.pow(1.5))
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = {}
                    if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(1.1))
                    else eff.first = Decimal.pow(1/25, x.times(-1).pow(1.1))
                
                    if (x.gte(0)) eff.second = x.pow(0.8)
                    else eff.second = x.times(-1).pow(0.8).times(-1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " lollipops\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Adds + " + format(data.effect.first) + " things and multiplies stuff by " + format(data.effect.second)
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
                sellOne() {
                    let amount = getBuyableAmount(this.layer, this.id)
                    if (amount.lte(0)) return // Only sell one if there is at least one
                    setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].points = player[this.layer].points.add(this.cost())
                },
            },
        },
        doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
            if(layers[resettingLayer].row > this.row) layerDataReset(this.layer) // This is actually the default behavior
        },
        layerShown() {return true}, // Condition for when layer appears on the tree
        automate() {
        }, // Do any automation inherent to this layer if appropriate
        resetsNothing() {return false},
        onPrestige(gain) {
            return
        }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.

        hotkeys: [
            {key: "c", description: "C: reset for lollipops or whatever", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
            {key: "ctrl+c", description: "Ctrl+c: respec things", onPress(){if (player[this.layer].unlocked) respecBuyables(this.layer)}},
        ],
        increaseUnlockOrder: [], // Array of layer names to have their order increased when this one is first unlocked

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

        bars: {
            longBoi: {
                fillStyle: {'background-color' : "#FFFFFF"},
                baseStyle: {'background-color' : "#696969"},
                textStyle: {'color': '#04e050'},

                borderStyle() {return {}},
                direction: RIGHT,
                width: 300,
                height: 30,
                progress() {
                    return (player.points.add(1).log(10).div(10)).toNumber()
                },
                display() {
                    return format(player.points) + " / 1e10 points"
                },
                unlocked: true,

            },
            tallBoi: {
                fillStyle: {'background-color' : "#4BEC13"},
                baseStyle: {'background-color' : "#000000"},
                textStyle: {'text-shadow': '0px 0px 2px #000000'},

                borderStyle() {return {'border-width': "7px"}},
                direction: UP,
                width: 50,
                height: 200,
                progress() {
                    return player.points.div(100)
                },
                display() {
                    return formatWhole((player.points.div(1)).min(100)) + "%"
                },
                unlocked: true,

            },
            flatBoi: {
                fillStyle: {'background-color' : "#FE0102"},
                baseStyle: {'background-color' : "#222222"},
                textStyle: {'text-shadow': '0px 0px 2px #000000'},

                borderStyle() {return {}},
                direction: UP,
                width: 100,
                height: 30,
                progress() {
                    return player.c.points.div(50)
                },
                unlocked: true,

            },
        },

        // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
        tabFormat: {
            "main tab": {
                buttonStyle() {return  {'color': 'orange'}},
                shouldNotify: true,
                content:
                    ["main-display",
                    "prestige-button", "resource-display",
                    ["blank", "5px"], // Height
                    ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}],
                    ["display-text",
                        function() {return 'I have ' + format(player.points) + ' pointy points!'},
                        {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
                    "h-line", "milestones", "blank", "upgrades", "challenges"],
            },
            thingies: {
                style() {return  {'background-color': '#222222'}},
                buttonStyle() {return {'border-color': 'orange'}},
                content:[ 
                    ["buyables", ""], "blank",
                    ["row", [
                        ["toggle", ["c", "beep"]], ["blank", ["30px", "10px"]], // Width, height
                        ["display-text", function() {return "Beep"}], "blank", ["v-line", "200px"],
                        ["column", [
                            ["prestige-button", "", {'width': '150px', 'height': '80px'}],
                            ["prestige-button", "", {'width': '100px', 'height': '150px'}],
                        ]], 
                    ], {'width': '600px', 'height': '350px', 'background-color': 'green', 'border-style': 'solid'}],
                    "blank",
                    ["display-image", "discord.png"],],
            },
            jail: {
                content: [
                    ["infobox", "coolInfo"],
                    ["bar", "longBoi"], "blank",
                    ["row", [
                        ["column", [
                            ["display-text", "Sugar level:", {'color': 'teal'}],  "blank", ["bar", "tallBoi"]],
                        {'background-color': '#555555', 'padding': '15px'}],
                        "blank",
                        ["column", [
                        ["display-text", "idk"],
                        ["blank", ['0', '50px']], ["bar", "flatBoi"]
                        ]],
                    ]],
                    "blank", ["display-text", "It's jail because \"bars\"! So funny! Ha ha!"],["tree", testTree], 
                ],
            },
            illuminati: {
                unlocked() {return (hasUpgrade("c", 13))},
                content:[
                    ["raw-html", function() {return "<h1> C O N F I R M E D </h1>"}], "blank",
                    ["microtabs", "stuff", {'width': '600px', 'height': '350px', 'background-color': 'brown', 'border-style': 'solid'}]
                ]
            }

        },
        style() {return {
           //'background-color': '#3325CC' 
        }},
        nodeStyle() {return { // Style on the layer node
            'color': '#3325CC',
            'text-decoration': 'underline' 
        }},
        componentStyles: {
            "challenge"() {return {'height': '200px'}},
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
        },
        resetDescription: "Melt your points into ",
})



// This layer is mostly minimal but it uses a custom prestige type and a clickable
addLayer("f", {
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        boop: false,
        clickables: {[11]: "Start"} // Optional default Clickable state
    }},
    color: "#FE0102",
    requires() {return new Decimal(10)}, 
    resource: "farm points", 
    baseResource: "candies", 
    baseAmount() {return player.points},
    type: "static",
    exponent: 0.5,
    base: 3,
    roundUpCost: true,
    canBuyMax() {return hasAchievement('a', 13)},

    row: 1,
    layerShown() {return true}, 
    branches: ["c"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.

    tooltipLocked() { // Optional, tooltip displays when the layer is locked
        return ("This weird farmer dinosaur will only see you if you have at least " + this.requires() + " candies. You only have " + formatWhole(player.points))
    },

    midsection: [
        "blank", ['display-image', 'https://images.beano.com/store/24ab3094eb95e5373bca1ccd6f330d4406db8d1f517fc4170b32e146f80d?auto=compress%2Cformat&dpr=1&w=390'],
        ["display-text", "Bork bork!"]
    ],
    // The following are only currently used for "custom" Prestige type:
    prestigeButtonText() { //Is secretly HTML
        if (!this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you a Farm Point in exchange for all of your candies and lollipops! (At least " + formatWhole(tmp[this.layer].nextAt) + " candies)"
        if (this.canBuyMax()) return "Hi! I'm a <u>weird dinosaur</u> and I'll give you <b>" + formatWhole(tmp[this.layer].resetGain) + "</b> Farm Points in exchange for all of your candies and lollipops! (You'll get another one at " + formatWhole(tmp[layer].nextAtDisp) + " candies)"
    },
    getResetGain() {
        return getResetGain(this.layer, useType = "static")
    },
    getNextAt(canMax=false) { //  
        return getNextAt(this.layer, canMax, useType = "static")
    },
    canReset() {
        return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    // This is also non minimal, a Clickable!
    clickables: {
        rows: 1,
        cols: 1,
        masterButtonPress() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
            if (getClickableState(this.layer, 11) == "Borkened...")
                player[this.layer].clickables[11] = "Start"
        },
        masterButtonText() {return (getClickableState(this.layer, 11) == "Borkened...") ? "Fix the clickable!" : "Does nothing"}, // Text on Respec button, optional
        11: {
            title: "Clicky clicky!", // Optional, displayed at the top in a larger font
            display() { // Everything else displayed in the buyable button after the title
                let data = getClickableState(this.layer, this.id)
                return "Current state:<br>" + data
            },
            unlocked() { return player[this.layer].unlocked }, 
            canClick() {
                return getClickableState(this.layer, this.id) !== "Borkened..."},
            onClick() { 
                switch(getClickableState(this.layer, this.id)){
                    case "Start":
                        player[this.layer].clickables[this.id] = "A new state!"
                        break;
                    case "A new state!":
                        player[this.layer].clickables[this.id] = "Keep going!"
                        break;
                    case "Keep going!":
                        player[this.layer].clickables[this.id] = "Maybe that's a bit too far..."
                        break;                        
                    case "Maybe that's a bit too far...":
                        player[this.layer].clickables[this.id] = "Borkened..."
                        break;
                    default:
                        player[this.layer].clickables[this.id] = "Start"
                        break;

                }
            },
            style() {
                switch(getClickableState(this.layer, this.id)){
                    case "Start":
                        return {'background-color': 'green'}
                        break;
                    case "A new state!":
                        return {'background-color': 'yellow'}
                        break;
                    case "Keep going!":
                        return {'background-color': 'orange'}
                        break;                        
                    case "Maybe that's a bit too far...":
                        return {'background-color': 'red'}
                        break;
                    default:
                        return {}
                        break;
            }},
        },
    },

}, 
)

// A side layer with achievements, with no prestige
addLayer("a", {
        startData() { return {
            unlocked: true,
			points: new Decimal(0),
        }},
        color: "yellow",
        resource: "achievement power", 
        row: "side",
        layerShown() {return true}, 
        tooltip() { // Optional, tooltip displays when the layer is locked
            return ("Achievements")
        },
        achievements: {
            rows: 2,
            cols: 3,
            11: {
                name: "Get me!",
                done() {return true}, // This one is a freebie
                goalTooltip: "How did this happen?", // Shows when achievement is not completed
                doneTooltip: "You did it!", // Showed when the achievement is completed
            },
            12: {
                name: "Impossible!",
                done() {return false},
                goalTooltip: "Mwahahaha!", // Shows when achievement is not completed
                doneTooltip: "HOW????", // Showed when the achievement is completed
            },
            13: {
                name: "EIEIO",
                done() {return player.f.points.gte(1)},
                tooltip: "Get a farm point.\n\nReward: The dinosaur is now your friend (you can max Farm Points).", // Showed when the achievement is completed
                onComplete() {console.log("Bork bork bork!")}
            },
        },
    }, 
)
