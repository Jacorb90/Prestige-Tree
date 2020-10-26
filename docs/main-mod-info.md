# mod.js

All of the non-layer code and data that you're likely to edit is here in [mod.js](/js/mod.js)! Everything in [mod.js](/js/mod.js) will not be altered by updates, besides the addition of new things.

Here's a breakdown of what's in it:

- modInfo is where most of the basic configuration for the mod is. It contains:
    - name: The name of your mod. (a string)
    - id: The id for your mod, a unique string that is used to determine savefile location. Setting it is important!
    - author: The name of the author, displayed in the info tab.
    - pointsName: This changes what is displayed instead of "points" for the main currency. (It does not affect it in the code.)
    - discordName, discordLink: If you have a Discord server or other discussion place, you can add a link to it.

        "discordName" is the text on the link, and "discordLink" is the url of an invite. If you're using a Discord invite, please make sure it's set to never expire.

    - changelogLink: You can use this to set a link to a page where your changelog for the game is displayed.
    - offlineLimit: The maximum amount of offline time that the player can accumulate, in hours. Any extra time is lost. (a number)

        This is useful because most of these mods are fast-paced enough that too much offline time ruins the balance, such as the time in between updates. That is why I suggest developers disable offline time on their own savefile.

    - initialStartPoints: A Decimal for the amount of points a new player should start with.

- VERSION is used to describe the current version of your mod. It contains:
    - num: The mod's version number, displayed at the top right of the tree tab.
    - name: The version's name, displayed alongside the number in the info tab.

- doNotCallTheseFunctionsEveryTick is very important. TMT calls every function anywhere in "layers" every tick to store the result, unless specifically told not to. Functions that have are used to do an action need to be identified. "Official" functions (those in the documentation) are all fine, but if you make any new ones, add their names to this array.

```js
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]
```

- getStartPoints(): A function to determine the amount of points the player starts with after a reset. (returns a Decimal value)

- canGenPoints(): A function returning a boolean for if points should be generated. Use this if you want an upgrade to unlock generating points. 

- getPointGen(): A function that calculates your points per second. Anything that affects your point gain should go into the calculation here.

- addedPlayerData(): A function that returns any non-layer-related data that you want to be added to the save data and "player" object.

```js
function addedPlayerData() { return {
	weather: "Yes",
	happiness: new Decimal(72),
}}
```

- displayThings: An array of functions used to display extra things at the top of the tree tab. Each function returns a string, which is a line to display (with basic HTML support). If a function returns nothing, nothing is displayed (and it doesn't take up a line).

- isEndgame(): A function to determine if the player has reached the end of the game, at which point the "you win!" screen appears.

Less important things beyond this point!

- maxTickLength(): Returns the maximum tick length, in milliseconds. Only really useful if you have something that reduces over time, which long ticks mess up (usually a challenge).
