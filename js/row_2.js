function addToBoosterBase() {
	let toAdd = new Decimal(0)
	if (player.b.upgrades.includes(12)) toAdd = toAdd.add(LAYER_UPGS.b[12].currently())
	if (player.b.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.b[13].currently())
	if (player.t.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.t[11].currently())
	if (player.t.upgrades.includes(31)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(25)
	if (player.t.upgrades.includes(33)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(40)
	if (player.e.unl) toAdd = toAdd.add(tmp.enhEff2)
	if (player.e.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.e[11].currently().b)
	if (player.s.unl && tmp.s !== undefined) toAdd = toAdd.add(tmp.s.sbEff[2])
	if (player.sb.upgrades.includes(21)) toAdd = toAdd.add(LAYER_UPGS.sb[21].currently())
	
	if (player.b.upgrades.includes(31)) toAdd = toAdd.times(LAYER_UPGS.b[31].currently())
	if (player.q.upgrades.includes(53)) toAdd = toAdd.times(tmp.enhEff2)
	if (player.sb.unl) toAdd = toAdd.times(tmp.layerEffs.sb)
	return toAdd
}

function getFreeBoosters() {
	let free = new Decimal(0)
	if (player.t.upgrades.includes(24)&&!(tmp.challActive?tmp.challActive.h[12]:true)) free = free.add(18)
	if (player.b.upgrades.includes(32)) free = free.add(LAYER_UPGS.b[32].currently())
	if (player.b.upgrades.includes(33)) free = free.add(100)
	return free
}

function getBoosterPower() {
	let power = new Decimal(1)
	if (spellActive(1)) power = power.times(tmp.spellEffs[1])
	if (player.sp.upgrades.includes(34)) power = power.times(1.25)
	if (player.ge.upgrades.includes(21)) power = power.times(1.02)
	return power
}

function getScaling12Boosters() {
	let x = new Decimal(1)
	if (player.ps.upgrades.includes(22)) x = x.times(LAYER_UPGS.ps[22].currently())
	return x
}

function addToGenBase() {
	let toAdd = new Decimal(0)
	if (player.g.upgrades.includes(12)) toAdd = toAdd.add(LAYER_UPGS.g[12].currently())
	if (player.g.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.g[13].currently())
	if (player.g.upgrades.includes(33)) toAdd = toAdd.add(LAYER_UPGS.g[33].currently())
	if (player.e.unl) toAdd = toAdd.add(tmp.enhEff2)
	if (player.e.upgrades.includes(11)&&!(tmp.challActive?tmp.challActive.h[12]:true)) toAdd = toAdd.add(LAYER_UPGS.e[11].currently().g)
	if (player.s.unl && tmp.s !== undefined) toAdd = toAdd.add(tmp.s.sbEff[2])
		
	if (player.h.challs.includes(51)) toAdd = toAdd.times(LAYER_CHALLS.h[51].currently())
	if (player.q.upgrades.includes(53)) toAdd = toAdd.times(tmp.enhEff2)
	return toAdd
}

function getGenPow() {
	let pow = new Decimal(1)
	if (player.g.upgrades.includes(34)) pow = pow.times(LAYER_UPGS.g[34].currently())
	if (player.sp.upgrades.includes(34)) pow = pow.times(1.25)
	if (player.ge.upgrades.includes(21)) pow = pow.times(1.5)
	if (player.sg.upgrades.includes(13)) pow = pow.times(LAYER_UPGS.sg[13].currently())
	return pow
}

function getGenPowerGainMult() {
	let mult = new Decimal(1)
	if (player.g.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.g[21].currently())
	if (player.g.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.g[25].currently())
	if (player.e.upgrades.includes(35)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.e[35].currently())
	if (player.s.upgrades.includes(12)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.s[12].currently())
	if (player.s.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true)) mult = mult.times(LAYER_UPGS.s[13].currently())
	if (player.q.unl && tmp.quirkEff) mult = mult.times(tmp.quirkEff)
	if (player.g.upgrades.includes(35)) mult = mult.times(LAYER_UPGS.g[35].currently())
	return mult
}

function getGenPowerEffExp() {
	let exp = new Decimal(1/3)
	if (player.s.upgrades.includes(34)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = exp.add(LAYER_UPGS.s[34].currently())
	if (player.b.upgrades.includes(21)) exp = exp.times(2)
	if (player.b.upgrades.includes(22)) exp = exp.times(1.2)
	if (player.e.upgrades.includes(21)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = exp.times(1.15)
	if (player.h.challs.includes(11)) exp = exp.times(1.25)
	if (player.h.challs.includes(42)) exp = exp.times(3)
	return exp;
}

function getGenPowerEff() {
	if (tmp.challActive ? tmp.challActive.h[11] : true) return new Decimal(1)
	let eff = player.g.power.add(1).pow(getGenPowerEffExp());
	return eff
}