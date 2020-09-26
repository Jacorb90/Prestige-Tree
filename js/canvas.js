var canvas;
var ctx;

window.addEventListener("resize", (_=>resizeCanvas()));

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
    canvas.width = document.getElementById("treeTab").scrollWidth;
    canvas.height = document.getElementById("treeTab").scrollHeight;
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
	for (let layer in LAYER_DATA) {
		let data = LAYER_DATA[layer]
		for (let x in data.branches) {
			let colorDefined = data.branches[x] instanceof Array
			drawTreeBranch((colorDefined?data.branches[x][0]:data.branches[x]), layer, colorDefined?data.branches[x][1]:1)
		}
	}
	needCanvasUpdate = false;
}

function drawTreeBranch(num1, num2, color_id = 1) { // taken from Antimatter Dimensions & adjusted slightly
	if (!LAYER_DATA[num1]) return;
	if (!LAYER_DATA[num2]) return;
	
	if (!LAYER_DATA[num1].shown()) return;
	if (!LAYER_DATA[num2].shown()) return;
	
    let start = document.getElementById(num1).getBoundingClientRect();
    let end = document.getElementById(num2).getBoundingClientRect();
    let x1 = start.left + (start.width / 2) + (document.getElementById("treeTab").scrollLeft || document.body.scrollLeft);
    let y1 = start.top + (start.height / 2) + (document.getElementById("treeTab").scrollTop || document.body.scrollTop);
    let x2 = end.left + (end.width / 2) + (document.getElementById("treeTab").scrollLeft || document.body.scrollLeft);
    let y2 = end.top + (end.height / 2) + (document.getElementById("treeTab").scrollTop || document.body.scrollTop);
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.strokeStyle = colors_theme[color_id]
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}