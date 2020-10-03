# Basic layer breakdown

This is a very minimal layer with minimal features. Most things will require additional features.
If you're curious about "() =>", it's a weird notation that lets you use either a value or function in the same slot,
and treats it like a function. If you're using an actual function there, you can replace it with the normal notation.

```js
    p: {
        startData() { return {                  // startData is a function that returns default data for a layer. 
            unl: false,                         // You can add more variables here to add them to your layer.
            points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
                                                // If you add non-standard Decimal variables, look at convertToDecimal
        }},

        color:() => "#FE0102",                       // The color for this layer, which affects many elements
        resource: "prestige points",            // The name of this layer's main prestige resource
        row: 0,                                 // The row this layer is on (0 is the first row)

        baseResource: "points",                 // The name of the resource your prestige gain is based on
        baseAmount() {return player.points},    // A function to return the current value of that resource

        requires:() => new Decimal(200)},            // The amount of the base needed to  gain 1 of the prestige currency.
                                                // Also the amount required to unlock the layer.
        
        type: "normal",                         // Determines the formula used for calculating prestige currency.
        exponent: 0.5,                          // "normal" prestige gain is (currency^exponent)

        gainMult() {                            // Returns your multiplier to your gain of the prestige resource
            return new Decimal(1)               // Factor in any bonuses multiplying gain here
        },
        gainExp() {                             // Returns your exponent to your gain of the prestige resource
            return new Decimal(1)
        },

        layerShown() {return true},             // Returns a bool for if this layer's node should be visible in the tree.
    },
```