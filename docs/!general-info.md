# The-Modding-Tree

The main way to add content is through creating layers. You can either add a layer directly in the layers object in [layerSupport.js](/js/layerSupport.js), or declare it in another file and register it by calling `addLayer(layername, layerdata)`. There is an example layer registration in [layers.js](/js/layers.js) showing the recommended method. It is just an example and can be freely deleted. You can also use it as a reference or a base for your own layers.

The first thing you need to do is fill out the modInfo object at the top of [mod.js](/js/mod.js) to set your mod's name, ID (a string), and other information. A unique modId will prevent your mod's saves from conflicting with other mods. Note that changing this after people have started playing will reset their saves.

Most of the time, you won't need to dive deep into the code to create things, but you still can if you really want to, for example to add new Vue components in [v.js](/js/v.js).

The Modding Tree uses [break\_eternity.js](https://github.com/Patashu/break_eternity.js) to store large values. This means that many numbers are `Decimal` objects, and must be treated differently. For example, you have to use `new Decimal(x)` to create a `Decimal` value instead of a plain number, and perform operations on them by calling functions. e.g, instead of `x = x + y`, use `x = x.add(y)`. Keep in mind this also applies to comparison operators, which should be replaced with calling the `.gt`, `.gte`, `.lt`, `.lte`, `.eq`, and `.neq` functions. See the [break\_eternity.js](https://github.com/Patashu/break_eternity.js) docs for more details on working with `Decimal` values.

Almost all values can be either a constant value, or a dynamic value. Dynamic values are defined by putting a function that returns what the value should be at any given time.

All display text can use basic HTML elements (But you can't use most Vue features there).

While reading this documentation, the following key will be used when describing features:

- No label: This is required and the game may crash if it isn't included.
- **sometimes required**: This is may be required, depending on other things in the layer.
- **optional**: You can leave this out if you don't intend to use that feature for the layer.
- **assigned automagically**: This value will be set automatically and override any value you set.
- **deprecated**: This feature is not recommended to be used anymore, and may be removed in future versions of TMT.

## Table of Contents

### General

- [Getting Started](getting-started.md): Getting your own copy of the code set up with Github Desktop.
- [Main mod info](main-mod-info.md): How to set up general things for your mod in [mod.js](/js/mod.js).
- [Basic layer breakdown](basic-layer-breakdown.md): Breaking down the components of a layer with minimal features.
- [Layer features](layer-features.md): Explanations of all of the different properties that you can give a layer.
- [Custom Tab Layouts](custom-tab-layouts.md): An optional way to give your tabs a different layout. You can even create entirely new components to use.
- [Custom game layouts](trees-and-tree-customization.md): You can get rid of the tree tab, add buttons and other things to the tree,
    or even customize the tab's layout like a layer tab.
- [Updating TMT](updating-tmt.md): Using Github Desktop to update your mod's version of TMT.

### Common components

- [Upgrades](upgrades.md): How to create upgrades for a layer.
- [Milestones](milestones.md): How to create milestones for a layer.
- [Buyables](buyables.md): Create rebuyable upgrades for your layer (with the option to make them respec-able). Can be used to make Enhancers or Space Buildings.
- [Clickables](clickables.md): A more generalized variant of buyables, for any kind of thing that is sometimes clickable. Between these and Buyables, you can do just about anything.

### Other components and features

- [Challenges](challenges.md): How to create challenges for a layer.
- [Bars](bars.md): Display some information as a progress bar, gauge, or similar. They are highly customizable, and can be horizontal and vertical as well.
- [Subtabs and Microtabs](subtabs-and-microtabs.md): Create subtabs for your tabs, as well as "microtab" components that you can put inside the tabs.
                        You can even use them to embed a layer inside another layer!
- [Achievements](achievements.md): How to create achievements for a layer (or for the whole game).
- [Infoboxes](infoboxes.md): Boxes containing text that can be shown or hidden.
- [Trees](trees-and-tree-customization.md): Make your own trees. You can make non-layer button nodes too!
