var app;

function loadVue() {
	app = new Vue({
	  el: "#app",
	  data: {
		  player,
		  tmp,
		  offTime,
		  format,
		  formatWhole,
		  formatTime,
		  layerUnl,
		  getLayerEffDesc,
		  doReset,
		  buyUpg,
		  getEnhancerCost,
		  getExtCapsuleCost,
		  getSpace,
		  getSpaceBuildingsUnl,
		  getSpaceBuildingCost,
		  getSpaceBuildingEffDesc,
		  buyBuilding,
		  getQuirkLayerCost,
		  buyQuirkLayer,
		  startHindrance,
		  HCActive,
		  milestoneShown,
		  destroyBuilding,
		  LAYERS,
		  LAYER_RES,
		  LAYER_TYPE,
		  LAYER_UPGS,
		  LAYER_EFFS,
		  LAYER_AMT_NAMES,
		  LAYER_RES_CEIL,
		  H_CHALLS
	  },
	})
}