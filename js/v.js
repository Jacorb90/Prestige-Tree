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
				locked: !player[layer].unl && !tmp.layerAmt[layer].gte(tmp.layerReqs[layer]),
				can: layerUnl(layer),
			}"
			v-bind:style="{
				'background-color': layers[layer].color,
			}">
			{{abb}}
		</button>
		`
	})

	Vue.component('challs', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].challs" class="upgTable">
			<div v-for="row in layers[layer].challs.rows" class="upgRow">
				<div v-for="col in layers[layer].challs.cols">
					<div v-if="layers[layer].challs[row*10+col].unl()" v-bind:class="{hChall: true, done: player[layer].challs.includes(row*10+col), canComplete: tmp.challActive[layer][row*10+col]&&!player[layer].challs.includes(row*10+col)&&canCompleteChall(layer, row*10+col)}">
						<br><h3>{{layers[layer].challs[row*10+col].name}}</h3><br><br>
						<button v-bind:class="{ longUpg: true, can: true, [layer]: true }" v-bind:style="{'background-color': layers[layer].color}" v-on:click="startChall(layer, row*10+col)">{{player[layer].active==(row*10+col)?(canCompleteChall(layer, row*10+col)?"Finish":"Exit Early"):(player[layer].challs.includes(row*10+col)?"Completed":"Start")}}</button><br><br>
						{{layers[layer].challs[row*10+col].desc}}<br>
						Goal: {{format(layers[layer].challs[row*10+col].goal)}} {{layers[layer].challs[row*10+col].currencyDisplayName ? layers[layer].challs[row*10+col].currencyDisplayName : "points"}}<br>
						Reward: {{layers[layer].challs[row*10+col].reward}}<br>
						<span v-if="layers[layer].challs[row*10+col].effDisp!==undefined">Currently: {{(layers[layer].challs[row*10+col].effDisp) ? (layers[layer].challs[row*10+col].effDisp(layers[layer].challs[row*10+col].effect())) : format(layers[layer].challs[row*10+col].effect())}}</span>
					</div>
				</div>
			</div>
		</div>
		`
	})

	Vue.component('upgrades', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].upgrades" class="upgTable">
			<div v-for="row in layers[layer].upgrades.rows" class="upgRow">
				<div v-for="col in layers[layer].upgrades.cols" class="upgAlign">
					<button v-if="layers[layer].upgrades[row*10+col].unl()" v-on:click="buyUpg(layer, row*10+col)" v-bind:class="{ [layer]: true, upg: true, bought: player[layer].upgrades.includes(row*10+col), locked: (!(canAffordUpg(layer, row*10+col))&&!player[layer].upgrades.includes(row*10+col)), can: (canAffordUpg(layer, row*10+col)&&!player[layer].upgrades.includes(row*10+col))}" v-bind:style="{'background-color': layers[layer].color}">{{ layers[layer].upgrades[row*10+col].desc }}<span v-if="layers[layer].upgrades[row*10+col].effect"><br>Currently: {{(layers[layer].upgrades[row*10+col].effDisp) ? (layers[layer].upgrades[row*10+col].effDisp(layers[layer].upgrades[row*10+col].effect())) : format(layers[layer].upgrades[row*10+col].effect())}}</span><br><br>Cost: {{ formatWhole(layers[layer].upgrades[row*10+col].cost) }} {{(layers[layer].upgrades[row*10+col].currencyDisplayName ? layers[layer].upgrades[row*10+col].currencyDisplayName : layers[layer].resource)}}</button>
				</div>
			</div>
			<br>
		</div>
		`
	})

	Vue.component('milestones', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].milestones">
			<table>
				<tr v-for="id in Object.keys(layers[layer].milestones)">
					<td v-if="milestoneShown(layer, id)" v-bind:class="{milestone: !player[layer].milestones.includes(id), milestoneDone: player[layer].milestones.includes(id)}"><h3>{{layers[layer].milestones[id].requirementDesc}}</h3><br>{{layers[layer].milestones[id].effectDesc}}<br><span v-if="(layers[layer].milestones[id].toggles)&&(player[layer].milestones.includes(id))" v-for="toggle in layers[layer].milestones[id].toggles"><toggle :layer= "layer" :data= "toggle"></toggle>&nbsp;</span></td></tr>
				</tr>
			</table>
			<br>
		</div>
		`
	})

	Vue.component('toggle', {
		props: ['layer', 'data'],
		template: `
		<button class="smallUpg can" v-bind:style="{'background-color': layers[data[0]].color}" v-on:click="toggleAuto(data)">{{player[data[0]][data[1]]?"ON":"OFF"}}</button>
		`
	})

	// data = function to return the text describing the reset before the amount gained (optional)
	Vue.component('prestige-button', {
		props: ['layer', 'data'],
		template: `
		<span>
			<button v-if="layers[layer].type=='normal'" v-bind:class="{ [layer]: true, reset: true, locked: tmp.layerAmt[layer].lt(tmp.layerReqs[layer]), can: tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) }" v-bind:style="{'background-color': layers[layer].color}" v-on:click="doReset(layer)"><span v-if="player[layer].points.lt(1e3)">{{data ? data() : "Reset for "}}</span>+<b>{{formatWhole(tmp.resetGain[layer])}}</b> {{layers[layer].resource}}<span v-if="tmp.resetGain[layer].lt(100) && player[layer].points.lt(1e3)"><br><br>Next at {{ (layers[layer].resCeil ? formatWhole(tmp.nextAt[layer]) : format(tmp.nextAt[layer])) }} {{ layers[layer].baseResource }}</span></button>
			<button v-if="layers[layer].type=='static'" v-bind:class="{ [layer]: true, reset: true, locked: tmp.layerAmt[layer].lt(tmp.nextAt[layer]), can: tmp.layerAmt[layer].gte(tmp.nextAt[layer]) }" v-bind:style="{'background-color': layers[layer].color}" v-on:click="doReset(layer)"><span v-if="player[layer].points.lt(10)">{{data ? data() : "Reset for "}}</span>+<b>{{formatWhole(tmp.resetGain[layer])}}</b> {{layers[layer].resource}}<br><br><span v-if="player[layer].points.lt(10)">Req: {{formatWhole(tmp.layerAmt[layer])}} / </span>{{(layers[layer].resCeil ? formatWhole(tmp.nextAt[layer]) : format(tmp.nextAt[layer]))}} {{ layers[layer].baseResource }}</button>
		</span>
		`
	})

	// Displays the main resource for the layer
	Vue.component('main-display', {
		props: ['layer'],
		template: `
		<div><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': layers[layer].color, 'text-shadow': '0px 0px 10px' + layers[layer].color}">{{formatWhole(player[layer].points)}}</h2> {{layers[layer].resource}}<span v-if="layers[layer].effectDescription">, {{layers[layer].effectDescription()}}</span><br><br></span>
		`
	})

	// data = button size, in px
	Vue.component('buyables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].buyables" class="upgTable">
			<button v-if="layers[layer].buyables.respec" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unl, locked: !player[layer].unl }">{{layers[layer].buyables.respecText ? layers[layer].buyables.respecText : "Respec"}}</button><br>
			<div v-for="row in layers[layer].buyables.rows" class="upgRow">
				<div v-for="col in layers[layer].buyables.cols" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : '200px'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data"></buyable>
				</div>
				<br>
			</div>
		</div>
		`
	})

	// data = id of buyable
	Vue.component('buyable', {
		props: ['layer', 'data', 'size'],
		template: `
		<div v-if="layers[layer].buyables">
			<button 
				v-if="layers[layer].buyables[data].unl()" 
				v-bind:class="{ upg: true, can: layers[layer].buyables[data].canAfford(), locked: !layers[layer].buyables[data].canAfford()}"
				v-bind:style="{'background-color': layers[layer].color, 'height': (size ? size : '200px'), 'width': (size ? size : '200px')}"
				v-on:click="buyBuyable(layer, data)">
				<span v-if= "layers[layer].buyables[data].title"><h2>{{layers[layer].buyables[data].title}}</h2><br></span>
				<span v-bind:style="{'white-space': 'pre-line'}">{{layers[layer].buyables[data].display()}}</span>
			</button>
		</div>
		`
	})

	// data = a function returning the content
	Vue.component('display-text', {
		props: ['layer', 'data'],
		template: `
		<span>{{data()}}</span>
		`
	})

	// data = a function returning html content, with some limited functionality
		Vue.component('raw-html', {
			props: ['layer', 'data'],
			template: `
			<span v-html="data()"></span>
			`
		})

	// Blank lines
	Vue.component('blank', {
		props: ['layer', 'data'],
		template: `
		<br>
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