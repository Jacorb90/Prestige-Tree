var canvas;
var ctx

window.addEventListener("resize", (_=>resizeCanvas()));

function retrieveCanvasData() {
	let treeCanv = document.getElementById("treeCanvas")
	if (treeCanv===undefined||treeCanv===null) return false;
	canvas = treeCanv;
	ctx = canvas.getContext("2d");
	return true;
}

function resizeCanvas() {
	if (!retrieveCanvasData()) return
	canvas.width = 0;
    canvas.height = 0;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
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
	if (layerUnl('s')) drawTreeBranch("g", "s")
	
	needCanvasUpdate = false;
}

function drawTreeBranch(num1, num2) { // taken from Antimatter Dimensions & adjusted slightly
    let start = document.getElementById(num1).getBoundingClientRect();
    let end = document.getElementById(num2).getBoundingClientRect();
    let x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
    let y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
    let x2 = end.left + (end.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
    let y2 = end.top + (end.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.strokeStyle = "white"
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}