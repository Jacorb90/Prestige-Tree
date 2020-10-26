# Challenges

Useful functions for dealing with Challenges and implementing their effects:

- inChallenge(layer, id): determine if the player is in a given challenge (or another challenge on the same layer that counts as this one).
- hasChallenge(layer, id): determine if the player has completed the challenge.
- challengeCompletions(layer, id): determine how many times the player completed the challenge.
- challengeEffect(layer, id): Returns the current effects of the challenge, if any.

Challenges are stored in the following format:

```js
challenges: {
    rows: # of rows,
    cols: # of columns,
    11: {
        name: "Ouch",
        challengeDescription: "description of ouchie",
        goal: new Decimal(100),
        etc
    },
    etc
}
```

Each challenge should have an id where the first digit is the row and the second digit is the column.

Individual Challenges can have these features:

- name: Name of the challenge, can be a string or a function. Can use basic HTML.

- challengeDescription: A description of what makes the challenge a challenge. *You will need to implement these elsewhere.* It can also be a function that returns updating text. Can use basic HTML.

- rewardDescription: A description of the reward's effect. *You will also have to implement the effect where it is applied.* It can also be a function that returns updating text. Can use basic HTML.

- rewardEffect(): **optional**. A function that calculates and returns the current values of any bonuses from the reward. Can return a value or an object containing multiple values. Can use basic HTML.

- rewardDisplay(): **optional**. A function that returns a display of the current effects of the reward with formatting. Default behavior is to just display the a number appropriately formatted.

- goal: A Decimal for the amount of currency required to beat the challenge. By default, the goal is in basic Points. The goal can also be a function if its value changes.

- unlocked(): **optional**. A function returning a bool to determine if the challenge is visible or not. Default is unlocked.

- onComplete() - **optional**. this function will be called when the challenge is completed when previously incomplete.

- countsAs: **optional**. If a challenge combines the effects of other challenges in this layer, you can use this. An array of challenge ids. The player is effectively in all of those challenges when in the current one.

- completionLimit: **optional**. the amount of times you can complete this challenge. Default is 1 completion.

- style: **optional**. Applies CSS to this challenge, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do player[this.layer].points or similar

- id: **assigned automagically**. It's the "key" which the challenge was stored under, for convenient access. The challenge in the example's id is 11.

By default, challenges use basic Points for the goal. You can change that using these features:

- currencyDisplayName: **optional**. the name to display for the currency for the goal

- currencyInternalName: **optional**. the internal name for that currency

- currencyLayer: **optional**. the internal name of the layer that currency is stored in. If it's not in a layer, omit. If it's not stored directly in a layer, instead use the next feature.

- currencyLocation: **optional**. if your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way. This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)
