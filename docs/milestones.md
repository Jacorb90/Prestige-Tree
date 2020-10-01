#Milestones

Milestones should be formatted like this:

``milestones: {
  0: {
      requirementDesc: "123 waffles",
  }
  etc
}``

You can use inChall(layer, id) and hasChall(layer, id) to determine if the player is currently in a challenge,

Milestone features:

- requirementDesc: A string describing the requirement for unlocking this milestone. Suggestion: Use a "total".

- effectDesc: A string describing the reward for having the milestone. *You will have to implement the reward elsewhere.*

- done(): A function returning a boolean to determine if the milestone has been fulfilled.

- toggles: *optional*, Creates toggle buttons that appear on the milestone when it is unlocked.
           The toggles can toggle a given boolean value in a layer.
           It is defined as an array of paired items, one pair per toggle. The first is the internal name of the layer
           the value being toggled is stored in, and the second is the internal name of the variable to toggle.
           (e.g. [["b", "auto"], ["g", "auto"])

#Challenges

Challenges are stored in the following format:

```challs: {
  rows: # of rows
  cols: # of columns
  11: {
    name: "Ouch",
    etc
  }
  etc
}```

You can use inChall(layer, id) and hasChall(layer, id) to determine if the player is currently in a challenge,
or has completed the challenge, respectively. These are useful for implementing effects.

Each challenge should have an id where the first digit is the row and the second digit is the column.
Individual upgrades can have these features:

- name: Name of the challenge

- desc: A description of what makes the challenge a challenge. *You will need to implement these elsewhere*

- reward: A description of the reward's effect. *You will also have to implement the effect where it is applied.*

- effect(): **optional**, A function that calculates and returns the current values of any bonuses from the reward.
    Can return a value or an object containing multiple values.

- effectDisp(effects): **optional**, A function that returns a display of the current effects of the reward with 
                     formatting. Default behavior is to just display the a number appropriately formatted.

- goal: A Decimal for the cost of the upgrade. By default, the goal is in basic Points.

- unl(): A function returning a bool to determine if the challenge is unlocked or not.

- onComplete() - **optional**, this function will be called when the challenge is completed when previously incomplete.

- countsAs: **optional**, If a challenge combines the effects of other challenges in this layer, you can use this.
            An array of challenge ids. The player is effectively in all of those challenges when in the current one.

By default, challenges use basic Points for the goal. You can change that using these features.
- currencyDisplayName: **optional**, the name to display for the currency for the goal
- currencyInternalName: **optional**, the internal name for that currency
- currencyLayer: **optional**, the internal name of the layer that currency is stored in.
                 If it's part of a layer, omit.


