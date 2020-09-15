var app;

function loadVue() {
	Vue.component('layer-node', {
		props: ['layer', 'abb'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				showTab(layer)
			}"
			v-bind:tooltip="
				layerUnl(layer) ? formatWhole(player[layer].points) + ' ' + LAYER_RES[layer]
				: 'Reach ' + formatWhole(tmp.layerReqs[layer]) + ' ' + LAYER_AMT_NAMES[layer] + ' to unlock (You have ' + formatWhole(tmp.layerAmt[layer]) + ' ' + LAYER_AMT_NAMES[layer] + ')'
			"
			v-bind:class="{
				treeNode: true,
				[layer]: true,
				hidden: !layerShown(layer),
				locked: !layerUnl(layer),
				can: layerUnl(layer)
			}">
			{{abb}}
		</button>
		`
	})
	app = new Vue({
		el: "#app",
		data: {
			player,
			tmp,
			Decimal,
			format,
			formatWhole,
			formatTime,
			focused,
			getThemeName,
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
			startChall,
			milestoneShown,
			destroyBuilding,
			getSpellDesc,
			activateSpell,
			spellActive,
			updateToCast,
			keepGoing,
			VERSION,
			ENDGAME,
			LAYERS,
			LAYER_RES,
			LAYER_TYPE,
			LAYER_UPGS,
			LAYER_EFFS,
			LAYER_AMT_NAMES,
			LAYER_RES_CEIL,
			LAYER_CHALLS,
			SPACE_BUILDINGS,
			SPELL_NAMES,
			LIFE_BOOSTERS,
			HYPERSPACE,
			IMPERIUM
		},
	})
}