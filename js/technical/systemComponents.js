var systemComponents = {
	'tab-buttons': {
		props: ['layer', 'data', 'name'],
		template: `
			<div class="upgRow">
				<div v-for="tab in Object.keys(data)">
					<button v-if="data[tab].unlocked == undefined || data[tab].unlocked" v-bind:class="{tabButton: true, notify: subtabShouldNotify(layer, name, tab), resetNotify: subtabResetNotify(layer, name, tab), anim: (player.anim&&!player.oldStyle), grad: (player.grad&&!player.oldStyle)}" v-bind:style="[{'border-color': tmp[layer].color}, tmp[layer].componentStyles['tab-button'], data[tab].buttonStyle]" v-on:click="player.subtabs[layer][name] = tab">{{tab}}</button>
				</div>
			</div>
		`
	},

	'button-node': {
		props: ['layer', 'abb', 'size'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				layers[layer].onClick()
			}"
			v-bind:tooltip="
				tmp[layer].canClick ? (tmp[layer].tooltip ? tmp[layer].tooltip : 'I am a button!')
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : 'I am a button!')
			"
			v-bind:class="{
				treeButton: size != 'small',
				smallNode: size == 'small',
				[layer]: true,
				ghost: tmp[layer].layerShown == 'ghost',
				hidden: !tmp[layer].layerShown,
				locked: !tmp[layer].canClick,
				notify: tmp[layer].notify,
				can: tmp[layer].canClick,
				anim: (player.anim&&!player.oldStyle),
				grad: (player.grad&&!player.oldStyle)
			}"
			v-bind:style="[tmp[layer].canClick ? {'background-color': tmp[layer].color} : {}, tmp[layer].nodeStyle]" v-bind:html="abb">
		</button>
		`
	},

	'layer-node': {
		props: ['layer', 'abb', 'size'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				if (player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&tmp.ma.canBeMastered.includes(layer)&&player.ma.current===null) layers.ma.startMastery(layer);
				showTab(layer)
			}"
			v-bind:tooltip="
				(player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(layer))?'Cannot be mastered yet.':((player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&player.ma.current===null)?'Click to attempt Mastery.':(player[layer].unlocked ? (tmp[layer].tooltip ? tmp[layer].tooltip : formatWhole(player[layer].points) + ' ' + tmp[layer].resource)
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : 'Reach ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + ')')))
			"
			v-bind:class="{
				treeNode: size != 'small',
				smallNode: size == 'small',
				[layer]: true,
				ghost: tmp[layer].layerShown == 'ghost',
				hidden: !tmp[layer].layerShown,
				locked: (player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(layer))||(!player[layer].unlocked && !(tmp[layer].baseAmount.gte(tmp[layer].requires)&&tmp[layer].canReset)),
				notify: tmp[layer].notify,
				resetNotify: tmp[layer].prestigeNotify,
				can: player[layer].unlocked&&!(player.ma.selectionActive&&tmp[layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(layer)),
				anim: (player.anim&&!player.oldStyle),
				grad: (player.grad&&!player.oldStyle)
			}"
			v-bind:style="[layerunlocked(layer) ? {
				'background-color': tmp[layer].color,
			} : {}, tmp[layer].nodeStyle]">
			<stars :layer='layer'></stars><span class="noChange" v-html="abb"></span>
		</button>
		`
	},
	
	'layer-tab': {
		props: ['layer', 'back', 'spacing'],
		template: `<div v-bind:style="[tmp[layer].style ? tmp[layer].style : {}, (tmp[layer].tabFormat && !Array.isArray(tmp[layer].tabFormat)) ? tmp[layer].tabFormat[player.subtabs[layer].mainTabs].style : {}]">
		<div v-if="back"><button v-bind:class="back == 'big' ? 'other-back' : 'back'" v-on:click="goBack()">←</button></div>
		<div v-if="!tmp[layer].tabFormat">
			<div v-if="spacing" v-bind:style="{'height': spacing}"></div>
			<info-box v-if="tmp[layer].infoboxes" :layer="layer" :data="Object.keys(tmp[layer].infoboxes)[0]"></info-box>
			<main-display v-bind:style="tmp[layer].componentStyles['main-display']" :layer="layer"></main-display>
			<div v-if="tmp[layer].type !== 'none'">
				<prestige-button :layer="layer"></prestige-button>
			</div>
			<resource-display v-bind:style="tmp[layer].componentStyles['resource-display']" :layer="layer"></resource-display>
			<milestones v-bind:style="tmp[layer].componentStyles.milestones" :layer="layer"></milestones>
			<div v-if="Array.isArray(tmp[layer].midsection)">
				<column :layer="layer" :data="tmp[layer].midsection"></column>
			</div>
			<clickables v-bind:style="tmp[layer].componentStyles['clickables']" :layer="layer"></clickables>
			<buyables v-bind:style="tmp[layer].componentStyles.buyables" :layer="layer"></buyables>
			<upgrades v-bind:style="tmp[layer].componentStyles['upgrades']" :layer="layer"></upgrades>
			<challenges v-bind:style="tmp[layer].componentStyles['challenges']" :layer="layer"></challenges>
			<achievements v-bind:style="tmp[layer].componentStyles.achievements" :layer="layer"></achievements>
			<br><br>
		</div>
		<div v-if="tmp[layer].tabFormat">
			<div v-if="Array.isArray(tmp[layer].tabFormat)"><div v-if="spacing" v-bind:style="{'height': spacing}"></div>
				<column :layer="layer" :data="tmp[layer].tabFormat"></column>
			</div>
			<div v-else>
				<div class="upgTable" v-bind:style="{'padding-top': '25px', 'margin-bottom': '24px'}">
					<tab-buttons v-bind:style="tmp[layer].componentStyles['tab-buttons']" :layer="layer" :data="tmp[layer].tabFormat" :name="'mainTabs'"></tab-buttons>
				</div>
				<layer-tab v-if="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer" :layer="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer"></layer-tab>
				<column v-else :layer="layer" :data="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].content"></column>
			</div>
		</div></div>
			`
	},

	'overlay-head': {
		template: `			
		<div class="overlayThing" style="padding-bottom:7px; width: 90%">
		<span v-if="player.devSpeed && player.devSpeed != 1" class="overlayThing">
			<br>Dev Speed: {{format(player.devSpeed)}}x<br>
		</span>
		<span v-if="player.offTime !== undefined && player.offTime !== null"  class="overlayThing">
			<br>Offline Time: {{formatTime(player.offTime?player.offTime.remain:0)}}<br>
		</span>
		<span v-if="false && !player.keepGoing"  class="overlayThing">
			<br>Reach {{formatWhole(ENDGAME)}} to beat the game!<br>
		</span>
		<br>
		<span v-if="player.points.lt('1e1000')"  class="overlayThing">You have </span>
		<h2  class="overlayThing" id="points">{{format(player.points)}}</h2>
		<span v-if="player.points.lt('1e1e6')"  class="overlayThing"> {{modInfo.pointsName}}</span>
		<br>
		<span v-if="canGenPoints()"  class="overlayThing">({{format(getPointGen())}}/sec)</span>
		<div v-for="thing in tmp.displayThings" class="overlayThing"><span v-if="thing" v-html="thing"></span></div>
	</div>
	`
    },

    'info-tab': {
        template: `
        <div>
        <h2>{{modInfo.name}}</h2>
        <br>
        <h3>{{VERSION.withName}}</h3>
        <span v-if="modInfo.author">
            <br>
            Made by {{modInfo.author}}	
        </span>
        <br>
        The Modding Tree {{TMT_VERSION.tmtNum}} by Acamaeda
        <br>
        The Prestige Tree made by Jacorb and Aarex
        <br>
        Original idea by papyrus (on discord)
        <br><br>
        <a v-bind:href="modInfo.changelogLink" target="_blank" class="link" >Changelog</a><br>
        <span v-if="modInfo.discordLink"><a class="link" v-bind:href="modInfo.discordLink" target="_blank">{{modInfo.discordName}}</a><br></span>
        <a class="link" href="https://discord.gg/F3xveHV" target="_blank" v-bind:style="modInfo.discordLink ? {'font-size': '16px'} : {}">The Modding Tree Discord</a><br>
        <a class="link" href="http://discord.gg/wwQfgPa" target="_blank" v-bind:style="{'font-size': '16px'}">Main Prestige Tree server</a><br>
        <br><br>
        Time Played: {{ formatTime(player.timePlayed) }}<br><br>
        <h3>Hotkeys</h3><br>
        <span v-for="key in hotkeys" v-if="player[key.layer].unlocked"><br>{{key.description}}</span></div>
    `
    },

    'options-tab': {
        template: `
        <table>
            <tr>
                <td><button class="opt" onclick="save()">Save</button></td>
                <td><button class="opt" onclick="toggleOpt('autosave')">Autosave: {{ player.autosave?"ON":"OFF" }}</button></td>
                <td><button class="opt" onclick="hardReset()">HARD RESET</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="exportSave()">Export to clipboard</button></td>
                <td><button class="opt" onclick="importSave()">Import</button></td>
                <td><button class="opt" onclick="toggleOpt('offlineProd')">Offline Prod: {{ player.offlineProd?"ON":"OFF" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="switchTheme()">Theme: {{ getThemeName() }}</button></td>
                <td><button class="opt" onclick="adjustMSDisp()">Show Milestones: {{ player.msDisplay.toUpperCase() }}</button></td>
                <td><button class="opt" onclick="toggleOpt('hqTree')">High-Quality Tree: {{ player.hqTree?"ON":"OFF" }}</button></td>
            </tr>
                <tr>
                    <td><button class="opt" onclick="toggleOpt('hideChallenges')">Completed Challenges: {{ player.hideChallenges?"HIDDEN":"SHOWN" }}</button></td>
                <!--	<td><button class="opt" onclick="toggleOpt('oldStyle')">Style: {{ player.oldStyle?"v1.0":"NEW" }}</button></td>-->
            </tr> 
        </table>`
    },

    'back-button': {
        template: `
        <button v-bind:class="back" onclick="goBack()">←</button>
        `
    }
}