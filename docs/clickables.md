# Clickables

Clickables are any kind of thing that you can click for an effect. They're a more generalized version of Buyables.

DO NOT USE THESE TO MAKE THINGS THAT YOU CLICK REPEATEDLY FOR A BONUS BECAUSE THOSE ARE AWFUL.

There are several differences between the two. One is that a buyable's saved data is its amount as a Decimal, while
Clickables store a "state" which can be a number or string, but not Decimal, array, or object). 
Buyables have a number of extra features which you can see on their page.
Clickables also have a smaller default size.

You can get and set a clickable's state with getClickableState(layer, id) and setClickableState(layer, id, state).
You can use clickableEffect(layer, id) to get the current effects of a clickable.

Clickables should be formatted like this:

```js
    clickables: {
        rows: # of rows
        cols: # of columns
        masterButtonPress() // **optional** If this is present, an additional button will appear above the clickables.
                            // pressing it will call the function.
        masterButtonText: "Press me!" // **optional** text to display on the Master Button
        showMasterButton(){} //**optional**, a function determining whether or not to show the button. Defaults to true if absent.
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
                    
- effect(): **optional**, A function that calculates and returns the current values of bonuses
            of this clickable. Can return a value or an object containing multiple values.

- display(): A function returning everything that should be displayed on the clickable after the title, likely
             changing based on its state. Can use basic HTML.

- unlocked(): **optional**, A function returning a bool to determine if the clickable is visible or not. Default is unlocked.

- canClick(): A function returning a bool to determine if you can click the clickable.

- onClick(): A function that implements clicking one of the clickable. 

- style: **Optional**, Applies CSS to this clickable, in the form of an object where the keys are CSS attributes,
         and the values are the values for those attributes (both as strings)

- layer: **Assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar.

- id: **Assigned automagically**. It's the "key" which the clickable was stored under, for convenient access.
      The clickable in the example's id is 11.