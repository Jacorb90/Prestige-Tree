#Challenges

Challenges are stored in the following format:

challs: {
  rows: # of rows
  cols: # of columns
  11: {
    [insert challenge info here]
  }
  etc
}

Each challenge should have an id where the first digit is the row and the second digit is the column. Individual upgrades can have these features:

name: Name of the challenge

desc: A description of what makes the challenge a challenge

reward: A description of the reward's effect

effect() - Optional, calculate and return the values of this upgrade's effects or effects.

effectDisp(x) - Optional, returns a display of the current effects of the upgrade with formatting. Default behavior is to just display the number appropriately formatted.

goal: A Decimal for the goal of the challenge's value.

currencyDisplayName: Optional, if using a goal currency other than basic Points, the name to display for that currency
currencyInternalName: The internal name for that currency
currencyLayer: The internal name of the layer for that currency. If it's not in a layer, omit.

unl() - Return a bool to determine if the challenge is unlocked or not.

onComplete() - Optional, this function will be called when the challenge is newly completed.

countsAs: An array of ids of other challenges in this layer that being in this challenge "counts as" being in. 
