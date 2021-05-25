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
		
	// data = a function returning the content (actually HTML)
	Vue.component('tall-display-text', {
			props: ['layer', 'data'],
			template: `
				<div class="instant"  v-html="data" style="height: 100%;"></div>
			`
		})

	// Blank space, data = optional height in px or pair with width and height in px
	Vue.component('blank', {
		props: ['layer', 'data'],
		template: `
			<div class = "instant">
			<div class = "instant" v-if="!data" v-bind:style="{'width': '8px', 'height': '17px'}"></div>
			<div class = "instant" v-else-if="Array.isArray(data)" v-bind:style="{'width': data[0], 'height': data[1]}"></div>
			<div class = "instant" v-else v-bind:style="{'width': '8px', 'height': data}"><br></div>
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
		<div class="upgTable instant">
			<div class="upgCol">
				<div v-for="item in data">
					<div v-if="!Array.isArray(item)" v-bind:is="item" :layer= "layer" v-bind:style="(item=='prestige-button')?{}:tmp[layer].componentStyles[item]"></div>
					<div v-else-if="item.length==3" v-bind:style="[(item[0]=='prestige-button')?{}:tmp[layer].componentStyles[item[0]], (item[2] ? item[2] : {})]" v-bind:is="item[0]" :layer= "layer" :data= "item[1]"></div>
					<div v-else-if="item.length==2" v-bind:is="item[0]" :layer= "layer" :data= "item[1]" v-bind:style="(item[0]=='prestige-button')?{}:tmp[layer].componentStyles[item[0]]"></div>
				</div>
			</div>
		</div>
		`
	})

	Vue.component('infobox', {
		props: ['layer', 'data'],
		template: `
		<div class="story instant" v-if="tmp[layer].infoboxes && tmp[layer].infoboxes[data]!== undefined && tmp[layer].infoboxes[data].unlocked" v-bind:style="[{'border-color': tmp[layer].color, 'border-radius': player.infoboxes[layer][data] ? 0 : '8px'}, tmp[layer].infoboxes[data].style]">
			<button class="story-title" v-bind:style="[{'background-color': tmp[layer].color}, tmp[layer].infoboxes[data].titleStyle]"
				v-on:click="player.infoboxes[layer][data] = !player.infoboxes[layer][data]">
				<span class="story-toggle">{{player.infoboxes[layer][data] ? "+" : "-"}}</span>
				<span v-html="tmp[layer].infoboxes[data].title ? tmp[layer].infoboxes[data].title : (tmp[layer].name)"></span>
			</button>
			<div v-if="!player.infoboxes[layer][data]" class="story-text" v-bind:style="tmp[layer].infoboxes[data].bodyStyle">
				<span v-html="tmp[layer].infoboxes[data].body ? tmp[layer].infoboxes[data].body : 'Blah'"></span>
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
		<div v-if="tmp[layer].challenges" class="upgTable">
			<div v-for="row in tmp[layer].challenges.rows" class="upgRow">
				<div v-for="col in tmp[layer].challenges.cols">
					<challenge v-if="tmp[layer].challenges[row*10+col]!== undefined && tmp[layer].challenges[row*10+col].unlocked" :layer = "layer" :data = "row*10+col" :cl="hasChallenge(layer, row*10+col)?'done':((player[layer].activeChallenge == (row*10+col)&&!hasChallenge(layer, row*10+col)&&canCompleteChallenge(layer, row*10+col))?'canComplete':'none')" v-bind:style="tmp[layer].componentStyles.challenge"></challenge>
				</div>
			</div>
		</div>
		`
	})

	// data = id
	Vue.component('challenge', {
		props: ['layer', 'data', 'cl'],
		template: `
		<div v-if="tmp[layer].challenges && tmp[layer].challenges[data]!== undefined && tmp[layer].challenges[data].unlocked && !(player.hideChallenges && hasChallenge(layer, [data]))" v-bind:class="{hChallenge: true, done: cl=='done', canComplete: cl=='canComplete', anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}" v-bind:style="tmp[layer].challenges[data].style">
			<br><h3 v-html="tmp[layer].challenges[data].name"></h3><br><br>
			<button v-bind:class="{ longUpg: true, can: true, [layer]: true, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }" v-bind:style="{'background-color': tmp[layer].color}" v-on:click="startChallenge(layer, data)" v-html="tmp[layer].challenges[data].buttonText"></button><br><br>
			<span v-html="tmp[layer].challenges[data].challengeDescription"></span><br>
			<span v-if="tmp[layer].challenges[data].currencyDisplayName!=''">Goal: {{format(tmp[layer].challenges[data].goal)}} {{tmp[layer].challenges[data].currencyDisplayName ? tmp[layer].challenges[data].currencyDisplayName : "points"}}<br></span>
			Reward: <span v-html="tmp[layer].challenges[data].rewardDescription"></span><br>
			<span v-if="tmp[layer].challenges[data].rewardEffect"><span v-if="tmp.nerdMode" v-html="'Formula: '+(tmp[layer].challenges[data].formula?tmp[layer].challenges[data].formula:'???')"></span>
			<span v-if="!tmp.nerdMode" v-html="'Currently: '+((tmp[layer].challenges[data].rewardDisplay) ? (tmp[layer].challenges[data].rewardDisplay) : format(tmp[layer].challenges[data].rewardEffect))"></span></span>
		</div>
		`
	})

	Vue.component('upgrades', {
		props: ['layer'],
		template: `
		<div v-if="tmp[layer].upgrades" class="upgTable">
			<div v-for="row in tmp[layer].upgrades.rows" class="upgRow">
				<div v-for="col in tmp[layer].upgrades.cols"><div v-if="tmp[layer].upgrades[row*10+col]!== undefined" class="upgAlign">
					<upgrade :layer = "layer" :data = "row*10+col" :cl = "hasUpgrade(layer, row*10+col)?'bought':(canAffordUpgrade(layer, row*10+col)?'can':'locked')" :pcl="tmp[layer].upgrades[row*10+col].pseudoCan?'can':'locked'" v-bind:style="tmp[layer].componentStyles.upgrade"></upgrade>
				</div></div>
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('upgrade', {
		props: ['layer', 'data', 'cl', 'pcl'],
		template: `
		<div v-if="tmp[layer].upgrades && tmp[layer].upgrades[data]!==undefined">
			<button v-if="pseudoUnl(layer, data) && !(tmp[layer].upgrades[data].unlocked)" v-bind:class="{ [layer]: true, upg: true, pseudo: true, plocked: pcl=='locked', can: pcl=='can', anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }" v-on:click="unlockUpg(layer, data)">
				<h3>Explore A New Upgrade</h3><br><span v-html="tmp[layer].upgrades[data].pseudoReq"></span>
			</button>
			<button v-if="tmp[layer].upgrades[data].unlocked" v-on:click="buyUpg(layer, data)" v-bind:class="{ [layer]: true, upg: true, bought: cl?(cl=='bought'):hasUpgrade(layer, data), locked: cl?(cl=='locked'):(!hasUpgrade(layer, data)&&!canAffordUpgrade(layer, data)), can: cl?(cl=='can'):(!hasUpgrade(layer, data)&&canAffordUpgrade(layer, data)), anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
				v-bind:style="[((!hasUpgrade(layer, data) && canAffordUpgrade(layer, data)) ? {'background-color': tmp[layer].color} : {}), tmp[layer].upgrades[data].style]">
				<span v-if= "tmp[layer].upgrades[data].title"><h3 v-html="tmp[layer].upgrades[data].title"></h3><br></span>
				<span v-html="tmp[layer].upgrades[data].description"></span>
				<span v-if="tmp[layer].upgrades[data].effect"><br>{{(tmp.nerdMode&&!tmp[layer].upgrades[data].noFormula)?'Formula: ':'Currently: '}}<span v-if="tmp.nerdMode&&!tmp[layer].upgrades[data].noFormula" v-html="tmp[layer].upgrades[data].formula?tmp[layer].upgrades[data].formula:'???'"></span><span v-if="(!tmp.nerdMode)||tmp[layer].upgrades[data].noFormula" v-html="(tmp[layer].upgrades[data].effectDisplay) ? (tmp[layer].upgrades[data].effectDisplay) : format(tmp[layer].upgrades[data].effect)"></span></span>
				<br><span v-if="tmp.nerdMode&&tmp[layer].upgrades[data].costFormula">Cost Formula: {{tmp[layer].upgrades[data].costFormula}}</span><span v-if="!tmp.nerdMode||!tmp[layer].upgrades[data].costFormula"><br>Cost: <span v-if="tmp[layer].upgrades[data].multiRes"><span v-for="num in tmp[layer].upgrades[data].multiRes.length">{{formatWhole(tmp[layer].upgrades[data].multiRes[num-1].cost)+' '+(tmp[layer].upgrades[data].multiRes[num-1].currencyDisplayName ? tmp[layer].upgrades[data].multiRes[num-1].currencyDisplayName : tmp[layer].resource)}}<br></span></span><span v-if="!tmp[layer].upgrades[data].multiRes">{{formatWhole(tmp[layer].upgrades[data].cost)+' '+(tmp[layer].upgrades[data].currencyDisplayName ? tmp[layer].upgrades[data].currencyDisplayName : tmp[layer].resource)}}</span></span>
			</button>
		</div>
		`
	})
	
	Vue.component('improvements', {
		props: ['layer'],
		template: `
		<div v-if="tmp[layer].impr" class="upgTable">
			<div v-for="row in tmp[layer].impr.rows" class="upgRow">
				<div v-for="col in tmp[layer].impr.cols"><div v-if="tmp[layer].impr[row*10+col]!== undefined && tmp[layer].impr[row*10+col].unlocked" class="upgAlign">
					<improvement :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.upgrade"></improvement>
				</div></div>
			</div>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('improvement', {
		props: ['layer', 'data'],
		template: `
		<button v-if="tmp[layer].impr && tmp[layer].impr[data]!== undefined && tmp[layer].impr[data].unlocked" v-bind:class="{ [layer]: true, upg: true, bought: getImprovements(layer, data).gt(0), locked: getImprovements(layer, data).lte(0), anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
			v-bind:style="[tmp[layer].impr[data].style]">
			<span v-if= "tmp[layer].impr[data].title"><h3 v-html="tmp[layer].impr[data].title"></h3><br></span>
			<span v-html="tmp[layer].impr[data].description"></span>
			Amount: <span v-html="formatWhole(getImprovements(layer, data))+(tmp[layer].impr.free?(tmp[layer].impr.free.gt(0)?(' + '+formatWhole(tmp[layer].impr.free)):''):'')"></span> (next at <span v-html="format(getNextImpr(layer, data))"></span> <span v-html="tmp[layer].impr.resName"></span>)
			<br><span v-if="tmp[layer].impr[data].effect"><br>{{(tmp.nerdMode&&!tmp[layer].impr[data].noFormula)?'Formula: ':'Currently: '}}<span v-if="tmp.nerdMode&&!tmp[layer].impr[data].noFormula" v-html="tmp[layer].impr[data].formula?tmp[layer].impr[data].formula:'???'"></span><span v-if="(!tmp.nerdMode)||tmp[layer].impr[data].noFormula" v-html="(tmp[layer].impr[data].effectDisplay) ? (tmp[layer].impr[data].effectDisplay) : format(tmp[layer].impr[data].effect)"></span></span>
		</button>
		`
	})

	Vue.component('milestones', {
		props: ['layer'],
		template: `
		<div v-if="tmp[layer].milestones">
			<table>
				<tr v-for="id in Object.keys(tmp[layer].milestones)"><div v-if="tmp[layer].milestones[id]!== undefined && tmp[layer].milestones[id].unlocked"
					<milestone :layer = "layer" :data = "id" :cl = "hasMilestone(layer, id)?'milestoneDone':'milestone'"  :shown = "milestoneShown(layer, id)" :locked = "!(tmp[layer].milestones[id].unlocked)" v-bind:style="tmp[layer].componentStyles.milestone"></milestone>
				</tr></div>
			</table>
			<br>
		</div>
		`
	})

	// data = id
	Vue.component('milestone', {
		props: ['layer', 'data', 'cl', 'shown', 'locked'],
		template: `
		<td v-if="tmp[layer].milestones && tmp[layer].milestones[data]!== undefined && shown" v-bind:style="[locked ? {'visibility': 'hidden'} : {}, tmp[layer].milestones[data].style]" v-bind:class="{milestone: cl=='milestone', milestoneDone: cl=='milestoneDone', anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}">
			<h3 v-html="tmp[layer].milestones[data].requirementDescription"></h3><br>
			<span v-html="tmp[layer].milestones[data].effectDescription"></span><br>
		<span v-if="(tmp[layer].milestones[data].toggles)&&(hasMilestone(layer, data))" v-for="toggle in tmp[layer].milestones[data].toggles"><toggle :data= "toggle" :type="((toggle instanceof Array)?'normal':'multi')" v-bind:style="tmp[layer].componentStyles.toggle"></toggle>&nbsp;</span></td></tr>
		`
	})

	Vue.component('toggle', {
		props: ['data', 'type'],
		template: `
		<button class="smallUpg can" v-bind:style="{'background-color': (player[(type=='multi')?data.layer:data[0]][(type=='multi')?data.varName:data[1]]?tmp[((type=='multi')?(data.layer):(data[0]))].color:'#666666')}" v-on:click="toggleAuto(data)">{{(type=='multi')?(player[data.layer][data.varName]):(player[data[0]][data[1]]?"ON":"OFF")}}</button>
		`
	})

	// data = function to return the text describing the reset before the amount gained (optional)
	Vue.component('prestige-button', {
		props: ['layer', 'data'],
		template: `
		<div class='upgRow'><button v-if="(tmp[layer].type !== 'none')" v-bind:class="{ [layer]: true, reset: true, locked: !tmp[layer].canReset, can: tmp[layer].canReset, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
			v-bind:style="[tmp[layer].canReset ? {'background-color': tmp[layer].color} : {}, tmp[layer].componentStyles['prestige-button']]"
			v-html="tmp[layer].prestigeButtonText" v-on:click="doReset(layer)">
		</button>
		<button v-if="player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&tmp.ma.canBeMastered.includes(layer)&&player.ma.current==layer" v-bind:class="{ ma: true, reset: true, locked: player[layer].points.lt(tmp.ma.masteryGoal[layer]), can: player[layer].points.gte(tmp.ma.masteryGoal[layer]), anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }"
			v-bind:style="(player[layer].points.gte(tmp.ma.masteryGoal[layer]))?{'background-color': tmp.ma.color}:{}"
			v-html="(player[layer].points.gte(tmp.ma.masteryGoal[layer]))?('Master this layer!'):('Reach '+format(tmp.ma.masteryGoal[layer])+' '+tmp[layer].resource+' to fully Master this layer.')"
			v-on:click="layers.ma.completeMastery(layer)">
		</button></div>
		`
	
	})

	// Displays the main resource for the layer
	Vue.component('main-display', {
		props: ['layer'],
		template: `
		<div v-if="!!player[layer].points"><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': tmp[layer].color, 'text-shadow': ('0px 0px 10px' + tmp[layer].color)}">{{formatWhole(player[layer].points)}}</h2><span v-if="tmp[layer].extraAmtDisplay"><span v-html="tmp[layer].extraAmtDisplay"></span></span> <h3 v-if="tmp.ma.mastered.includes(layer)" v-bind:style="{'color': tmp.ma.color, 'text-shadow': '0px 0px 10px', 'font-weight': 'bold'}">mastered</h3> {{tmp[layer].resource}}<span v-if="tmp[layer].effectDescription" v-html="', '+tmp[layer].effectDescription"></span><br><br></div>
		`
	})

	// Displays the base resource for the layer, as well as the best and total values for the layer's currency, if tracked
	Vue.component('resource-display', {
		props: ['layer'],
		template: `
		<div style="margin-top: -13px">
			<span v-if="tmp[layer].type=='normal'"><br><span v-if="tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3)">You have </span>{{formatWhole(tmp[layer].baseAmount)}} {{tmp[layer].baseResource}}</span>
			<br><br>
			<span v-if="tmp[layer].showBest">Your best {{tmp[layer].resource}} is {{formatWhole(player[layer].best)}}<br></span>
			<span v-if="tmp[layer].showTotal">You have made a total of {{formatWhole(player[layer].total)}} {{tmp[layer].resource}}<br></span>
		</div>
		`
	})

	// data = button size, in px
	Vue.component('buyables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].buyables" class="upgTable">
			<respec-button v-if="tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)" :layer = "layer" v-bind:style="[{'margin-bottom': '12px'}, tmp[layer].componentStyles['respec-button']]"></respec-button>
			<div v-for="row in tmp[layer].buyables.rows" class="upgRow">
				<div v-for="col in tmp[layer].buyables.cols"><div v-if="tmp[layer].buyables[row*10+col]!== undefined && tmp[layer].buyables[row*10+col].unlocked" class="upgAlign" v-bind:style="{'margin-left': '7px', 'margin-right': '7px',  'height': (data ? data : 'inherit'),}">
					<buyable :layer = "layer" :data = "row*10+col" :size = "data"></buyable>
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
		<div v-if="tmp[layer].buyables && tmp[layer].buyables[data]!== undefined && tmp[layer].buyables[data].unlocked" style="display: grid">
			<button v-bind:class="{ buyable: true, can: tmp[layer].buyables[data].canAfford, locked: !tmp[layer].buyables[data].canAfford, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
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
			<button v-if="tmp[layer].buyables && tmp[layer].buyables.respec && !(tmp[layer].buyables.showRespec !== undefined && tmp[layer].buyables.showRespec == false)" v-on:click="respecBuyables(layer)" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }">{{tmp[layer].buyables.respecText ? tmp[layer].buyables.respecText : "Respec"}}</button>
	`
	})

	// data = button size, in px
	Vue.component('clickables', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].clickables" class="upgTable">
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
			v-if="tmp[layer].clickables && tmp[layer].clickables[data]!== undefined && tmp[layer].clickables[data].unlocked" 
			v-bind:class="{ upg: true, can: tmp[layer].clickables[data].canClick, locked: !tmp[layer].clickables[data].canClick, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
			v-bind:style="[tmp[layer].clickables[data].canClick ? {'background-color': tmp[layer].color} : {}, size ? {'height': size, 'width': size} : {}, tmp[layer].clickables[data].style]"
			v-on:click="clickClickable(layer, data)">
			<span v-if= "tmp[layer].clickables[data].title"><h2 v-html="tmp[layer].clickables[data].title"></h2><br></span>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="tmp[layer].clickables[data].display"></span>
		</button>
		`
	})

	Vue.component('master-button', {
		props: ['layer', 'data'],
		template: `
		<button v-if="tmp[layer].clickables && tmp[layer].clickables.masterButtonPress && !(tmp[layer].clickables.showMasterButton !== undefined && tmp[layer].clickables.showMasterButton == false)" v-on:click="tmp[layer].clickables.masterButtonPress()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }">{{tmp[layer].clickables.masterButtonText ? tmp[layer].clickables.masterButtonText : "Click me!"}}</button>
	`
	})

	// data = button size, in px
	Vue.component('microtabs', {
		props: ['layer', 'data'],
		computed: {
			currentTab() {return player.subtabs[layer][data]}
		},
		template: `
		<div v-if="tmp[layer].microtabs" :style="{'border-style': 'solid'}">
			<div class="upgTable">
				<tab-buttons :layer="layer" :data="tmp[layer].microtabs[data]" :name="data" v-bind:style="tmp[layer].componentStyles['tab-buttons']"></tab-buttons>
			</div>
			<layer-tab v-if="tmp[layer].microtabs[data][player.subtabs[layer][data]].embedLayer" :layer="tmp[layer].microtabs[data][player.subtabs[layer][data]].embedLayer" ></layer-tab>

			<column v-else v-bind:style="tmp[layer].microtabs[data][player.subtabs[layer][data]].style" :layer="layer" :data="tmp[layer].microtabs[data][player.subtabs[layer][data]].content"></column>
		</div>
		`
	})


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
		<div v-if="tmp[layer].achievements" class="upgTable">
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
		<div v-if="tmp[layer].achievements && tmp[layer].achievements[data]!== undefined && tmp[layer].achievements[data].unlocked" v-bind:class="{ [layer]: true, achievement: true, locked: !hasAchievement(layer, data), bought: hasAchievement(layer, data), anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}"
			v-bind:tooltip="
				hasAchievement(layer, data) ? (tmp[layer].achievements[data].doneTooltip ? tmp[layer].achievements[data].doneTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'You did it!'))
				: (tmp[layer].achievements[data].goalTooltip ? tmp[layer].achievements[data].goalTooltip : (tmp[layer].achievements[data].tooltip ? tmp[layer].achievements[data].tooltip : 'LOCKED'))
			"

			v-bind:style="[(!tmp[layer].achievements[data].unlocked) ? {'visibility': 'hidden'} : {}, tmp[layer].achievements[data].style, (tmp[layer].achievements[data].image?{'background-image': (hasAchievement(layer, data)?('url('+tmp[layer].achievements[data].image+')'):''), 'background-size': '110% 110%', 'background-repeat': 'no-repeat', 'background-position': 'center', 'text-shadow': '0px 0px 2px #000000, 0px 0px 2px #000000, 0px 0px 2px #000000, 0px 0px 2px #000000, 0px 0px 2px #000000, 0px 0px 2px #000000'}:''), ]">
			<span v-if= "tmp[layer].achievements[data].name"><br><h3 v-html="tmp[layer].achievements[data].name"></h3><br></span>
		</div>
		`
	})
	
	Vue.component('stars', {
		props: ['layer'],
		template: `<div v-if='!player.hideStars'><div v-if='player.ma.mastered.includes(layer)' class='star' style='position: absolute; left: -10px; top: -10px;'></div>
		<div v-if='false' class='star' style='position: absolute; left: 13px; top: -10px;'></div>
		<div v-if='false' class='star' style='position: absolute; left: 36px; top: -10px;'></div>
		<div v-if='false' class='star' style='position: absolute; left: 59px; top: -10px;'></div>
		<div v-if='false' class='star' style='position: absolute; right: -10px; top: -10px;'></div>
		</div>`
	})

	// Data is an array with the structure of the tree
	Vue.component('tree', {
		props: ['layer', 'data'],
		template: `<div>
		<span class="nodeRow" v-for="row in data"><table>
			<span v-for="node in row">
				<layer-node v-if="tmp[node].isLayer" :layer='node' :abb='tmp[node].symbol'></layer-node>
				<button-node v-else :layer='node' :abb='tmp[node].symbol'></button-node>
			</span>
			<tr><table><button class="treeNode hidden"></button></table></tr>
		</span></div>

	`
	})

	// These are for buyables, data is the id of the corresponding buyable
	Vue.component('sell-one', {
		props: ['layer', 'data'],
		template: `
			<button v-if="tmp[layer].buyables && tmp[layer].buyables[data].sellOne && !(tmp[layer].buyables[data].canSellOne !== undefined && tmp[layer].buyables[data].canSellOne == false)" v-on:click="tmp[layer].buyables[data].sellOne()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }">{{tmp[layer].buyables.sellOneText ? tmp[layer].buyables.sellOneText : "Sell One"}}</button>
	`
	})
	Vue.component('sell-all', {
		props: ['layer', 'data'],
		template: `
			<button v-if="tmp[layer].buyables && tmp[layer].buyables[data].sellAll && !(tmp[layer].buyables[data].canSellAll !== undefined && tmp[layer].buyables[data].canSellAll == false)" v-on:click="tmp[layer].buyables[data].sellAll()" v-bind:class="{ longUpg: true, can: player[layer].unlocked, locked: !player[layer].unlocked, anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle) }">{{tmp[layer].buyables.sellAllText ? tmp[layer].buyables.sellAllText : "Sell All"}}</button>
	`
	})
	
	// For the save menu popup
	Vue.component('saves', {
		template: `
		<div class="popup" v-if="!(!player.saveMenuOpen)">
			<div class="popupBlocker" onclick="player.saveMenuOpen = false;"></div>
			<div class="popup-content"><br>
				<div class="upgRow" style="width: 100%;" v-for="(data, name) in allSaves" v-if="name!='set' && data!==undefined">
					<div v-bind:class="{ activeSave: (allSaves.set==name), widthLock: true }">{{name}}</div>
					<button v-on:click="save(); loadSave(name);" class="popupBtn can">Load</button>
					<button v-on:click="renameSave(name)" class="popupBtn can">Rename</button>
					<button v-on:click="deleteSave(name)" class="popupBtn can">Delete</button>
					<div><button class="popupBtnMini can" v-on:click="moveSave(name, -1)" v-bind:style="{ visibility: (showMoveSaveBtn(name, 'up')?'visible':'hidden')}">▲</button><button class="popupBtnMini can" v-on:click="moveSave(name, 1)" v-bind:style="{ visibility: (showMoveSaveBtn(name, 'down')?'visible':'hidden')}">▼</button></div>
				</div>
				<div class="upgRow" style="width: 100%;"><button onclick="newSave()" class="popupBtn can">New Save</button></div>
			</div>
		</div>
	`
	})

	// SYSTEM COMPONENTS

	Vue.component('tab-buttons', systemComponents['tab-buttons'])
	Vue.component('button-node', systemComponents['button-node'])
	Vue.component('layer-node', systemComponents['layer-node'])
	Vue.component('layer-tab', systemComponents['layer-tab'])
	Vue.component('overlay-head', systemComponents['overlay-head'])
	Vue.component('info-tab', systemComponents['info-tab'])
	Vue.component('options-tab', systemComponents['options-tab'])


	app = new Vue({
		el: "#app",
		data: {
			player,
			allSaves,
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
			canAffordUpgrade,
			hasUpgrade,
			hasAchievement,
			hasMilestone,
			hasChallenge,
			challengeCompletions,
			startChallenge,
			milestoneShown,
			keepGoing,
			hasUpgrade,
			hasMilestone,
			hasAchievement,
			hasChallenge,
			maxedChallenge,
			canAffordUpgrade,
			subtabShouldNotify,
			subtabResetNotify,
			VERSION,
			LAYERS,
			hotkeys
		},
	})
}

 
