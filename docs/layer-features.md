# Layer Features

This is a more comprehensive list of established features to add to layers.
You can add more freely, if you want to have other functions or values associated with your layer. These have special functionality, though.

You can make almost any value dynamic by using a function in its place, including all display strings and styling/color features.

Key:    
- No label: This is required and the game will crash if it isn't included.
- **sometimes required**: This is may be required, depending on other things in the layer.
- **optional**: You can leave this out if you don't intend to use that feature for the layer.

## Layer Definition features

- layer: **Assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar
      to access the save value. It makes copying code to new layers easier. It is also assigned to all upgrades and buyables and such.

- name: **Optional**, used in reset confirmations (and maybe other places). If absent, it just uses the layer's id.

- startData(): A function to return the default save data for this layer. Add any variables you have to it.
            Any nonstandard Decimal variables need to be added to convertToDecimal as well.
    Standard values:
        Required:
            unlocked: a bool determining if this layer is unlocked or not
            points: a Decimal, the main currency for the layer
        Optional:
            total: A Decimal, tracks total amount of main prestige currency
            best: A Decimal, tracks highest amount of main prestige currency
            unlockOrder: used to keep track of relevant layers unlocked before this one.

- color: A color associated with this layer, used in many places. (A string in hex format with a #)

- row: The row of the layer, starting at 0. This affects where the node appears on the tree, and which resets affect the layer.

       Using "side" instead of a number will cause the layer to appear off to the side as a smaller node (useful for achievements
       and statistics). Side layers are not affected by resets unless you add a doReset to them.
       

- resource: Name of the main currency you gain by resetting on this layer.

- effect(): **optional**, A function that calculates and returns the current values of any bonuses
    inherent to the main currency.
    Can return a value or an object containing multiple values.
    *You will also have to implement the effect where it is applied.*

- effectDescription: **optional**, A function that returns a description of this effect.
                     If the text stays constant, it can just be a string.

- layerShown(): A function returning a bool which determines if this layer's node should be visible on the tree.
                It can also return "ghost", which will hide the layer, but its node will still take up space in the tree.

- hotkeys: **optional**, An array containing information on any hotkeys associated with this layer:
    ```js
    hotkeys: [
        {key: "p", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" if ctrl is.
        desc: "p: reset your points for prestige points", // The description of the hotkey used in the How To Play
        onPress(){if (player.p.unlocked) doReset("p")}}, // This function is called when the hotkey is pressed.
    ],
    ```

- style: **optional**, a "CSS object" where the keys are CSS attributes ,containing any CSS that should affect this
         layer's entire tab.

- tabFormat: **optional**, use this if you want to add extra things to your tab or change the layout. [See here for more info.](custom-tab-layouts.md)

- midsection: **optional**, an alternative to tabFormat, which is inserted in between Milestones and Buyables in the
              standard tab layout. (cannot do subtabs)


## Big features (all optional)

- upgrades: A grid of one-time purchases which can have unique upgrade conditions, currency costs, and bonuses.
    [Explanations are in a separate file.](upgrades.md)

- milestones: A list of bonuses gained upon reaching certain thresholds of a resource. Often used for automation/QOL.
    [Explanations are in a separate file.](milestones.md)

- challenges: The player can enter challenges, which make the game harder. If they reach a goal and beat the challenge,
              they recieve a bonus.
    [Explanations are in a separate file.](challenges.md)

- buyables: Effectively upgrades that can be bought multiple times, and are optionally respeccable. Many uses.
    [Explanations are in a separate file.](buyables.md)

- clickables: Extremely versatile and generalized buttons which can only be clicked sometimes.
    [Explanations are in a separate file.](clickables.md)

- microtabs: An area that functions like a set of subtabs, with buttons at the top changing the content within. (Advanced)
    [Explanations are in a separate file.](subtabs-and-microtabs.md)

- bars: Display some information as a progress bar, gague, or similar. They are highly customizable, and can be vertical as well.
    [Explanations are in a separate file.](bars.md)

- achievements: Kind of like milestones, but with a different display style and some other differences. Extra features are on the way at a later date!
    [Explanations are in a separate file.](achievements.md)

- infoboxes: Displays some text in a box that can be shown or hidden.
    [Explanations are in a separate file.](infoboxes.md)


## Prestige formula features

- type: **optional**, Determines which prestige formula you use. Defaults to "none".
    "normal": The amount of currency you gain is independent of its current amount (like Prestige).
        formula before bonuses is based on `baseResource^exponent`
    "static": The cost is dependent on your total after reset. 
        formula before bonuses is based on `base^(x^exponent)`
    "custom": You can define everything, from the calculations to the text on the button, yourself. (See more at the bottom)
    "none": This layer does not prestige, and therefore does not need any of the other features in this section.

- baseResource: The name of the resource that determines how much of the main currency you gain on reset.

- baseAmount(): A function that gets the current value of the base resource.

- requires: A Decimal, the amount of the base needed to gain 1 of the prestige currency.
            Also the amount required to unlock the layer.
            You can instead make this a function, to make it harder if another layer was unlocked first (based on unlockOrder).

- exponent: Used as described above.

- base: **sometimes required**, required for "static" layers, used as described above. If absent, defaults to 2.
        Must be greater than 1.

- roundUpCost: **optional**, a bool, which is true if the resource cost needs to be rounded up.
            (use if the base resource is a "static" currency.)

- canBuyMax(): **sometimes required**, required for static layers, function used to determine if buying max is permitted.

- gainMult(), gainExp(): **optional**, Functions that calculate the multiplier and exponent on resource gain from upgrades
                         and boosts and such. Plug in any bonuses here.

- onPrestige(gain): **optional**, A function that triggers when this layer prestiges, just before you gain the currency. 
                    Can be used to have secondary resource gain on prestige, or to recalculate things or whatnot.

- resetDesc: **optional**, use this to replace "Reset for " on the Prestige button with something else.

- prestigeButtonText(): **Sometimes required**, Use this to make the entirety of the text a Prestige button contains. Only required for custom layers,
                        but usable by all types. 



## Tree/node features

- symbol: **optional**, the text that appears on this layer's node. Default is the layer id with the first letter capitalized

- position: **optional**, Determines the horizontal position of the layer in its row. By default, it uses the layer id,
            and layers are sorted in alphabetical order.

- branches: **optional**, an array of layer ids. On a tree, a line will appear from this layer to all of the layers
            in the list. Alternatively, an entry in the array can be a 2-element array consisting of the layer id and a color
            value. The color value can either be a string with a hex color code, or a number from 1-3 (theme-affected colors)

- nodeStyle: **optional**,  a CSS object, where the keys are CSS attributes, which styles this layer's node on the tree

- tooltip() / tooltipLocked(): **optional** Functions that return text, which is the tooltip for the node when the layer
                               is unlocked or locked, respectively. By default the tooltips behave the same as in the original Prestige Tree.


## Other features

- doReset(resettingLayer): **optional**, is triggered when a layer on a row greater than or equal to this one does a reset.
                The default behavior is to reset everything on the row, but only if it was triggered by a layer in a higher row.
                (doReset is always called for side layers, but for these the default behavior is to reset nothing.)
                
                If you want to keep things, determine what to keep based on the resettingLayer, milestones, and such, then call
                resetLayerData(layer, keep), where layer is this layer, and keep is an array of the names of things to keep.
                It can include things like "points", "best", "total" (for this layer's prestige currency), "upgrades", 
                any unique variables like "generatorPower", etc.
                If you want to only keep specific upgrades or something like that, save them in a separate variable, then
                call layerDataReset, and then set player[layer].upgrades to the saved upgrades.

- update(diff): **optional**, this function is called every game tick. Use it for any passive resource production or
                time-based things. diff is the time since the last tick.
                Suggestion: use addPoints(layer, gain) when generating points to automatically
                update the best and total amounts.

- automate(): **optional**, this function is called every game tick, after production. Use it to activate any
               autobuyers or auto-resets or similar on this layer, if appropriate. 

- resetsNothing: **optional**, returns true if this layer shouldn't trigger any resets when you prestige.

- increaseUnlockOrder: **optional**, an array of layer ids. When this layer is unlocked for the first time, the unlockOrder value
              for any not-yet-unlocked layers in this list increases. This can be used to make them harder to unlock.

- shouldNotify: **optional**, a function to return true if this layer should be highlighted in the tree.
                 The layer will automatically be highlighted if you can buy an upgrade whether you have this or not.

- componentStyles: **optional**, An object that contains a set of functions returning CSS objects.
                   Each of these will be applied to any components on the layer with the type of its id. Example:

```js
        componentStyles: {
            "challenge"() {return {'height': '200px'}},
            "prestige-button"() {return {'color': '#AA66AA'}},
        },
```


## Custom Prestige type  

- getResetGain(): **For custom prestige type**, Returns how many points you should get if you reset now. You can call
            getResetGain(this.layer, useType = "static") or similar to calculate what your gain would be under another
            prestige type (provided you have all of the required features in the layer.)

- getNextAt(canMax=false): **For custom prestige type**, Returns how many of the base currency you need to get to
                the next point. canMax is an optional variable used with Static-ish layers to differentiate between if 
                it's looking for the first point you can reset at, or the requirement for any gain at all.
                (Supporting both is good). You can also call getNextAt(this.layer, canMax=false, useType = "static")
                or similar to calculate what your next at would be under another prestige type (provided you have
                all of the required features in the layer.)

- canReset(): **For custom prestige type**, return true only if you have the resources required to do a prestige here.