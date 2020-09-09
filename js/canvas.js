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

function drawTree() {
	if (!retrieveCanvasData()) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (layerUnl('b')) drawTreeBranch("p", "b")
	if (layerUnl('g')) drawTreeBranch("p", "g")
	if (layerUnl('e')) {
		drawTreeBranch("b", "e")
		drawTreeBranch("g", "e")
	}
	if (layerUnl('t')) drawTreeBranch("b", "t")
	if (layerUnl('sb')) drawTreeBranch("b", "sb")
	if (layerUnl('sg')) drawTreeBranch("g", "sg")
	if (layerUnl('s')) drawTreeBranch("g", "s")
	if (layerUnl('h')) drawTreeBranch("t", "h")
	if (layerUnl('q')) drawTreeBranch("e", "q")
	if (layerUnl('hb')) {
		drawTreeBranch("sb", "hb")
		drawTreeBranch("t", "hb")
	}
	if (layerUnl('ss')) {
		drawTreeBranch("e", "ss")
		drawTreeBranch("s", "ss")
	}
	if (layerUnl('m')) {
		drawTreeBranch("hb", "m")
		drawTreeBranch("h", "m")
		drawTreeBranch("q", "m")
	}
	if (layerUnl('ba')) {
		drawTreeBranch("q", "ba")
		drawTreeBranch("ss", "ba")
	}
	if (layerUnl('sp')) {
		drawTreeBranch("m", "sp")
		drawTreeBranch("ba", "sp")
	}
	
	needCanvasUpdate = false;
}

function drawTreeBranch(num1, num2) { // taken from Antimatter Dimensions & adjusted slightly
    let start = document.getElementById(num1).getBoundingClientRect();
    let end = document.getElementById(num2).getBoundingClientRect();
    let x1 = start.left + (start.width / 2) + (document.getElementById("treeTab").scrollLeft || document.body.scrollLeft);
    let y1 = start.top + (start.height / 2) + (document.getElementById("treeTab").scrollTop || document.body.scrollTop);
    let x2 = end.left + (end.width / 2) + (document.getElementById("treeTab").scrollLeft || document.body.scrollLeft);
    let y2 = end.top + (end.height / 2) + (document.getElementById("treeTab").scrollTop || document.body.scrollTop);
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.strokeStyle = "white"
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}