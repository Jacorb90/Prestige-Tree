var app;

function loadVue() {
	app = new Vue({
	  el: "#app",
	  data: {
		  player,
		  tmp,
		  format,
		  formatWhole,
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
		  LAYERS,
		  LAYER_RES,
		  LAYER_TYPE,
		  LAYER_UPGS,
		  LAYER_EFFS,
	  },
	})
}