# Buyables

Buyables are usually things that can be bought multiple times with scaling costs. If you set a respec function, the player can reset the purchases to get their currency back.

The amount of a buyable owned is a `Decimal`. 

Useful functions for dealing with buyables and implementing their effects:

- getBuyableAmt(layer, id): get the amount of the buyable the player has
- setBuyableAmount(layer, id, amount): set the amount of the buyable the player has
- buyableEffect(layer, id): Returns the current effects of the buyable, if any.

Buyables should be formatted like this:

```js
buyables: {
    rows: # of rows,
    cols: # of columns,
    11: {
        cost(x) { return new Decimal(1).mul(x || getBuyableAmt(this.layer, this.id)) },
        display() { return "Blah" },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmt(this.layer, this.id).add(1))
        },
        etc
    },
    etc
}
```

Features:

- title: **optional**. displayed at the top in a larger font. It can also be a function that returns updating text.

- cost(): cost for buying the next buyable. Can have an optional argument "x" to calculate the cost of the x+1th object, but needs to use "current amount" as a default value for x. (x is a `Decimal`). Can return an object if there are multiple currencies.
                    
- effect(): **optional**. A function that calculates and returns the current values of bonuses of this buyable. Can return a value or an object containing multiple values.

- display(): A function returning everything that should be displayed on the buyable after the title, likely including the description, amount bought, cost, and current effect. Can use basic HTML.

- unlocked(): **optional**. A function returning a bool to determine if the buyable is visible or not. Default is unlocked.

- canAfford(): A function returning a bool to determine if you can buy one of the buyables.

- buy(): A function that implements buying one of the buyable, including spending the currency.

- buyMax(): **optional**. A function that implements buying as many of the buyable as possible.

- style: **optional**. Applies CSS to this buyable, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).
         
- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.

- id: **assigned automagically**. It's the "key" which the buyable was stored under, for convenient access. The buyable in the example's id is 11.

Sell One/Sell All:

Including a `sellOne` or `sellAll` function will cause an additional button to appear beneath the buyable. They are functionally identical, but "sell one" appears above "sell all". You can also use them for other things.

- sellOne/sellAll(): **optional**. Called when the button is pressed. The standard use would be to decrease/reset the amount of the buyable, and possibly return some currency to the player.

- canSellOne/canSellAll(): **optional**. booleans determining whether or not to show the buttons. If  "canSellOne/All" is absent but "sellOne/All" is present, the appropriate button will always show.
