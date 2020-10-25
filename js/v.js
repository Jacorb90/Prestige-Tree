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
<<<<<<< Updated upstream
			<div v-for="row in layers[layer].upgrades.rows" class="upgRow">
				<div v-for="col in layers[layer].upgrades.cols" class="upgAlign">
					<upgrade :layer = "layer" :data = "row*10+col" v-bind:style="tmp.componentStyles[layer].upgrade"></upgrade>
				</div>
=======
			<div v-for="row in tmp[layer].upgrades.rows" class="upgRow">
				<div v-for="col in tmp[layer].upgrades.cols"><div v-if="tmp[layer].upgrades[row*10+col]!== undefined && tmp[layer].upgrades[row*10+col].unlocked" class="upgAlign">
					<upgrade :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.upgrade"></upgrade>
				</div></div>
>>>>>>> Stashed changes
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('upgrade', {
		props: ['layer', 'data'],
		template: `
<<<<<<< Updated upstream
		<button v-if="layers[layer].upgrades && tmp.upgrades[layer][data].unl" v-on:click="buyUpg(layer, data)" v-bind:class="{ [layer]: true, upg: true, bought: player[layer].upgrades.includes(data), locked: (!(canAffordUpg(layer, data))&&!player[layer].upgrades.includes(data)), can: (canAffordUpg(layer, data)&&!player[layer].upgrades.includes(data))}"
			v-bind:style="[((!hasUpg(layer, data) && canAffordUpg(layer, data)) ? {'background-color': tmp.layerColor[layer]} : {}), tmp.upgrades[layer][data].style]">
			<span v-if= "tmp.upgrades[layer][data].title"><h3 v-html="tmp.upgrades[layer][data].title"></h3><br></span>
			<span v-html="tmp.upgrades[layer][data].desc"></span>
			<span v-if="tmp.upgrades[layer][data].effect"><br>Currently: <span v-html="(tmp.upgrades[layer][data].effectDisplay) ? (tmp.upgrades[layer][data].effectDisplay) : format(tmp.upgrades[layer][data].effect)"></span></span>
			<br><br>Cost: {{ formatWhole(tmp.upgrades[layer][data].cost) }} {{(layers[layer].upgrades[data].currencyDisplayName ? layers[layer].upgrades[data].currencyDisplayName : layers[layer].resource)}}
=======
		<button v-if="layers[layer].upgrades && tmp[layer].upgrades[data]!== undefined && tmp[layer].upgrades[data].unlocked" v-on:click="buyUpg(layer, data)" v-bind:class="{ [layer]: true, upg: true, bought: hasUpgrade(layer, data), locked: (!(canAffordUpgrade(layer, data))&&!hasUpgrade(layer, data)), can: (canAffordUpgrade(layer, data)&&!hasUpgrade(layer, data))}"
			v-bind:style="[((!hasUpgrade(layer, data) && canAffordUpgrade(layer, data)) ? {'background-color': tmp[layer].color} : {}), tmp[layer].upgrades[data].style]">
			<span v-if= "tmp[layer].upgrades[data].title"><h3 v-html="tmp[layer].upgrades[data].title"></h3><br></span>
			<span v-html="tmp[layer].upgrades[data].description"></span>
			<span v-if="tmp[layer].upgrades[data].effect"><br>Currently: <span v-html="(tmp[layer].upgrades[data].effectDisplay) ? (tmp[layer].upgrades[data].effectDisplay) : format(tmp[layer].upgrades[data].effect)"></span></span>
			<br><br>Cost: {{ formatWhole(tmp[layer].upgrades[data].cost) }} {{(tmp[layer].upgrades[data].currencyDisplayName ? tmp[layer].upgrades[data].currencyDisplayName : tmp[layer].resource)}}
>>>>>>> Stashed changes
		</button>
		`
	})

	Vue.component('milestones', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].milestones">
			<table>
<<<<<<< Updated upstream
				<tr v-for="id in Object.keys(layers[layer].milestones)">
					<milestone :layer = "layer" :data = "id" v-bind:style="tmp.componentStyles[layer].milestone"></milestone>
				</tr>
=======
				<tr v-for="id in Object.keys(tmp[layer].milestones)"><div v-if="tmp[layer].milestones[id]!== undefined && tmp[layer].milestones[id].unlocked"
					<milestone :layer = "layer" :data = "id" v-bind:style="tmp[layer].componentStyles.milestone"></milestone>
				</tr></div>
