var canvas;
var ctx;

window.addEventListener("resize", (_=>resizeCanvas()));
window.addEventListener('wheel', (_=>resizeCanvas()));

function retrieveCanvasData() {
	let treeCanv = document.getElementById("treeCanvas")
	let treeTab = document.getElementById("treeTab")
	if (treeCanv===undefined||treeCanv===null) return false;
	if (treeTab===undefined||treeTab===null) return false;
	canvas = treeCanv;
	ctx = canvas.getContext("2d");
	return true;
}

function resizeCanvas() {
	if (!retrieveCanvasData()) return
	canvas.width = 0;
    canvas.height = 0;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	drawTree();
}

var colors = {
	default: {
		1: "#ffffff",
		2: "#bfbfbf",
		3: "#7f7f7f",
	},
	aqua: {
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
	},
}
var colors_theme

function drawTree() {
	if (!retrieveCanvasData()) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (layer in layers){
		if (tmp[layer].layerShown == true && tmp[layer].branches){
			for (branch in tmp[layer].branches)
				{
					drawTreeBranch(layer, tmp[layer].branches[branch]);
				}
		}
	}
	needCanvasUpdate = false;
}

function drawTreeBranch(num1, data) { // taken from Antimatter Dimensions & adjusted slightly
	let num2 = data
	let color_id = 1

	if (Array.isArray(data)){
		num2 = data[0]
		color_id = data[1]
	} 

	if (typeof color_id == "number") color_id = colors_theme[color_id]

	let el1 = document.getElementById(num1);
	let el2 = document.getElementById(num2);
	let tab = document.body;

	if (el1 == null || el2 == null)
		return

	let start = el1.getBoundingClientRect();
    let end = el2.getBoundingClientRect();
    let x1 = start.left + (start.width / 2) + tab.scrollLeft;
    let y1 = start.top + (start.height / 2) + tab.scrollTop;
    let x2 = end.left + (end.width / 2) + tab.scrollLeft;
    let y2 = end.top + (end.height / 2) + tab.scrollTop;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.strokeStyle = color_id
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}