# Bars

Bars let you display information in a more direct way. It can be a progress bar, health bar, capacity gauge, or anything else.

Bars are defined like other Big Features:

```js
bars: {
    bigBar: {
        direction: RIGHT,
        width: 200,
        height: 50,
        progress() { return 0 },
        etc
    },
    etc
}
```

Features:

- direction: UP, DOWN, LEFT, or RIGHT (not strings). Determines the direction that the bar is filled as it progresses. RIGHT means from left to right.

- width, height: The size in pixels of the bar, but as numbers (no "px" at the end).

- progress(): A function that returns the portion of the bar that is filled, from "empty" at 0 to "full" at 1, updating automatically.
    (Nothing bad happens if the value goes out of these bounds, and it can be a number or `Decimal`)

- display(): **optional**. A function that returns text to be displayed on top of the bar, can use HTML.

- unlocked(): **optional**. A function returning a bool to determine if the bar is visible or not. Default is unlocked.

- baseStyle, fillStyle, borderStyle, textStyle: **Optional**, Apply CSS to the unfilled portion, filled portion, border, and display text on the bar, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.

- id: **assigned automagically**. It's the "key" which the bar was stored under, for convenient access. The bar in the example's id is "bigBar".
