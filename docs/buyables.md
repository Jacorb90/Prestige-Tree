# Buyables

Buyables are things that can be bought multiple times with scaling costs. If you set a respec function,
the player can reset the purchases to get their currency back.

Buyables should be formatted like this:

```js
    buyables: {
        rows: # of rows
        cols: # of columns
        respec() {}, **optional**, implement it to reset things and give back your currency.
                     Having this function makes a respec button appear
        respecText: **optional**, text that appears on the respec button
        11: {
            desc:() => "Blah",
            etc
        }
        etc
    }
```

Features:

- title: **optional**, displayed at the top in a larger font
         It can also be a function that returns updating text.

- cost(x): cost for buying xth buyable, can be an object if there are multiple currencies
                    
- effect(x): **optional**, A function that calculates and returns the current values of bonuses
              for having x of this buyable. Can return a value or an object containing multiple values.

- display(): A function returning everything that should be displayed on the rebuyable after the title, likely
           including the description, amount bought, cost, and current effect.

- unl(): A function returning a bool to determine if the buyable is visible or not.

- canAfford(): A function returning a bool to determine if you can buy one of the buyables.

- buy(): A function that implements buying one of the buyable. 

- buyMax(): **optional**, A function that implements buying as many of the buyable as possible.

- layer: **Assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar

- id: **Assigned automagically**. It's the id for this buyable.