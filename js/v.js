var app;

function loadVue() {
	// data = a function returning the content (actually HTML)
	Vue.component('display-text', {
		props: ['layer', 'data'],
		template: `
			<span class="instant" v-html="data"></span>
		`
	})

// data = a function returning the content (actually HTML)
	Vue.component('raw-html', {
			props: ['layer', 'data'],
			template: `
				<span class="instant"  v-html="data"></span>
			`
		})

	// Blank space, data = optional height in px or pair with width and height in px
	Vue.component('blank', {
		props: ['layer', 'data'],
		template: `
			<div class = "instant">
			<div class = "instant" v-if="!data" v-bind:style="{'width': '8px', 'height': '17px'}"></div>
			<div class = "instant" v-else-if="Array.isArray(data)" v-bind:style="{'width': data[0], 'height': data[1]}"></div>
			<div class = "instant" v-else v-bind:style="{'width': '8px', 'height': 'data'}"><br></div>
			</div>
		`
	})

	// Displays an image, data is the URL
	Vue.component('display-image', {
		props: ['layer', 'data'],
		template: `
			<img class="instant" v-bind:src= "data" v-bind:alt= "data">
		`
	})
		
	// data = an array of Components to be displayed in a row
	Vue.component('row', {
		props: ['layer', 'data'],
		template: `
		<div class="upgTable instant" >
			<div class="upgRow">
				<div v-for="item in data">
				<div v-if="!Array.isArray(item)" v-bind:is="item" :layer= "layer" v-bind:style="tmp[layer].componentStyles[item]"></div>
				<div v-else-if="item.length==3" v-bind:style="[tmp[layer].componentStyles[item[0]], (item[2] ? item[2] : {})]" v-bind:is="item[0]" :layer= "layer" :data= "item[1]"></div>
				<div v-else-if="item.length==2" v-bind:is="item[0]" :layer= "layer" :data= "item[1]" v-bind:style="tmp[layer].componentStyles[item[0]]"></div>
				</div>
			</div>
		</div>
		`
	})

	// data = an array of Components to be displayed in a column
	Vue.component('column', {
		props: ['layer', 'data'],
		template: `
		<div class="upgTable instant" >
			<div class="upgCol">
				<div v-for="item in data">
					<div v-if="!Array.isArray(item)" v-bind:is="item" :layer= "layer" v-bind:style="tmp[layer].componentStyles[item]"></div>
					<div v-else-if="item.length==3" v-bind:style="[tmp[layer].componentStyles[item[0]], (item[2] ? item[2] : {})]" v-bind:is="item[0]" :layer= "layer" :data= "item[1]"></div>
					<div v-else-if="item.length==2" v-bind:is="item[0]" :layer= "layer" :data= "item[1]" v-bind:style="tmp[layer].componentStyles[item[0]]"></div>
				</div>
			</div>
		</div>
		`
	})


	// Data = width in px, by default fills the full area
	Vue.component('h-line', {
		props: ['layer', 'data'],
			template:`
				<hr class="instant" v-bind:style="data ? {'width': data} : {}" class="hl">
			`
		})

	// Data = height in px, by default is bad
	Vue.component('v-line', {
		props: ['layer', 'data'],
		template: `
			<div class="instant" v-bind:style="data ? {'height': data} : {}" class="vl2"></div>
		`
	})

	Vue.component('challenges', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].challenges" class="upgTable">
			<div v-for="row in tmp[layer].challenges.rows" class="upgRow">
				<div v-for="col in tmp[layer].challenges.cols">
					<challenge v-if="layers[layer].challenges[row*10+col]!== undefined && tmp[layer].challenges[row*10+col].unlocked" :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.challenge"></challenge>
				</div>
			</div>
		</div>
		`
	})

	// data = id
	Vue.component('challenge', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].challenges && layers[layer].challenges[data]!== undefined && tmp[layer].challenges[data].unlocked && !(player.hideChallenges && hasChallenge(layer, [data]))" v-bind:class="{hChallenge: true, done: hasChallenge(layer, data), canComplete: player[layer].active == data&&!hasChallenge(layer, data)&&canCompleteChallenge(layer, data)}">
			<br><h3 v-html="tmp[layer].challenges[data].name"></h3><br><br>
			<button v-bind:class="{ longUpg: true, can: true, [layer]: true }" v-bind:style="{'background-color': tmp[layer].color}" v-on:click="startChallenge(layer, data)">{{player[layer].active==(data)?(canCompleteChallenge(layer, data)?"Finish":"Exit Early"):(hasChallenge(layer, data)?"Completed":"Start")}}</button><br><br>
			<span v-html="tmp[layer].challenges[data].challengeDescription"></span><br>
			Goal: {{format(tmp[layer].challenges[data].goal)}} {{tmp[layer].challenges[data].currencyDisplayName ? tmp[layer].challenges[data].currencyDisplayName : "points"}}<br>
			Reward: <span v-html="tmp[layer].challenges[data].rewardDescription"></span><br>
			<span v-if="tmp[layer].challenges[data].rewardEffect!==undefined">Currently: <span v-html="(tmp[layer].challenges[data].rewardDisplay) ? (tmp[layer].challenges[data].rewardDisplay) : format(tmp[layer].challenges[data].rewardEffect)"></span></span>
		</div>
		`
	})

	Vue.component('upgrades', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].upgrades" class="upgTable">
			<div v-for="row in layers[layer].upgrades.rows" class="upgRow">
				<div v-for="col in layers[layer].upgrades.cols"><div v-if="layers[layer].upgrades[row*10+col]!== undefined && tmp[layer].upgrades[row*10+col].unlocked" class="upgAlign">
					<upgrade :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.upgrade"></upgrade>
				</div></div>
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('upgrade', {
		props: ['layer', 'data'],
		template: `
		<button v-if="layers[layer].upgrades && layers[layer].upgrades[data]!== undefined && tmp[layer].upgrades[data].unlocked" v-on:click="buyUpg(layer, data)" v-bind:class="{ [layer]: true, upg: true, bought: player[layer].upgrades.includes(data), locked: (!(canAffordUpgrade(layer, data))&&!player[layer].upgrades.includes(data)), can: (canAffordUpgrade(layer, data)&&!player[layer].upgrades.includes(data))}"
			v-bind:style="[((!hasUpgrade(layer, data) && canAffordUpgrade(layer, data)) ? {'background-color': tmp[layer].color} : {}), tmp[layer].upgrades[data].style]">
			<span v-if= "tmp[layer].upgrades[data].title"><h3 v-html="tmp[layer].upgrades[data].title"></h3><br></span>
			<span v-html="tmp[layer].upgrades[data].description"></span>
			<span v-if="tmp[layer].upgrades[data].effect"><br>Currently: <span v-html="(tmp[layer].upgrades[data].effectDisplay) ? (tmp[layer].upgrades[data].effectDisplay) : format(tmp[layer].upgrades[data].effect)"></span></span>
			<br><br>Cost: {{ formatWhole(tmp[layer].upgrades[data].cost) }} {{(layers[layer].upgrades[data].currencyDisplayName ? tmp[layer].upgrades[data].currencyDisplayName : tmp[layer].resource)}}
		</button>
		`
	})

	Vue.component('milestones', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].milestones">
			<table>
				<tr v-for="id in Object.keys(tmp[layer].milestones)"><div v-if="layers[layer].milestones[id]!== undefined && tmp[layer].milestones[id].unlocked"
					<milestone :layer = "layer" :data = "id" v-bind:style="tmp[layer].componentStyles.milestone"></milestone>
				</tr></div>
			</table>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('milestone', {
		props: ['layer', 'data'],
		template: `
		<td v-if="layers[layer].milestones && layers[layer].milestones[data]!== undefined && milestoneShown(layer, data)" v-bind:style="[(!tmp[layer].milestones[data].unlocked) ? {'visibility': 'hidden'} : {}, tmp[layer].milestones[data].style]" v-bind:class="{milestone: !player[layer].milestones.includes(data), milestoneDone: player[layer].milestones.includes(data)}">
			<h3 v-html="tmp[layer].milestones[data].requirementDescription"></h3><br>
			<span v-html="tmp[layer].milestones[data].effectDescription"></span><br>
		<span v-if="(tmp[layer].milestones[data].toggles)&&(player[layer].milestones.includes(data))" v-for="toggle in tmp[layer].milestones[data].toggles"><toggle :layer= "layer" :data= "toggle" v-bind:style="tmp[layer].componentStyles.toggle"></toggle>&nbsp;</span></td></tr>
		`
	})

	Vue.component('toggle', {
		props: ['layer', 'data'],
		template: `
		<button class="smallUpg can" v-bind:style="{'background-color': tmp[data[0]].color}" v-on:click="toggleAuto(data)">{{player[data[0]][data[1]]?"ON":"OFF"}}</button>
		`
	})

	// data = function to return the text describing the reset before the amount gained (optional)
	Vue.component('prestige-button', {
		props: ['layer', 'data'],
		template: `
		<button v-bind:class="{ [layer]: true, reset: true, locked: !tmp[layer].canReset, can: tmp[layer].canReset}"
			v-bind:style="[tmp[layer].canReset ? {'background-color': tmp[layer].color} : {}, tmp[layer].componentStyles['prestige-button']]"
			v-html="tmp[layer].prestigeButtonText" v-on:click="doReset(layer)">
		</button>
		`
	
	})

	// Displays the main resource for the layer
	Vue.component('main-display', {
		props: ['layer'],
		template: `
		<div><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': tmp[layer].color, 'text-shadow': '0px 0px 10px' + tmp[layer].color}">{{formatWhole(player[layer].points)}}</h2> {{tmp[layer].resource}}<span v-if="tmp[layer].effectDescription">, {{tmp[layer].effectDescription}}</span><br><br></span>
		`
	})

	// data = button size, in px
	Vue.component('buyables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].buyables" class="upgTable">
			<button v-if="tmp[layer].buyables.respec" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.respecText ? tmp[layer].buyables.respecText : "Respec"}}</button><br>
			<div v-for="row in tmp[layer].buyables.rows" class="upgRow">
				<div v-for="col in tmp[layer].buyables.cols"><div v-if="layers[layer].buyables[row*10+col]!== undefined && tmp[layer].buyables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data" v-bind:style="tmp[layer].componentStyles.buyable"></buyable>
				</div></div>
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
			v-if="layers[layer].buyables && layers[layer].buyables[data]!== undefined && tmp[layer].buyables[data].unlocked" 
			v-bind:class="{ buyable: true, can: tmp[layer].buyables[data].canAfford, locked: !tmp[layer].buyables[data].canAfford}"
			v-bind:style="[tmp[layer].buyables[data].canAfford ? {'background-color': tmp[layer].color} : {}, size ? {'height': size, 'width': size} : {}, tmp[layer].buyables[data].style]"
			v-on:click="buyBuyable(layer, data)">
			<span v-if= "tmp[layer].buyables[data].title"><h2 v-html="tmp[layer].buyables[data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp[layer].buyables[data].display"></span>
		</button>
		`
	})


	// data = button size, in px
	Vue.component('clickables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].clickables" class="upgTable">
			<button v-if="tmp[layer].clickables.masterButtonPress" v-on:click="layers[layer].clickables.masterButtonPress()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].clickables.masterButtonText ? tmp[layer].clickables.masterButtonText : "Click me!"}}</button><br>
			<div v-for="row in tmp[layer].clickables.rows" class="upgRow">
				<div v-for="col in tmp[layer].clickables.cols"><div v-if="layers[layer].clickables[row*10+col]!== undefined && tmp[layer].clickables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<clickable :layer = "layer" :data = "row*10+col" :size = "data" v-bind:style="tmp[layer].componentStyles.clickable"></clickable>
				</div></div>
				<br>
			</div>
		</div>
	`
	})

	// data = id of clickable
	Vue.component('clickable', {
		props: ['layer', 'data', 'size'],
		template: `
		<button 
			v-if="layers[layer].clickables && layers[layer].clickables[data]!== undefined && tmp[layer].clickables[data].unlocked" 
			v-bind:class="{ upg: true, can: tmp[layer].clickables[data].canClick, locked: !tmp[layer].clickables[data].canClick}"
			v-bind:style="[tmp[layer].clickables[data].canClick ? {'background-color': tmp[layer].color} : {}, size ? {'height': size, 'width': size} : {}, tmp[layer].clickables[data].style]"
			v-on:click="clickClickable(layer, data)">
			<span v-if= "tmp[layer].clickables[data].title"><h2 v-html="tmp[layer].clickables[data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp[layer].clickables[data].display"></span>
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
				<tab-buttons :layer="layer" :data="tmp[layer].microtabs[data]" :name="data" v-bind:style="tmp[layer].componentStyles['tab-buttons']"></tab-buttons>
			</div>
			<column v-bind:style="tmp[layer].microtabs[data][player.subtabs[layer][data]].style" :layer="layer" :data="tmp[layer].microtabs[data][player.subtabs[layer][data]].content"></column>
		</div>
		`
	})


	// data = id of the bar
	Vue.component('bar', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].bars && tmp[layer].bars[data].unlocked" v-bind:style="{'position': 'relative'}"><div class ="barBorder"  v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].baseStyle, tmp[layer].bars[data].borderStyle, tmp[layer].bars[data].dims]">
			
			<div class = "overlayTextContainer" v-bind:style="[tmp[layer].bars[data].dims]">
				<span class = "overlayText" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].textStyle]" v-html="tmp[layer].bars[data].display"></span>
			</div>
			<div class ="fill" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].fillStyle, tmp[layer].bars[data].fillDims]"></div>
		
		</div></div>
		`
	})



	// NOT FOR USE IN STANDARD TAB FORMATTING
	Vue.component('tab-buttons', {
		props: ['layer', 'data', 'name'],
		template: `
			<div class="upgRow">
				<div v-for="tab in Object.keys(data)">
					<button v-if="data[tab].unlocked == undefined || data[tab].unlocked" class="tabButton" v-bind:style="[{'border-color': tmp[layer].color}, tmp[layer].componentStyles['tab-button'], data[tab].buttonStyle]" v-on:click="player.subtabs[layer][name] = tab">{{tab}}</button>
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
				player[layer].unlocked ? (tmp[layer].tooltip ? tmp[layer].tooltip : formatWhole(player[layer].points) + ' ' + tmp[layer].resource)
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : 'Reach ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + ')')
			"
			v-bind:class="{
				treeNode: true,
				[layer]: true,
				hidden: !tmp[layer].layerShown,
				locked: !player[layer].unlocked && !tmp[layer].baseAmount.gte(tmp[layer].requires),
				notify: tmp[layer].notify,
				can: layerunlocked(layer),
			}"
			v-bind:style="[layerunlocked(layer) ? {
				'background-color': tmp[layer].color,
			} : {}, tmp[layer].nodeStyle]">
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
			layerunlocked,
			doReset,
			buyUpg,
			startChallenge,
			milestoneShown,
			keepGoing,
			VERSION,
			ENDGAME,
			LAYERS,
			hotkeys
		},
	})
}

 
