function getQuirkLayerCostBase() {
	let base = new Decimal(2)
	if (player.ba.upgrades.includes(31)) base = LAYER_UPGS.ba[31].currently()
	return base
}

function getQuirkLayerCost(layers) {
	if (layers === undefined) layers = player.q.layers
	if (layers.gte(20)) layers = Decimal.pow(player.h.challs.includes(72)?1.025:1.05, layers.sub(20)).times(20)
	if (player.ba.upgrades.includes(55)) layers = layers.sub(LAYER_UPGS.ba[55].currently())
	let base = getQuirkLayerCostBase()
	let cost = Decimal.pow(base, Decimal.pow(base, layers).sub(1))
	return cost.max(1);
}

function getQuirkLayerTarg() {
	let base = getQuirkLayerCostBase()
	let targ = player.q.points.log(base).add(1).log(base)
	if (player.ba.upgrades.includes(55)) targ = targ.add(LAYER_UPGS.ba[55].currently())
	if (targ.gte(20)) targ = targ.div(20).log(player.h.challs.includes(72)?1.025:1.05).add(20)
	return targ.add(1).floor()
}

function getQuirkLayerMult() {
	let mult = new Decimal(1)
	if (player.q.upgrades.includes(13)) mult = mult.times(2)
	if (player.q.upgrades.includes(14)) mult = mult.times(3)
	if (player.q.upgrades.includes(21)) mult = mult.times(LAYER_UPGS.q[21].currently())
	if (player.q.upgrades.includes(52)) mult = mult.times(LAYER_UPGS.q[52].currently())
	if (player.h.challs.includes(52)) mult = mult.times(LAYER_CHALLS.h[52].currently())
	if (player.ba.upgrades.includes(13)) mult = mult.times(LAYER_UPGS.ba[13].currently())
	if (player.ge.unl) mult = mult.times(LAYER_CHALLS.ge[31].currently());
	return mult
}

function getExtraQuirkLayers() {
	let layers = new Decimal(0);
	if (player.q.upgrades.includes(51)) layers = layers.add(LAYER_UPGS.q[51].currently())
	if (player.m.upgrades.includes(24)) layers = layers.add(LAYER_UPGS.m[24].currently())
	if (player.m.upgrades.includes(34)) layers = layers.add(1)
	if (tmp.s !== undefined && tmp.s.trueSbUnl >= 8) layers = layers.add(tmp.s.sbEff[8])
	return layers;
}

function getQuirkEnergyGainExp() {
	let mult = new Decimal(1)
	if (spellActive(3)) mult = mult.times(tmp.spellEffs[3])
	if (player.ge.unl) mult = mult.times(LAYER_CHALLS.ge[12].currently())
	return player.q.layers.add(getExtraQuirkLayers()).sub(1).times(mult)
}

function getQuirkEnergyEff() {
	let eff = player.q.energy.add(1).pow(2)
	if (player.q.upgrades.includes(12)) {
		let mod = player.q.energy.add(1).log10().add(1).log10().add(1)
		if (mod.gte(2)) {
			eff = eff.times(mod.div(2).pow(10))
			mod = new Decimal(2)
		}
		eff = eff.pow(mod)
	}
	if (player.q.upgrades.includes(32)) eff = eff.pow(2)
	if (player.h.challs.includes(61)) eff = eff.pow(1.2)
	if (player.ba.upgrades.includes(13)) eff = eff.pow(3)

	return eff;
}

function buyQuirkLayer() {
	if (!player.q.unl) return
	let cost = getQuirkLayerCost()
	if (player.q.points.lt(cost)) return
	player.q.points = player.q.points.sub(cost)
	player.q.layers = player.q.layers.add(1)
}

function maxQuirkLayers() {
	if (!player.q.unl) return
	let cost = getQuirkLayerCost()
	if (player.q.points.lt(cost)) return
	let target = getQuirkLayerTarg()
	if (target.lte(player.q.layers)) return
	player.q.points = player.q.points.sub(cost)
	player.q.layers = player.q.layers.max(target)
}

function getSubspaceEff1() {
	if (!player.ss.unl) return new Decimal(0)
	let eff = player.ss.subspace.times(player.ss.points).add(1).log10().times(100)
	if (player.sp.upgrades.includes(35)) eff = eff.times(LAYER_UPGS.sp[35].currently())
	return eff.floor();
}

function getSubspaceEff2() {
	if (!player.ss.unl) return new Decimal(1)
	let eff = player.ss.subspace.add(1).pow(750)
	if (player.sp.upgrades.includes(35)) eff = eff.pow(LAYER_UPGS.sp[35].currently())
	return eff;
}

function getSubspaceEff3() {
	if (!player.ss.unl) return new Decimal(1)
	let eff = player.ss.subspace.add(1).log10().add(1).log10().div(2.5).add(1)
	if (player.ss.upgrades.includes(13)) eff = eff.times(1.5)
	if (player.sp.upgrades.includes(35)) eff = eff.times(LAYER_UPGS.sp[35].currently())
	if (eff.gte(2)) eff = eff.log2().add(1)
	return eff;
}

function getSubspaceGainMult() {
	let mult = new Decimal(1)
	if (player.ss.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.ss[12].currently())
	if (player.ss.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ss[22].currently())
	if (player.ss.upgrades.includes(24)) mult = mult.times(LAYER_UPGS.ss[24].currently())
	if (player.ss.upgrades.includes(25)) mult = mult.times(LAYER_UPGS.ss[25].currently())
	if (player.ba.upgrades.includes(12)) mult = mult.times(LAYER_UPGS.ba[12].currently())
	return mult
}

function addToHBBase() {
	let toAdd = new Decimal(0)
	if (player.m.upgrades.includes(13)) toAdd = toAdd.add(LAYER_UPGS.m[13].currently())
	if (player.m.upgrades.includes(33)) toAdd = toAdd.add(LAYER_UPGS.m[33].currently())
	return toAdd
}

function getHyperBoosterExp() {
	let exp = new Decimal(1)
	if (player.hb.order>0) exp = new Decimal(0.5)
	return exp
}

function getExtraHyperBoosters() {
	let x = new Decimal(0)
	if (player.l.unl && tmp.l !== undefined) x = x.add(tmp.l.lbEff[1])
	return x
}

function getHyperBoosterPow() {
	if (tmp.challActive ? tmp.challActive.ge[11] : true) return new Decimal(0)
	
	let pow = new Decimal(1)
	if (player.hb.upgrades.includes(12)) pow = pow.times(LAYER_UPGS.hb[12].currently())
	if (player.ge.unl) pow = pow.times(LAYER_CHALLS.ge[11].currently())
	return pow;
}