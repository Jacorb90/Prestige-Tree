var layoutInfo = {
    startTab: "none",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("spook", {
    layerShown: "ghost",
}, 
)

addLayer("tree-tab", {
    tabFormat: ["tree", function() {layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS}]
})