# Buyables

Buyables are usually things that can be bought multiple times with scaling costs. If you set a respec function,
the player can reset the purchases to get their currency back.

The amount of a buyable owned is a Decimal.
You can get or set the amount of a buyable with getBuyableAmt(layer, id) and setBuyableAmt(layer, id, amt).
You can use buyableEffect(layer, id) to get the current effects of a buyable.

Buyables should be formatted like this:

```js
    buyables: {
        rows: # of rows
        cols: # of columns
        respec() {}, //**optional**, implement it to reset things and give back your currency.
                     // Having this function makes a respec button appear
        respecText:// **optional**, text that appears on the respec button
        showRespecButton(){} //**optional**, a function determining whether or not to show the button. Defaults to true if absent.
        sellOneText, sellAllText:// **optional**, text that appears on the "sell one" and "sell all" buttons respectively (if you are using them)
        11: {
            display() {return "Blah"},
            etc
        }
        etc
    }
```

Features:

- title: **optional**, displayed at the top in a larger font
         It can also be a function that returns updating text.

- cost(): cost for buying the next buyable. Can have an optional argument "x" to calculate the cost of the x+1th object,
          but needs to use "current amount" as a default value for x. (x is a Decimal).
          Can return an object if there are multiple currencies.
                    
- effect(): **optional**, A function that calculates and returns the current values of bonuses
            of this buyable. Can return a value or an object containing multiple values.

- display(): A function returning everything that should be displayed on the buyable after the title, likely
           including the description, amount bought, cost, and current effect. Can use basic HTML.

- unlocked(): **optional**, A function returning a bool to determine if the buyable is visible or not. Default is unlocked.

- canAfford(): A function returning a bool to determine if you can buy one of the buyables.

- buy(): A function that implements buying one of the buyable, including spending the currency.

- buyMax(): **optional**, A function that implements buying as many of the buyable as possible.

- style: **Optional**, Applies CSS to this buyable, in the form of an object where the keys are CSS attributes,
         and the values are the values for those attributes (both as strings)
         
- layer: **Assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar

- id: **Assigned automagically**. It's the "key" which the buyable was stored under, for convenient access.
      The buyable in the example's id is 11.

Sell One/Sell All:

Including a sellOne or sellAll function will cause an additional button to appear beneath the buyable.
They are functionally identical, but "sell one" appears above "sell all". You can also use them for other things.

sellOne/sellAll(): **optional**, Called when the button is pressed. The standard use would be to decrease/reset the amount of the buyable,
                   And possibly return some currency to the player.

canSellOne/canSellAll(): **optional**, booleans determining whether or not to show the buttons. If  "canSellOne/All" is absent but 
                         "sellOne/All" is present, the appropriate button will always show.