# Custom tab layouts

Custom tab layouts can be used to do basically anything in a tab window, especially combined with the "style" layer feature. The tabFormat feature is an array of things, like this:

`` tabFormat: ["main-display",
            ["prestige-button", function(){return "Melt your points into "}],
            ["raw-html", function() {return "<button onclick='console.log(`yeet`)'>'HI'</button>"}],
            ["display-text",
                function() {return 'I have ' + format(player.points) + ' pointy points!'},
                {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
            "blank",
            ["toggle", ["c", "beep"]],
            "milestones", "blank", "blank", "upgrades"] ``

It is a list of components, which can be either just a name, or an array with arguments. If it's an array, the first item is the name of the component, the second is the data passed into it, and the third (optional) is a CSS object,
which applies its style to the component.

These are the existing components, but you can create more in v.js:

- display-text: Displays some text. The argument is a function which returns the text to display.

- raw-html: Displays some HTML. The argument is a function which returns the HTML. It doesn't work with many vue things.

- blank: An empty newline

- main-display: The text that displays the main currency for the layer and its effects.

- prestige-button: The argument is a function that returns what the prestige button should say before the amount of
                   currency you will gain.

- upgrades, milestones, challs: Display the upgrades, milestones, and challenges for a layer, as appropriate.

- buyables: Display all of the buyables for this layer, as appropriate. The argument optional, and is the size of the
            boxes in pixels.

- toggle: A toggle button that toggles a bool value. The data is a pair that identifies what bool to toggle, [layer, id]