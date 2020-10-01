#Milestones

Milestones should be formatted like this:

```js
    milestones: {
        0: {
            requirementDesc: "123 waffles",
        }
        etc
    }
```

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