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
				layerUnl(layer) ? formatWhole(player[layer].points) + ' ' + LAYER_DATA[layer].res
				: 'Reach ' + formatWhole(tmp.layerReqs[layer]) + ' ' + LAYER_DATA[layer].amtName + ' to unlock (You have ' + formatWhole(tmp.layerAmt[layer]) + ' ' + LAYER_DATA[layer].amtName + ')'
			"
			v-bind:class="{
				treeNode: true,
				[layer]: true,
				notify: player.notify[layer],
				hidden: !LAYER_DATA[layer].shown(),
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
			LAYER_DATA,
			LAYER_UPGS,
			LAYER_CHALLS,
			SPACE_BUILDINGS,
			SPELL_NAMES,
			LIFE_BOOSTERS,
			HYPERSPACE,
			IMPERIUM,
			MASTERY
		},
	})
}