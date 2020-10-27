# Achievements

Achievements are awarded to the player when they meet a certain goal, and optionally give some benefit. Currently they are pretty basic, but additional features will be added later to help.

You can make global achievements by putting them in a side layer by making its row equal to "side" instead of a number.

Useful functions for dealing with achievements and implementing their effects:

- hasAchievement(layer, id): determine if the player has the Achievement.
- achievementEffect(layer, id): Returns the current effects of the achievement, if any.

Achievements should be formatted like this:

```js
achievements: {
    rows: # of rows,
    cols: # of columns,
    11: {
        name: "Blah",
        more features
    },
    etc
}
```

Each achievement should have an id where the first digit is the row and the second digit is the column.

Individual achievement can have these features:

- name: **optional**. displayed at the top of the achievement. The only visible text. It can also be a function that returns updating text. Can use basic HTML.

- done(): A function returning a boolean to determine if the achievement should be awarded.

- tooltip: Default tooltip for the achievement, appears when it is hovered over. Should convey the goal and any reward for completing the achievement. It can also be a function that returns updating text. Can use basic HTML.

- effect(): **optional**. A function that calculates and returns the current values of any bonuses from the achievement. Can return a value or an object containing multiple values.

- unlocked(): **optional**. A function returning a bool to determine if the achievement is visible or not. Default is unlocked.

- onComplete() - **optional**. this function will be called when the achievement is completed.

- style: **optional**. Applies CSS to this achievement, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.

- id: **assigned automagically**. It's the "key" which the achievement was stored under, for convenient access. The achievement in the example's id is 11.

- goalTooltip: **optional, deprecated**. Appears when the achievement is hovered over and locked, overrides the basic tooltip. This is to display the goal (or a hint). It can also be a function that returns updating text. Can use basic HTML.

- doneTooltip: **optional, deprecated**. Appears when the achievement is hovered over and completed, overrides the basic tooltip. This can display what the player achieved (the goal), and the rewards, if any. It can also be a function that returns updating text. Can use basic HTML.
