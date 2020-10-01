#Upgrades

Upgrades are stored in the following format:

upgrades: {
  rows: # of rows
  cols: # of columns
  11: {
    [insert upgrade info here]
  }
  etc
}

Each upgrade should have an id where the first digit is the row and the second digit is the column. Individual upgrades can have these features:

desc: A description of the upgrade's effect

effect() - Optional, calculate and return the values of this upgrade's effects or effects.

effectDisp() - Optional, returns a display of the current effects of the upgrade with formatting. Default behavior is to just display the number appropriately formatted.

cost: A Decimal for the cost of the upgrade.

currencyDisplayName: Optional, if using a currency other than the main one for this layer, the name to display for that currency
currencyInternalName: The internal name for that currency
currencyLayer: The internal name of the layer for that currency. If it's not in a layer (like Points), omit.

unl() - Return a bool to determine if the upgrade is unlocked or not.

onPurchase() - Optional, this function will be called when the upgrade is purchased. Good for upgrades like "makes this layer act like it was unlocked first".
