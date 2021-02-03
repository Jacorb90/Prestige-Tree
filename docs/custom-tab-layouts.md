# Custom tab layouts

Note: If you are using subtabs, `tabFormat` is used differently, but you still use the same format within each subtabs. [See here for more on subtabs](subtabs-and-microtabs.md).

Custom tab layouts can be used to do basically anything in a tab window, especially combined with the "style" layer feature. The `tabFormat` feature is an array of things, like this:

```js
tabFormat: [
    "main-display",
    ["prestige-button", function() { return "Melt your points into " }],
    "blank",
    ["display-text",
        function() { return 'I have ' + format(player.points) + ' pointy points!' },
        { "color": "red", "font-size": "32px", "font-family": "Comic Sans MS" }],
    "blank",
    ["toggle", ["c", "beep"]],
    "milestones",
    "blank",
    "blank",
    "upgrades"
]
```

It is a list of components, which can be either just a name, or an array with arguments. If it's an array, the first item is the name of the component, the second is the data passed into it, and the third (optional) applies a CSS style to it with a "CSS object", where the keys are CSS attributes.

These are the existing components, but you can create more in [v.js](/js/v.js):

- display-text: Displays some text (can use basic HTML). The argument is the text to display. It can also be a function that returns updating text.

- raw-html: Displays some basic HTML, can also be a function.

- blank: Adds empty space. The default dimensions are 8px x 17px. The argument changes the dimensions. If it's a single value (e.g. "20px"), that determines the height. If you have a pair of arguments, the first is width and the second is height.

- row: Display a list of components horizontally. The argument is an array of components in the tab layout format.

- column: Display a list of components vertically. The argument is an array of components in the tab layout format. This is useful to display columns within a row.

- main-display: The text that displays the main currency for the layer and its effects.

- resource-display: The text that displays the currency that this layer is based on, as well as the best and/or total values for this layer's prestige currency (if they are put in `startData` for this layer).

- prestige-button: The argument is a string that the prestige button should say before the amount of currency you will gain. It can also be a function that returns updating text.

- upgrades, milestones, challenges, achievements: Display the upgrades, milestones, and challenges for a layer, as appropriate.

- buyables, clickables: Display all of the buyables/clickables for this layer, as appropriate. The argument is optional and is the size of the boxes in pixels.

- microtabs: Display a set of subtabs for an area. The argument is the name of the set of microtabs in the "microtabs" feature.

- bar: Display a bar. The argument is the id of the bar to display.

- infobox: Display an infobox. The argument is the id of the infobox to display.

- tree: Displays a tree. The argument is an array of arrays containing the names of the nodes in the tree (first by row, then by column)
    [See here for more information on tree layouts and nodes!](trees-and-tree-customization.md)

- toggle: A toggle button that toggles a bool value. The data is a pair that identifies what bool to toggle, e.g. `[layer, id]`

The rest of the components are sub-components. They can be used just like other components, but are typically part of another component.

- upgrade, milestone, challenge, buyable, clickable, achievement: An individual upgrade, challenge, etc. The argument is the id. This can be used if you want to have upgrades split up across multiple subtabs, for example.

- respec-button, master-button: The respec and master buttons for buyables and clickables, respectively.

- sell-one, sell-all: The "sell one" and "sell all" for buyables, respectively. The argument is the id of the buyable.
