addLayer("p", {

    effect() {return {}},
    startData() { return {
        unl: true,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color:() => "#00bfbf",
    background:() => undefined,
    requires:() => new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player[this.layer].upgrades.includes(21)) mult = mult.times(2)
            if (player[this.layer].upgrades.includes(23)) mult = mult.times(this.upgrades[23].effect())
            if (player.b.upgrades.includes(11)) mult = mult.times(layers.b.upgrades[11].effect())
            if (player.g.upgrades.includes(11)) mult = mult.times(layers.g.upgrades[11].effect())
            if (player.e.upgrades.includes(11)) mult = mult.times(layers.e.upgrades[11].effect())
            if (player.e.unl) mult = mult.times(layers.e.buyables[11].effect.second)
            if (player.d.unl) mult = mult.times(layers.d.buyables[11].effect(player.d.buyables[11]).first)
            if (!player.s.active) if (player.pr.buyables[13].gt(0)) mult = mult.times(layers.pr.buyables[13].effect().first)
        if (player.s.challs.includes(21)) mult = mult.times(layers.s.challs[21].effect())
        return mult.max(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        if (player.d.unl && player.d.banking == 1) exp = exp.div(2)
        if (player.s.active == 11) exp = exp.div(10)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            desc:() => "Gain 1 Point every second.",
            cost:() => new Decimal(1),
            unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
        },
        12: {
            desc:() => "Point generation is faster based on your unspent prestige points.",
            cost:() => new Decimal(1),
            unl() { return player[this.layer].upgrades.includes(11) },
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                if (player.d.banking == 1) return new Decimal(1)
                let ret = player[this.layer].points.add(2).pow(0.5) 
                if (player.s.unl) ret = ret.pow(layers.s.effect())
                if (ret.gte("1e20000000")) ret = ret.sqrt().times("1e10000000")
                return ret;
            },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        13: {
            desc:() => "Points boost point gain.",
            cost:() => new Decimal(5),
            unl() { return player[this.layer].upgrades.includes(12) },
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.points.add(1).log10().add(1)
                return ret;
            },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        21: {
            desc:() => "Double prestige point gain.",
            cost:() => new Decimal(10),
            unl() { return player[this.layer].upgrades.includes(13) },
        },
        22: {
            desc:() => "Point generation is faster based on your prestige upgrades.",
            cost:() => new Decimal(25),
            unl() { return player[this.layer].upgrades.includes(21) },
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                      let ret = Decimal.pow(1.4, player[this.layer].upgrades.length)
                      return ret
            },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        23: {
            desc:() => "Prestige Point gain is boosted by normal Points.",
            cost:() => new Decimal(250),
            unl() { return player[this.layer].upgrades.includes(22) },
            effect() { 
                      let ret = player.points.add(1).log10().cbrt().add(1) 
                      return ret;
            },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(resettingLayer == "b") {
          if (player.b.milestones.includes("0")) {
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].upgrades = upgrades
            return;
          }
        }
        if(resettingLayer == "g") {
          if (player.g.milestones.includes("0")) {
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].upgrades = upgrades
            return;
          }
        }
        if(resettingLayer == "e") {
          if (player.e.milestones.includes("0")) {
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].upgrades = upgrades
            return;
          }
        }
        if(resettingLayer == "r") {
          if (player.r.milestones.includes("0")) {
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].upgrades = upgrades
            return;
          }
        }
        if(resettingLayer == "d") {
          if (player.d.milestones.includes("0")) {
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].upgrades = upgrades
            return;
          }
        }
        if(layers[resettingLayer].row > this.row) fullLayerReset(this.layer) // This is actually the default behavior
    },
    layerShown() {return true}, // Condition for when layer appears on the tree
    update(diff) {
        if (player[this.layer].upgrades.includes(11)) player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
    }, // Do any gameloop things (e.g. resource generation) inherent to this layer
    hotkeys: [
        {key: "p", desc: "P: Reset points for prestige points.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}],
                ["blank", "5px"], // Height
                ["display-text",
                    function() {return 'You have ' + format(player.points) + ' points.'},
                    {"font-size": "14px"}],
                "upgrades"],
})


