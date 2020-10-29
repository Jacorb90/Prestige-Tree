# Subtabs and Microtabs

Subtabs are separate sections of a tab that you can view by selecting one at the top of the tab. Microtabs are smaller areas that function in much the same way. You can also embed layers inside of subtabs/microtabs.

Subtabs are defined by using the tab format like this, where each element of tabFormat is given the name of that subtab:

```js
tabFormat: {
    "Main tab": {
        content: [tab format things],
        *subtab features*
    },
    "Other tab": {
        content: [tab format things],
        *subtab features*
    },
    etc
}
```

Microtabs are defined similarly, and use the same features, but are defined in the "microtabs" feature. Each entry is a group of tabs which will appear in a microtabs component. The first set, "stuff", has 2 tabs, and the second, "otherStuff", has none.

```js
microtabs: {
    stuff: {
        first: {
            content: [tab format things],
            *subtab features*
        },
        second: {
            content: [tab format things],
            *subtab features*
        }
    },
    otherStuff: {
        // There could be another set of microtabs here
    }
}
```

Normal subtabs and microtab subtabs both use the same features:

# Features:

- content: The tab layout code for the subtab, in [the tab layout format](custom-tab-layouts.md).

- style: **optional**. Applies CSS to the whole subtab when switched to, in the form of an "CSS Object", where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- buttonStyle: **optional**. A CSS object, which affects the appearance of the button for that subtab.

- unlocked(): **optional**. a function to determine if the button for this subtab should be visible. By default, a subtab is always unlocked. You can't use the "this" keyword in this function.

- shouldNotify(): **optional**, if true, the tab button will be highlighted to notify the player that there is something there.

- embedLayer: **SIGNIFICANT**, the id of another layer. If you have this, it will override "content", "style" and "shouldNotify",
                instead displaying the entire layer in the subtab.