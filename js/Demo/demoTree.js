// treeLayout will override the default tree's layout if used
var layoutInfo = {
    startTab: "c",
	showTree: true,

    //treeLayout: ""

    
}

// A "ghost" layer which offsets f in the tree
addNode("spook", {
    row: 1,
    layerShown: "ghost",
}, 
)


// A "ghost" layer which offsets f in the tree
addNode("g", {
    symbol: "TH",
    branches: ["c"],
    color: '#6d3678',
    layerShown: true,
    canClick() {return player.points.gte(10)},
    tooltip: "Thanos your points",
    tooltipLocked: "Thanos your points",
    onClick() {player.points = player.points.div(2)}

}, 
)


// A "ghost" layer which offsets f in the tree
addNode("h", {
    branches: ["g"],
    layerShown: true,
    tooltip: "Restore your points to 10",
    tooltipLocked: "Restore your points to 10",

    canClick() {return player.points.lt(10)},
    onClick() {player.points = new Decimal(10)}
}, 
)

addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]]
})