# The-Modding-Tree
How to add layers:
You can either add a layer directly into the layers object in layers.js, or declare it separately and then do "addLayer(layername, layerdata)" (good for breaking things up into smaller files)

You still need to add nodes to the tree in the HTML, add hotkeys, and do any non-standard displaying in the HTML. (You can use <div v-if="layer=='x'">Blah blah</div> to add sections to specific layers)

Layer features! In no particular order

-----Layer-defining features-----

startData() - Returns an object containing the default values for any saved data in this layer, including resources, toggles, upgrades, and more.
  Required:
    unl: a bool determining if it is unlocked or not
    points: a Decimal, the main currency for the layer
  Useful:
    total: A decimal, tracks total amount of main currency
    best: A decimal, tracks highest amount of main currency
    order: used to keep track of relevant layers unlocked before this one.
    upgrades, milestones, challs: Empty arrays. Needed if you are using the corresponding feature in this layer
  

color: A color associated with this layer, used in many places. (A string in hex format with a #)

row: The row of the layer

resource: Name of the main currency you gain by resetting on this layer.

effect() - Optional, returns the current strength of any effects derived from the layer's main currency

effectDescription() - Optional, returns a description of the effect this layer has

-----Prestige formula features-----

baseResource: The resource that determines how much of the main currency you gain on reset.

baseAmount() - How you get the current value of baseResource (e.g. baseAmount() {player.points})

requires() - A function that determines how much base resource you need to reset as a Decimal value. It can return a constant value, or change based on your order.

type: can be "normal" or "static". "normal" means the amount of currency you gain is independent of its current amount (like Prestige). "static" means that the cost grows depending on how much you already have (like Boosters). They both use different formulas. normal = x^exponent, static is base^(x^exponent)

exponent: Prestige currency exponent

base: Prestige currency base, only needed for "static" layers

resCeil: Bool, true if the resource needs to be rounded up

canBuyMax() - Only needed for static layers, used to determine if buying max is permitted.

gainMult(), gainExp() - Used to determine the multiplier and exponent on resource gain from upgrades and boosts and such. Plug all of them in here.

onPrestige(gain) - Optional, Triggers when this layer prestiges, just before you gain the currency. Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.


-----Other features-----

doReset(resettingLayer) - Optional, is triggered when a layer on a row greater than or equal to this one. If you use it, you can choose what to keep via milestones and such. Without it, the default is to reset everything on the row, but only if it was triggered by a higher layer.

convertToDecimal() - Only needed if you have non-standard Decimal values in startData, to these values from strings to Decimals after loading.

layerShown() - Returns a bool determining if this layer's node should be visible on the tree.

update(diff) - Optional, part of the main loop, use it for any passive resource production or time-based things. diff is the time since the last update. Suggestion: use addPoints(layer, gain) when generating points to automatically update the best and total amounts.

automate() - Optional, use it to activate any autobuyers or auto-resets or similar on this layer, if appropriate. 

updateTemp() - Optional, use it to update anything in the "temp" object. 

resetsNothing() - Optional, returns true if this layer shouldn't trigger any resets.

incr_order: Optional, an array of layer names, their order will increase by 1 when this one is first unlocked. Can be empty.

branches: Optional, an array of pairs consisting of a layer name and a number from 1 to 3. When this layer is visible, for each pair, there will be a branch from this layer to the other layer with a color determined by the number.


-----Upgrades-----

Upgrades are stored in the following format:

upgrades: {
  rows: # of rows
  cols: # of columns
  11: {
    [insert upgrade info here]
  }
  etc
}

Each upgrade should have an id where the first digit is the row and the second digit is the column. Individual upgrades can have these features:

desc: A description of the upgrade's effect

effect() - Optional, calculate and return the values of this upgrade's effects or effects.

effectDisp() - Optional, returns a display of the current effects of the upgrade with formatting. Default behavior is to just display the number appropriately formatted.

cost: A Decimal for the cost of the upgrade.

currencyDisplayName: Optional, if using a currency other than the main one for this layer, the name to display for that currency
currencyInternalName: The internal name for that currency
currencyLayer: The internal name of the layer for that currency. If it's not in a layer (like Points), omit.

unl() - Return a bool to determine if the upgrade is unlocked or not.

onPurchase() - Optional, this function will be called when the upgrade is purchased. Good for upgrades like "makes this layer act like it was unlocked first".

-----Milestones-----

Milestones should be formatted like this:

milestones: {
  0: {
      [insert milestone info here]
  }
  etc
}

Milestone features:

requirementDesc: A string describing the requirement

effectDesc: A string describing the reward for having the milestone

done() - A function to determine if the milestone has been fulfilled.

toggles: Creates toggle buttons on the milestone when it is unlocked. An array of paired items, one pair per toggle. The first is the internal name of the layer the value being toggled is stored in, and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])

-----Challenges-----

Challenges are stored in the following format:

challs: {
  rows: # of rows
  cols: # of columns
  11: {
    [insert challenge info here]
  }
  etc
}

Each challenge should have an id where the first digit is the row and the second digit is the column. Individual upgrades can have these features:

name: Name of the challenge

desc: A description of what makes the challenge a challenge

reward: A description of the reward's effect

effect() - Optional, calculate and return the values of this upgrade's effects or effects.

effectDisp(x) - Optional, returns a display of the current effects of the upgrade with formatting. Default behavior is to just display the number appropriately formatted.

goal: A Decimal for the goal of the challenge's value.

currencyDisplayName: Optional, if using a goal currency other than basic Points, the name to display for that currency
currencyInternalName: The internal name for that currency
currencyLayer: The internal name of the layer for that currency. If it's not in a layer, omit.

unl() - Return a bool to determine if the challenge is unlocked or not.

onComplete() - Optional, this function will be called when the challenge is newly completed.

countsAs: An array of ids of other challenges in this layer that being in this challenge "counts as" being in. 
