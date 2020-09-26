function getBalancePowerEff() {
	let eff = player.ba.power.times(2).add(1).pow(2/3)
	if (player.ba.upgrades.includes(14)) eff = eff.pow(3.85)
	if (player.ba.upgrades.includes(33)) eff = eff.pow(2)
	return eff;
}

function getBalanceTypesEff() {
	let mod = player.ba.positivity.add(1).log10().add(1).div(player.ba.negativity.add(1).log10().add(1)).log10().abs().add(1).pow(-1)
	let pos = player.ba.positivity.add(1).log10().add(1)
	let neg = player.ba.negativity.add(1).log10().add(1)
	if (player.ba.upgrades.includes(34)) mod = mod.times(1.5)
	if (player.ba.upgrades.includes(53)) mod = mod.times(LAYER_UPGS.ba[53].currently())
	let eff = pos.times(neg).pow(mod)
	return eff;
}

function getBalanceEnergyExp() {
	let exp = new Decimal(1)
	if (player.ba.unl) exp = exp.times(1.5)
	return exp;
}

function getPosGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ba[22].currently())
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 7) mult = mult.times(tmp.l.lbEff[7])
	return mult;
}

function getNegGainMult() {
	let mult = new Decimal(1)
	if (player.ba.upgrades.includes(22)) mult = mult.times(LAYER_UPGS.ba[22].currently())
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 7) mult = mult.times(tmp.l.lbEff[7])
	return mult;
}

function getBalPowGainMult() {
	let mult = new Decimal(1)
	if (player.sp.upgrades.includes(14)) mult = mult.times(LAYER_UPGS.sp[14].currently())
	return mult;
}

const MAX_SPELLS = 10

const SPELL_NAMES = {
	1: "Booster Launch",
	2: "Time Warp",
	3: "Quirk Amplification",
	4: "Spatial Compression",
	5: "Stockade Multiplication",
	6: "Generator Augmentation",
	7: "Shatter Serum",
	8: "Revival Energy",
	9: "Prestigial Ascension",
	10: "Voodoo Empowerment"
}

const SPELL_DESCS = {
	1: "Boosters are X% stronger",
	2: "Time Capsules are X% stronger",
	3: "Quirk Layers are X% more efficient",
	4: "Space Buildings cost scale X% slower",
	5: "The Final Stockade's effect is X% more efficient",
	6: "Multiply the Super-Generator base by X",
	7: "The Hindrance Spirit effect is multiplied by X",
	8: "Multiply Life Power gain by X",
	9: "Multiply Super-Prestige Point gain by X",
	10: "All previous Spells are X% stronger",
}

const SPELL_BASE = {
	1: 1.25,
	2: 1.1,
	3: 1.04,
	4: 1.01,
	5: 1.175,
	6: 1.45,
	7: 1.1,
	8: 5,
	9: 2,
	10: 1.008,
}

function getSpellPower(x) {
	let power = new Decimal(1);
	if (player.m.upgrades.includes(11)) power = power.times(LAYER_UPGS.m[11].currently())
	if (player.m.upgrades.includes(21) && (x==2||x==3)) power = power.times(LAYER_UPGS.m[21].currently())
	if (player.m.upgrades.includes(22) && (x==2)) power = power.times(10)
	if (player.m.upgrades.includes(41)) {
		let casted = player.m.casted[x]
		power = power.times(casted.max(1).log10().add(1).log10().div(5).add(1))
	}
	if (player.sp.upgrades.includes(23)) power = power.times(LAYER_UPGS.sp[23].currently())
	if (player.ps.upgrades.includes(13)) power = power.times(LAYER_UPGS.ps[13].currently())
	
	if (power.gte(50)) power = power.log10().times(50/Math.log10(50)).min(power)
	
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 6) power = power.times(tmp.l.lbEff[6])
	if (spellActive(10) && x<10) power = power.times(tmp.spellEffs[10]);
	if (tmp.mb) power = power.times(tmp.mb.spellBoost)
	
	if (power.gte(100)) power = power.log10().times(50).min(power)
	return power.max(1);
}

function getSpellEff(x) {
	let base = SPELL_BASE[x]
	let power = getSpellPower(x)
	let eff = Decimal.pow(base, power)
	if (x==4) eff = Decimal.sub(2, Decimal.div(base, power.log2().add(1)))
	return eff
}

function getSpellDesc(x) {
	let desc = SPELL_DESCS[x]
	let eff = tmp.spellEffs[x]
	if (desc.includes("X%")) return desc.replace("X", format(eff.sub(1).times(100)))
	else return desc.replace("X", format(eff))
}

function getSpellTime() {
	let time = 60
	if (player.m.total.gte(2.5e9)) time *= 4
	if (player.m.upgrades.includes(43)) time *= LAYER_UPGS.m[43].currently().toNumber()
	return time
}

function spellActive(x) {
	if (!player.m.unl) return false
	if (!tmp.spellEffs) return false
	if (tmp.spellsUnl<x) return false
	return player.m.spellTimes[x]>0
}

function activateSpell(x, force=false) {
	if (tmp.spellsUnl<x) return;
	let toCast = setToCast(player.m.toCast[x]).max(1)
	if (!force) {
		if (!player.m.unl) return
		if (spellActive(x)) return
		if (player.m.points.lt(toCast)) return
	}
	if (player.sp.total.lt(2)) player.m.points = player.m.points.sub(toCast).max(0)
	player.m.casted[x] = toCast
	player.m.spellTimes[x] = getSpellTime()
	if (!force) player.m.hexes = player.m.hexes.add(getHexGain())
}

function getHexGain() {
	let gain = new Decimal(1)
	if (player.m.upgrades.includes(14)) gain = gain.times(LAYER_UPGS.m[14].currently())
	if (player.sp.upgrades.includes(14)) gain = gain.times(LAYER_UPGS.sp[14].currently())
	if (player.l.unl && tmp.l !== undefined) gain = gain.times(tmp.l.lbEff[2])
	return gain.floor()
}

function getHexEff() {
	let eff = player.m.hexes.times(2).max(1).pow(5)
	return eff;
}

function isToCastValid(val) {
	try {
		val = new Decimal(val).floor()
		if (val.eq(undefined) || val.eq(null)) return false
		if (val.lt(1)) return false
		if (val.gt(player.m.points)) return false
		return val;
	} catch(e) {
		return false;
	}
}

function setToCast(val) {
	if (!player.m.upgrades.includes(41)) return new Decimal(1)
	let validVal = isToCastValid(val)
	if (!validVal) return new Decimal(1)
	else return validVal
}

function updateToCast(id) {
	activateSpell(id, true)
}

function getScaling12PS() {
	let x = new Decimal(1)
	if (player.l.unl && tmp.l !== undefined && tmp.l.lbUnl >= 10) x = x.times(tmp.l.lbEff[10])
	return x
}