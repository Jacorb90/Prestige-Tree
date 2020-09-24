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
				player[layer].unl ? formatWhole(player[layer].points) + ' ' + layers[layer].resource
				: 'Reach ' + formatWhole(tmp.layerReqs[layer]) + ' ' + layers[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp.layerAmt[layer]) + ' ' + layers[layer].baseResource + ')'
			"
			v-bind:class="{
				treeNode: true,
				[layer]: true,
				hidden: !layers[layer].layerShown(),
				locked: !player[layer].unl,
				can: layerUnl(layer),
			}"
			v-bind:style="{
				'background-color': layers[layer].color,
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
			layers,
			Decimal,
			format,
			formatWhole,
			formatTime,
			focused,
			getThemeName,
			layerUnl,
			doReset,
			buyUpg,
			startChall,
			milestoneShown,
			keepGoing,
			VERSION,
			ENDGAME,
			LAYERS
		},
	})
}