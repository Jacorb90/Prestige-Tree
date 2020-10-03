# Custom tab layouts

Custom tab layouts can be used to do basically anything in a tab window, especially combined with the "style" layer feature. The tabFormat feature is an array of things, like this:

```js
    tabFormat: ["main-display",
            ["prestige-button", function(){return "Melt your points into "}],
            "blank",
            ["display-text",
                function() {return 'I have ' + format(player.points) + ' pointy points!'},
                {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
            "blank",
            ["toggle", ["c", "beep"]],
            "milestones", "blank", "blank", "upgrades"]
```

It is a list of components, which can be either just a name, or an array with arguments. If it's an array, the first item is the name of the component, the second is the data passed into it, and the third (optional) is a CSS object,
which applies its style to the component.

These are the existing components, but you can create more in v.js:

- display-text: Displays some text. The argument is the text to display. It can also be a function that returns updating text.

- raw-html: Displays some HTML. The argument is the HTML as a string, or a function that returns updating HTML.
            It doesn't work with many vue things.

- blank: Adds empty space. The default dimensions are 8px x 17px. The argument changes the dimensions.
         If it's a single value (e.g. "20px"), that determines the height.
         If you have a pair of arguments, the first is width and the second is height.

- main-display: The text that displays the main currency for the layer and its effects.

- prestige-button: The argument is a string that the prestige button should say before the amount of
                   currency you will gain. It can also be a function that returns updating text.

- upgrades, milestones, challs: Display the upgrades, milestones, and challenges for a layer, as appropriate.

- buyables: Display all of the buyables for this layer, as appropriate. The argument optional, and is the size of the
            boxes in pixels.

- toggle: A toggle button that toggles a bool value. The data is a pair that identifies what bool to toggle, [layer, id]

- row: Display a list of components horizontally. The argument is an array of components in the tab layout format.

- column: Display a list of components vertically. The argument is an array of components in the tab layout format.
          This is useful to display columns within a row.