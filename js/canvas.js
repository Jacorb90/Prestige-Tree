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
	if (layerShown('b')) drawTreeBranch("p", "b")
	if (layerShown('g')) drawTreeBranch("p", "g")
	if (layerShown('e')) {
		drawTreeBranch("b", "e")
		drawTreeBranch("g", "e")
	}
	if (layerShown('t')) drawTreeBranch("b", "t")
	if (layerShown('sb')) drawTreeBranch("b", "sb")
	if (layerShown('sg')) drawTreeBranch("g", "sg")
	if (layerShown('s')) drawTreeBranch("g", "s")
	if (layerShown('h')) drawTreeBranch("t", "h")
	if (layerShown('q')) drawTreeBranch("e", "q")
	if (layerShown('hb')) {
		drawTreeBranch("sb", "hb")
		drawTreeBranch("t", "hb")
	}
	if (layerShown('ss')) {
		drawTreeBranch("e", "ss")
		drawTreeBranch("s", "ss")
	}
	if (layerShown('hg')) {
		drawTreeBranch("sg", "hg")
	}
	if (layerShown('m')) {
		drawTreeBranch("hb", "m")
		drawTreeBranch("h", "m")
		drawTreeBranch("q", "m")
	}
	if (layerShown('ba')) {
		drawTreeBranch("h", "ba", 2)
		drawTreeBranch("q", "ba")
		drawTreeBranch("ss", "ba")
	}
	if (layerShown('sp')) {
		drawTreeBranch("m", "sp")
		drawTreeBranch("ba", "sp")
	}
	if (layerShown('l')) {
		drawTreeBranch("hb", "l")
		drawTreeBranch("m", "l")
	}
	if (layerShown('ps')) {
		drawTreeBranch("h", "ps", 3)
		drawTreeBranch("q", "ps", 3)
	}
	if (layerShown('hs')) {
		drawTreeBranch("ss", "hs")
		drawTreeBranch("ba", "hs")
	}
	if (layerShown('i')) {
		drawTreeBranch("ss", "i")
		drawTreeBranch("sg", "i")
	}
	if (layerShown('mb')) {
		drawTreeBranch("l", "mb")
		drawTreeBranch("ps", "mb", 2)
	}
	if (layerShown('ge')) {
		drawTreeBranch("sp", "ge")
	}
	if (layerShown('ma')) {
		drawTreeBranch("hs", "ma")
		drawTreeBranch("i", "ma")
	}
	needCanvasUpdate = false;
}

function drawTreeBranch(num1, num2, color_id = 1) { // taken from Antimatter Dimensions & adjusted slightly
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