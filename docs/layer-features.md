# Layer Features

This is a more comprehensive list of established features to add to layers.
You can add more freely, if you want to have other functions or values associated with your layer. These have special functionality, though.

Key:    
- No label: This is required and the game will crash if it isn't included.
- **sometimes required**: This is may be required, depending on other things in the layer.
- **optional**: You can leave this out if you don't intend to use that feature for the layer.

# Layer Definition features

- layer: **Assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar
      to access the save value. It makes copying code to new layers easier. It is also assigned to all upgrades and buyables and such.

- startData(): A function to return the default save data for this layer. Add any variables you have to it.
            Any nonstandard Decimal variables need to be added to convertToDecimal as well.
    Standard values:
        Required:
            unl: a bool determining if this layer is unlocked or not
            points: a Decimal, the main currency for the layer
        Optional:
            total: A Decimal, tracks total amount of main prestige currency
            best: A Decimal, tracks highest amount of main prestige currency
            order: used to keep track of relevant layers unlocked before this one.

- color: A color associated with this layer, used in many places. (A string in hex format with a #)

- row: The row of the layer, starting at 0.

- resource: Name of the main currency you gain by resetting on this layer.

- effect(): **optional**, A function that calculates and returns the current values of any bonuses
    inherent to the main currency.
    Can return a value or an object containing multiple values.
    *You will also have to implement the effect where it is applied.*

- effectDescription: **optional**, A function that returns a description of this effect.
                     If the text stays constant, it can just be a string.

- layerShown(): A function returning a bool which determines if this layer's node should be visible on the tree.

- hotkeys: An array containing information on any hotkeys associated with this layer:
    ```js
    hotkeys: [
        {key: "p", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" if ctrl is.
        desc: "p: reset your points for prestige points", // The description of the hotkey used in the How To Play
        onPress(){if (player.p.unl) doReset("p")}}, // This function is called when the hotkey is pressed.
    ],
    ```

- branches: **optional**, determines what lines should appear on the tree when this layer is visible.
            An array of pairs consisting of a layer name and a number from 1 to 3.
            A branch will appear connecting this layer to the correspodnding layer, with the color based on the number.
            You should add the branch value to the layer that is unlocked second.

- style: A CSS object containing any CSS that should affect this layer's whole tab.
         Can also be a function returning a dynamic CSS object.

- tabFormat: Use this if you want to add extra things to your tab or change the layout.


# Big features

- upgrades: A grid of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
    [Explanations are in a separate file.](upgrades.md)

- milestones: A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
    [Explanations are in a separate file.](milestones.md)

- challenges: The player can enter challenges, which make the game harder. If they reach a goal and beat the challenge,
              they recieve a bonus.
    [Explanations are in a separate file.](challenges.md)

- buyables: Effectively upgrades that can be bought multiple times, and are optionally respeccable.
    [Explanations are in a separate file.](buyables.md)


# Prestige formula features

- baseResource: The name of the resource that determines how much of the main currency you gain on reset.

- baseAmount(): A function that gets the current value of the base resource.

- requires: A Decimal, the amount of the base needed to gain 1 of the prestige currency.
            Also the amount required to unlock the layer.
            You can instead make this a function, to make it harder if another layer was unlocked first (based on "order").

- type: Determines which prestige formula you use.
    "normal": The amount of currency you gain is independent of its current amount (like Prestige).
        formula before bonuses is based on `baseResource^exponent`
    "static: The cost is dependent on your total after reset. 
        formula before bonuses is based on `base^(x^exponent)`

- exponent: Used as described above.

- base: **sometimes required**, required for "static" layers, used as described above.

- resCeil: **optional**, a bool, which is true if the resource cost needs to be rounded up.
            (use if the base resource is a "static" currency.)

- canBuyMax(): **sometimes required**, required for static layers, function used to determine if buying max is permitted.

- gainMult(), gainExp(): Functions that calculate the multiplier and exponent on resource gain from upgrades
                         and boosts and such. Plug in any bonuses here.

- onPrestige(gain): **optional**, A function that triggers when this layer prestiges, just before you gain the currency. 
                    Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.


# Other features

- doReset(resettingLayer): **optional**, is triggered when a layer on a row greater than or equal to this one does a reset.
                           If you use it, you can choose what to keep via milestones and such.
                           Without it, the default is to reset everything on the row, but only 
                           if it was triggered by a layer in a higher row.

- convertToDecimal(): **sometimes required**, required if you add non-standard Decimals to startData. 
                        This function converts those values from a string to a Decimal (used when loading).
                        Convert a value to Decimal with `value = new Decimal(value)`


- update(diff): **optional**, this function is called every game tick. Use it for any passive resource production or
                time-based things. diff is the time since the last tick.
                Suggestion: use addPoints(layer, gain) when generating points to automatically
                update the best and total amounts.

- automate(): **optional**, this function is called every game tick, after production. Use it to activate any
               autobuyers or auto-resets or similar on this layer, if appropriate. 

- updateTemp(): **optional**, this function is called every game tick. use it to update anything in the "tmp" object. 
                You don't really need it. tmp is used as a way to store calculated values so it doesn't repeat
                calculations.

- resetsNothing(): **optional**, returns true if this layer shouldn't trigger any resets when you prestige.

- incr_order: **optional**, an array of layer ids. When this layer is unlocked for the first time, the "order" value
              for any not-yet-unlocked layers in this list increases. This can be used to make them harder to unlock.

- should_notify: **optional**, a function to return true if this layer should be highlighted in the tree.
                 The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.