function updateTemp() {
	if (!tmp.hcActive) tmp.hcActive = {}
	for (let row=1;row<=H_CHALLS.rows;row++) {
		for (let col=1;col<=H_CHALLS.cols;col++) {
			let id = row*10+col
			tmp.hcActive[id] = HCActive(id)
		}
	}
	
	if (!tmp.layerEffs) tmp.layerEffs = {}
	for (let name in LAYER_EFFS) tmp.layerEffs[name] = LAYER_EFFS[name]()
	
	if (!tmp.layerReqs) tmp.layerReqs = {}
	for (let name in LAYER_REQS) tmp.layerReqs[name] = getLayerReq(name)
		
	if (!tmp.gainMults) tmp.gainMults = {}
	if (!tmp.resetGain) tmp.resetGain = {}
	if (!tmp.nextAt) tmp.nextAt = {}
	if (!tmp.layerAmt) tmp.layerAmt = {}
	for (let i in LAYERS) {
		tmp.layerAmt[LAYERS[i]] = getLayerAmt(LAYERS[i])
		tmp.gainMults[LAYERS[i]] = getLayerGainMult(LAYERS[i])
		tmp.resetGain[LAYERS[i]] = getResetGain(LAYERS[i])
		tmp.nextAt[LAYERS[i]] = getNextAt(LAYERS[i])
	}
	
	tmp.pointGen = getPointGen()
	
	tmp.atbb = addToBoosterBase()
	tmp.atgb = addToGenBase()
	
	tmp.genPowEff = getGenPowerEff()
	
	tmp.enhPow = getEnhancerPow()
	tmp.enhEff = getEnhancerEff()
	tmp.enhEff2 = getEnhancerEff2()
	tmp.subbedEnh = new Decimal(0)
	if (tmp.hcActive ? tmp.hcActive[52] : true) {
		tmp.subbedEnh = tmp.subbedEnh.plus(new Decimal(player.h.time).times(40).plus(1).log10().pow(10).max(10)).round()
	}
	
	tmp.freeExtCap = getFreeExtCapsules()
	tmp.timeEff = getTimeEnergyEff()
	tmp.attb = addToTimeBase()
	
	if (!tmp.spaceBuildEff) tmp.spaceBuildEff = {}
	for (let i=1;i<=5;i++) tmp.spaceBuildEff[i] = getSpaceBuildingEff(i)
	tmp.sbUnl = getSpaceBuildingsUnl()

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
}