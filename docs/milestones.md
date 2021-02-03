# Milestones

Milestones are awarded to the player when they meet a certain goal, and give some benefit. Milestones should be formatted like this:

```js
milestones: {
    0: {
        requirementDesc: "123 waffles",
        effectDesc: "blah",
        done() { return player.w.points.gte(123) }
    }
    etc
}
```

You can use `hasMilestone(layer, id)` to determine if the player has a given milestone

Milestone features:

- requirementDescription: A string describing the requirement for unlocking this milestone. Suggestion: Use a "total". It can also be a function that returns updating text. Can use basic HTML.

- effectDescription: A string describing the reward for having the milestone. *You will have to implement the reward elsewhere.* It can also be a function that returns updating text. Can use basic HTML.

- done(): A function returning a boolean to determine if the milestone should be awarded.

- toggles: **optional**. Creates toggle buttons that appear on the milestone when it is unlocked. The toggles can toggle a given boolean value in a layer. It is defined as an array of paired items, one pair per toggle. The first is the internal name of the layer the value being toggled is stored in, and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])

   **Tip:** Toggles are not de-set if the milestone becomes locked! In this case, you should also check if the player has the milestone.

- style: **optional**. Applies CSS to this milestone, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).

- unlocked(): **optional**. A function returning a boolean to determine if the milestone should be shown. If absent, it is always shown.

- layer: **assigned automagically**. It's the same value as the name of this layer, so you can do `player[this.layer].points` or similar.

- id: **assigned automagically**. It's the "key" which the milestone was stored under, for convenient access. The milestone in the example's id is 0.