>>>>>>> Stashed changes
			</table>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('milestone', {
		props: ['layer', 'data'],
		template: `
<<<<<<< Updated upstream
		<td v-if="layers[layer].milestones && milestoneShown(layer, data)" v-bind:style="[(layers[layer].milestones[data].unl && !tmp.milestones[layer][data].unl) ? {'visibility': 'hidden'} : {}, tmp.milestones[layer][data].style]" v-bind:class="{milestone: !player[layer].milestones.includes(data), milestoneDone: player[layer].milestones.includes(data)}">
			<h3 v-html="tmp.milestones[layer][data].requirementDesc"></h3><br>
			<span v-html="tmp.milestones[layer][data].effectDesc"></span><br>
		<span v-if="(layers[layer].milestones[data].toggles)&&(player[layer].milestones.includes(data))" v-for="toggle in layers[layer].milestones[data].toggles"><toggle :layer= "layer" :data= "toggle" v-bind:style="tmp.componentStyles[layer].toggle"></toggle>&nbsp;</span></td></tr>
=======
		<td v-if="layers[layer].milestones && tmp[layer].milestones[data]!== undefined && milestoneShown(layer, data)" v-bind:style="[(!tmp[layer].milestones[data].unlocked) ? {'visibility': 'hidden'} : {}, tmp[layer].milestones[data].style]" v-bind:class="{milestone: !hasMilestone(layer, data), milestoneDone: hasMilestone(layer, data)}">
			<h3 v-html="tmp[layer].milestones[data].requirementDescription"></h3><br>
			<span v-html="tmp[layer].milestones[data].effectDescription"></span><br>
		<span v-if="(tmp[layer].milestones[data].toggles)&&(hasMilestone(layer, data))" v-for="toggle in tmp[layer].milestones[data].toggles"><toggle :layer= "layer" :data= "toggle" v-bind:style="tmp[layer].componentStyles.toggle"></toggle>&nbsp;</span></td></tr>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
			<button v-if="layers[layer].buyables.respec" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unl, locked: !player[layer].unl }">{{layers[layer].buyables.respecText ? tmp.buyables[layer].respecText : "Respec"}}</button><br>
			<div v-for="row in layers[layer].buyables.rows" class="upgRow">
				<div v-for="col in layers[layer].buyables.cols" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : '200px'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data" v-bind:style="tmp.componentStyles[layer].buyable"></buyable>
				</div>
=======
			<respec-button v-if="tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)" :layer = "layer" v-bind:style="[{'margin-bottom': '12px'}, tmp[layer].componentStyles['respec-button']]"></respec-button>
			<div v-for="row in tmp[layer].buyables.rows" class="upgRow">
				<div v-for="col in tmp[layer].buyables.cols"><div v-if="tmp[layer].buyables[row*10+col]!== undefined && tmp[layer].buyables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data"></buyable>
				</div></div>
>>>>>>> Stashed changes
				<br>
			</div>
		</div>
		`
	})

	// data = id of buyable
	Vue.component('buyable', {
		props: ['layer', 'data', 'size'],
		template: `
<<<<<<< Updated upstream
		<button 
			v-if="layers[layer].buyables && tmp.buyables[layer][data].unl" 
			v-bind:class="{ buyable: true, can: tmp.buyables[layer][data].canAfford, locked: !tmp.buyables[layer][data].canAfford}"
			v-bind:style="[tmp.buyables[layer][data].canAfford ? {'background-color': tmp.layerColor[layer]} : {}, {'height': (size ? size : 'inherit'), 'width': (size ? size : '200px')}, tmp.buyables[layer][data].style]"
			v-on:click="buyBuyable(layer, data)">
			<span v-if= "layers[layer].buyables[data].title"><h2 v-html="tmp.buyables[layer][data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp.buyables[layer][data].display"></span>
=======
		<div v-if="layers[layer].buyables && tmp[layer].buyables[data]!== undefined && tmp[layer].buyables[data].unlocked" style="display: grid">
			<button v-bind:class="{ buyable: true, can: tmp[layer].buyables[data].canAfford, locked: !tmp[layer].buyables[data].canAfford}"
			v-bind:style="[tmp[layer].buyables[data].canAfford ? {'background-color': tmp[layer].color} : {}, size ? {'height': size, 'width': size} : {}, tmp[layer].componentStyles.buyable, tmp[layer].buyables[data].style]"
			v-on:click="buyBuyable(layer, data)">
				<span v-if= "tmp[layer].buyables[data].title"><h2 v-html="tmp[layer].buyables[data].title"></h2><br></span>
				<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp[layer].buyables[data].display"></span>
			</button>
			<br v-if="(tmp[layer].buyables[data].sellOne !== undefined && !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)) || (tmp[layer].buyables[data].sellAll && !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false))">
			<sell-one :layer="layer" :data="data" v-bind:style="tmp[layer].componentStyles['sell-one']" v-if="(tmp[layer].buyables[data].sellOne)&& !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)"></sell-one>
			<sell-all :layer="layer" :data="data" v-bind:style="tmp[layer].componentStyles['sell-all']" v-if="(tmp[layer].buyables[data].sellAll)&& !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false)"></sell-all>
		</div>
		`
	})

	Vue.component('respec-button', {
		props: ['layer', 'data'],
		template: `
			<button v-if="layers[layer].buyables && tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.respecText ? tmp[layer].buyables.respecText : "Respec"}}</button>
	`
	})

	// data = button size, in px
	Vue.component('clickables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].clickables" class="upgTable">
			<master-button v-if="tmp[layer].clickables.masterButtonPress && !(tmp[layer].clickables.showMasterButton !== undefined && tmp[layer].clickables.showMasterButton == false)" :layer = "layer" v-bind:style="[{'margin-bottom': '12px'}, tmp[layer].componentStyles['master-button']]"></master-button>
			<div v-for="row in tmp[layer].clickables.rows" class="upgRow">
				<div v-for="col in tmp[layer].clickables.cols"><div v-if="tmp[layer].clickables[row*10+col]!== undefined && tmp[layer].clickables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
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
			v-if="layers[layer].clickables && tmp[layer].clickables[data]!== undefined && tmp[layer].clickables[data].unlocked" 
			v-bind:class="{ upg: true, can: tmp[layer].clickables[data].canClick, locked: !tmp[layer].clickables[data].canClick}"
			v-bind:style="[tmp[layer].clickables[data].canClick ? {'background-color': tmp[layer].color} : {}, size ? {'height': size, 'width': size} : {}, tmp[layer].clickables[data].style]"
			v-on:click="clickClickable(layer, data)">
			<span v-if= "tmp[layer].clickables[data].title"><h2 v-html="tmp[layer].clickables[data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp[layer].clickables[data].display"></span>
>>>>>>> Stashed changes
		</button>
		`
	})

<<<<<<< Updated upstream
=======
	Vue.component('master-button', {
		props: ['layer', 'data'],
		template: `
		<button v-if="tmp[layer].clickables && tmp[layer].clickables.masterButtonPress && !(tmp[layer].clickables.showMasterButton !== undefined && tmp[layer].clickables.showMasterButton == false)" v-on:click="tmp[layer].clickables.masterButtonPress()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].clickables.masterButtonText ? tmp[layer].clickables.masterButtonText : "Click me!"}}</button>
	`
	})

>>>>>>> Stashed changes
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


<<<<<<< Updated upstream
=======
	// data = id of the bar
	Vue.component('bar', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].bars && tmp[layer].bars[data].unlocked" v-bind:style="{'position': 'relative'}"><div v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].dims, {'display': 'table'}]">
			<div class = "overlayTextContainer barBorder" v-bind:style="[tmp[layer].bars[data].borderStyle, tmp[layer].bars[data].dims]">
				<span class = "overlayText" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].textStyle]" v-html="tmp[layer].bars[data].display"></span>
			</div>
			<div class ="barBG barBorder" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].baseStyle, tmp[layer].bars[data].borderStyle,  tmp[layer].bars[data].dims]">
				<div class ="fill" v-bind:style="[tmp[layer].bars[data].style, tmp[layer].bars[data].fillStyle, tmp[layer].bars[data].fillDims]"></div>
			</div>
		</div></div>
		`
	})


	Vue.component('achievements', {
		props: ['layer'],
		template: `
		<div v-if="layers[layer].achievements" class="upgTable">
			<div v-for="row in tmp[layer].achievements.rows" class="upgRow">
				<div v-for="col in tmp[layer].achievements.cols"><div v-if="tmp[layer].achievements[row*10+col]!== undefined && tmp[layer].achievements[row*10+col].unlocked" class="upgAlign">
					<achievement :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.achievement"></achievement>
				</div></div>
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('achievement', {
		props: ['layer', 'data'],
		template: `
		<div v-if="layers[layer].achievements && tmp[layer].achievements[data]!== undefined && tmp[layer].achievements[data].unlocked" v-bind:class="{ [layer]: true, achievement: true, locked: !hasAchievement(layer, data), bought: hasAchievement(layer, data)}"
			v-bind:tooltip="
				hasAchievement(layer, data) ? (tmp[layer].achievements[data].doneTooltip ? tmp[layer].achievements[data].doneTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'You did it!'))
				: (tmp[layer].achievements[data].goalTooltip ? tmp[layer].achievements[data].goalTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'LOCKED'))
			"

			v-bind:style="[(!tmp[layer].achievements[data].unlocked) ? {'visibility': 'hidden'} : {}, tmp[layer].achievements[data].style,]">
			<span v-if= "tmp[layer].achievements[data].name"><br><h3 v-html="tmp[layer].achievements[data].name"></h3><br></span>
		</div>
		`
	})


	// These are for buyables, data is the id of the corresponding buyable
	Vue.component('sell-one', {
		props: ['layer', 'data'],
		template: `
			<button v-if="layers[layer].buyables && tmp[layer].buyables[data].sellOne && !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)" v-on:click="tmp[layer].buyables[data].sellOne()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.sellOneText ? tmp[layer].buyables.sellOneText : "Sell One"}}</button>
	`
	})
	Vue.component('sell-all', {
		props: ['layer', 'data'],
		template: `
			<button v-if="layers[layer].buyables && tmp[layer].buyables[data].sellAll && !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false)" v-on:click="tmp[layer].buyables[data].sellAll()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked }">{{tmp[layer].buyables.sellAllText ? tmp[layer].buyables.sellAllText : "Sell All"}}</button>
	`
	})

>>>>>>> Stashed changes
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

 
