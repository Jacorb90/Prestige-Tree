# The Modding Tree changelog:

### v2.1.4 - 10/25/20
- Added an infobox component. Thank you to thepaperpilot for this contribution!
- Layer type is now optional, and defaults to "none".
- Improved the look of bars and tab buttons.
- Improved spacing between layer nodes (also thanks to thepaperpilot!)
- Fixed the "blank" component breaking if only specifying the height.
- Fixed some numbers not displaying with enough digits.
- Made a few more things able to be functions.
- A few other minor fixes.

### v2.1.3.1 - 10/21/20
- Fixed the update function.

### v2.1.3 - 10/21/20
- gainMult and gainExp are now optional.
- Layer unlocking is now kept on reset.
- Game should start up faster.
- Layer updates now have a determined order and starts with earlier-rowed layers.
- Automation now has a determined order and starts with later-rowed layers.
- Fixed issues with resetting clickables and challenges.
- Commas should no longer appear in the decimal places of a number.
- Fixed potential issue in displaying the tree.

### v2.1.2 - 10/19/20
- Added buyUpgrade function (buyUpg still works though)
- Added author name to modInfo.
- Fix to crash caused when the name of a subtab or microtab is changed.
- Fixes to outdated information in docs.
- Improvements to Discord links.
- Thank you to thepaperpilot for contributing to this update!

### v2.1.1 - 10/17/20
- Added resource-display component, which displays the base currency for the prestige layer, as well as the best
    and/or total of this layer's prestige currency.
- Fixed the value for the base currency not updating in resource-display.

## v2.1: We should have thought of this sooner! - 10/17/20
- Moved most of the code users will want to edit to mod.js, added documentation for it.
    - Specifically, modInfo, VERSION, canGenPoints, getPointGen, and maxTickLength
- Added getStartPoints()
- Added the ability to store non-layer-related data
- Added the ability to display more things at the top of the tree tab below points.
- Made the endgame condition customizable
- Added "sell one" and "sell all" buttons for buyables.
- Moved the old "game" to demo.js, and replaced it with a minimal game that won't cause issues when edited.
- Fixed issues with version number
- Fixed number formatting issue making things like "10e9" appear.


### v2.0.5 - 10/16/20
- Made more features (including prestige parameters) able to be dynamic.
- Layer nodes can be hidden but still take up space with "ghost" visibility
- Added clickableEffect for real.
- Fixed some visual issues with bars.
- A few other minor tweaks and improvements.

### v2.0.4 - 10/16/20
- Fixed HTML on buttons interfering with clicking on them.

### v2.0.3 - 10/16/20
- Fixed hotkeys not displaying in info.
- Fixed the game supressing all external hotkeys.
- You can use more things as currencies for upgrade costs and challenge goals using currencyLocation.
- Added maxTickLength, which can be used to prevent offline time or tab-switching from breaking time-limit based mechanics.
- Made buyable respec buttons and clickable "master" buttons their own components, and gave them a hide/show feature.
- Added a general "tooltip" feature for achievements.

### v2.0.2 - 10/15/20
- Branches are now dynamic (they can be functions).
- Fixed a crash related to offline time.
- Fixed links being too wide.

### v2.0.1 - 10/15/20
- Fixed side layers appearing multiple times.

## v2.0: The Pinnacle of Achievement Mountain - 10/15/20
- Added progress bars, which are highly customizable and can be horizontal or vertical!
- Added "side layers", displayed smaller and off to the side, and don't get reset by default.
    They can be used for global achievements and statistics. Speaking of which...
- Added achievements!
- Added clickables, a more generalized variant of buyables.
- Almost every value in layer data can be either a function or a constant value!
- Added support for multiple completions of challenges.
- Added "none" prestige type, which removes the need for any other prestige-related features.
- The points display and other gui elements stay at the top of the screen when the tree scrolls.
- Added getter/setter functions for the amounts and effects of most Big Features
- Moved modInfo to game.js, added a spot in modInfo for a Discord link, changelog link.
    Also added a separate mod version from the TMT version in VERSION.
- Tree structure is based on layer data, no index.html editing is needed.
- Tmp does not need to be manually updated.
- You don't have to have the same amount of upgrades in every row (and challs and buyables)
- "unlocked" is optional for all Big Components (defaults to true).
- All displays will update correctly.
- Changelog is no longer in index.html at all.
- Generation of Points now happens in the main game loop
- Changed the reset functions to make keeping things easier
- Renamed many things to increase readability (see the list in the link below)
- Improved documentation based on feedback

  [For a full list of changes to the format and functionality of existing things, click here.](2.0-format-changes.md)



### v1.3.5:

- Completely automated convertToDecimal, now you never have to worry about it again.
- Branches can be defined without a color id. But they can also use hex values for color ids!
- Created a tutorial for getting started with TMT and Github.
- Page title is now automatically taken from mod name.

### v1.3.4 - 10/8/20

- Added "midsection" feature to add things to a tab's layout while still keeping the standard layout.
- Fix for being able to buy more buyables than you should.

### v1.3.3 - 10/7/20
- Fix for the "order of operations" issue in temp.

### v1.3.1 - 10/7/20

- Added custom CSS and tooltips for Layer Nodes.
- Added custom CSS for upgrades, buyables, milestones, and challenges, both individually and layer-wide.
- You can now use HTML in most display text!
- You can now make milestones unlockable and not display immediately.
- Fixed importing saves, and issue with upgrades not appearing, and probably more.
- Optional "name" layer feature, used in confirmation messages.

## v1.3: Tabception... ception! - 10/7/20

- Added subtabs! And also a Micro-tab component to let you make smaller subtab-esque areas anywhere.
- Added a "custom" prestige formula type, and a number of features to support it.
- Added points/sec display (can be disabled).
- Added h-line, v-line and image-display components, plus components for individual upgrades, challenges, and milestones.
- Added upgEffect, buyableEffect, and challEffect functions.
- Added "hide completed challenges" setting.
- Moved old changelogs to a separate place.
- Fixed hasMilestone and incr_order.
- Static layers now show the currency amount needed for the next one if you can buy max.



### v1.2.4 - 10/4/20

- Layers are now highlighted if you can buy an upgrade, and a new feature, shouldNotify,
lets you make it highlight other ways.
- Fixed bugs with hasUpg, hasChall, hasMilestone, and inChallenge.
- Changed the sample code to use the above functions for convenience.

### v1.2.3 - 10/3/20

- Added a row component, which displays a list of objects in a row.
- Added a column component, which displays a list of objects in a column (useful within a row).
- Changed blanks to have a customizable width and height.

## v1.2: This Changes Everything! - 10/3/20

- Many layer features can now be static values or functions. (This made some formats change,
which will break old things)
- You can now use the "this" keyword, to make code easier to transfer when making new layers.
- Also added "this.layer", which is the current layer's name, and works on existing subfeatures
(e.g. individual upgrades) as well! Subfeatures also have "this.id".
- Fixed a big save issue. If you use a unique mod id, your save will never conflict with other mods.
- Added a configurable offline time limit in modinfo at the top of index.html. (default 1 hour)
- Added a few minor features, and updated the docs with new information.



### v1.1.1:

- You can define hotkeys directly from layer config.

## v1.1: Enhanced Edition

- Added "Buyables", which can function like Space Buildings or Enhancers.
- Custom CSS can now be used on any component! Make the third argument an object with CSS
parameters.
- Lots of minor good things.


## v1.0:
- First release.