addLayer("b", {
    startData() { return {
        unl: false,
        auto: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: []
    }},
    color:() => "#415a9e",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(5000)
      if (player.g.unl && !player.b.unl) req = req.mul(500)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "boosters", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {
      return player[this.layer].milestones.includes("1")
    }, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player[this.layer].upgrades.includes(21)) mult = mult.div(layers[this.layer].upgrades[21].effect())
        if (!player.s.active) if (player.pr.buyables[11].gt(0)) mult = mult.div(layers.pr.buyables[11].effect().first)
        if (player.s.challs.includes(12)) mult = mult.div(layers.s.challs[12].effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (player.d.unl && player.d.banking == 3) exp = exp.div(2)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
      let base = new Decimal(2)
      if (player[this.layer].upgrades.includes(12)) base = base.add(layers[this.layer].upgrades[12].effect())
      if (player[this.layer].upgrades.includes(13)) base = base.add(layers[this.layer].upgrades[13].effect())
      if (player.e.unl && tmp.buyables) base = base.add(tmp.e.buyables[11].effect.first)
      if (!player.s.active) if (player.pr.buyables[12].gt(0)) base = base.add(layers.pr.buyables[12].effect().first)
      if (player.g.upgrades.includes(23)) base = base.mul(2) 
      if (player.s.active == 11) base = base.pow(0.1)
      if (player.d.unl && player.d.banking == 3) base = new Decimal(2)
      let exp = new Decimal(1)
      if (player.d.banking == 1) exp = exp.div(2)
      let free = new Decimal(0)
      if (!player.s.active) if (player.pr.buyables[14].gt(0)) free = free.add(layers.pr.buyables[14].effect().first)
      return Decimal.pow(base, player[this.layer].points.add(free)).pow(exp)
    },
    effectDescription:() => "multiplying point gain by "+format(layers[this.layer].effect())+"x",
    milestones: {
          0: {
            requirementDesc:() => "4 boosters",
            effectDesc:() => "You don't lose prestige upgrades on booster resets",
            done() {
                return player[this.layer].best.gte(4) || player.e.milestones.includes("0") || player.r.milestones.includes("0") || player.d.milestones.includes("0");
            }
          },
          1: {
            requirementDesc:() => "8 boosters",
            effectDesc:() => "You can max-buy boosters.",
            done() {
                return player[this.layer].best.gte(8);
            }
          }
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        let unlocked = true
        let autoed = player[this.layer].auto
        if(resettingLayer == "r") {
          if (player.r.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.r.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(resettingLayer == "d") {
          if (player.d.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.d.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(resettingLayer == "e") {
          if (player.e.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.e.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(layers[resettingLayer].row > this.row) {
          fullLayerReset(this.layer) // This is actually the default behavior
          player[this.layer].unl = unlocked
        }
    },
    layerShown() {return player.p.unl}, // Condition for when layer appears on the tree
    resetsNothing() {return player.e.milestones.includes("3") || player.r.milestones.includes("3") || player.d.milestones.includes("3")},
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            desc:() => "Boosters multiply prestige points.",
            cost:() => new Decimal(3),
            unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(2).log10().add(1).pow(2)
                return ret;
            },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        12: {
            desc:() => "Generators add to the base of Boosters.",
            cost:() => new Decimal(8),
            unl() { return player[this.layer].upgrades.includes(11) && player.g.unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.g.points.add(1).log10().div(3)
                return ret;
            },
            effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        13: {
            desc:() => "Prestige Points add to the base of Boosters.",
            cost:() => new Decimal(16),
            unl() { return player[this.layer].upgrades.includes(12) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.p.points.add(1).log10().root(7).div(3)
                return ret;
            },
            effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        21: {
            desc:() => "Points divide the Booster cost.",
            cost:() => new Decimal(20),
            unl() { return player[this.layer].upgrades.includes(13) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = (player.points.add(1)).root(15)
                return ret;
            },
            effectDisplay() { return "/"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        22: {
            desc:() => "Square the Generator Power effect.",
            cost:() => new Decimal(21),
            unl() { return player[this.layer].upgrades.includes(21) }, // The upgrade is only visible when this is true
        },
        23: {
            desc:() => "Boosters multiply Generator Power gain.",
            cost:() => new Decimal(24),
            unl() { return player[this.layer].upgrades.includes(22) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.b.points.add(1).log10().add(1).pow(5)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
    },
    hotkeys: [
        {key: "b", desc: "B: Reset points for boosters.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    incr_order: [], // Array of layer names to have their order increased when this one is first unlocked
    prestigeButtonText() { //Is secretly HTML
      return  `<span v-if="player[layer].points.lt(10)">Convert your points into </span>+<b>${formatWhole(tmp[layer].resetGain)}</b> ${layers[layer].resource}<br><br><span v-if="player[layer].points.lt(10)">${(tmp[layer].baseAmount.gte(tmp[layer].nextAt)&&layers[layer].canBuyMax && layers[layer].canBuyMax())?"Next":"Req"}: ${formatWhole(tmp[layer].baseAmount)} / </span>${(layers[layer].resCeil ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))} ${ layers[layer].baseResource }`
    },
    getResetGain() {
          if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
          let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
          if (gain.gte(12)) {
                gain = gain.times(12).sqrt()
        }
          if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
          return gain.floor().sub(player[layer].points).add(1).max(1);
    },
    getNextAt() {
          let amt = player[layer].points
          if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
          if (amt.gte(12)) {
                amt = amt.pow(2).div(12)
          }
          let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
          let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
          if (layers[layer].resCeil) cost = cost.ceil()
          return cost;
    },
    canReset() {
        return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    automate() {
        if (player.e.milestones.includes("4") || player.r.milestones.includes("4") || player.d.milestones.includes("4") && player[this.layer].auto) doReset(this.layer, false)
      }, // Do any automation inherent to this layer if appropriate
    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}, {}],
                ["blank", "5px"], // Height
                ["display-text",
                    function() {return 'You have ' + format(player.points) + ' points.'},
                    {"font-size": "14px"}],
                "upgrades", "blank", "milestones"],
      branches: [["p", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})


addLayer("g", {
    startData() { return {
        unl: false,
        auto: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        power: new Decimal(0),
        milestones: []
    }},
    color:() => "#409c6e",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(5000)
      if (player.b.unl && !player.g.unl) req = req.mul(500)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "generators", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {
      return player[this.layer].milestones.includes("1")
    }, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player[this.layer].upgrades.includes(21)) mult = mult.div(layers[this.layer].upgrades[21].effect())
        if (!player.s.active) if (player.pr.buyables[11].gt(0)) mult = mult.div(layers.pr.buyables[11].effect().first)
        if (player.s.challs.includes(12)) mult = mult.div(layers.s.challs[12].effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if (player.d.unl && player.d.banking == 3) exp = exp.div(2)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
      let base = new Decimal(2)
      if (player[this.layer].upgrades.includes(12)) base = base.add(layers[this.layer].upgrades[12].effect())
      if (player[this.layer].upgrades.includes(13)) base = base.add(layers[this.layer].upgrades[13].effect())
      if (player.r.upgrades.includes(14)) base = base.add(layers.r.upgrades[14].effect())
      if (player.e.unl && tmp.buyables) base = base.add(tmp.e.buyables[11].effect.first)
      if (!player.s.active) if (player.pr.buyables[12].gt(0)) base = base.add(layers.pr.buyables[12].effect().first)
      if (player.s.active == 11) base = base.pow(0.1)
      if (player.d.unl && player.d.banking == 3) base = new Decimal(2)
      
      let genMult = new Decimal(1)
      if (player[this.layer].upgrades.includes(14)) genMult = genMult.add(layers[this.layer].upgrades[14].effect())
      if (player[this.layer].upgrades.includes(22)) genMult = genMult.add(layers[this.layer].upgrades[22].effect())
      if (player.b.upgrades.includes(23)) genMult = genMult.add(layers.b.upgrades[23].effect(player.e.buyables[11]))
        if (player.r.unl) genMult = genMult.times(layers.r.effect().powerBoost)
      if (player.d.unl) genMult = genMult.times(layers.d.buyables[13].effect(player.d.buyables[13]).first)
      
      let powerPow = new Decimal(1)
      if (player.b.upgrades.includes(21)) powerPow = powerPow.add(1)
      if (player.d.banking == 1) powerPow = powerPow.div(2)
      
      let freeGens = new Decimal(0)
      if (player.r.unl && tmp.buyables) freeGens = freeGens.add(tmp.r.buyables[13].effect.first)
      if (!player.s.active) if (player.pr.buyables[14].gt(0)) freeGens = freeGens.add(layers.pr.buyables[14].effect().first)
      return {
        genProd: Decimal.pow(base, player[this.layer].points.add(freeGens)).sub(1).mul(genMult),
        powerBoost: player.g.power.add(1).pow(1/3).pow(powerPow)
      }
    },
    effectDescription() {return "producing "+format(layers[this.layer].effect().genProd)+" generator power each second"},
    milestones: {
          0: {
            requirementDesc:() => "4 generators",
            effectDesc:() => "You don't lose prestige upgrades on generator resets",
            done() {
                return player[this.layer].best.gte(4) || player.e.milestones.includes("0") || player.r.milestones.includes("0") || player.d.milestones.includes("0");
            }
          },
          1: {
            requirementDesc:() => "8 generators",
            effectDesc:() => "You can buy max generators.",
            done() {
                return player[this.layer].best.gte(8);
            }
          },
          2: {
            requirementDesc:() => "14 generators",
            effectDesc:() => "You get 100% of Prestige Points gained on Prestige each second.",
            done() {
                return player[this.layer].best.gte(14);
            }
          }
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row-1) player.g.power = new Decimal(0)
        let unlocked = true
        let autoed = player[this.layer].auto
        if(resettingLayer == "d") {
          if (player.d.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.d.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(resettingLayer == "r") {
          if (player.r.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.r.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(resettingLayer == "e") {
          if (player.e.milestones.includes("2")) {
            let milestones = player[this.layer].milestones
            let upgrades = player[this.layer].upgrades
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].upgrades = upgrades
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
          if (player.e.milestones.includes("1")) {
            let milestones = player[this.layer].milestones
            fullLayerReset(this.layer)
            player[this.layer].milestones = milestones
            player[this.layer].unl = unlocked
            player[this.layer].auto = autoed
            return;
          }
        }
        if(layers[resettingLayer].row > this.row) {
          fullLayerReset(this.layer) // This is actually the default behavior
          player[this.layer].unl = unlocked
        }
    },
    convertToDecimal() {
        player.g.power = new Decimal(player.g.power)
        // Convert any layer-specific Decimal values (besides points, total, and best) from String to Decimal (used when loading save)
    },
    layerShown() {return player.p.unl}, // Condition for when layer appears on the tree
    automate() {
      if (player.e.milestones.includes("4") || player.r.milestones.includes("4") || player.d.milestones.includes("4") && player[this.layer].auto) doReset(this.layer, false)
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    update(diff) {
      if (player.g.unl) player.g.power = player.g.power.add(layers[this.layer].effect().genProd.mul(diff))
      if (player[this.layer].milestones.includes("2")) generatePoints("p", diff)
    },
    resetsNothing() {return player.e.milestones.includes("3") || player.r.milestones.includes("3") || player.d.milestones.includes("3")},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            desc:() => "Generators multiply prestige points.",
            cost:() => new Decimal(3),
            unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(2).log10().add(1).pow(2)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        12: {
            desc:() => " Boosters add to the base of Generators.",
            cost:() => new Decimal(8),
            unl() { return player[this.layer].upgrades.includes(11) && player.b.unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.b.points.add(1).log10().div(3)
                return ret;
            },
            effectDisplay(fx) { return "+"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        13: {
            desc:() => "Prestige Points add to the base of Generators.",
            cost:() => new Decimal(16),
            unl() { return player[this.layer].upgrades.includes(12) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.p.points.add(1).log10().root(7).div(3)
                return ret;
            },
            effectDisplay(fx) { return "+"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        14: {
            desc:() => "Generator Power boosts itself.",
            cost:() => new Decimal(19),
            unl() { return player[this.layer].upgrades.includes(13) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].power.add(1).log10().add(1).pow(1.15)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        21: {
            desc:() => "Prestige Points divide the Generator cost.",
            cost:() => new Decimal(24),
            unl() { return player[this.layer].upgrades.includes(14) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = (player.p.points.add(1)).root(13)
                return ret;
            },
            effectDisplay(fx) { return "/"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        22: {
            desc:() => "Points multiply Generator Power gain.",
            cost:() => new Decimal(25),
            unl() { return player[this.layer].upgrades.includes(21) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.points.add(1).log10().add(1).pow(2)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        23: {
            desc:() => "Double the Booster base.",
            cost:() => new Decimal(26),
            unl() { return player[this.layer].upgrades.includes(22) }, // The upgrade is only visible when this is true
        },
        24: {
            desc:() => "???",
            cost:() => new Decimal(1/0),
            unl() { return false }, // The upgrade is only visible when this is true
        },
    },
    hotkeys: [
        {key: "g", desc: "G: Reset points for generators.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    incr_order: [], // Array of layer names to have their order increased when this one is first unlocked
    prestigeButtonText() { //Is secretly HTML
      return  `<span v-if="player[layer].points.lt(10)">Convert your points into </span>+<b>${formatWhole(tmp[layer].resetGain)}</b> ${layers[layer].resource}<br><br><span v-if="player[layer].points.lt(10)">${(tmp[layer].baseAmount.gte(tmp[layer].nextAt)&&layers[layer].canBuyMax && layers[layer].canBuyMax())?"Next":"Req"}: ${formatWhole(tmp[layer].baseAmount)} / </span>${(layers[layer].resCeil ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))} ${ layers[layer].baseResource }`
    },
    getResetGain() {
          if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
          let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
          if (gain.gte(12)) {
                gain = gain.times(12).sqrt()
        }
          if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
          return gain.floor().sub(player[layer].points).add(1).max(1);
    },
    getNextAt() {
          let amt = player[layer].points
          if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
          if (amt.gte(12)) {
                amt = amt.pow(2).div(12)
          }
          let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
          let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
          if (layers[layer].resCeil) cost = cost.ceil()
          return cost;
    },
    canReset() {
        return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}, {}],
                ["display-text",
                    function() {return 'You have ' + format(player.points) + ' points.'},
                    {"font-size": "14px"}],
                ["blank", "5px"], // Height
                ["display-text",
                    function() {return 'You have ' + format(player.g.power) + ' generator power, translating to a '+format(layers.g.effect().powerBoost)+'x multiplier to points.'},
                    {"font-size": "14px"}],
                "upgrades", "blank", "milestones"],
      branches: [["p", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})

addLayer("e", {
    startData() { return {
        unl: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: [],
        order: 0
    }},
    color:() => "#9643a3",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(1e60)
      if (!player[this.layer].upgrades.includes(14)) if (player[this.layer].order > 0) req = req.pow(player[this.layer].order+1)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "enhance points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.04, // Prestige currency exponent
    base: 5, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player[this.layer].upgrades.includes(12)) mult = mult.mul(layers[this.layer].upgrades[12].effect())
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    milestones: {
          0: {
            requirementDesc:() => "1 enhance point",
            effectDesc:() => "You don't lose prestige upgrades on previous resets and this resets",
            done() {
                return player[this.layer].best.gte(1);
            }
          },
          1: {
            requirementDesc:() => "3 enhance points",
            effectDesc:() => "You keep all booster and generator milestones on reset.",
            done() {
                return player[this.layer].best.gte(3);
            }
          },
          2: {
            requirementDesc:() => "10 enhance points",
            effectDesc:() => "You keep booster and generator upgrades on reset.",
            done() {
                return player[this.layer].best.gte(10);
            }
          },
          3: {
            requirementDesc:() => "15 enhance points",
            effectDesc:() => "Boosters and generators do not reset everything.",
            done() {
                return player[this.layer].best.gte(15);
            }
          },
          4: {
            requirementDesc:() => "50 enhance points",
            effectDesc:() => "Automate boosters and generators.",
            done() {
                return player[this.layer].best.gte(50);
            },
            toggles: [
              ["b", "auto"],
              ["g", "auto"]
            ]
          }
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title:() => "Enhancers", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]
                if (x.gte(25)) x = x.pow(2).div(25)
                if (player[this.layer].upgrades.includes(13)) x = x.div(layers[this.layer].upgrades[13].effect())
                let cost = Decimal.pow(2, x.pow(1.5))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]

                let eff = {}
                eff.first = Decimal.pow(1.5, x.sqrt())
            
                eff.second = x.add(1).pow(3)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " enhance points\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Adds + " + format(data.effect.first) + " to the booster and generator base and multiply points and prestige points by " + format(data.effect.second)
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
    },
    layerShown() {return player.b.unl && player.g.unl}, // Condition for when layer appears on the tree
    automate() {
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    resetsNothing() {return false},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    upgrades: {
        rows: 1,
        cols: 4,
        11: {
            desc:() => "Enhance points boost point and prestige point gain.",
            cost:() => new Decimal(100),
            unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(2).root(1.5)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        12: {
            desc:() => "Generator Power boosts enhance point gain.",
            cost:() => new Decimal(500),
            unl() { return player[this.layer].upgrades.includes(11) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.g.power.add(1).log10().add(1).root(8)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        13: {
            desc:() => "Boosters reduce the enhancer cost formula power.",
            cost:() => new Decimal(1000),
            unl() { return player[this.layer].upgrades.includes(12) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.b.points.add(1).log10().add(1).root(3)
                return ret;
            },
            effectDisplay(fx) { return "/"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        14: {
            desc:() => "This layer behaves like it was bought first..",
            cost:() => new Decimal(1000),
            unl() { return player[this.layer].order > 0 && player[this.layer].upgrades.includes(13) }, // The upgrade is only visible when this is true
        },
    },
    hotkeys: [
        {key: "e", desc: "E: Reset points for enhance points.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    tooltipLocked() { // Optional, tooltip displays when the layer is locked
        return ("(Passive layer) This layer requires " + this.requires() + " points. You only have " + formatWhole(player.points))
    },
    incr_order: ["r", "d"],

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}, {}],
                ["display-text",
                    function() {return 'You have ' + format(player.points) + ' points.'},
                    {"font-size": "14px"}],
                ["blank", "5px"], // Height
                "buyables", "blank", "blank",
                "upgrades", "blank", "milestones"],
      branches: [["b", 1], ["g", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})

addLayer("r", {
    startData() { return {
        unl: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: [],
        power: new Decimal(1),
        order: 0
    }},
    color:() => "#94bc42",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(1e20)
      if (!player[this.layer].upgrades.includes(15)) if (player[this.layer].order > 0) req = req.pow(player[this.layer].order+1)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "replicators", // Name of prestige currency
    baseResource: "generator power", // Name of resource prestige is based on
    baseAmount() {return player.g.power}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 25, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {return player[this.layer].milestones.includes("4")}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    effect() {
      let base = new Decimal(1)
      if (player.r.unl && tmp.buyables) base = base.mul(tmp.r.buyables[11].effect.first)
      if (player[this.layer].upgrades.includes(12)) base = base.mul(layers[this.layer].upgrades[12].effect())
      if (player[this.layer].upgrades.includes(13)) base = base.mul(layers[this.layer].upgrades[13].effect())
      
      let genMult = new Decimal(1)
      if (player.r.unl && tmp.buyables) genMult = genMult.mul(tmp.r.buyables[12].effect.first)
      
      return {
        genProd: player[this.layer].points.add(1).log10().add(1).pow(base).sub(1),
        powerBoost: player.r.power.add(1).log2().add(1).pow(genMult)
      }
    },
    effectDescription() {return "making replicanti multiply by "+format(layers[this.layer].effect().genProd.add(1))+" each second"},
    milestones: {
          0: {
            requirementDesc:() => "1 replicator",
            effectDesc:() => "You don't lose prestige upgrades on previous resets and this resets",
            done() {
                return player[this.layer].best.gte(1);
            }
          },
          1: {
            requirementDesc:() => "2 replicators",
            effectDesc:() => "You keep all booster and generator milestones on reset.",
            done() {
                return player[this.layer].best.gte(2);
            }
          },
          2: {
            requirementDesc:() => "4 replicators",
            effectDesc:() => "You keep booster and generator upgrades on reset.",
            done() {
                return player[this.layer].best.gte(4);
            }
          },
          3: {
            requirementDesc:() => "5 replicators",
            effectDesc:() => "Boosters and generators do not reset everything.",
            done() {
                return player[this.layer].best.gte(5);
            }
          },
          4: {
            requirementDesc:() => "8 replicators",
            effectDesc:() => "Automate boosters and generators, and you can buy max replicators.",
            done() {
                return player[this.layer].best.gte(8);
            },
            toggles: [
              ["b", "auto"],
              ["g", "auto"]
            ]
          }
    },
    buyables: {
        rows: 1,
        cols: 3,
        11: {
            title:() => "Replication Up", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]
                if (x.gte(25)) x = x.pow(2).div(25)
                if (player[this.layer].buyables[this.id].gte(150)) x = x.pow(1.5).div(12.2474487139)
                let cost = Decimal.pow(500, x.add(1).pow(1.5))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = Decimal.pow(1.4, x.sqrt())
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " replicanti\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Multiplies replicator power by " + format(data.effect.first) + "x"
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].power = player[this.layer].power.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        12: {
            title:() => "Effect Up", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]
                if (x.gte(25)) x = x.pow(2).div(25)
                if (player[this.layer].buyables[this.id].gte(150)) x = x.pow(1.5).div(12.2474487139)
                let cost = Decimal.pow(1000, x.add(1).pow(1.5))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x.add(1).log10().add(1).pow(0.25)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " replicanti\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Multiplies replicanti power by " + format(data.effect.first) + "x"
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].power = player[this.layer].power.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        13: {
            title:() => "Generator", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]
                if (x.gte(5)) x = x.pow(3).div(25)
                if (player[this.layer].buyables[this.id].gte(25)) x = x.pow(4).div(244140625)
                if (player[this.layer].buyables[this.id].gte(50)) x = x.pow(5).div(3.90625e13)
                let cost = Decimal.pow("1.80e308", x.add(1).pow(0.125))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost) + " replicanti\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Get " + format(data.effect.first) + " free generators, and increase the replicanti limit by "+format(tmp[this.layer].buyables[this.id].cost.div("1.80e308"))+"x"
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].power = player[this.layer].power.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
    },
    upgrades: {
        rows: 1,
        cols: 5,
        11: {
            desc:() => "Replicanti boosts point gain.",
            cost:() => new Decimal(3),
            unl() { return player[this.layer].unl }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].power.add(1).log2().add(1).log2().add(1).pow(3)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        12: {
            desc:() => "Generator Power boosts replicanti gain.",
            cost:() => new Decimal(7),
            unl() { return player[this.layer].upgrades.includes(11) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player.g.power.add(1).log2().add(1).log2().add(1).log2().add(1)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        13: {
            desc:() => "Replicanti boosts itself.",
            cost:() => new Decimal(14),
            unl() { return player[this.layer].upgrades.includes(12) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].power.add(1).log2().add(1).log2().add(1).log2().add(1).log2().add(1)
                return ret;
            },
            effectDisplay(fx) { return format(tmp[this.layer].upgrades[this.id].effect)+"x" }, // Add formatting to the effect
        },
        14: {
            desc:() => "Replicators boost the generator base.",
            cost:() => new Decimal(17),
            unl() { return player[this.layer].upgrades.includes(13) }, // The upgrade is only visible when this is true
            effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                let ret = player[this.layer].points.add(1).log2().add(1).log2().add(1).cbrt()
                return ret;
            },
            effectDisplay(fx) { return "+"+format(tmp[this.layer].upgrades[this.id].effect) }, // Add formatting to the effect
        },
        15: {
            desc:() => "This layer behaves like it was bought first.",
            cost:() => new Decimal(20),
            unl() { return player[this.layer].order > 0 && player[this.layer].upgrades.includes(14) }, // The upgrade is only visible when this is true
        },
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row-1) player.r.power = new Decimal(1)
    },
    convertToDecimal() {
      player.r.power = new Decimal(player.r.power).max(1)
    },
    layerShown() {return player.g.unl}, // Condition for when layer appears on the tree
    automate() {
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    resetsNothing() {return false},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    update(diff) {
      player.r.power = player.r.power.mul(layers[this.layer].effect().genProd.mul(diff).add(1)).max(1).min(tmp["r"].buyables[13].cost)
    },
    hotkeys: [
        {key: "r", desc: "R: Reset generator power for replicators.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    prestigeButtonText() { //Is secretly HTML
      return  `<span v-if="player[layer].points.lt(10)">Convert your generator power into </span>+<b>${formatWhole(tmp[layer].resetGain)}</b> ${layers[layer].resource}<br><br><span v-if="player[layer].points.lt(10)">${(tmp[layer].baseAmount.gte(tmp[layer].nextAt)&&layers[layer].canBuyMax && layers[layer].canBuyMax())?"Next":"Req"}: ${formatWhole(tmp[layer].baseAmount)} / </span>${(layers[layer].resCeil ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))} ${ layers[layer].baseResource }`
    },
    getResetGain() {
          if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
          let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
          if (gain.gte(12)) {
                gain = gain.times(12).sqrt()
        }
          if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
          return gain.floor().sub(player[layer].points).add(1).max(1);
    },
    getNextAt() {
          let amt = player[layer].points
          if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
          if (amt.gte(12)) {
                amt = amt.pow(2).div(12)
          }
          let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
          let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
          if (layers[layer].resCeil) cost = cost.ceil()
          return cost;
    },
    canReset() {
        return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    tooltipLocked() { // Optional, tooltip displays when the layer is locked
        return ("(Active layer) This layer requires " + this.requires() + " generator power. You only have " + formatWhole(player.g.power))
    },
    incr_order: ["e", "d"],

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your generator power into "}, {}],
                ["display-text",
                    function() {return 'You have ' + format(player.r.power) + ' replicanti (Limit at '+format(tmp["r"].buyables[13].cost)+'), multiplying generator power gain by '+format(tmp.r.effect.powerBoost)+'.'},
                    {"font-size": "14px"}],
                "upgrades", "buyables", ["blank", "25px"], "milestones"],
      branches: [["g", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})

addLayer("d", {
    startData() { return {
        unl: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: [],
        power: new Decimal(1),
        order: 0,
        banking: 0
    }},
    color:() => "#328ba8",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(1e32)
      if (!player[this.layer].upgrades.includes(11)) if (player[this.layer].order > 0) req = req.pow(player[this.layer].order+1)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "tachyon particles", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.750, // Prestige currency exponent
    base: 500, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: false, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {return true}, // Only needed for static layers with buy max
    effect() {
      let base = new Decimal(1.1)
      return Decimal.pow(base, player[this.layer].points.pow(0.9))
    },
    effectDescription:() => "multiplying dilated currency gain by "+format(layers[this.layer].effect())+"x",
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    milestones: {
          0: {
            requirementDesc:() => "1 tachyon particle",
            effectDesc:() => "You don't lose prestige upgrades on previous resets and this resets",
            done() {
                return player[this.layer].best.gte(1);
            }
          },
          1: {
            requirementDesc:() => "2 tachyon particles",
            effectDesc:() => "You keep all booster and generator milestones on reset.",
            done() {
                return player[this.layer].best.gte(2);
            }
          },
          2: {
            requirementDesc:() => "4 tachyon particles",
            effectDesc:() => "You keep booster and generator upgrades on reset.",
            done() {
                return player[this.layer].best.gte(4);
            }
          },
          3: {
            requirementDesc:() => "5 tachyon particles",
            effectDesc:() => "Boosters and generators do not reset everything.",
            done() {
                return player[this.layer].best.gte(5);
            }
          },
          4: {
            requirementDesc:() => "8 tachyon particles",
            effectDesc:() => "Automate boosters and generators.",
            done() {
                return player[this.layer].best.gte(8);
            },
            toggles: [
              ["b", "auto"],
              ["g", "auto"]
            ]
          }
    },
    dilationMult() {
      let mult = layers[this.layer].effect()
      if (player.d.unl) mult = mult.times(layers.d.buyables[21].effect(player.d.buyables[21]).first)
      return mult
    },
    buyables: {
        rows: 2,
        cols: 3,
        11: {
            title:() => "Dilated Prestige Points", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(0)
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x.add(1).root(2)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
                      return data.canAfford 
                        ? "You have " + format(player[this.layer].buyables[this.id], 0) + " dilated prestige points, which are boosting prestige point multiplier by " + format(data.effect.first) + "x.\n\n\
                        Dilation is currently " + (player[this.layer].banking == 1 ? "enabled.\n\
                          Click here to disable dilation and gain " + format(player.p.points.mul(layers[this.layer].dilationMult()).sub(player.d.buyables[11]).max(0), 0) + " dilated prestige points." : "disabled.\n\
                          Click here to enable dilation, which will force a dilation reset and square root all of your point generation speed, prestige point gain, generator effects, booster effects, and disable the second Prestige Upgrade.")
                        : "You need to obtain at least 2 tachyon particles before you can use this function."
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return true},
            buy() { 
                      if (player.d.banking == 1) player.d.buyables[11] = player.d.buyables[11].max(player.p.points.mul(layers[this.layer].dilationMult()))
                      player.d.banking = player.d.banking == 1 ? 0 : 1
              doReset(this.layer, true)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        12: {
            title:() => "Dilated Points", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(0)
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x.add(1)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
                      return data.canAfford 
                        ? "You have " + format(player[this.layer].buyables[this.id], 0) + " dilated points, which are boosting point multiplier by " + format(data.effect.first) + "x.\n\n\
                        Dilation is currently " + (player[this.layer].banking == 2 ? "enabled.\n\
                          Click here to disable dilation and gain " + format(player.points.mul(layers[this.layer].dilationMult()).sub(player.d.buyables[12]).max(0), 0) + " dilated prestige points." : "disabled.\n\
                          Click here to enable dilation, which will force a dilation reset and apply logarithm to your point generation.")
                        : "You need to obtain at least 3 tachyon particles before you can use this function."
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].points.gte(3)},
            buy() { 
                      if (player.d.banking == 2) player.d.buyables[12] = player.d.buyables[12].max(player.points.mul(layers[this.layer].dilationMult()))
                      player.d.banking = player.d.banking == 2 ? 0 : 2
              doReset(this.layer, true)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        13: {
            title:() => "Dilated Generator Power", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                return new Decimal(0)
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x.add(1).root(5)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
                      return data.canAfford 
                        ? "You have " + format(player[this.layer].buyables[this.id], 0) + " dilated generator power, which are boosting generator power gain by " + format(data.effect.first) + "x.\n\n\
                        Dilation is currently " + (player[this.layer].banking == 3 ? "enabled.\n\
                          Click here to disable dilation and gain " + format(player.g.power.mul(layers[this.layer].dilationMult()).sub(player.d.buyables[13]).max(0), 0) + " dilated generator power." : "disabled.\n\
                          Click here to enable dilation, which will force a dilation reset, lock the generator and booster bases at 2, and double booster and generator cost multiplier.")
                        : "You need to obtain at least 7 tachyon particles before you can use this function."
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return player[this.layer].points.gte(7)},
            buy() { 
                      if (player.d.banking == 3) player.d.buyables[13] = player.d.buyables[13].max(player.g.power.mul(layers[this.layer].dilationMult()))
                      player.d.banking = player.d.banking == 3 ? 0 : 3
              doReset(this.layer, true)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        21: {
            title:() => "Dilation Boost", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]
                let cost = Decimal.pow("5000", x.add(1))
                return {
                  1: cost.floor(),
                  2: cost.sqrt().div(50).floor(),
                  3: cost.pow(2).floor()
                }
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = Decimal.pow(4, x)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost[1]) + " dilated prestige points, " + format(data.cost[2]) + " dilated points, " + format(data.cost[3]) + " dilated generator power\n\
                Amount: " + player[this.layer].buyables[this.id] + "\n\
                Multiply all dilation currency gain by " + format(data.effect.first) + "x"
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return (player[this.layer].buyables[11].gte(tmp[this.layer].buyables[this.id].cost[1]) && player[this.layer].buyables[12].gte(tmp[this.layer].buyables[this.id].cost[2]) && player[this.layer].buyables[13].gte(tmp[this.layer].buyables[this.id].cost[3]))
            },
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost[1])	
                player[this.layer].buyables[12] = player[this.layer].buyables[12].sub(cost[2])	
                player[this.layer].buyables[13] = player[this.layer].buyables[13].sub(cost[3])	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        22: {
            title:() => "shh", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]

                let cost = Decimal.pow("5000", x.add(1))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Why are you here"
            },
            unl() { return false }, 
            canAfford() {
                return player[this.layer].buyables[11].gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
        23: {
            title:() => "shh", // Optional, displayed at the top in a larger font
            cost() { // cost for buying xth buyable, can be an object if there are multiple currencies
                let x = player[this.layer].buyables[this.id]

                let cost = Decimal.pow("5000", x.add(1))
                return cost.floor()
            },
            effect() { // Effects of owning x of the items, x is a decimal
                let x = player[this.layer].buyables[this.id]
                let eff = {}
                eff.first = x
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Why are you here"
            },
            unl() { return false }, 
            canAfford() {
                return player[this.layer].buyables[11].gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buyMax() {}, // You'll have to handle this yourself if you want
        },
    },
    upgrades: {
        rows: 1,
        cols: 1,
        11: {
            desc:() => "This layer no longer uses order.",
            cost:() => new Decimal(15),
            unl() { return player[this.layer].order > 0 }, // The upgrade is only visible when this is true
        },
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row-1) player.r.power = new Decimal(1)
    },
    layerShown() {return player.b.unl}, // Condition for when layer appears on the tree
    automate() {
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    resetsNothing() {return false},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    update(diff) {
    },
    hotkeys: [
        {key: "d", desc: "D: Reset prestige points for tachyon particles.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    prestigeButtonText() { //Is secretly HTML
      return  `<span v-if="player[layer].points.lt(10)">Convert your prestige points into </span>+<b>${formatWhole(tmp[layer].resetGain)}</b> ${layers[layer].resource}<br><br><span v-if="player[layer].points.lt(10)">${(tmp[layer].baseAmount.gte(tmp[layer].nextAt)&&layers[layer].canBuyMax && layers[layer].canBuyMax())?"Next":"Req"}: ${formatWhole(tmp[layer].baseAmount)} / </span>${(layers[layer].resCeil ? formatWhole(tmp[layer].nextAtDisp) : format(tmp[layer].nextAtDisp))} ${ layers[layer].baseResource }`
    },
    getResetGain() {
          if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
          let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
          if (gain.gte(12)) {
                gain = gain.times(12).sqrt()
        }
          if (gain.gte(1225)) gain = gain.times(Decimal.pow(1225, 9)).pow(0.1)
          return gain.floor().sub(player[layer].points).add(1).max(1);
    },
    getNextAt() {
          let amt = player[layer].points
          if (amt.gte(1225)) amt = amt.pow(10).div(Decimal.pow(1225, 9))
          if (amt.gte(12)) {
                amt = amt.pow(2).div(12)
          }
          let extraCost = Decimal.pow(layers[layer].base, amt.pow(layers[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
          let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
          if (layers[layer].resCeil) cost = cost.ceil()
          return cost;
    },
    canReset() {
        return tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt)
    },
    tooltipLocked() { // Optional, tooltip displays when the layer is locked
        return ("(Idle layer) This layer requires " + this.requires() + " prestige points. You only have " + formatWhole(player.p.points))
    },
    incr_order: ["r", "e"],

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your prestige points into "}, {}],
                "upgrades", "buyables", ["blank", "25px"], "milestones"],
      branches: [["b", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})

addLayer("pr", {
    startData() { return {
        unl: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: [],
        power: new Decimal(1),
        order: 0
    }},
    color:() => "#e8d684",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(68)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "ascension power", // Name of prestige currency
    baseResource: "boosters", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.850, // Prestige currency exponent
    base: 1.03, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: true, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {return true}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    effect() {
      let base = new Decimal(1.03)
      return Decimal.pow(base, player[this.layer].points.sub(8).max(0).sqrt())
    },
    effectDescription:() => "increasing the perk power by "+format(layers[this.layer].effect().sub(1).mul(100))+"%",
    maxActivePerks() {
      let number = 1;
      if (player.s.challs.includes(11)) number += 1
      return number
    },
    activePerks() {
      let number = 0;
      for (var i in player[this.layer].buyables) {
        if (player[this.layer].buyables[i].gt(0)) number += 1
      }
      return number
    },
    perkPower() {
      let power = layers[this.layer].effect()
      return power
    },
    buyables: {
        rows: 1,
        cols: 4,
        11: {
            title:() => "Cost Perk", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let multiplier = new Decimal(30)
                return multiplier
            },
            effect(x) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                eff.first = new Decimal(1e7)
                eff.first = eff.first.pow(layers[this.layer].perkPower())
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
              let activeThing = (player[this.layer].buyables[this.id].gt(1) ? "Active for "+format(player[this.layer].buyables[this.id], 0)+" seconds" : "Not Active")
              + "\n\
              Divide booster and generator costs by /" + format(data.effect.first)
                      return activeThing
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return (layers[this.layer].activePerks() < layers[this.layer].maxActivePerks()) },
            buy() { 
                      if (player[this.layer].buyables[this.id].gt(0)) return;
              player[this.layer].buyables[this.id] = layers[this.layer].buyables[this.id].cost()
            },
        },
        12: {
            title:() => "Base Perk", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let multiplier = new Decimal(30)
                return multiplier
            },
            effect(x) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                eff.first = new Decimal(2)
                eff.first = eff.first.pow(layers[this.layer].perkPower())
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
              let activeThing = (player[this.layer].buyables[this.id].gt(1) ? "Active for "+format(player[this.layer].buyables[this.id], 0)+" seconds" : "Not Active")
              + "\n\
              Add +" + format(data.effect.first) + " to the generator and booster bases"
                      return activeThing
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return (layers[this.layer].activePerks() < layers[this.layer].maxActivePerks()) },
            buy() { 
                      if (player[this.layer].buyables[this.id].gt(0)) return;
              player[this.layer].buyables[this.id] = layers[this.layer].buyables[this.id].cost()
            },
        },
        13: {
            title:() => "Multiplier Perk", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let multiplier = new Decimal(30)
                return multiplier
            },
            effect(x) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                eff.first = new Decimal(1e15)
                eff.first = eff.first.pow(layers[this.layer].perkPower())
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
              let activeThing = (player[this.layer].buyables[this.id].gt(1) ? "Active for "+format(player[this.layer].buyables[this.id], 0)+" seconds" : "Not Active")
              + "\n\
              Multiply prestige point and prestige point gain by x" + format(data.effect.first, 1)
                      return activeThing
            },
            unl() { return player[this.layer].unl }, 
            canAfford() {
                return (layers[this.layer].activePerks() < layers[this.layer].maxActivePerks()) },
            buy() { 
                      if (player[this.layer].buyables[this.id].gt(0)) return;
              player[this.layer].buyables[this.id] = layers[this.layer].buyables[this.id].cost()
            },
        },
        14: {
            title:() => "Bonus Perk", // Optional, displayed at the top in a larger font
            cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let multiplier = new Decimal(30)
                return multiplier
            },
            effect(x) { // Effects of owning x of the items, x is a decimal
                let eff = {}
                eff.first = new Decimal(5)
                eff.first = eff.first.pow(layers[this.layer].perkPower())
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                      let data = tmp[this.layer].buyables[this.id]
              let activeThing = (player[this.layer].buyables[this.id].gt(1) ? "Active for "+format(player[this.layer].buyables[this.id], 0)+" seconds" : "Not Active")
              + "\n\
              Add +" + format(data.effect.first, 1) + " free boosters and generators"
                      return activeThing
            },
            unl() { return player.s.challs.includes(12) }, 
            canAfford() {
                return (layers[this.layer].activePerks() < layers[this.layer].maxActivePerks()) },
            buy() { 
                      if (player[this.layer].buyables[this.id].gt(0)) return;
              player[this.layer].buyables[this.id] = layers[this.layer].buyables[this.id].cost()
            },
        },
    },
    layerShown() {return player.d.unl && player.e.unl && player.r.unl}, // Condition for when layer appears on the tree
    automate() {
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    resetsNothing() {return true},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    update(diff) {
      for (var i in player[this.layer].buyables) {
        player[this.layer].buyables[i] = player[this.layer].buyables[i].sub(diff).max(0)
      }
    },
    hotkeys: [
        {key: "P", desc: "Shift+P: Reset boosters for ascension power.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],
    incr_order: ["s"],

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}, {}],
                ["display-text",
                    function() {return '(Perk Power: '+format((layers.pr.perkPower()?layers.pr.perkPower():new Decimal(1)).mul(100))+'%)'},
                    {"font-size": "16px", "color": "orange"}],
                "buyables", ["blank", "25px"], "milestones"],
      branches: [["b", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})

addLayer("s", {
    startData() { return {
        unl: false,
              points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        milestones: [],
        order: 0
    }},
    color:() => "#fab4d9",
    background:() => 'https://cdn.glitch.com/7460ed4d-c31b-459d-8407-710f48e787a3%2Fefdb5b70-5e55-4f23-9524-953a8eea4545.image.png?v=1601771864943',
    requires() {
      let req = new Decimal(67)
      return req
    }, // Can be a function that takes requirement increases into account
    resource: "stadium power", // Name of prestige currency
    baseResource: "generators", // Name of resource prestige is based on
    baseAmount() {return player.g.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.850, // Prestige currency exponent
    base: 1.03, // Only needed for static layers, base of the formula (b^(x^exp))
    resCeil: true, // True if the cost needs to be rounded up (use when baseResource is static?)
    canBuyMax() {return true}, // Only needed for static layers with buy max
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect() {
      let base = new Decimal(1.02)
      return Decimal.pow(base, player[this.layer].points.sub(8).max(0).add(1.25).log10())
    },
    effectDescription:() => "increasing the second prestige upgrade power by "+format(layers[this.layer].effect().sub(1).mul(100))+"%",
    row: 2, // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row-1) player.r.power = new Decimal(1)
    },
    layerShown() {return player.d.unl && player.e.unl && player.r.unl}, // Condition for when layer appears on the tree
    automate() {
    }, // Do any automation inherent to this layer if appropriate
    updateTemp() {
    }, // Do any necessary temp updating, not that important usually
    challengeUnlocks: ["1.80e308", "1e340", "1e370", "1e800"],
    getChallengeUnlock() {
      let number = 0
      for (var i in layers[this.layer].challs) {
        if (layers[this.layer].challs[i].unl) if (layers[this.layer].challs[i].unl()) number += 1 
      }
      return number
    },
    challs: {
      rows: 2,
      cols: 2,
          11: {
              name:() => "Spaceon",
              desc:() => "Prestige point gain is raised to the 10th root.",
              unl() { return player.points.gt(layers[this.layer].challengeUnlocks[0]) || player[this.layer].challs.includes(11) || player[this.layer].active == 11 },
            goal:() => new Decimal("10000"),
            currencyDisplayName: "prestige points", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            currencyLayer: "p", // Leave empty if not in a layer
            reward:() => "You can have two perks active at once.",
      },
          12: {
              name:() => "Infinity",
              desc:() => "Booster and generators are 90% weaker.",
              unl() { return player.points.gt(layers[this.layer].challengeUnlocks[1]) || player[this.layer].challs.includes(12) || player[this.layer].active == 12 },
            goal:() => new Decimal("1e137"),
            currencyDisplayName: "prestige points", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            currencyLayer: "p", // Leave empty if not in a layer
            reward:() => "Unlock a new perk, and generator and booster cost is divided by stadium and ascension power.",
            effect() {
                let ret = player[this.layer].points.add(player.pr.points).mul(100).pow(3).add(1)
                return ret;
            },
            effectDisplay(x) { return "/"+format(x) },
      },
          21: {
              name:() => "Eternity",
              desc:() => "Time speed is reduced based on your points. (Hold P for more prestige gain)",
              unl() { return player.points.gt(layers[this.layer].challengeUnlocks[2]) || player[this.layer].challs.includes(21) || player[this.layer].active == 21 },
            goal:() => new Decimal("1e147"),
            currencyDisplayName: "prestige points", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            currencyLayer: "p", // Leave empty if not in a layer
            reward:() => "Generators and boosters multiply prestige point gain.",
            effect() {
                let ret = player.g.points.add(player.b.points).mul(1e5).pow(2).add(1)
                return ret;
            },
            effectDisplay(x) { return format(x)+"x" },
      },
          22: {
              name:() => "???",
              desc:() => "Time speed is reduced based on your points.",
              unl() { return player.points.gt(layers[this.layer].challengeUnlocks[3]) || player[this.layer].challs.includes(22) || player[this.layer].active == 22 },
            goal:() => new Decimal("1e50"),
            currencyDisplayName: "prestige points", // Use if using a nonstandard currency
            currencyInternalName: "points", // Use if using a nonstandard currency
            currencyLayer: "p", // Leave empty if not in a layer
            reward:() => "Generators and boosters multiply prestige point gain.",
            effect() {
                let ret = player.g.points.add(player.b.points).mul(1e5).pow(2).add(1)
                return ret;
            },
            effectDisplay(x) { return format(x)+"x" },
      },
    },
    resetsNothing() {return true},
    onPrestige(gain) {
        return
    }, // Useful for if you gain secondary resources or have other interesting things happen to this layer when you reset it. You gain the currency after this function ends.
    update(diff) {
    },
    onReset() {
      if (player[this.layer].active) doReset("d", true)
    },
    hotkeys: [
        {key: "s", desc: "S: Reset generators for stadium power.", onPress(){if (player[this.layer].unl) doReset(this.layer)}},
    ],

    // Optional, lets you format the tab yourself by listing components. You can create your own components in v.js.
    tabFormat: ["main-display",
                ["prestige-button", function() {return "Convert your points into "}, {}],
                ["display-text",
                    function() {return 'Next stadium challenge at '+format(layers["s"].challengeUnlocks[layers["s"].getChallengeUnlock()])+" points."},
                    {"font-size": "14px"}], "blank", "blank",
                ["display-text",
                    function() {return '(Note: Perks do not work in stadium challenges)'},
                    {"font-size": "10px"}],
                "challs"],
      branches: [["g", 1]]
    /*style() {return {
        'background-color': '#3325CC'
    }},*/
})