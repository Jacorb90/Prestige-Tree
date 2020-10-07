#The Modding Tree changelog:

##v1.3.3: - 10/7/20
- Fix for the "order of operations" issue in temp.

##v1.3.1: - 10/7/20

- Added custom CSS and tooltips for Layer Nodes.
- Added custom CSS for upgrades, buyables, milestones, and challenges, both individually and layer-wide.
- You can now use HTML in most display text!
- You can now make milestones unlockable and not display immediately.
- Fixed importing saves, and issue with upgrades not appearing, and probably more.
- Optional "name" layer feature, used in confirmation messages.

##v1.3: Tabception... ception! - 10/7/20

- Added subtabs! And also a Micro-tab component to let you make smaller subtab-esque areas anywhere.
- Added a "custom" prestige formula type, and a number of features to support it.
- Added points/sec display (can be disabled).
- Added h-line, v-line and image-display components, plus components for individual upgrades, challenges, and milestones.
- Added upgEffect, buyableEffect, and challEffect functions.
- Added "hide completed challenges" setting.
- Moved old changelogs to a separate place.
- Fixed hasMilestone and incr_order.
- Static layers now show the currency amount needed for the next one if you can buy max.



##v1.2.4 - 10/4/20

- Layers are now highlighted if you can buy an upgrade, and a new feature, shouldNotify,
lets you make it highlight other ways.
- Fixed bugs with hasUpg, hasChall, hasMilestone, and inChallenge.
- Changed the sample code to use the above functions for convenience.

##v1.2.3 - 10/3/20

- Added a row component, which displays a list of objects in a row.
- Added a column component, which displays a list of objects in a column (useful within a row).
- Changed blanks to have a customizable width and height.

#v1.2: This Changes Everything! - 10/3/20

- Many layer features can now be static values or functions. (This made some formats change,
which will break old things)
- You can now use the "this" keyword, to make code easier to transfer when making new layers.
- Also added "this.layer", which is the current layer's name, and works on existing subfeatures
(e.g. individual upgrades) as well! Subfeatures also have "this.id".
- Fixed a big save issue. If you use a unique mod id, your save will never conflict with other mods.
- Added a configurable offline time limit in modinfo at the top of index.html. (default 1 hour)
- Added a few minor features, and updated the docs with new information.



##v1.1.1

- You can define hotkeys directly from layer config.

#v1.1: Enhanced Edition

- Added "Buyables", which can function like Space Buildings or Enhancers.
- Custom CSS can now be used on any component! Make the third argument an object with CSS
parameters.
- Lots of minor good things.

#v1.0:
- First release.