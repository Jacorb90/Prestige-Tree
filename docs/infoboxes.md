# Infoboxes

Infoboxes are good for displaying "lore", or story elements, as well as for explaining complicated things.

In the default tab layout, the first infobox will be displayed at the very top of the tab.

Infoboxes are defined like other Big Features:

```js
infoboxes: {
    lore: {
        title: "foo",
        body() { return "bar" },
        etc
    },
    etc
}
```

Features:

- title: The text displayed above the main box. Can be a function to be dynamic, and can use basic HTML.

- body: The text displayed inside the box. Can be a function to be dynamic, and can use basic HTML.

- style, titleStyle, bodyStyle: **optional**. Apply CSS to the infobox, or to the title button or body of the infobox, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- unlocked(): **optional**. A function returning a bool to determine if the infobox is visible or not. Default is unlocked.

- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar

- id: **assigned automagically**. It's the "key" which the bar was stored under, for convenient access. The infobox in the example's id is "lore".