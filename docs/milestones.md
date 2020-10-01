#Milestones

Milestones should be formatted like this:

milestones: {
  0: {
      [insert milestone info here]
  }
  etc
}

Milestone features:

requirementDesc: A string describing the requirement

effectDesc: A string describing the reward for having the milestone

done() - A function to determine if the milestone has been fulfilled.

toggles: Creates toggle buttons on the milestone when it is unlocked. An array of paired items, one pair per toggle. The first is the internal name of the layer the value being toggled is stored in, and the second is the internal name of the variable to toggle. (e.g. [["b", "auto"], ["g", "auto"])

