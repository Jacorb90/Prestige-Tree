# Prestige-Tree
How to add layers:
You can either add a layer directly into the layers object in layers.js, or declare it separately and then do "addLayer(layername, layerdata)" (good for breaking things up into smaller files)

You still need to add nodes to the tree in the HTML, add hotkeys, and do any non-standard displaying in the HTML. (You can use <div v-if="layer=='x'">Blah blah</div> to add sections to specific layers)

Layer features! In no particular order

~~~~~~Defining features~~~~~~

startData: An object containing the default values for any saved data in this layer, including resources, toggles, upgrades, and more.

color: A color associated with this layer, used in many places. (A string in hex format with a #)

row: The row of the layer

resource: Name of the main currency you gain by resetting on this layer.

effect() - Optional, returns the current strength of any effects derived from the layer's main currency

effectDescription() - Optional, returns a description of the effect this layer has


~~~~~~Prestige formula features~~~~~~

baseResource: The resource that determines how much of the main currency you gain on reset.

baseAmount() - How you get the current value of baseResource (e.g. baseAmount() {player.points})

requires() - A function that determines how much base resource you need to reset as a Decimal value. It can return a constant value, or change based on your order.

type: can be "normal" or "static". "normal" means the amount of currency you gain is independent of its current amount (like Prestige). "static" means that the cost grows depending on how much you already have (like Boosters). They both use different formulas. normal = x^exponent, static is base^(x^exponent)

exponent: Prestige currency exponent

base: Prestige currency base, only needed for "static" layers

resCeil: Bool, true if the resource needs to be rounded up

canBuyMax() - Only needed for static layers, used to determine if buying max is permitted.

gainMult(), gainExp() - Used to determine the multiplier and exponent on resource gain from upgrades and boosts and such. Plug all of them in here.

