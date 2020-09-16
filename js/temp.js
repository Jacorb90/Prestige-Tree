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
	for (let name in LAYER_EFFS) tmp.layerEffs[name] = LAYER_EFFS[name]()

	if (!tmp.layerReqs) tmp.layerReqs = {}
	for (let name in LAYER_REQS) tmp.layerReqs[name] = getLayerReq(name)

	if (!tmp.gainMults) tmp.gainMults = {}
	if (!tmp.gainExp) tmp.gainExp = {}
	if (!tmp.resetGain) tmp.resetGain = {}
	if (!tmp.nextAt) tmp.nextAt = {}
	if (!tmp.layerAmt) tmp.layerAmt = {}
	for (let i in LAYERS) {
		tmp.layerAmt[LAYERS[i]] = getLayerAmt(LAYERS[i])
		tmp.gainMults[LAYERS[i]] = getLayerGainMult(LAYERS[i])
		tmp.gainExp[LAYERS[i]] = getLayerGainExp(LAYERS[i])
		tmp.resetGain[LAYERS[i]] = getResetGain(LAYERS[i])
		tmp.nextAt[LAYERS[i]] = getNextAt(LAYERS[i])
	}

	tmp.pointGen = getPointGen()

	tmp.scaling12b = getScaling12Boosters()

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
	tmp.qCB = getQuirkLayerCostBase()

	tmp.ssEff1 = getSubspaceEff1()
	tmp.ssEff2 = getSubspaceEff2()
	tmp.ssEff3 = getSubspaceEff3()

	tmp.balEff = getBalancePowerEff()
	tmp.balEff2 = getBalanceTypesEff()
	tmp.baExp = getBalanceEnergyExp()

	tmp.hexEff = getHexEff()
	tmp.spellsUnl = player.sp.upgrades.includes(13)?4:3
	if (!tmp.spellEffs) tmp.spellEffs = {}
	for (let i=1;i<=4;i++) tmp.spellEffs[i] = getSpellEff(i)

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
			data.lb[i] = fixValue(player.l.boosters[i])
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
		data.workEff = Decimal.pow(2, data.work.sub(1))

		data.collapse = {}
		for (var i = 1; i <= IMPERIUM.maxCollapseRows; i++) if (data.work.gt(i + 0.5)) data.collapse[i] = data.work.sub(i + 0.5).times(2).min(1)

		data.compressed = tmp.s.sbUnl.sub(SPACE_BUILDINGS.max).max(0).floor().toNumber()
	}
}

function updateChallTemp(layer) {
	if (player[layer] === undefined) return

	let data = tmp.challActive[layer]
	let data2 = LAYER_CHALLS[layer]
	let customActive = data2.active !== undefined
	for (let row = 1; row <= data2.rows; row++) {
		for (let col = 1; col <= data2.cols; col++) {
			let id = row * 10 + col
			if (customActive ? data2.active(id) : player[layer].active == id) data[id] = 1
			else delete data[id]
		}
	}
}