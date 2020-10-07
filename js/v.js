var app;

function loadVue() {
	// data = a function returning the content (actually HTML)
	Vue.component('display-text', {
		props: ['layer', 'data'],
		template: `
			<span v-html="readData(data)"></span>
		`
	})

	// data = a function returning html content, with some limited functionality
	Vue.component('raw-html', {
		props: ['layer', 'data'],
		template: `
			<span v-html="readData(data)"></span>
		`
	})

	// Blank space, data = optional height in px or pair with width and height in px
	Vue.component('blank', {
		props: ['layer', 'data'],
		template: `
			<div>
			<div v-if="!data" v-bind:style="{'width': '8px', 'height': '17px'}"></div>
			<div v-else-if="Array.isArray(data)" v-bind:style="{'width': data[0], 'height': data[1]}"></div>
			<div v-else v-bind:style="{'width': '8px', 'height': 'data'}"><br></div>
			</div>
		`
	})

	// Displays an image, data is the URL
	Vue.component('display-image', {
		props: ['layer', 'data'],
		template: `
			<img v-bind:src= "readData(data)" v-bind:alt= "readData(data)">
		`
	})
		
	// data = an array of Components to be displayed in a row
	Vue.component('row', {
		props: ['layer', 'data'],
		template: `
		<div class="upgTable">
			<div class="upgRow">
				<div v-for="item in data">
				<div v-if="!Array.isArray(item)" v-bind:is="item" :layer= "layer" v-bind:style="tmp.componentStyles[layer][item]"></div>
				<div v-else-if="item.length==3" v-bind:style="[tmp.componentStyles[layer][item], (item[2] ? item[2] : {})]" v-bind:is="item[0]" :layer= "layer" :data= "item[1]"></div>
				<div v-else-if="item.length==2" v-bind:is="item[0]" :layer= "layer" :data= "item[1]" v-bind:style="tmp.componentStyles[layer][item]"></div>
				</div>
			</div>
		</div>
		`
	})

	// data = an array of Components to be displayed in a column
	Vue.component('column', {
		props: ['layer', 'data'],
		template: `
		<div class="upgTable">
			<div class="upgCol">
				<div v-for="item in data">
				<div v-if="!Array.isArray(item)" v-bind:is="item" :layer= "layer" v-bind:style="tmp.componentStyles[layer][item]"></div>
				<div v-else-if="item.length==3" v-bind:style="[tmp.componentStyles[layer][item], (item[2] ? item[2] : {})]" v-bind:is="item[0]" :layer= "layer" :data= "item[1]"></div>
				<div v-else-if="item.length==2" v-bind:is="item[0]" :layer= "layer" :data= "item[1]" v-bind:style="tmp.componentStyles[layer][item]"></div>
				</div>
			</div>
		</div>
		`
	})


	// Data = width in px, by default fills the full area
	Vue.component('h-line', {
		props: ['layer', 'data'],
			template:`
				<hr v-bind:style="data ? {'width': data} : {}" class="hl">
			`
		})

	// Data = height in px, by default is bad
	Vue.component('v-line', {
		props: ['layer', 'data'],
		template: `
			<div v-bind:style="data ? {'height': data} : {}" class="vl2"></div>
		`
	})

	Vue.component('challs', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].challs" class="upgTable">
			<div v-for="row in layers[layer].challs.rows" class="upgRow">
				<div v-for="col in layers[layer].challs.cols">
					<chall :layer = "layer" :data = "row*10+col" v-bind:style="tmp.componentStyles[layer].chall"></chall>
				</div>
			</div>
		</div>
		`
	})

	// data = id
	Vue.component('chall', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].challs && tmp.challs[layer][data].unl && !(player.hideChalls && hasChall(layer, [data]))" v-bind:class="{hChall: true, done: player[layer].challs.includes(data), canComplete: tmp.challActive[layer][data]&&!player[layer].challs.includes(data)&&canCompleteChall(layer, data)}">
			<br><h3 v-html="tmp.challs[layer][data].name"></h3><br><br>
			<button v-bind:class="{ longUpg: true, can: true, [layer]: true }" v-bind:style="{'background-color': tmp.layerColor[layer]}" v-on:click="startChall(layer, data)">{{player[layer].active==(data)?(canCompleteChall(layer, data)?"Finish":"Exit Early"):(player[layer].challs.includes(data)?"Completed":"Start")}}</button><br><br>
			<span v-html="tmp.challs[layer][data].desc"></span><br>
			Goal: {{format(tmp.challs[layer][data].goal)}} {{layers[layer].challs[data].currencyDisplayName ? layers[layer].challs[data].currencyDisplayName : "points"}}<br>
			Reward: <span v-html="tmp.challs[layer][data].reward"></span><br>
			<span v-if="tmp.challs[layer][data].effect!==undefined">Currently: <span v-html="(tmp.challs[layer][data].effectDisplay) ? (tmp.challs[layer][data].effectDisplay) : format(tmp.challs[layer][data].effect)"></span></span>
		</div>
		`
	})

	Vue.component('upgrades', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].upgrades" class="upgTable">
			<div v-for="row in layers[layer].upgrades.rows" class="upgRow">
				<div v-for="col in layers[layer].upgrades.cols" class="upgAlign">
					<upgrade :layer = "layer" :data = "row*10+col" v-bind:style="tmp.componentStyles[layer].upgrade"></upgrade>
				</div>
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('upgrade', {
		props: ['layer', 'data'],
		template: `
		<button v-if="layers[layer].upgrades && tmp.upgrades[layer][data].unl" v-on:click="buyUpg(layer, data)" v-bind:class="{ [layer]: true, upg: true, bought: player[layer].upgrades.includes(data), locked: (!(canAffordUpg(layer, data))&&!player[layer].upgrades.includes(data)), can: (canAffordUpg(layer, data)&&!player[layer].upgrades.includes(data))}"
			v-bind:style="[((!hasUpg(layer, data) && canAffordUpg(layer, data)) ? {'background-color': tmp.layerColor[layer]} : {}), tmp.upgrades[layer][data].style]">
			<span v-if= "tmp.upgrades[layer][data].title"><h3 v-html="tmp.upgrades[layer][data].title"></h3><br></span>
			<span v-html="tmp.upgrades[layer][data].desc"></span>
			<span v-if="tmp.upgrades[layer][data].effect"><br>Currently: <span v-html="(tmp.upgrades[layer][data].effectDisplay) ? (tmp.upgrades[layer][data].effectDisplay) : format(tmp.upgrades[layer][data].effect)"></span></span>
			<br><br>Cost: {{ formatWhole(tmp.upgrades[layer][data].cost) }} {{(layers[layer].upgrades[data].currencyDisplayName ? layers[layer].upgrades[data].currencyDisplayName : layers[layer].resource)}}
		</button>
		`
	})

	Vue.component('milestones', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].milestones">
			<table>
				<tr v-for="id in Object.keys(layers[layer].milestones)">
					<milestone :layer = "layer" :data = "id" v-bind:style="tmp.componentStyles[layer].milestone"></milestone>
				</tr>
			</table>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('milestone', {
		props: ['layer', 'data'],
		template: `
		<td v-if="layers[layer].milestones && milestoneShown(layer, data)" v-bind:style="[(layers[layer].milestones[data].unl && !tmp.milestones[layer][data].unl) ? {'visibility': 'hidden'} : {}, tmp.milestones[layer][data].style]" v-bind:class="{milestone: !player[layer].milestones.includes(data), milestoneDone: player[layer].milestones.includes(data)}">
			<h3 v-html="tmp.milestones[layer][data].requirementDesc"></h3><br>
			<span v-html="tmp.milestones[layer][data].effectDesc"></span><br>
		<span v-if="(layers[layer].milestones[data].toggles)&&(player[layer].milestones.includes(data))" v-for="toggle in layers[layer].milestones[data].toggles"><toggle :layer= "layer" :data= "toggle" v-bind:style="tmp.componentStyles[layer].toggle"></toggle>&nbsp;</span></td></tr>
		`
	})

	Vue.component('toggle', {
		props: ['layer', 'data'],
		template: `
		<button class="smallUpg can" v-bind:style="{'background-color': tmp.layerColor[data[0]]}" v-on:click="toggleAuto(data)">{{player[data[0]][data[1]]?"ON":"OFF"}}</button>
		`
	})

	// data = function to return the text describing the reset before the amount gained (optional)
	Vue.component('prestige-button', {
		props: ['layer', 'data'],
		template: `
		<span>
			<button v-if="layers[layer].type=='normal'" v-bind:class="{ [layer]: true, reset: true, locked: tmp.layerAmt[layer].lt(tmp.layerReqs[layer]), can: tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) }"
				v-bind:style="[tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) ? {'background-color': tmp.layerColor[layer]} : {}, tmp.componentStyles[layer]['prestige-button']]" v-on:click="doReset(layer)"><span v-if="player[layer].points.lt(1e3)">{{data ? data() : "Reset for "}}</span>+<b>{{formatWhole(tmp.resetGain[layer])}}</b> {{layers[layer].resource}}<span v-if="tmp.resetGain[layer].lt(100) && player[layer].points.lt(1e3)"><br><br>Next at {{ (layers[layer].resCeil ? formatWhole(tmp.nextAt[layer]) : format(tmp.nextAt[layer])) }} {{ layers[layer].baseResource }}</span></button>
			<button v-if="layers[layer].type=='static'" v-bind:class="{ [layer]: true, reset: true, locked: tmp.layerAmt[layer].lt(tmp.nextAt[layer]), can: tmp.layerAmt[layer].gte(tmp.nextAt[layer]) }"
				v-bind:style="[tmp.layerAmt[layer].gte(tmp.nextAt[layer]) ? {'background-color': tmp.layerColor[layer]} : {}, tmp.componentStyles[layer]['prestige-button']]" v-on:click="doReset(layer)"><span v-if="player[layer].points.lt(10)">{{data ? data() : "Reset for "}}</span>+<b>{{formatWhole(tmp.resetGain[layer])}}</b> {{layers[layer].resource}}<br><br><span v-if="player[layer].points.lt(10)">{{(tmp.layerAmt[layer].gte(tmp.nextAt[layer])&&layers[layer].canBuyMax && layers[layer].canBuyMax())?"Next":"Req"}}: {{formatWhole(tmp.layerAmt[layer])}} / </span>{{(layers[layer].resCeil ? formatWhole(tmp.nextAtDisp[layer]) : format(tmp.nextAtDisp[layer]))}} {{ layers[layer].baseResource }}</button>		
			<button v-if="layers[layer].type=='custom'" v-bind:class="{ [layer]: true, reset: true, locked: !tmp.canReset[layer], can: tmp.canReset[layer] }"
				v-bind:style="[tmp.canReset[layer] ? {'background-color': tmp.layerColor[layer]} : {}, tmp.componentStyles[layer]['prestige-button']]" v-on:click="doReset(layer)" v-html="tmp.prestigeButtonText[layer]"></button>		
		</span>
		`
	
	})

	// Displays the main resource for the layer
	Vue.component('main-display', {
		props: ['layer'],
		template: `
		<div><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': tmp.layerColor[layer], 'text-shadow': '0px 0px 10px' + tmp.layerColor[layer]}">{{formatWhole(player[layer].points)}}</h2> {{layers[layer].resource}}<span v-if="layers[layer].effectDescription">, {{tmp.effectDescription[layer]}}</span><br><br></span>
		`
	})

	// data = button size, in px
	Vue.component('buyables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].buyables" class="upgTable">
			<button v-if="layers[layer].buyables.respec" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unl, locked: !player[layer].unl }">{{layers[layer].buyables.respecText ? tmp.buyables[layer].respecText : "Respec"}}</button><br>
			<div v-for="row in layers[layer].buyables.rows" class="upgRow">
				<div v-for="col in layers[layer].buyables.cols" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : '200px'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data" v-bind:style="tmp.componentStyles[layer].buyable"></buyable>
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
		<button 
			v-if="layers[layer].buyables && tmp.buyables[layer][data].unl" 
			v-bind:class="{ buyable: true, can: tmp.buyables[layer][data].canAfford, locked: !tmp.buyables[layer][data].canAfford}"
			v-bind:style="[tmp.buyables[layer][data].canAfford ? {'background-color': tmp.layerColor[layer]} : {}, {'height': (size ? size : 'inherit'), 'width': (size ? size : '200px')}, tmp.buyables[layer][data].style]"
			v-on:click="buyBuyable(layer, data)">
			<span v-if= "layers[layer].buyables[data].title"><h2 v-html="tmp.buyables[layer][data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp.buyables[layer][data].display"></span>
		</button>
		`
	})

	// data = button size, in px
	Vue.component('microtabs', {
		props: ['layer', 'data'],
		computed: {
			currentTab() {return player.subtabs[layer][data]}
		},
		template: `
		<div v-if="layers[layer].microtabs" :style="{'border-style': 'solid'}">
			<div class="upgTable">
				<tab-buttons :layer="layer" :data="layers[layer].microtabs[data]" :name="data" v-bind:style="tmp.componentStyles[layer]['tab-buttons']"></tab-buttons>
			</div>
			<column v-bind:style="tmp.microtabs[layer][data][player.subtabs[layer][data]].style" :layer="layer" :data="layers[layer].microtabs[data][player.subtabs[layer][data]].content"></column>
		</div>
		`
	})


	// NOT FOR USE IN STANDARD TAB FORMATTING
	Vue.component('tab-buttons', {
		props: ['layer', 'data', 'name'],
		template: `
			<div class="upgRow">
				<div v-for="tab in Object.keys(data)">
					<button v-if="!data[tab].unl || data[tab].unl()" class="tabButton" v-bind:style="[{'border-color': tmp.layerColor[layer]}, tmp.componentStyles[layer]['tab-button'], tmp.microtabs[layer][name][tab].buttonStyle]" v-on:click="player.subtabs[layer][name] = tab">{{tab}}</button>
				</div>
			</div>
		`
	})

	Vue.component('layer-node', {
		props: ['layer', 'abb'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				showTab(layer)
			}"
			v-bind:tooltip="
				player[layer].unl ? (layers[layer].tooltip ? tmp.tooltips[layer] : formatWhole(player[layer].points) + ' ' + layers[layer].resource)
				: (layers[layer].tooltipLocked ? tmp.tooltipsLocked[layer] : 'Reach ' + formatWhole(tmp.layerReqs[layer]) + ' ' + layers[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp.layerAmt[layer]) + ' ' + layers[layer].baseResource + ')')
			"
			v-bind:class="{
				treeNode: true,
				[layer]: true,
				hidden: !tmp.layerShown[layer],
				locked: !player[layer].unl && !tmp.layerAmt[layer].gte(tmp.layerReqs[layer]),
				notify: tmp.notify[layer],
				can: layerUnl(layer),
			}"
			v-bind:style="[layerUnl(layer) ? {
				'background-color': tmp.layerColor[layer],
			} : {}, tmp.nodeStyle[layer]]">
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
			startChall,
			milestoneShown,
			keepGoing,
			VERSION,
			ENDGAME,
			LAYERS,
			hotkeys
		},
	})
}