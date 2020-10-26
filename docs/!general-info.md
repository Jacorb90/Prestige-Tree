# The-Modding-Tree
The main way to add content is through creating layers. You can either add a layer directly in the layers object in layersSupportjs,
or declare it in another file and then do "`addLayer(layername, layerdata)`"
(good for breaking things up into smaller files). The existing layers are just examples and can be freely deleted.
You can also use them as references and a base for your own layers.


The first thing you need to do is to edit the modInfo at the top of game.js to set your modID (a string). A
unique modId will prevent your mod's saves from conflicting with other mods.



Most of the time, you won't need to dive deep into the code to create things, but you still can if you really want to.


The Modding Tree uses break_eternity.js to store large values. This means that many numbers are Decimal objects,
and must be treated differently. For example, you have to use `new Decimal(x)` to create a Decimal value instead of a
plain number, and perform operations on them by calling functions. e.g, instead of `x = x + y`, use `x = x.add(y)`.

Almost all values can be either a constant value, or a dynamic value. Dynamic values are defined by putting a function
that returns what the value should be at any given time.

All display text can be basic HTML instead (But you can't use most Vue features there).

# Table of Contents:

## General:

- [Getting Started](getting-started.md): Getting your own copy of the code set up with Github Desktop.
- [Main mod info](main-mod-info.md): How to set up general things for your mod in mod.js.
- [Basic layer breakdown](basic-layer-breakdown.md): Breaking down the components of a layer with minimal features.
- [Layer features](layer-features.md): Explanations of all of the different properties that you can give a layer.
- [Custom Tab Layouts](custom-tab-layouts.md): An optional way to give your tabs a different layout.
                                                   You can even create entirely new components to use.
- [Updating TMT](updating-tmt.md): Using Github Desktop to update your mod's version of TMT.

## Common components

- [Upgrades](upgrades.md): How to create upgrades for a layer.
- [Milestones](milestones.md): How to create milestones for a layer.
- [Buyables](buyables.md): Create rebuyable upgrades for your layer (with the option to make them respec-able).
                           Can be used to make Enhancers or Space Buildings.
- [Clickables](clickables.md): A more generalized variant of buyables, for any kind of thing that is sometimes clickable.
                               Between these and Buyables, you can do just about anything.

## Other components

- [Challenges](challenges.md): How to create challenges for a layer.
- [Bars](bars.md): Display some information as a progress bar, gague, or similar. They are highly customizable,
         and can be horizontal and vertical as well.
- [Subtabs and Microtabs](subtabs-and-microtabs.md): Create subtabs for your tabs, as well as "microtab" components that you can put inside the tabs.
- [Achievements](milestones.md): How to create achievements for a layer (or for the whole game).
- [Infoboxes](infoboxes.md): Boxes containing text that can be shown or hidden.
