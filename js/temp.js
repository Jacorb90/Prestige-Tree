function updateTemp() {
	if (!tmp.challActive) {
		let LAYERS_WITH_CHALLS = Object.keys(LAYER_CHALLS)
		tmp.challActive = {}
		for (let i = 0; i < LAYERS_WITH_CHALLS.length; i++) {
			tmp.challActive[LAYERS_WITH_CHALLS[i]] = {}
			updateChallTemp(LAYERS_WITH_CHALLS[i])
		}
	}
	
	if (!tmp.layerEffs) tmp.layerEffs = {}
	for (let name in LAYER_DATA) if (LAYER_DATA[name].eff) tmp.layerEffs[name] = LAYER_DATA[name].eff()

	if (!tmp.layerReqs) tmp.layerReqs = {}
	for (let name in LAYER_DATA) tmp.layerReqs[name] = LAYER_DATA[name].getReq()

	if (!tmp.gainMults) tmp.gainMults = {}
	if (!tmp.gainExp) tmp.gainExp = {}
	if (!tmp.resetGain) tmp.resetGain = {}
	if (!tmp.nextAt) tmp.nextAt = {}
	if (!tmp.nextAtDisp) tmp.nextAtDisp = {}
	if (!tmp.layerAmt) tmp.layerAmt = {}
	for (let layer in LAYER_DATA) {
		tmp.layerAmt[layer] = LAYER_DATA[layer].getAmt()
		tmp.gainMults[layer] = getLayerGainMult(layer)
		tmp.gainExp[layer] = getLayerGainExp(layer)
		tmp.resetGain[layer] = getResetGain(layer)
		tmp.nextAt[layer] = getNextAt(layer)
		tmp.nextAtDisp[layer] = getNextAt(layer, true)
	}

	tmp.pointGen = getPointGen()

	tmp.scaling12b = getScaling12Boosters()
	tmp.scaling12ps = getScaling12PS()

	tmp.atbb = addToBoosterBase()
	tmp.atgb = addToGenBase()

	tmp.genPowEff = getGenPowerEff()

	tmp.enhPow = getEnhancerPow()
	tmp.enhEff = getEnhancerEff()
	tmp.enhEff2 = getEnhancerEff2()
	tmp.subbedEnh = new Decimal(0)
	if (tmp.challActive ? tmp.challActive.h[52] : true) {
		tmp.subbedEnh = tmp.subbedEnh.add(new Decimal(player.h.time).times(40).add(1).log10().pow(10).max(10)).round()
	}

	tmp.freeExtCap = getFreeExtCapsules()
	tmp.timeEff = getTimeEnergyEff()
	tmp.attb = addToTimeBase()
	tmp.mttb = multiplyToTimeBase()

	if (layerUnl("s")) {
		tmp.s = {
			sb: {},
			sbEff: {}
		}
		var data = tmp.s

		data.sbUnl = getSpaceBuildingsUnl()
		data.trueSbUnl = Decimal.min(data.sbUnl, SPACE_BUILDINGS.max).floor().toNumber()
		data.sbCostMult = getSpaceBuildingCostMult()
		data.sbCostMod = getSpaceBuildingCostMod()
		data.sbExtra = getExtraBuildingLevels()
		data.sbPow = getSpaceBuildingPow()
		data.sbSum = sumValues(player.s.buildings)
		for (let i=data.trueSbUnl;i>=1;i--) {
			data.sb[i] = fixValue(player.s.buildings[i])
			data.sbEff[i] = getSpaceBuildingEff(i)
		}
	}

	tmp.quirkEff = getQuirkEnergyEff()

	tmp.ssEff1 = getSubspaceEff1()
	tmp.ssEff2 = getSubspaceEff2()
	tmp.ssEff3 = getSubspaceEff3()

	tmp.balEff = getBalancePowerEff()
	tmp.balEff2 = getBalanceTypesEff()
	tmp.baExp = getBalanceEnergyExp()

	tmp.hexEff = getHexEff()
	tmp.spellsUnl = Math.min((player.sp.upgrades.includes(13)?4:3)+player.mb.extraSpells.toNumber(), MAX_SPELLS)
	if (!tmp.spellEffs) tmp.spellEffs = {}
	for (let i=1;i<=MAX_SPELLS;i++) tmp.spellEffs[i] = getSpellEff(i)

	tmp.sGenPowEff = getSGenPowEff()

	if (layerUnl("l")) {
		if (!tmp.l) tmp.l = {
			lb: {},
			lbEff: {}
		}
		var data = tmp.l
		var data2 = LIFE_BOOSTERS

		data.lpEff = data2.eff()
		data.lbUnl = data2.unl()
		for (let i=1;i<=data2.max;i++) {
			data.lb[i] = new Decimal(fixValue(player.l.boosters[i]))
			data.lbEff[i] = data2[i].eff(data.lb[i].times(data.lpEff))
		}
	}

	if (layerUnl("hs")) {
		if (!tmp.hs) tmp.hs = {
			su: {},
			suEff: {}
		}
		var data = tmp.hs
		var data2 = HYPERSPACE

		data.eff = data2.eff()
		for (let i=1;i<=tmp.s.trueSbUnl;i++) data.su[i] = fixValue(player.hs.superUpgrades[i])
	}

	if (layerUnl("i")) {
		if (!tmp.i) tmp.i = {}
		var data = tmp.i

		data.work = new Decimal(1)
		if (player.i.building) data.work = data.work.add(player.i.extraBuildings.add(1).sqrt().add(1).div(5))
		if (tmp.challActive ? tmp.challActive.ge[21] : true) data.work = data.work.add(0.75)
		data.workEff = Decimal.pow(2, data.work.sub(1))

		data.collapse = {}
		for (var i = 1; i <= IMPERIUM.maxCollapseRows; i++) if (data.work.gt(i + 0.5)) data.collapse[i] = data.work.sub(i + 0.5).times(2).min(1)

		data.compressed = tmp.s.sbUnl.sub(SPACE_BUILDINGS.max).max(0).floor().toNumber()
	}
	
	if (layerUnl("ge")) {
		if (!tmp.ge) tmp.ge = {}
		var data = tmp.ge 
		
		data.pow = getMechChallPow()
	}
	
	if (layerUnl("mb")) {
		if (!tmp.mb) tmp.mb = {}
		var data = tmp.mb
		
		data.spellBoost = player.mb.extraSpells.sub(MAX_SPELLS-4).max(0).plus(1).log10().div(2).plus(1).sqrt()
		data.lbBoost = player.mb.extraBoosters.sub(LIFE_BOOSTERS.max-5).max(0).plus(1).log10().div(2).plus(1).sqrt()
		data.machBoost = player.ma.built.sub(MACHINES.maxBuild).max(0).plus(1)
	}
	
	if (layerUnl("ma")) {
		if (!tmp.ma) tmp.ma = {}
		var data = tmp.ma
		
		data.pow = getMachinePower()
	}
}

function updateChallTemp(layer) {
	if (player[layer] === undefined) return

	let data = tmp.challActive[layer]
	let data2 = LAYER_CHALLS[layer]
	let customActive = data2.active !== undefined
	let otherChoices = data2.choose>1
	if (!data.combos) data.combos = {}
	let comboData = player[layer].challs.reduce(function (acc, curr) {
		if (acc[curr] === undefined) acc[curr] = 1;
		else acc[curr] += 1;
		return acc;
	}, {})
	
	let goalToFind = player[layer].active||player[layer].choices
	if (goalToFind==0||goalToFind==[]||goalToFind==""||goalToFind===undefined) data.goal = new Decimal(0)
	else data.goal = calcChallGoal(layer, goalToFind)
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			if (otherChoices) {
				let total = 0
				Object.keys(comboData).forEach(key => {
					if (key.split(",").includes(id.toString())) total += comboData[key]
				})
				data.combos[id] = total;
			}
			
			if (player[layer].active===undefined) delete data[id]
			else if (customActive ? data2.active(id) : (otherChoices ? player[layer].active.includes(id) : (player[layer].active == id))) data[id] = 1
			else delete data[id]
		}
	}
}