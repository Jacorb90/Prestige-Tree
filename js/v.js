var app;

function loadVue() {
	app = new Vue({
	  el: "#app",
	  data: {
		  player,
		  format,
		  formatWhole,
		  getResetGain,
		  getLayerReq,
		  getNextAt,
		  layerUnl,
		  getLayerEffDesc,
		  doReset,
		  buyUpg,
		  getGenPowerEff,
		  getEnhancerCost,
		  getEnhancerEff,
		  getEnhancerEff2,
		  getTimeEnergyEff,
		  getExtCapsuleCost,
		  getSpace,
		  getSpaceBuildingsUnl,
		  getSpaceBuildingCost,
		  getSpaceBuildingEffDesc,
		  buyBuilding,
		  LAYERS,
		  LAYER_RES,
		  LAYER_TYPE,
		  LAYER_UPGS,
		  LAYER_EFFS,
	  },
	})
}