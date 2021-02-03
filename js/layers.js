addLayer("p", {
        name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#31aeb0",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "prestige points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:0.5 }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasAchievement("a", 13)) mult = mult.times(1.1);
			if (hasAchievement("a", 32)) mult = mult.times(2);
			if (hasUpgrade("p", 21)) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e50:1.8);
			if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23));
			if (hasUpgrade("p", 41)) mult = mult.times(upgradeEffect("p", 41));
			if (hasUpgrade("b", 11)) mult = mult.times(upgradeEffect("b", 11));
			if (hasUpgrade("g", 11)) mult = mult.times(upgradeEffect("g", 11));
			if (player.t.unlocked) mult = mult.times(tmp.t.enEff);
			if (player.e.unlocked) mult = mult.times(tmp.e.buyables[11].effect.first);
			if (player.s.unlocked) mult = mult.times(buyableEffect("s", 11));
			if (hasUpgrade("e", 12)) mult = mult.times(upgradeEffect("e", 12));
			if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
			if (hasUpgrade("p", 31)) exp = exp.times(1.05);
			return exp;
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "p", description: "Press P to Prestige.", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return true},
		passiveGeneration() { return (hasMilestone("g", 1)&&player.ma.current!="p")?1:0 },
		doReset(resettingLayer) {
			let keep = [];
			if (hasMilestone("b", 0) && resettingLayer=="b") keep.push("upgrades")
			if (hasMilestone("g", 0) && resettingLayer=="g") keep.push("upgrades")
			if (hasMilestone("e", 1) && resettingLayer=="e") keep.push("upgrades")
			if (hasMilestone("t", 1) && resettingLayer=="t") keep.push("upgrades")
			if (hasMilestone("s", 1) && resettingLayer=="s") keep.push("upgrades")
			if (hasAchievement("a", 41)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
		}},
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "Begin",
				description: "Generate 1 Point every second.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1).pow(tmp.h.costExp11) },
			},
			12: {
				title: "Prestige Boost",
				description: "Prestige Points boost Point generation.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:1).pow(tmp.h.costExp11) },
				effect() {
					let eff = player.p.points.plus(2).pow(0.5);
					if (hasUpgrade("g", 14)) eff = eff.pow(1.5);
					if (hasUpgrade("g", 24)) eff = eff.pow(1.4666667);
					if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) eff = eff.pow(1.4333333)
					
					if (hasChallenge("h", 22)) eff = softcap("p12_h22", eff);
					else eff = softcap("p12", eff);
					
					if (hasUpgrade("p", 14)) eff = eff.pow(3);
					if (hasUpgrade("hn", 14)) eff = eff.pow(1.05);
					if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) eff = eff.pow(upgradeEffect("b", 34));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.1);
					return eff;
				},
				unlocked() { return hasUpgrade("p", 11) },
				effectDisplay() { return format(tmp.p.upgrades[12].effect)+"x" },
				formula() { 
					let exp = new Decimal(0.5*(hasUpgrade("g", 14)?1.5:1)*(hasUpgrade("g", 24)?1.4666667:1));
					if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) exp = exp.times(1.4333333);
					if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 34));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.1);
					let f = "(x+2)^"+format(exp)
					if (upgradeEffect("p", 12).gte("1e3500")) {
						if (hasChallenge("h", 22)) f = "10^(sqrt(log(x+2))*"+format(Decimal.mul(exp, 3500).sqrt())+")"
						else f = "log(x+2)*"+format(Decimal.div("1e3500",3500).times(exp))
					}
					if (hasUpgrade("p", 14)) f += "^"+(hasUpgrade("hn", 14)?3.15:3)
					return f;
				},
			},
			13: {
				title: "Self-Synergy",
				description: "Points boost their own generation.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?50:5).pow(tmp.h.costExp11) },
				effect() { 
					let eff = player.points.plus(1).log10().pow(0.75).plus(1);
					if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
					if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
					if (hasUpgrade("hn", 13)) eff = eff.pow(upgradeEffect("hn", 13));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(75);
					return eff;
				},
				unlocked() { return hasUpgrade("p", 12) },
				effectDisplay() { return format(tmp.p.upgrades[13].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
					if (hasUpgrade("g", 15)) exp = exp.times(upgradeEffect("g", 15));
					if (hasUpgrade("hn", 13)) exp = exp.times(upgradeEffect("hn", 13));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(75);
					return "(log(x+1)^0.75+1)"+(exp.gt(1)?("^"+format(exp)):"")
				},
			},
			14: {
				title: "Prestigious Intensity",
				description: "<b>Prestige Boost</b>'s effect is cubed (unaffected by softcap).",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e589":"1e4070000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 13) },
				pseudoReq: 'Req: 1e168,000 Prestige Points in the "Productionless" Hindrance',
				pseudoCan() { return player.p.points.gte("1e168000")&&inChallenge("h", 42) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			21: {
				title: "More Prestige",
				description() { return "Prestige Point gain is increased by "+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e52":"80")+"%." },
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e171:20).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 11) },
			},
			22: {
				title: "Upgrade Power",
				description: "Point generation is faster based on your Prestige Upgrades bought.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:75).pow(tmp.h.costExp11) },
				effect() {
					let eff = Decimal.pow(1.4, player.p.upgrades.length);
					if (hasUpgrade("p", 32)) eff = eff.pow(2);
					if (hasUpgrade("hn", 22)) eff = eff.pow(upgradeEffect("hn", 22))
					if (hasUpgrade("hn", 32)) eff = eff.pow(7);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(40);
					return eff;
				},
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 12) },
				effectDisplay() { return format(tmp.p.upgrades[22].effect)+"x" },
				formula() { 
					let exp = new Decimal(hasUpgrade("p", 32)?2:1);
					if (hasUpgrade("hn", 22)) exp = exp.times(upgradeEffect("hn", 22));
					if (hasUpgrade("hn", 32)) exp = exp.times(7);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(40);
					return exp.gt(1)?("(1.4^x)^"+format(exp)):"1.4^x" 
				},
			},
			23: {
				title: "Reverse Prestige Boost",
				description: "Prestige Point gain is boosted by your Points.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e305:5e3).pow(tmp.h.costExp11) },
				effect() {
					let eff = player.points.plus(1).log10().cbrt().plus(1);
					if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
					if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
					if (hasUpgrade("hn", 23)) eff = eff.pow(upgradeEffect("hn", 23));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.5);
					return eff;
				},
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 13) },
				effectDisplay() { return format(tmp.p.upgrades[23].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
					if (hasUpgrade("g", 23)) exp = exp.times(upgradeEffect("g", 23));
					if (hasUpgrade("hn", 23)) exp = exp.times(upgradeEffect("hn", 23));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.5);
					return exp.gt(1)?("(log(x+1)^(1/3)+1)^"+format(exp)):"log(x+1)^(1/3)+1"
				},
			},
			24: {
				title: "Plasmic Energies",
				description: "The Tachoclinal Plasma effect uses a better formula (log(log(x+1)+1)*10+1 -> 10^cbrt(log(x+1))).",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11435":"e5070000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 14)||hasUpgrade("p", 23)) },
				pseudoReq: "Req: 41,250 Damned Souls without any Wraiths.",
				pseudoCan() { return player.ps.souls.gte(41250) && player.ps.buyables[11].eq(0) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				style: {"font-size": "9px" },
			},
			31: {
				title: "WE NEED MORE PRESTIGE",
				description: "Prestige Point gain is raised to the power of 1.05.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e316":1e45).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 21) },
			},
			32: {
				title: "Still Useless",
				description: "<b>Upgrade Power</b> is squared.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e355":1e56).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 22) },
			},
			33: {
				title: "Column Leader",
				description: "Both above upgrades are stronger based on your Total Prestige Points.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e436":1e60).pow(tmp.h.costExp11) },
				effect() { return player.p.total.plus(1).log10().plus(1).log10().div(5).plus(1).times(hasUpgrade("hn", 33) ? upgradeEffect("hn", 33) : 1) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 23) },
				effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
				formula() { return hasUpgrade("hn", 33) ? ("(log(log(x+1)+1)/5+1)*"+format(upgradeEffect("hn", 33))) : "log(log(x+1)+1)/5+1" },
			},
			34: {
				title: "Solar Potential",
				description: "Solarity multiplies the Solarity gain exponent.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"ee7").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 24)||hasUpgrade("p", 33)) },
				pseudoReq: "Req: 30 Achievements",
				pseudoCan() { return player.a.achievements.length>=30 },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.o.points.plus(1).log10().plus(1).log10().plus(1).log10().plus(1).times((hasUpgrade("hn", 34)) ? upgradeEffect("hn", 34) : 1) },
				effectDisplay() { return format(tmp.p.upgrades[34].effect)+"x" },
				formula: "log(log(log(x+1)+1)+1)+1",
			},
			41: {
				title: "Prestige Recursion",
				description: "Prestige Points boost their own gain.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e9570":"1e4460000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 31) },
				pseudoReq: "Req: 25 Total Honour",
				pseudoCan() { return player.hn.total.gte(25) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { 
					let eff = Decimal.pow(10, player.p.points.plus(1).log10().pow(.8));
					if (hasUpgrade("hn", 41)) eff = eff.pow(upgradeEffect("hn", 41));
					return eff;
				},
				effectDisplay() { return format(tmp.p.upgrades[41].effect)+"x" },
				formula() { return "10^(log(x+1)^0.8)"+(hasUpgrade("hn", 41)?("^"+format(upgradeEffect("hn", 41))):"") },
			},
			42: {
				title: "Spatial Awareness",
				description: "Space Building costs scale 50% slower.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11445":"e5960000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 32) },
				pseudoReq: "Req: 1e100 Solarity",
				pseudoCan() { return player.o.points.gte(1e100) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			43: {
				title: "Booster Potential",
				description: "Quirk Energy also affects the Booster effect.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"e8888888").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
				pseudoReq: "Req: e10,000,000 Points",
				pseudoCan() { return player.points.gte("ee7") },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			44: {
				title: "Spelling Dictionary",
				description: "The softcaps for the first two Spells start later based on your Boosters.",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11456":"e6500000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
				pseudoReq: "Req: 150,000 Primary Space Buildings",
				pseudoCan() { return player.s.buyables[11].gte(1.5e5) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.b.points.plus(1).pow(3) },
				effectDisplay() { return format(tmp.p.upgrades[44].effect)+"x later" },
				formula: "(x+1)^3",
				style: {"font-size": "9px"},
			},
		},
})

addLayer("b", {
        name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#6e64c4",
        requires() { return new Decimal(200).times((player.b.unlockOrder&&!player.b.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
        resource: "boosters", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["p"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:5 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("b", 23)) mult = mult.div(upgradeEffect("b", 23));
			if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
			return mult;
		},
		canBuyMax() { return hasMilestone("b", 1) },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "b", description: "Press B to perform a booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.p.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("t", 4)&&player.ma.current!="b" },
		addToBase() {
			let base = new Decimal(0);
			if (hasUpgrade("b", 12)) base = base.plus(upgradeEffect("b", 12));
			if (hasUpgrade("b", 13)) base = base.plus(upgradeEffect("b", 13));
			if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
			if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).b);
			if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
			if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
			if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
			return base;
		},
		effectBase() {
			let base = new Decimal(2);
			
			// ADD
			base = base.plus(tmp.b.addToBase);
			
			// MULTIPLY
			if (player.sb.unlocked) base = base.times(tmp.sb.effect);
			if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
			if (hasUpgrade("q", 34)) base = base.times(upgradeEffect("q", 34));
			if (player.m.unlocked) base = base.times(tmp.m.buyables[11].effect);
			if (hasUpgrade("b", 24) && player.i.buyables[12].gte(1)) base = base.times(upgradeEffect("b", 24));
			if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
			
			return base.pow(tmp.b.power);
		},
		power() {
			let power = new Decimal(1);
			if (player.m.unlocked) power = power.times(player.m.spellTimes[12].gt(0)?1.05:1);
			return power;
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(1);
			return Decimal.pow(tmp.b.effectBase, player.b.points.plus(tmp.sb.spectralTotal)).max(0).times(hasUpgrade("p", 43)?tmp.q.enEff:1);
		},
		effectDescription() {
			return "which are boosting Point generation by "+format(tmp.b.effect)+"x"+(tmp.nerdMode?("\n ("+format(tmp.b.effectBase)+"x each)"):"")
		},
		doReset(resettingLayer) {
			let keep = [];
			if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
			if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
			if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("t", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
		},
		extraAmtDisplay() {
			if (tmp.sb.spectralTotal.eq(0)) return "";
			return "<h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'> + "+formatWhole(tmp.sb.spectralTotal)+"</h3>"
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
			auto: false,
		}},
		autoPrestige() { return (hasMilestone("t", 3) && player.b.auto)&&player.ma.current!="b" },
		increaseUnlockOrder: ["g"],
		milestones: {
			0: {
				requirementDescription: "8 Boosters",
				done() { return player.b.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "Keep Prestige Upgrades on reset.",
			},
			1: {
				requirementDescription: "15 Boosters",
				done() { return player.b.best.gte(15) || hasAchievement("a", 71) },
				effectDescription: "You can buy max Boosters.",
			},
		},
		upgrades: {
			rows: 3,
			cols: 4,
			11: {
				title: "BP Combo",
				description: "Best Boosters boost Prestige Point gain.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:3) },
				effect() { 
					let ret = player.b.best.sqrt().plus(1);
					if (hasUpgrade("b", 32)) ret = Decimal.pow(1.125, player.b.best).times(ret);
					if (hasUpgrade("s", 15)) ret = ret.pow(buyableEffect("s", 14).root(2.7));
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
					return ret;
				},
				unlocked() { return player.b.unlocked },
				effectDisplay() { return format(tmp.b.upgrades[11].effect)+"x" },
				formula() { 
					let base = "sqrt(x)+1"
					if (hasUpgrade("b", 32)) base = "(sqrt(x)+1)*(1.125^x)"
					let exp = new Decimal(1)
					if (hasUpgrade("s", 15)) exp = exp.times(buyableEffect("s", 14).root(2.7));
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) exp = exp.times(1.5);
					let f = exp.gt(1)?("("+base+")^"+format(exp)):base;
					return f;
				},
			},
			12: {
				title: "Cross-Contamination",
				description: "Generators add to the Booster effect base.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1250:7) },
				effect() {
					let ret = player.g.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.g.unlocked },
				effectDisplay() { return "+"+format(tmp.b.upgrades[12].effect) },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					let f = "sqrt(log(x+1))"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			13: {
				title: "PB Reversal",
				description: "Total Prestige Points add to the Booster effect base.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1436:8) },
				effect() { 
					let ret = player.p.total.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1) 
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
				effectDisplay() { return "+"+format(tmp.b.upgrades[13].effect) },
				formula() { 
					let exp = new Decimal(1)
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					let f = "log(log(x+1)+1)"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			14: {
				title: "Meta-Combo",
				description: "The first 3 Booster Upgrades are stronger based on your Super Boosters, and <b>BP Combo</b> directly multiplies Point gain.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:2250) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 13) },
				pseudoReq: "Req: 30 Super Boosters.",
				pseudoCan() { return player.sb.points.gte(30) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.sb.points.plus(1) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "x+1",
				style: {"font-size": "9px"},
			},
			21: {
				title: "Gen Z^2",
				description: "Square the Generator Power effect.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2000:9) },
				unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
			},
			22: {
				title: "Up to the Fifth Floor",
				description: "Raise the Generator Power effect ^1.2.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2075:15) },
				unlocked() { return hasUpgrade("b", 12) && hasUpgrade("b", 13) },
			},
			23: {
				title: "Discount One",
				description: "Boosters are cheaper based on your Points.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:18) },
				effect() { 
					let ret = player.points.add(1).log10().add(1).pow(3.2);
					if (player.s.unlocked) ret = ret.pow(buyableEffect("s", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
					return ret;
				},
				unlocked() { return hasUpgrade("b", 21) || hasUpgrade("b", 22) },
				effectDisplay() { return "/"+format(tmp.b.upgrades[23].effect) },
				formula() { return "(log(x+1)+1)^"+(player.s.unlocked?format(buyableEffect("s", 14).times(3.2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1)):"3.2") },
			},
			24: {
				title: "Boost Recursion",
				description: "Boosters multiply their own base.",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:2225) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 23) },
				pseudoReq: "Req: 2,150 Boosters without any Hexes.",
				pseudoCan() { return player.b.points.gte(2150) && player.m.hexes.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.b.points.plus(1).pow(500) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "(x+1)^500",
			},
			31: {
				title: "Worse BP Combo",
				description: "Super Boosters boost Prestige Point gain.",
				cost() { return tmp.h.costMult11b.times(103) },
				unlocked() { return hasAchievement("a", 41) },
				effect() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
					return Decimal.pow(1e20, player.sb.points.pow(1.5)).pow(exp); 
				},
				effectDisplay() { return format(tmp.b.upgrades[31].effect)+"x" },
				formula() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
					return "1e20^(x^1.5)"+(exp==1?"":("^"+format(exp)));
				},
			},
			32: {
				title: "Better BP Combo",
				description() { return "<b>BP Combo</b> uses a better formula"+(tmp.nerdMode?" (sqrt(x+1) -> (1.125^x)*sqrt(x+1))":"")+"." },
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:111) },
				unlocked() { return hasAchievement("a", 41) },
			},
			33: {
				title: "Even More Additions",
				description: "<b>More Additions</b> is stronger based on your Super Boosters.",
				cost() { return tmp.h.costMult11b.times(118) },
				unlocked() { return hasAchievement("a", 41) },
				effect() { return player.sb.points.times(player.sb.points.gte(4)?2.6:2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
				effectDisplay() { return format(tmp.b.upgrades[33].effect)+"x" },
				formula() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1
					let f = "x*"+(player.sb.points.gte(4)?"2.6":"2")+"+1"
					if (exp==1) return f;
					else return "("+f+")^"+format(exp);
				},
			},
			34: {
				title: "Anti-Metric",
				description: "Imperium Bricks raise <b>Prestige Boost</b> to an exponent (unaffected by softcap).",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2021:2275) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 33) },
				pseudoReq: "Req: 1e15,000,000 Prestige Points while in the <b>Productionless</b> Hindrance.",
				pseudoCan() { return player.p.points.gte("e1.5e7") && inChallenge("h", 42) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.points.plus(1).root(4) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "(x+1)^0.25",
			},
		},
})

addLayer("g", {
        name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#a3d9a5",
        requires() { return new Decimal(200).times((player.g.unlockOrder&&!player.g.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
        resource: "generators", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["p"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2.5:5 },
		gainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("g", 22)) mult = mult.div(upgradeEffect("g", 22));
			if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
			return mult;
		},
		canBuyMax() { return hasMilestone("g", 2) },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "g", description: "Press G to perform a generator reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.p.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("s", 4)&&player.ma.current!="g" },
		effBase() {
			let base = new Decimal(2);
			
			// ADD
			if (hasUpgrade("g", 12)) base = base.plus(upgradeEffect("g", 12));
			if (hasUpgrade("g", 13)) base = base.plus(upgradeEffect("g", 13));
			if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
			if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
			if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
			
			// MULTIPLY
			if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
			if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12)
			if (player.sg.unlocked) base = base.times(tmp.sg.enEff)
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
			
			return base;
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(0);
			let eff = Decimal.pow(this.effBase(), player.g.points.plus(tmp.sg.spectralTotal)).sub(1).max(0);
			if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
			if (hasUpgrade("g", 25)) eff = eff.times(upgradeEffect("g", 25));
			if (hasUpgrade("t", 15)) eff = eff.times(tmp.t.enEff);
			if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
			if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
			if (player.q.unlocked) eff = eff.times(tmp.q.enEff);
			return eff;
		},
		effectDescription() {
			return "which are generating "+format(tmp.g.effect)+" Generator Power/sec"+(tmp.nerdMode?("\n ("+format(tmp.g.effBase)+"x each)"):"")
		},
		extraAmtDisplay() {
			if (tmp.sg.spectralTotal.eq(0)) return "";
			return "<h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'> + "+formatWhole(tmp.sg.spectralTotal)+"</h3>"
		},
		update(diff) {
			if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			power: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
			auto: false,
		}},
		autoPrestige() { return (hasMilestone("s", 3) && player.g.auto)&&player.ma.current!="g" },
		powerExp() {
			let exp = new Decimal(1/3);
			if (hasUpgrade("b", 21)) exp = exp.times(2);
			if (hasUpgrade("b", 22)) exp = exp.times(1.2);
			if (hasUpgrade("q", 13)) exp = exp.times(1.25);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.05);
			if (player.mc.upgrades.includes(11)) exp = exp.times(buyableEffect("mc", 12));
			return exp;
		},
		powerEff() {
			if (!unl(this.layer)) return new Decimal(1);
			return player.g.power.plus(1).pow(this.powerExp());
		},
		doReset(resettingLayer) {
			let keep = [];
			player.g.power = new Decimal(0);
			if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
			if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
			if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("s", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.g.power) + ' Generator Power, which boosts Point generation by '+format(tmp.g.powerEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(tmp.g.powerExp)+")":"")},
					{}],
			"blank",
			["display-text",
				function() {return 'Your best Generators is ' + formatWhole(player.g.best) + '<br>You have made a total of '+formatWhole(player.g.total)+" Generators."},
					{}],
			"blank",
			"milestones", "blank", "blank", "upgrades"],
		increaseUnlockOrder: ["b"],
		milestones: {
			0: {
				requirementDescription: "8 Generators",
				done() { return player.g.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "Keep Prestige Upgrades on reset.",
			},
			1: {
				requirementDescription: "10 Generators",
				done() { return player.g.best.gte(10) || hasAchievement("a", 71) },
				effectDescription: "You gain 100% of Prestige Point gain every second.",
			},
			2: {
				requirementDescription: "15 Generators",
				done() { return player.g.best.gte(15) || hasAchievement("a", 71) },
				effectDescription: "You can buy max Generators.",
			},
		},
		upgrades: {
			rows: 3,
			cols: 5,
			11: {
				title: "GP Combo",
				description: "Best Generators boost Prestige Point gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?380:3) },
				effect() { return player.g.best.sqrt().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5e5:1) },
				unlocked() { return player.g.unlocked },
				effectDisplay() { return format(tmp.g.upgrades[11].effect)+"x" },
				formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(x+1)^250,000":"sqrt(x)+1" },
			},
			12: {
				title: "I Need More!",
				description: "Boosters add to the Generator base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?375:7) },
				effect() { 
					let ret = player.b.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.g.unlocked },
				effectDisplay() { return "+"+format(tmp.g.upgrades[12].effect) },
				formula() { 
					let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
					if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
					return "sqrt(log(x+1))"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
				},
			},
			13: {
				title: "I Need More II",
				description: "Best Prestige Points add to the Generator base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?381:8) },
				effect() { 
					let ret = player.p.best.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return player.g.best.gte(8) },
				effectDisplay() { return "+"+format(tmp.g.upgrades[13].effect) },
				formula() { 
					let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
					if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
					return "log(log(x+1)+1)"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
				},
			},
			14: {
				title: "Boost the Boost",
				description() { return "<b>Prestige Boost</b> is raised to the power of 1.5." },
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?378:13) },
				unlocked() { return player.g.best.gte(10) },
			},
			15: {
				title: "Outer Synergy",
				description: "<b>Self-Synergy</b> is stronger based on your Generators.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?382:15) },
				effect() { 
					let eff = player.g.points.sqrt().add(1);
					if (eff.gte(400)) eff = eff.cbrt().times(Math.pow(400, 2/3))
					return eff;
				},
				unlocked() { return hasUpgrade("g", 13) },
				effectDisplay() { return "^"+format(tmp.g.upgrades[15].effect) },
				formula() { return upgradeEffect("g", 15).gte(400)?"((x+1)^(1/6))*(400^(2/3))":"sqrt(x)+1" },
			},
			21: {
				title: "I Need More III",
				description: "Generator Power boost its own generation.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e314":1e10) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let ret = player.g.power.add(1).log10().add(1);
					if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1e4)
					return ret;
				},
				unlocked() { return hasUpgrade("g", 15) },
				effectDisplay() { return format(tmp.g.upgrades[21].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("s", 24)) exp = exp.times(upgradeEffect("s", 24));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1e4);
					let f = "log(x+1)+1";
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			22: {
				title: "Discount Two",
				description: "Generators are cheaper based on your Prestige Points.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"5e47141":1e11) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let eff = player.p.points.add(1).pow(0.25);
					if (hasUpgrade("g", 32) && player.i.buyables[12].gte(2)) eff = eff.pow(upgradeEffect("g", 32));
					return eff;
				},
				unlocked() { return hasUpgrade("g", 15) },
				effectDisplay() { return "/"+format(tmp.g.upgrades[22].effect) },
				formula: "(x+1)^0.25",
			},
			23: {
				title: "Double Reversal",
				description: "<b>Reverse Prestige Boost</b> is stronger based on your Boosters.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"2e47525":1e12) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { return player.b.points.pow(0.85).add(1) },
				unlocked() { return hasUpgrade("g", 15)&&player.b.unlocked },
				effectDisplay() { return "^"+format(tmp.g.upgrades[23].effect) },
				formula: "x^0.85+1",
			},
			24: {
				title: "Boost the Boost Again",
				description: "<b>Prestige Boost</b> is raised to the power of 1.467.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?690:20) },
				unlocked() { return hasUpgrade("g", 14)&&(hasUpgrade("g", 21)||hasUpgrade("g", 22)) },
			},
			25: {
				title: "I Need More IV",
				description: "Prestige Points boost Generator Power gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47526":1e14) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let ret = player.p.points.add(1).log10().pow(3).add(1);
					if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return hasUpgrade("g", 23)&&hasUpgrade("g", 24) },
				effectDisplay() { return format(tmp.g.upgrades[25].effect)+"x" },
				formula() { 
					let f = "log(x+1)^3+1";
					if (hasUpgrade("s", 24)) f = "("+f+")^"+format(upgradeEffect("s", 24));
					return f;
				},
			},
			31: {
				title: "Absurd Generation",
				description: "Generator Power multiplies the Super Generator base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47545":"e4.4e7") },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "Req: e73,600,000 Prestige Points without any Generator Power (after doing an Enhance reset).",
				pseudoCan() { return player.p.points.gte("e7.35e7") && player.g.power.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.g.power.plus(1).log10().plus(1).pow(2) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "(log(x+1)+1)^2",
			},
			32: {
				title: "Primal Instincts",
				description: "The <b>Quaternary Space Building</b> also affects <b>Discount Two</b> at a reduced rate.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1260:2200) },
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "Req: e47,500,000 Generator Power without any Boosters (after doing an Enhance reset).",
				pseudoCan() { return player.g.power.gte("e4.75e7") && player.b.best.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return buyableEffect("s", 14).pow(0.8) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "eff^0.8",
				style: {"font-size": "9px"},
			},
			33: {
				title: "Dust Production",
				description: "Generators boost Dust gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48000":"e5.6e7") },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "Req: 1e14 Nebula Energy",
				pseudoCan() { return player.n.points.gte(1e14) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return Decimal.pow(1.15, player.g.points.sqrt()) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "1.15^sqrt(x)",
			},
			34: {
				title: "Boost the Boost Again^2",
				description: "<b>Prestige Boost</b> is raised to the power of 1.433.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1257:2200) },
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "Req: 36 Achievements.",
				pseudoCan() { return player.a.achievements.length>=36 },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			35: {
				title: "Into The Future",
				description: "Nebula Energy, Honour, and Hyperspace Energy gains are boosted by Generator Power.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47540":"e4.4e7") },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "Req: 5e18 Honour & 5e17 Hyperspace Energy.",
				pseudoCan() { return player.hn.points.gte(5e18) && player.hs.points.gte(5e17) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.g.power.plus(1).log10().plus(1).sqrt() },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "sqrt(log(x+1)+1)",
			},
		},
})

addLayer("t", {
        name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			energy: new Decimal(0),
			first: 0,
			auto: false,
			pseudoUpgs: [],
			autoExt: false,
        }},
        color: "#006609",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "time capsules", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(1.4):new Decimal(1.85) }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(10):new Decimal(1e15) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("q", 1) },
		enCapMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("t", 12)) mult = mult.times(upgradeEffect("t", 12));
			if (hasUpgrade("t", 21)) mult = mult.times(100);
			if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
			if (player.h.unlocked) mult = mult.times(tmp.h.effect);
			if (player.o.unlocked) mult = mult.times(tmp.o.solEnEff2);
			return mult;
		},
		enGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
			if (player.h.unlocked) mult = mult.times(tmp.h.effect);
			return mult;
		},
		effBaseMult() {
			let mult = new Decimal(1);
			if (player.o.unlocked) mult = mult.times(buyableEffect("o", 13));
			if (player.ba.unlocked) mult = mult.times(tmp.ba.posBuff);
			if (player.m.unlocked) mult = mult.times(tmp.m.buyables[12].effect);
			return mult;
		},
		effBasePow() {
			let exp = new Decimal(1);
			if (player.m.unlocked) exp = exp.times(player.m.spellTimes[12].gt(0)?1.1:1);
			return exp;
		},
		effGainBaseMult() {
			let mult = new Decimal(1);
			if (player.ps.unlocked) mult = mult.times(challengeEffect("h", 32));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 11)) mult = mult.times(upgradeEffect("t", 11).max(1));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 25)) mult = mult.times(upgradeEffect("t", 25).max(1))
			return mult;
		},
		effLimBaseMult() {
			let mult = tmp.n.realDustEffs2?new Decimal(tmp.n.realDustEffs2.orangePurple||1):new Decimal(1);
			if (hasUpgrade("t", 33) && player.i.buyables[12].gte(4)) mult = mult.times(upgradeEffect("t", 33));
			return mult;
		},
		effect() { 
			if (!unl(this.layer)) return {gain: new Decimal(0), limit: new Decimal(0)};
			else return {
				gain: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3).pow(tmp.t.effBasePow), player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(player.t.points.plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enGainMult).max(0),
				limit: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effLimBaseMult).times(2).pow(tmp.t.effBasePow), player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(100).times(player.t.points.plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enCapMult).max(0),
			}
		},
		effect2() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) || !unl(this.layer)) return new Decimal(1);
			let c = player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules);
			return Decimal.pow(1.01, c.sqrt());
		},
		effectDescription() {
			return "which are generating "+format(tmp.t.effect.gain)+" Time Energy/sec, but with a limit of "+format(tmp.t.effect.limit)+" Time Energy"+(tmp.nerdMode?("\n("+format(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3))+"x gain each, "+format(tmp.t.effBaseMult.times(2))+"x limit each)"):"")+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?(", and which multiply the speed of all layers in Rows 1-6 by "+format(tmp.t.effect2)+(tmp.nerdMode?(" (1.01^sqrt(x))"):"")):"")
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.t.energy.add(1).pow(1.2);
			if (hasUpgrade("t", 14)) eff = eff.pow(1.3);
			if (hasUpgrade("q", 24)) eff = eff.pow(7.5);
			return softcap("timeEnEff", eff);
		},
		enEff2() {
			if (!unl(this.layer)) return new Decimal(0);
			if (!hasUpgrade("t", 24)) return new Decimal(0);
			let exp = 5/9
			if (hasUpgrade("t", 35) && player.i.buyables[12].gte(4)) exp = .565;
			let eff = player.t.energy.max(0).plus(1).log10().pow(exp);
			return softcap("timeEnEff2", eff).floor();
		},
		nextEnEff2() {
			if (!hasUpgrade("t", 24)) return new Decimal(1/0);
			let next = Decimal.pow(10, reverse_softcap("timeEnEff2", tmp.t.enEff2.plus(1)).pow(1.8)).sub(1);
			return next;
		},
		autoPrestige() { return (player.t.auto && hasMilestone("q", 3))&&player.ma.current!="t" },
		update(diff) {
			if (player.t.unlocked) player.t.energy = player.t.energy.plus(this.effect().gain.times(diff)).min(this.effect().limit).max(0);
			if (player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
		},
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "t", description: "Press T to Time Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="t" },
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.t.energy) + ' Time Energy, which boosts Point & Prestige Point gain by '+format(tmp.t.enEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(1.2*(hasUpgrade("t", 14)?1.3:1)*(hasUpgrade("q", 24)?7.5:1))+")":"")+(hasUpgrade("t", 24)?(", and provides "+formatWhole(tmp.t.enEff2)+" free Extra Time Capsules ("+(tmp.nerdMode?"log(x+1)^0.556":("next at "+format(tmp.t.nextEnEff2)))+")."):"")},
					{}],
			"blank",
			["display-text",
				function() {return 'Your best Time Capsules is ' + formatWhole(player.t.best)},
					{}],
			"blank",
			"milestones", "blank", "buyables", "blank", "upgrades"],
        increaseUnlockOrder: ["e", "s"],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.b.unlocked},
        branches: ["b"],
		upgrades: {
			rows: 4,
			cols: 5,
			11: {
				title: "Pseudo-Boost",
				description: "Non-extra Time Capsules add to the Booster base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?750:2) },
				unlocked() { return player.t.unlocked },
				effect() { 
					return player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13)?upgradeEffect("t", 13):0).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1);
				},
				effectDisplay() { return "+"+format(tmp.t.upgrades[11].effect) },
				formula() { 
					let f = "x^0.9"+(hasUpgrade("t", 13)?("+"+format(upgradeEffect("t", 13).plus(0.5))):"+0.5") 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^3"
					return f;
				},
			},
			12: {
				title: "Limit Stretcher",
				description: "Time Energy cap starts later based on Boosters, and +1 Extra Time Capsule.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:([5e4,2e5,2.5e6][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "time energy",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return player.t.best.gte(2) },
				effect() { 
					return player.b.points.pow(0.95).add(1)
				},
				effectDisplay() { return format(tmp.t.upgrades[12].effect)+"x" },
				formula: "x^0.95+1",
			},
			13: {
				title: "Pseudo-Pseudo-Boost",
				description: "Extra Time Capsules add to the <b>Pseudo-Boost</b>'s effect.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e265:([3e6,3e7,3e8][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "time energy",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return hasUpgrade("t", 12) },
				effect() { 
					return player.t.buyables[11].add(tmp.t.freeExtraTimeCapsules).pow(0.95);
				},
				effectDisplay() { return "+"+format(tmp.t.upgrades[13].effect) },
				formula: "x^0.95",
			},
			14: {
				title: "More Time",
				description: "The Time Energy effect is raised to the power of 1.3.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?760:(player.t.unlockOrder>=2?5:4)) },
				unlocked() { return hasUpgrade("t", 13) },
			},
			15: {
				title: "Time Potency",
				description: "Time Energy affects Generator Power gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:([1.25e7,(player.s.unlocked?3e8:6e7),1.5e9][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "time energy",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return hasUpgrade("t", 13) },
			},
			21: {
				title: "Weakened Chains",
				description: "The Time Energy limit is multiplied by 100.",
				cost() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:12 },
				unlocked() { return hasAchievement("a", 33) },
			},
			22: {
				title: "Enhanced Time",
				description: "Enhance Points boost Time Energy's generation and limit.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?765:9) },
				unlocked() { return hasAchievement("a", 33) },
				effect() { 
					return player.e.points.plus(1).root(10).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1);
				},
				effectDisplay() { return format(tmp.t.upgrades[22].effect)+"x" },
				formula() { return "(x+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.11":"0.1") },
			},
			23: {
				title: "Reverting Time",
				description: "Time acts as if you chose it first.",
				cost() { return new Decimal(player[this.layer].unlockOrder>=2?3e9:(player.s.unlocked?6.5e8:1.35e8)) },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("t", 23))&&hasUpgrade("t", 13) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			24: {
				title: "Time Dilation",
				description: "Unlock a new Time Energy effect.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:2e17) },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return hasAchievement("a", 33) },
			},
			25: {
				title: "Basic",
				description: "Time Energy adds to the Booster base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?'1e9000':3e19) },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return hasAchievement("a", 33) },
				effect() { return player.t.energy.plus(1).log10().div(1.2).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
				effectDisplay() { return "+"+format(tmp.t.upgrades[25].effect) },
				formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(log(x+1)/1.2)^3":"log(x+1)/1.2" },
			},
			31: {
				title: "Cheap Time",
				description: "Extra Time Capsule cost scaling is removed, and their cost exponent is decreased by 0.2.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e16400":"e3600000") },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "Req: 1e42 Honour",
				pseudoCan() { return player.hn.points.gte(1e42) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			32: {
				title: "The Hypertime Continuum",
				description: "Hyperspace cost scales 33.33% slower.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "Req: 1e31 Hyperspace Energy",
				pseudoCan() { return player.hs.points.gte(1e31) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			33: {
				title: "Virtually Limitless",
				description: "Time Energy boosts the Time Energy limit base.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:750) },
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "Req: 30 Phantom Souls",
				pseudoCan() { return player.ps.points.gte(30) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.t.energy.plus(1).log10().plus(1).pow(3.5) },
				effectDisplay() { return format(tmp.t.upgrades[33].effect)+"x" },
				formula: "(log(x+1)+1)^3.5",
			},
			34: {
				title: "Scalings Galore",
				description: "Post-1,225 Booster & Generator cost scalings start at 1,400 instead.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: 'Req: Reach e124,000,000 Prestige Points while in the "Productionless" Hindrance and without any Hyper Buildings.',
				pseudoCan() { return player.p.points.gte("e1.24e8") && inChallenge("h", 42) && player.hs.spentHS.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			35: {
				title: "Don't Kill Time",
				description: "Time Energy's second effect exponent is increased (0.556 -> 0.565)",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e38000":"e3600000") },
				currencyDisplayName: "time energy",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "Req: 1e13 Purple Dust",
				pseudoCan() { return player.n.purpleDust.gte(1e13) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			41: {
				title: "Subtemporal Power",
				description: "Raise the Subspace base to the power of 1.5, and gain 2,500x more Hyperspace Energy.",
				cost: new Decimal(1050),
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "Req: 1e60 Honour & 1e575 Phantom Power",
				pseudoCan() { return player.hn.points.gte(1e60) && player.ps.power.gte("1e575") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
		},
		freeExtraTimeCapsules() {
			let free = new Decimal(0);
			if (hasUpgrade("t", 12)) free = free.plus(1);
			if (hasUpgrade("t", 24)) free = free.plus(tmp.t.enEff2);
			if (hasUpgrade("q", 22)) free = free.plus(upgradeEffect("q", 22));
			return free;
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Extra Time Capsules",
				costScalingEnabled() {
					return !(hasUpgrade("t", 31) && player.i.buyables[12].gte(4))
				},
				costExp() {
					let exp = new Decimal(1.2);
					if (hasUpgrade("t", 31) && player.i.buyables[12].gte(4)) exp = exp.sub(.2);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                    let cost = x.times(0.4).pow(tmp[this.layer].buyables[this.id].costExp).add(1).times(10)
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cost = cost.pow(.9);
                    return cost.floor()
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let e = tmp.t.freeExtraTimeCapsules;
                    let display = (tmp.nerdMode?("Cost Formula: "+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"(((x^2)/25":"((x")+"*0.4)^"+format(data.costExp)+"+1)*10"):("Cost: " + formatWhole(data.cost) + " Boosters"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+(e.gt(0)?(" + "+formatWhole(e)):"")+(inChallenge("h", 31)?("\nPurchases Left: "+String(10-player.h.chall31bought)):"")
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.b.points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.b.points = player.b.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					if (inChallenge("h", 31)) player.h.chall31bought++;
                },
                buyMax() {
					if (!this.canAfford()) return;
					if (inChallenge("h", 31)) return;
					let b = player.b.points.plus(1);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) b = b.root(.9);
					let tempBuy = b.div(10).sub(1).max(0).root(tmp[this.layer].buyables[this.id].costExp).div(0.4);
					if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
					let target = tempBuy.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
				autoed() { return player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31) },
                style: {'height':'222px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Time Capsules",
				done() { return player.t.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster/Generator milestones on reset.",
			},
			1: {
				requirementDescription: "3 Time Capsules",
				done() { return player.t.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "Keep Prestige Upgrades on reset.",
			},
			2: {
				requirementDescription: "4 Time Capsules",
				done() { return player.t.best.gte(4) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster Upgrades on all resets.",
			},
			3: {
				requirementDescription: "5 Time Capsules",
				done() { return player.t.best.gte(5) || hasAchievement("a", 71) },
				effectDescription: "Unlock Auto-Boosters.",
				toggles: [["b", "auto"]],
			},
			4: {
				requirementDescription: "8 Time Capsules",
				done() { return player.t.best.gte(8) || hasAchievement("a", 71) },
				effectDescription: "Boosters reset nothing.",
			},
		},
})

addLayer("e", {
        name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			auto: false,
			pseudoUpgs: [],
        }},
        color: "#b82fbd",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "enhance points", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.025:.02) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("e", 24)) mult = mult.times(upgradeEffect("e", 24));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		passiveGeneration() { return (hasMilestone("q", 1)&&player.ma.current!="e")?1:0 },
		update(diff) {
			if (player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
		},
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "e", description: "Press E to Enhance Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        increaseUnlockOrder: ["t", "s"],
        doReset(resettingLayer){ 
			let keep = []
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		freeEnh() {
			let enh = new Decimal(0);
			if (hasUpgrade("e", 13)) enh = enh.plus(1);
			if (hasUpgrade("e", 21)) enh = enh.plus(2);
			if (hasUpgrade("e", 23)) enh = enh.plus(upgradeEffect("e", 23));
			if (hasUpgrade("q", 22)) enh = enh.plus(upgradeEffect("q", 22));
			if (hasUpgrade("e", 32) && player.i.buyables[12].gte(3)) enh = enh.plus(upgradeEffect("e", 32));
			return enh;
		},
        layerShown(){return player.b.unlocked&&player.g.unlocked},
        branches: ["b","g"],
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "Row 2 Synergy",
				description: "Boosters & Generators boost each other.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":((player.e.unlockOrder>=2)?25:100)) },
				unlocked() { return player.e.unlocked },
				effect() { 
					let exp = 1
					return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp)} 
				},
				effectDisplay() { return "+"+format(tmp.e.upgrades[11].effect.g)+" to Generator base, +"+format(tmp.e.upgrades[11].effect.b)+" to Booster base" },
				formula: "log(x+1)",
			},
			12: {
				title: "Enhanced Prestige",
				description: "Total Enhance Points boost Prestige Point gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":(player.e.unlockOrder>=2?400:1e3)) },
				unlocked() { return hasUpgrade("e", 11) },
				effect() { 
					let ret = player.e.total.add(1).pow(1.5) 
					ret = softcap("e12", ret);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1.5);
					return ret
				},
				effectDisplay() { return format(tmp.e.upgrades[12].effect)+"x" },
				formula() { 
					let f = upgradeEffect("e", 12).gte("1e1500")?"(x+1)^0.75*1e750":"(x+1)^1.5" 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^1.5"
					return f;
				},
			},
			13: {
				title: "Enhance Plus",
				description: "Get a free Enhancer.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e5":2.5e3) },
				unlocked() { return hasUpgrade("e", 11) },
			},
			14: {
				title: "More Additions",
				description: "Any Booster/Generator Upgrades that add to the Booster/Generator base are quadrupled.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":3e23) },
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					let e = new Decimal(4)
					if (hasUpgrade("b", 33)) e = e.times(upgradeEffect("b", 33))
					return e;
				},
				effectDisplay() { return format(tmp.e.upgrades[14].effect)+"x" },
				noFormula: true,
			},
			21: {
				title: "Enhance Plus Plus",
				description: "Get another two free Enhancers",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>0?1e4:1e9)) },
				unlocked() { return hasUpgrade("e", 13) && ((!player.s.unlocked||(player.s.unlocked&&player.t.unlocked))&&player.t.unlocked) },
			},
			22: {
				title: "Enhanced Reversion",
				description: "Enhance acts as if you chose it first.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>=2?1e3:3e4)) },
				unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("e", 22))&&hasUpgrade("e", 12) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			23: {
				title: "Enter the E-Space",
				description: "Space Energy provides free Enhancers.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":2e20) },
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					let eff = player.s.points.pow(2).div(25);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(3.5);
					return eff.floor();
				},
				effectDisplay() { return "+"+formatWhole(tmp.e.upgrades[23].effect) },
				formula() { return "floor(x^2"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"/7.14":"/25")+")" },
			},
			24: {
				title: "Monstrous Growth",
				description: "Boosters & Generators boost Enhance Point gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.011e5":2.5e28) },
				unlocked() { return hasAchievement("a", 33) },
				effect() { return Decimal.pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2000":1.1, player.b.points.plus(player.g.points).pow(0.9)) },
				effectDisplay() { return format(tmp.e.upgrades[24].effect)+"x" },
				formula() { return (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2,000":"1.1")+"^((boosters+generators)^0.9)" },
			},
			31: {
				title: "Amplification",
				description: "The second effect of Enhancers also adds to the Super-Booster, Super-Generator, and Subspace bases.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "Req: e2,464,000 Enhance Points without any Super-Boosters or Super-Generators (after a Row 4 reset).",
				pseudoCan() { return player.sb.best.eq(0) && player.sg.best.eq(0) && player.e.points.gte("e2.464e6") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			32: {
				title: "Supplementation",
				description: "Best Honour provides free Enhancers.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "Req: 30,300 Free Enhancers.",
				pseudoCan() { return tmp.e.freeEnh.gte(30300) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return softcap("e32", player.hn.best.plus(1).log10().pow(3.25)).floor() },
				effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "log(x+1)^3.25",
			},
			33: {
				title: "Augmentation",
				description: "Both Enhancer effect exponents are 20% higher.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "Req: 60,600 Bought Enhancers.",
				pseudoCan() { return player.e.buyables[11].gte(60600) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			34: {
				title: "Intensification",
				description: "Enhancer cost scaling is disabled.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "Req: e3,050,000 Enhance Points without any purchased Quirk Layers (After a Row 5 reset).",
				pseudoCan() { return player.e.points.gte("e3.05e6") && player.q.buyables[11].eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			41: {
				title: "To the Next Level",
				description: "Enhance Points boost Hyperspace Energy gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e5750000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "Req: 44,900 Bought Enhancers without any Hyper Buildings.",
				pseudoCan() { return player.e.buyables[11].gte(44900) && player.hs.spentHS.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.e.points.plus(1).log10().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.45:.15) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula() { return "(log(x+1)+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.45":"0.15") },
			},
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Enhancers",
				costScalingEnabled() {
					return !(hasUpgrade("e", 34) && player.i.buyables[12].gte(3));
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                    let cost = Decimal.pow(2, x.pow(1.5))
                    return cost.floor()
                },
				power() {
					let pow = new Decimal(1);
					if (hasUpgrade("e", 33) && player.i.buyables[12].gte(3)) pow = pow.times(1.2);
					return pow;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let power = tmp[this.layer].buyables[this.id].power
					x = x.plus(tmp.e.freeEnh);
					if (!unl(this.layer)) x = new Decimal(0);
					
                    let eff = {}
                    if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(power.times(1.1)))
                    else eff.first = Decimal.pow(1/25, x.times(-1).pow(power.times(1.1)))
					if (hasUpgrade("q", 24)) eff.first = eff.first.pow(7.5);
					eff.first = softcap("enh1", eff.first)
                
                    if (x.gte(0)) eff.second = x.pow(power.times(0.8))
                    else eff.second = x.times(-1).pow(power.times(0.8)).times(-1)
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff.second = eff.second.pow(50);
                    return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: 2^("+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"((x^2)/25)":"x")+"^1.5)"):("Cost: " + formatWhole(data.cost) + " Enhance Points"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.e.freeEnh.gt(0)?(" + "+formatWhole(tmp.e.freeEnh)):"") + "\n\
                   "+(tmp.nerdMode?(" Formula 1: 25^(x^"+format(data.power.times(1.1))+")\n\ Formula 2: x^"+format(data.power.times(0.8))):(" Boosts Prestige Point gain by " + format(data.effect.first) + "x and adds to the Booster/Generator base by " + format(data.effect.second)))+(inChallenge("h", 31)?("\nPurchases Left: "+String(10-player.h.chall31bought)):"")
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					if (inChallenge("h", 31)) player.h.chall31bought++;
                },
                buyMax() {
					if (!this.canAfford()) return;
					if (inChallenge("h", 31)) return;
					let tempBuy = player[this.layer].points.max(1).log2().root(1.5)
					if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
					let target = tempBuy.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
				autoed() { return player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31) },
                style: {'height':'222px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Enhance Points",
				done() { return player.e.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster/Generator milestones on reset.",
			},
			1: {
				requirementDescription: "5 Enhance Points",
				done() { return player.e.best.gte(5) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "Keep Prestige Upgrades on reset.",
			},
			2: {
				requirementDescription: "25 Enhance Points",
				done() { return player.e.best.gte(25) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster/Generator Upgrades on reset.",
			},
		},
})

addLayer("s", {
        name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			spent: new Decimal(0),
			first: 0,
			auto: false,
			autoBld: false,
			pseudoUpgs: [],
        }},
        color: "#dfdfdf",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "space energy", // Name of prestige currency
        baseResource: "points", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1.85) }, // Prestige currency exponent
        base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:(hasUpgrade("ss", 11)?1e10:1e15)) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "s", description: "Press S to Space Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="s" },
        increaseUnlockOrder: ["t", "e"],
        doReset(resettingLayer){ 
            let keep = []
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("q", 2) && (resettingLayer=="q"||resettingLayer=="h")) {
				keep.push("buyables");
				keep.push("spent");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		space() {
			let space = player.s.best.pow(1.1).times(3);
			if (hasUpgrade("s", 13)) space = space.plus(2);
			if (hasAchievement("a", 53)) space = space.plus(2);
			if (player.ss.unlocked) space = space.plus(tmp.ss.eff1);
			
			if (inChallenge("h", 21)) space = space.div(10);
			return space.floor().sub(player.s.spent).max(0);
		},
		buildingBaseRoot() {
			let root = new Decimal(1);
			if (hasUpgrade("s", 34) && player.i.buyables[12].gte(5)) root = root.times(upgradeEffect("s", 34));
			return root;
		},
		buildingBaseCosts() { 
			let rt = tmp.s.buildingBaseRoot;
			return {
				11: new Decimal(1e3).root(rt),
				12: new Decimal(1e10).root(rt),
				13: new Decimal(1e25).root(rt),
				14: new Decimal(1e48).root(rt),
				15: new Decimal(1e250).root(rt),
				16: new Decimal("e3e7").root(rt),
				17: new Decimal("e4.5e7").root(rt),
				18: new Decimal("e6e7").root(rt),
				19: new Decimal("e3.5e8").root(rt),
				20: new Decimal("e1.5e9").root(rt),
		}},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'Your best Space Energy is ' + formatWhole(player.s.best)},
					{}],
			"blank",
			"milestones", "blank", 
			["display-text",
				function() {return 'You have ' + format(player.g.power) + ' Generator Power'},
					{}],
			["display-text",
				function() {return 'Your Space Energy has provided you with ' + formatWhole(tmp.s.space) + ' Space'},
					{}],
			["display-text",
				function() {return tmp.s.buildingPower.eq(1)?"":("Space Building Power: "+format(tmp.s.buildingPower.times(100))+"%")},
					{}],
			"blank",
			"buyables", "blank", "upgrades"],
        layerShown(){return player.g.unlocked},
        branches: ["g"],
		canBuyMax() { return hasMilestone("q", 1) },
		freeSpaceBuildings() {
			let x = new Decimal(0);
			if (hasUpgrade("s", 11)) x = x.plus(1);
			if (hasUpgrade("s", 22)) x = x.plus(upgradeEffect("s", 22));
			if (hasUpgrade("q", 22)) x = x.plus(upgradeEffect("q", 22));
			if (hasUpgrade("ss", 31)) x = x.plus(upgradeEffect("ss", 31));
			return x;
		},
		freeSpaceBuildings1to4() {
			let x = new Decimal(0);
			if (player.s.unlocked) x = x.plus(buyableEffect("s", 15));
			return x;
		},
		totalBuildingLevels() {
			let len = Object.keys(player.s.buyables).length
			if (len==0) return new Decimal(0);
			if (len==1) return Object.values(player.s.buyables)[0].plus(tmp.s.freeSpaceBuildings).plus(toNumber(Object.keys(player.s.buyables))<15?tmp.s.freeSpaceBuildings1to4:0)
			let l = Object.values(player.s.buyables).reduce((a,c,i) => Decimal.add(a, c).plus(toNumber(Object.keys(player.s.buyables)[i])<15?tmp.s.freeSpaceBuildings1to4:0)).plus(tmp.s.freeSpaceBuildings.times(len));
			return l;
		},
		manualBuildingLevels() {
			let len = Object.keys(player.s.buyables).length
			if (len==0) return new Decimal(0);
			if (len==1) return Object.values(player.s.buyables)[0]
			let l = Object.values(player.s.buyables).reduce((a,c) => Decimal.add(a, c));
			return l;
		},
		buildingPower() {
			if (!unl(this.layer)) return new Decimal(0);
			let pow = new Decimal(1);
			if (hasUpgrade("s", 21)) pow = pow.plus(0.08);
			if (hasChallenge("h", 21)) pow = pow.plus(challengeEffect("h", 21).div(100));
			if (player.ss.unlocked) pow = pow.plus(tmp.ss.eff2);
			if (hasUpgrade("ss", 42)) pow = pow.plus(1);
			if (hasUpgrade("ba", 12)) pow = pow.plus(upgradeEffect("ba", 12));
			if (player.n.buyables[11].gte(2)) pow = pow.plus(buyableEffect("o", 23));
			if (hasAchievement("a", 103)) pow = pow.plus(.1);
			if (inChallenge("h", 21)) pow = pow.sub(0.9);
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.div(5);
			return pow;
		},
		autoPrestige() { return player.s.auto&&hasMilestone("q", 3)&&player.ma.current!="s" },
		update(diff) {
			if (player.s.autoBld && hasMilestone("q", 7)) for (let i=(5+player.i.buyables[11].toNumber());i>=1;i--) layers.s.buyables[10+i].buyMax();
		},
		upgrades: {
			rows: 3,
			cols: 5,
			11: {
				title: "Space X",
				description: "Add a free level to all Space Buildings.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:2) },
				unlocked() { return player[this.layer].unlocked }
			},
			12: {
				title: "Generator Generator",
				description: "Generator Power boosts its own generation.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:3) },
				unlocked() { return hasUpgrade("s", 11) },
				effect() { return player.g.power.add(1).log10().add(1) },
				effectDisplay() { return format(tmp.s.upgrades[12].effect)+"x" },
				formula: "log(x+1)+1",
			},
			13: {
				title: "Shipped Away",
				description: "Space Building Levels boost Generator Power gain, and you get 2 extra Space.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48900":([1e37,1e59,1e94][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return hasUpgrade("s", 11) },
				effect() { return softcap("s13", Decimal.pow(20, tmp.s.totalBuildingLevels)) },
				effectDisplay() { return format(tmp.s.upgrades[13].effect)+"x" },
				formula: "20^x",
			},
			14: {
				title: "Into The Repeated",
				description: "Unlock the <b>Quaternary Space Building</b>.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:4) },
				unlocked() { return hasUpgrade("s", 12)||hasUpgrade("s", 13) }
			},
			15: {
				title: "Four Square",
				description: "The <b>Quaternary Space Building</b> cost is cube rooted, is 3x as strong, and also affects <b>BP Combo</b> (brought to the 2.7th root).",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55000":([1e65,(player.e.unlocked?1e94:1e88),1e129][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return hasUpgrade("s", 14) },
			},
			21: {
				title: "Spacious",
				description: "All Space Buildings are 8% stronger.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:13) },
				unlocked() { return hasAchievement("a", 33) },
			},
			22: {
				title: "Spacetime Anomaly",
				description: "Non-extra Time Capsules provide free Space Buildings.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55225":2.5e207) },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
				effect() { return player.t.points.cbrt().floor() },
				effectDisplay() { return "+"+formatWhole(tmp.s.upgrades[22].effect) },
				formula: "floor(cbrt(x))",
			},
			23: {
				title: "Revert Space",
				description() { return (player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)?"All Space Building costs are divided by 1e20.":("Space acts as if you chose it first"+(player.t.unlocked?", and all Space Building costs are divided by 1e20.":".")) },
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55300":(player.s.unlockOrder>=2?1e141:(player.e.unlocked?1e105:1e95))) },
				currencyDisplayName: "generator power",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return ((player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)||player[this.layer].unlockOrder>0||hasUpgrade("s", 23))&&hasUpgrade("s", 13) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			24: {
				title: "Want More?",
				description: "All four of the <b>I Need More</b> upgrades are stronger based on your Total Space Buildings.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55555":1e177) },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					return tmp.s.totalBuildingLevels.sqrt().div(5).plus(1);
				},
				effectDisplay() { return format(tmp.s.upgrades[24].effect.sub(1).times(100))+"% stronger" },
				formula: "sqrt(x)/5+1",
			},
			25: {
				title: "Another One?",
				description: "Unlock the Quinary Space Building.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e8e5":1e244) },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
			},
			31: {
				title: "Useful Dimensionality",
				description: "The first four Space Buildings' cost exponents are decreased by 0.04*(5-n), where n is the Space Building number.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?815:1225) },
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "Req: 1,200% Space Building Power",
				pseudoCan() { return tmp.s.buildingPower.gte(12) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				style: {"font-size": "9px"},
			},
			32: {
				title: "Poincaré Recurrence",
				description: "Each Space Building's bought Level adds to the previous building's Extra Level.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9e5":"e2.25e8") },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "Req: e1e9 Points",
				pseudoCan() { return player.points.gte("e1e9") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			33: {
				title: "Noncontinuous Spectrum",
				description: "<b>Contiguous Dimension</b> multiplies Nebula Energy & Hyperspace Energy gain at a reduced rate.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e6":"e2.75e8") },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "Req: Have at least 13 Space Upgrades, 39 Achievements, and the upgrade <b>Contiguous Dimension</b>.",
				pseudoCan() { return player.a.achievements.length>=39 && player.s.upgrades.length>=13 && hasUpgrade("s", 35) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return upgradeEffect("s", 35).sqrt() },
				effectDisplay() { return format(upgradeEffect("s", 33))+"x" },
				formula: "sqrt(x)",
				style: {"font-size": "8px"},
			},
			34: {
				title: "Energetic Reduction",
				description: "The first five Space Buildings' cost bases are reduced based on your Space Energy.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9.01e5":"e1.95e8") },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "Req: e160,000,000 Generator Power without any bought Space Buildings (Hint: respec Space Buildings).",
				pseudoCan() { return player.g.power.gte("e1.6e8") && tmp.s.manualBuildingLevels.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.s.points.plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return "brought to the "+format(tmp.s.upgrades[this.id].effect)+"th root" },
				formula: "log(log(x+1)+1)+1",
				style: {"font-size": "9px"},
			},
			35: {
				title: "Contiguous Dimension",
				description: "Unspent Space multiplies Honour gain.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?825:1255) },
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "Req: 9e16 Space",
				pseudoCan() { return tmp.s.space.gte(9e16) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return tmp.s.space.plus(1) },
				effectDisplay() { return format(tmp.s.upgrades[this.id].effect)+"x" },
				formula: "x+1",
			},
		},
		divBuildCosts() {
			let div = new Decimal(1);
			if (hasUpgrade("s", 23) && player.t.unlocked) div = div.times(1e20);
			if (player.ss.unlocked) div = div.times(tmp.ss.eff3);
			return div;
		},
		buildScalePower() {
			let scale = new Decimal(1);
			if (hasUpgrade("p", 42)) scale = scale.times(.5);
			if (hasUpgrade("hn", 42)) scale = scale.times(.8);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) scale = scale.div(3.85);
			if (tmp.m.buyables[14].unlocked) scale = scale.times(Decimal.sub(1, tmp.m.buyables[14].effect));
			return scale;
		},
		buyables: {
			rows: 1,
			cols: 10,
			showRespec() { return player.s.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
				player[this.layer].spent = new Decimal(0);
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
            respecText: "Respec Space Buildings", // Text on Respec button, optional
			11: {
				title: "Primary Space Building",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					if (x.eq(0)) return new Decimal(0);
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[11+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(x.plus(1).plus(tmp.s.freeSpaceBuildings).times(tmp.s.buildingPower), player.s.points.sqrt()).times(x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).max(1).times(4)).max(1);
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 21));
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x"+("*"+format(tmp.s.buildScalePower))+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                   "+(tmp.nerdMode?("Formula: level^sqrt(spaceEnergy)*level*4"):(" Space Energy boosts Point gain & Prestige Point gain by " + format(data.effect) +"x"))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
				target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			12: {
				title: "Secondary Space Building",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[12+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).sqrt();
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 22));
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                    "+(tmp.nerdMode?("Formula: sqrt(level)"):("Adds to base of Booster/Generator effects by +" + format(data.effect)))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
				target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			13: {
				title: "Tertiary Space Building",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[13+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(1e18, x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(0.9))
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 23));
					eff = softcap("spaceBuilding3", eff);
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.times(tmp.s.buildingPower).gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                    "+(tmp.nerdMode?("Formula: "+(data.effect.gte("e3e9")?"10^((level^0.3)*5.45e6)":"1e18^(level^0.9)")):("Divide Booster/Generator cost by " + format(data.effect)))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			14: {
				title: "Quaternary Space Building",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base);
					if (hasUpgrade("s", 15)) cost = cost.root(3);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[14+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).times((hasUpgrade("s", 15))?3:1).add(1).pow(1.25);
					ret = softcap("spaceBuilding4", ret);
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 24));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let extForm = hasUpgrade("s", 15)?3:1
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+(hasUpgrade("s", 15)?"^(1/3)":"")+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: "+(data.effect.gte(1e6)?("log(level"+(extForm==1?"":"*3")+"+1)*2.08e5"):("(level"+(extForm==1?"":"*3")+"+1)^1.25"))):("<b>Discount One</b> is raised to the power of " + format(data.effect)))
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 14) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).pow(hasUpgrade("s", 15)?3:1).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			15: {
				title: "Quinary Space Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(1.35)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings;
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[15+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(2);
					if (hasUpgrade("q", 32)) ret = ret.times(2);
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 25));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^1.35)*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: level"+(hasUpgrade("q", 32)?"":"/2")):("Add " + formatWhole(data.effect)+" levels to all previous Space Buildings."))
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 25) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(1.35).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			16: {
				title: "Senary Space Building",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[16+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).plus(1).sqrt();
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 26));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: sqrt(level+1)"):("Multiply Damned Soul gain by " + format(data.effect)+"."))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(1) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			17: {
				title: "Septenary Space Building",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[17+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = Decimal.pow("1e20000", x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(1.2));
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 27));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: 1e20,000^(level^1.2)"):("Divide the requirement of Phantom Souls by " + format(data.effect)+"."))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(2) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			18: {
				title: "Octonary Space Building",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[18+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1.5)
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 28));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: level/1.5"):("Get " + format(data.effect)+" more Free Quirk Layers."))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(3) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			19: {
				title: "Nonary Space Building",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[19+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1e3).plus(1)
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 29));
					return softcap("spaceBuilding9_2", softcap("spaceBuilding9", ret));
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: level/1,000+1"):("The Hyperspace Energy gain exponent is multiplied by " + format(data.effect)+"."))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(4) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			20: {
				title: "Decary Space Building",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(250)
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 30));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("Cost Formula: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("Cost: " + formatWhole(data.cost) + " Generator Power"))+"\n\
                    Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("Formula: (level/2.5)%"):("Hyper Building Power is increased by " + format(data.effect.times(100))+"%."))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(5) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Space Energy",
				done() { return player.s.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster/Generator milestones on reset.",
			},
			1: {
				requirementDescription: "3 Space Energy",
				done() { return player.s.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "Keep Prestige Upgrades on reset.",
			},
			2: {
				requirementDescription: "4 Space Energy",
				done() { return player.s.best.gte(4) || hasAchievement("a", 71) },
				effectDescription: "Keep Generator Upgrades on all resets.",
			},
			3: {
				requirementDescription: "5 Space Energy",
				done() { return player.s.best.gte(5) || hasAchievement("a", 71) },
				effectDescription: "Unlock Auto-Generators.",
				toggles: [["g", "auto"]],
			},
			4: {
				requirementDescription: "8 Space Energy",
				done() { return player.s.best.gte(8) || hasAchievement("a", 71) },
				effectDescription: "Generators reset nothing.",
			},
		},
})

addLayer("sb", {
        name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#504899",
        requires: new Decimal(100), // Can be a function that takes requirement increases into account
        resource: "super boosters", // Name of prestige currency
        baseResource: "boosters", // Name of resource prestige is based on
        baseAmount() {return player.b.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["b"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.075:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.025:1.05 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(4/3);
			return mult;
		},
		autoPrestige() { return player.sb.auto && hasMilestone("q", 4) && player.ma.current!="sb" },
		canBuyMax() { return hasMilestone("q", 7) },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "B", description: "Press Shift+B to perform a super booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.t.unlocked&&player.e.unlocked&&player.s.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="sb" },
		effectBase() {
			let base = new Decimal(5);
			if (hasChallenge("h", 12)) base = base.plus(.25);
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (player.o.unlocked) base = base.times(buyableEffect("o", 12));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 12)) base = base.times(upgradeEffect("b", 12).max(1));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 13)) base = base.times(upgradeEffect("b", 13).max(1));
			base = base.times(tmp.n.dustEffs.blue);
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) && hasChallenge("h", 12)) base = base.times(player.hs.points.plus(1));
			return base
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(1);
			return Decimal.pow(this.effectBase(), player.sb.points).max(0);
		},
		effectDescription() {
			return "which are multiplying the Booster base by "+format(tmp.sb.effect)+"x"+(tmp.nerdMode?("\n ("+format(tmp.sb.effectBase)+"x each)"):"")
		},
		doReset(resettingLayer){ 
			let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		spectralEach() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) return new Decimal(0);
			return player.sb.points;
		},
		spectralTotal() {
			return tmp.sb.spectralEach.times(player.sb.points);
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sb"):false)?("Your Super Boosters are providing you with <h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'>"+formatWhole(tmp.sb.spectralTotal)+"</h3> Spectral Boosters"+(tmp.nerdMode?(" ("+formatWhole(tmp.sb.spectralEach)+" per SB)"):"")+", which contribute to the Booster effect but not to any Booster-related upgrade effects."):"" }],
		],
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			auto: false,
		}},
})

addLayer("sg", {
        name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#248239",
        requires: new Decimal(200), // Can be a function that takes requirement increases into account
        resource: "super generators", // Name of prestige currency
        baseResource: "generators", // Name of resource prestige is based on
        baseAmount() {return player.g.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["g"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.225:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.04:1.05 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(1.1);
			return mult;
		},
		autoPrestige() { return player.sg.auto && hasMilestone("q", 6) && player.ma.current!="sg" },
		update(diff) {
			player.sg.power = player.sg.power.plus(tmp.sg.effect.times(diff));
			player.sg.time = player.sg.time.plus(diff);
		},
		canBuyMax() { return hasMilestone("q", 7) },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "G", description: "Press Shift+G to perform a super generator reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		layerShown(){return (hasUpgrade("q", 33)||player.ma.selectionActive)&&player.q.unlocked},
		resetsNothing() { return hasMilestone("q", 6) && player.ma.current!="sg" },
		effectBase() {
			let base = new Decimal(5);
			if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (hasUpgrade("g", 31) && player.i.buyables[12].gte(2)) base = base.times(upgradeEffect("g", 31));
			if (hasUpgrade("ba", 32)) base = base.times(upgradeEffect("ba", 32));
			if (hasUpgrade("hn", 52)) base = base.times(buyableEffect("o", 12));
			if (player.mc.unlocked) base = base.times(clickableEffect("mc", 21));
			if (tmp.m.buyables[16].unlocked) base = base.times(buyableEffect("m", 16));
			return base;
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(0);
			let eff = Decimal.pow(this.effectBase(), player.sg.points).sub(1).max(0);
			if (tmp.h.challenges[31].unlocked) eff = eff.times(challengeEffect("h", 31));
			return eff;
		},
		effectDescription() {
			return "which are generating "+format(tmp.sg.effect)+" Super Generator Power/sec"+(tmp.nerdMode?("\n ("+format(tmp.sg.effectBase)+"x each)"):"")
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.sg.power.plus(1).sqrt();
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false) eff = eff.pow(2);
			return eff;
		},
		doReset(resettingLayer){ 
			let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		spectralTotal() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)) return new Decimal(0);
			return player.sg.time.plus(1).log10().times(player.sg.points.pow(2)).pow(.95).times(1.2).floor();
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.sg.power) + ' Super Generator Power, which multiplies the Generator base by '+format(tmp.sg.enEff)+'x'+(tmp.nerdMode?(" (sqrt(x+1))"):"")},
					{}],
			"blank",
			["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)?("Your Super Generators are providing you with <h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'>"+formatWhole(tmp.sg.spectralTotal)+"</h3> Spectral Generators"+(tmp.nerdMode?(" (((log(timeSinceRow4Reset+1)*(SG^2))^0.95)*1.2)"):"")+", which contribute to the Generator effect but not to any Generator-related upgrade effects."):"" }],
		],
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			power: new Decimal(0),
			first: 0,
			auto: false,
			time: new Decimal(0),
		}},
})

addLayer("h", {
        name: "hindrance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			chall31bought: 0,
			first: 0,
			auto: false,
        }},
        color: "#a14040",
        requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
        resource: "hindrance spirit", // Name of prestige currency
        baseResource: "time energy", // Name of resource prestige is based on
        baseAmount() {return player.t.energy}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.2:.125) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).h);
			if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "h", description: "Press H to Hindrance Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			player.h.chall31bought = 0;
			if (hasMilestone("m", 1)) keep.push("challenges")
			if (layers[resettingLayer].row > this.row) {
				layerDataReset(this.layer, keep)
			}
        },
		update(diff) {
			if (hasAchievement("a", 111)) {
				let cd = tmp[this.layer].challenges;
				let auto = hasMilestone("h", 0) && player.h.auto;
				if (cd[31].unlocked && (player.h.activeChallenge==31 || auto)) cd[31].completeInBulk()
				if (cd[32].unlocked && (player.h.activeChallenge==32 || auto)) cd[32].completeInBulk()
			}
		},
        layerShown(){return (player.t.unlocked&&hasMilestone("q", 4))||player.m.unlocked||player.ba.unlocked},
        branches: ["t"],
		effect() { 
			if (!unl(this.layer)) return new Decimal(1);
			let h = player.h.points.times(player.points.plus(1).log("1e1000").plus(1));
			h = softcap("hindr_base", h);
			let eff = h.plus(1).pow(3).pow(hasChallenge("h", 11)?1.2:1).pow(hasUpgrade("ba", 21)?8:1);
			if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) eff = eff.pow(100);
			return eff;
		},
		effectDescription() {
			return "which are multiplying Point gain, Time Energy gain, & the Time Energy cap by "+format(tmp.h.effect)+" ("+(tmp.nerdMode?(tmp.h.effect.gte(15e4)?("(10^sqrt(log(hindranceSpirit/1e3*(log(points+1)+1))/log(1.5e5))+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")"):("(hindranceSpirit/1e3*(log(points+1)+1)+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")")):"boosted by Points")+")"
		},
		costMult11() {
			let mult = new Decimal(1);
			if (inChallenge("h", 11)) mult = mult.times(Decimal.pow(10, Decimal.pow(player.p.upgrades.length, 2)))
			return mult;
		},
		costExp11() {
			let exp = new Decimal(1);
			if (inChallenge("h", 11)) exp = exp.times(Math.pow(player.p.upgrades.length, 2)*4+1)
			return exp;
		},
		costMult11b() {
			let mult = new Decimal(1);
			if (inChallenge("h", 11)) mult = mult.times(player.b.upgrades.length*3+1)
			return mult;
		},
		baseDiv12() {
			let div = new Decimal(1);
			if (inChallenge("h", 12)) div = div.times(player.q.time.sqrt().times(player.sb.points.pow(3).times(3).plus(1)).plus(1))
			return div;
		},
		pointRoot31(x=challengeCompletions("h", 31)) {
			if (hasAchievement("a", 111)) x = 1;
			else if (player.h.activeChallenge==32) x = challengeCompletions("h", 32)*2
			if (x>=20) x = Math.pow(x-19, 1.5)+19
			let root = Decimal.add(2, Decimal.pow(x, 1.5).div(16))
			return root;
		},
		passiveGeneration() { return (hasMilestone("m", 2)&&player.ma.current!="h")?1:0 },
		milestones: {
			0: {
				unlocked() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) },
				requirementDescription: "e300,000,000 Hindrance Spirit",
				done() { return player.h.points.gte("e3e8") },
				effectDescription: "Unlock the Repeatable Hindrance Automator.",
				toggles: [["h", "auto"]],
			},
		},
		challenges: {
			rows: 4,
			cols: 2,
			11: {
				name: "Upgrade Desert",
				completionLimit: 1,
				challengeDescription: "Prestige/Booster Upgrades are reset regardless of your milestones, and every Prestige/Booster Upgrade you buy drastically increases the costs of the others.",
				unlocked() { return player.h.unlocked },
				goal() { return new Decimal(player.ma.current=="h"?"e1.37e8":"1e1325") },
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription: "Unlock Quirk Upgrades, and the Hindrance Spirit effect is raised to the power of 1.2.",
				onStart(testInput=false) { 
					if (testInput && !(hasAchievement("a", 81)&&player.ma.current!="h")) {
						player.p.upgrades = []; 
						player.b.upgrades = [];
					}
				},
			},
			12: {
				name: "Speed Demon",
				completionLimit: 1,
				challengeDescription: "The Booster/Generator bases are divided more over time (this effect is magnified by your Super-Boosters).",
				unlocked() { return hasChallenge("h", 11) },
				goal() { return new Decimal(player.ma.current=="h"?"e5e8":"1e3550") },
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription() { return "Add 0.25 to the Super Booster base"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?(" and multiply it by your Hyperspace Energy."):"")+"." },
			},
			21: {
				name: "Out of Room",
				completionLimit: 1,
				challengeDescription: "Space Buildings are respecced, your Space is divided by 10, and Space Building Power is decreased by 90%.",
				unlocked() { return hasChallenge("h", 12) },
				goal() { return new Decimal(player.ma.current=="h"?"e5.7e7":"1e435") },
				currencyDisplayName: "generator power",
				currencyInternalName: "power",
				currencyLayer: "g",
				rewardDescription: "Space Energy boosts the strength of Space Buildings.",
				rewardEffect() { return player.s.points.div(2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?1.4:1) },
				rewardDisplay() { return format(this.rewardEffect())+"% stronger (additive)" },
				formula() { return "(x*"+format(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.7:.5)+")%" },
				onStart(testInput=false) {
					if (testInput) {
						resetBuyables("s");
						player.s.spent = new Decimal(0);
					}
				},
			},
			22: {
				name: "Descension",
				completionLimit: 1,
				challengeDescription: "Prestige Upgrades, Achievement rewards, & the Primary Space Building are the only things that boost Point generation.",
				unlocked() { return hasChallenge("h", 21) },
				goal() { return new Decimal(player.ma.current=="h"?"e8.225e6":"1e3570") },
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription: "<b>Prestige Boost</b>'s hardcap is now a softcap.",
			},
			31: {
				name: "Timeless",
				scalePower() {
					let power = new Decimal(1);
					if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
					return power;
				},
				completionLimit() { 
					let lim = 10
					if (hasAchievement("a", 71)) lim += 10;
					if (hasAchievement("a", 74)) lim += 10;
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
					return lim
				},
				challengeDescription() {
					let lim = this.completionLimit();
					let infLim = !isFinite(lim);
					return "You can only buy 10 Enhancers & Extra Time Capsules (total), Enhancer/Extra Time Capsule automation is disabled, and Point generation is brought to the "+format(tmp.h.pointRoot31)+"th root<br>Completions: "+formatWhole(challengeCompletions("h", 31))+(infLim?"":("/"+lim));
				},
				unlocked() { return hasChallenge("h", 22) },
				goal() { 
					let comps = Decimal.mul(challengeCompletions("h", 31), tmp.h.challenges[this.id].scalePower);
					if (comps.gte(20)) comps = Decimal.pow(comps.sub(19), 1.95).plus(19);
					return Decimal.pow("1e50", Decimal.pow(comps, 2.5)).times("1e5325") 
				},
				completeInBulk() {
					if (challengeCompletions("h", 31)>=tmp[this.layer].challenges[this.id].completionLimit) return;
					let target = player.points.div("1e5325").max(1).log("1e50").root(2.5)
					if (target.gte(20)) target = target.sub(19).root(1.95).plus(19);
					target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
					player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
				},
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription() { return "<b>Timeless</b> completions boost Super Generator Power gain based on your time "+(hasUpgrade("ss", 33)?"playing this game.":"in this Row 4 reset.") },
				rewardEffect() { return Decimal.div(9, Decimal.add((hasUpgrade("ss", 33)?(player.timePlayed||0):player.q.time), 1).cbrt().pow(hasUpgrade("ss", 23)?(-1):1)).plus(1).pow(challengeCompletions("h", 31)).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:1) },
				rewardDisplay() { return format(this.rewardEffect())+"x" },
				formula() { return "(9"+(hasUpgrade("ss", 23)?"*":"/")+"cbrt(time+1)+1)^completions" },
			},
			32: {
				name: "Option D",
				scalePower() {
					let power = new Decimal(1);
					if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
					return power;
				},
				completionLimit() { 
					let lim = 10;
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
					return lim;
				},
				challengeDescription() { 
					let lim = this.completionLimit();
					let infLim = !isFinite(lim);
					return 'All previous challenges are applied at once ("Timeless" is applied at difficulty level '+formatWhole(challengeCompletions("h", 32)*2+1)+')<br>Completions: '+formatWhole(challengeCompletions("h", 32))+(infLim?"":('/'+lim))
				},
				goal() {
					let comps = Decimal.mul(challengeCompletions("h", 32), tmp.h.challenges[this.id].scalePower);
					if (comps.gte(3)) comps = comps.sub(0.96);
					if (comps.gte(3.04)) comps = comps.times(1.425);
					return Decimal.pow("1e1000", Decimal.pow(comps, 3)).times("1e9000");
				},
				completeInBulk() {
					if (challengeCompletions("h", 32)>=tmp[this.layer].challenges[this.id].completionLimit) return;
					let target = player.points.div("1e9000").max(1).log("1e1000").cbrt();
					if (target.gte(3.04)) target = target.div(1.425);
					if (target.gte(3)) target = target.plus(.96);
					target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
					player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
				},
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription: "<b>Option D</b> completions multiply the Time Energy gain base.",
				rewardEffect() { return softcap("option_d", Decimal.pow(100, Decimal.pow(challengeCompletions("h", 32), 2))).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1)) },
				rewardDisplay() { return format(tmp.h.challenges[32].rewardEffect)+"x" },
				formula: "100^(completions^2)",
				unlocked() { return tmp.ps.buyables[11].effects.hindr },
				countsAs: [11,12,21,22,31],
				onStart(testInput=false) { 
					if (testInput) {
						if (!hasAchievement("a", 81)) {
							player.p.upgrades = []; 
							player.b.upgrades = [];
						}
						resetBuyables("s");
						player.s.spent = new Decimal(0);
					}
				},
			},
			41: {
				name: "Central Madness",
				completionLimit: 1,
				challengeDescription: "Perform a Row 5 reset, Positivity & Negativity are reset, and Positivity & Negativity nerfs are extremely stronger.",
				goal: new Decimal("1e765000"),
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription: "Unlock 3 new Balance Upgrades.",
				unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=2 },
				onStart(testInput=false) {
					if (testInput) {
						doReset("m", true);
						player.h.activeChallenge = 41;
						player.ba.pos = new Decimal(0);
						player.ba.neg = new Decimal(0);
						updateTemp();
						updateTemp();
						updateTemp();
					}
				},
			},
			42: {
				name: "Productionless",
				completionLimit: 1,
				challengeDescription: "Perform a Row 5 reset, you are trapped in <b>Descension</b>, and all row 2-4 static layers have much harsher cost scalings.",
				goal: new Decimal("1e19000"),
				currencyDisplayName: "points",
				currencyInternalName: "points",
				rewardDescription() { return "The Quirk Layer cost base is decreased by 0."+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?"2":"15")+", and unlock 2 new Subspace Upgrades." },
				unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=3 },
				countsAs: [22],
				onStart(testInput=false) {
					if (testInput) {
						doReset("m", true);
						player.h.activeChallenge = 42;
						updateTemp();
						updateTemp();
						updateTemp();
					}
				},
			},
		},
})

addLayer("q", {
        name: "quirks", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			energy: new Decimal(0),
			time: new Decimal(0),
			auto: false,
			first: 0,
			pseudoUpgs: [],
        }},
        color: "#c20282",
        requires: new Decimal("1e512"), // Can be a function that takes requirement increases into account
        resource: "quirks", // Name of prestige currency
        baseResource: "generator power", // Name of resource prestige is based on
        baseAmount() {return player.g.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.008:.0075) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).q);
			mult = mult.times(improvementEffect("q", 33));
			if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
			if (hasUpgrade("hn", 43)) mult = mult.times(upgradeEffect("hn", 43));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "q", description: "Press Q to Quirk Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			if (hasMilestone("ba", 0)) keep.push("upgrades");
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.e.unlocked},
        branches: ["e"],
		enGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("q", 11)) mult = mult.times(upgradeEffect("q", 11));
			if (hasUpgrade("q", 21)) mult = mult.times(upgradeEffect("q", 21));
			if (player.o.unlocked) mult = mult.times(buyableEffect("o", 12));
			if (player.ba.unlocked) mult = mult.times(tmp.ba.negBuff);
			return mult;
		},
		enGainExp() {
			let exp = player.q.buyables[11].plus(tmp.q.freeLayers).sub(1);
			return exp;
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.q.energy.plus(1).pow(2);
			if (hasUpgrade("q", 23)) eff = eff.pow(3);
			return softcap("qe", eff.times(improvementEffect("q", 23)));
		},
		update(diff) {
			player.q.time = player.q.time.plus(diff);
			if (tmp.q.enGainExp.gte(0)) player.q.energy = player.q.energy.plus(player.q.time.times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(diff));
			if (hasMilestone("ba", 1) && player.q.auto && player.ma.current!="q") layers.q.buyables[11].buyMax();
		},
		passiveGeneration() { return (hasMilestone("ba", 0)&&player.ma.current!="q")?1:0 },
		tabFormat: {
			"Main Tab": {
				content: [
					"main-display",
					"prestige-button",
					"blank",
					["display-text",
						function() {return 'You have ' + formatWhole(player.g.power)+' Generator Power'},
							{}],
					["display-text",
						function() {return 'You have ' + formatWhole(player.q.best)+' Best Quirks'},
							{}],
					["display-text",
						function() {return 'You have ' + formatWhole(player.q.total)+' Total Quirks'},
							{}],
					"blank",
					["display-text",
						function() {return 'You have ' + formatWhole(player.q.energy)+' Quirk Energy ('+(tmp.nerdMode?('Base Gain: (timeInRun^(quirkLayers-1))'):'generated by Quirk Layers')+'), which multiplies Point and Generator Power gain by ' + format(tmp.q.enEff)+(tmp.nerdMode?(" ((x+1)^"+format(hasUpgrade("q", 23)?6:2)+"*"+format(improvementEffect("q", 23))+")"):"")},
							{}],
					"blank",
					"milestones", "blank",
					"blank",
					"buyables", "blank",
					["display-text", "Note: Most Quirk Upgrade costs increase over time, but reset on a Quirk reset."], "blank",
					"upgrades"],
			},
			Improvements: {
				unlocked() { return hasUpgrade("q", 41) },
				buttonStyle() { return {'background-color': '#f25ed7'} },
				content: [
					"main-display",
					"blank",
					["display-text",
						function() {return 'You have ' + formatWhole(player.q.energy)+' Quirk Energy ('+(tmp.nerdMode?('Base Gain: (timeInRun^(quirkLayers-1))'):'generated by Quirk Layers')+'), which has provided the below Quirk Improvements (next at '+format(tmp.q.impr.overallNextImpr)+')'},
							{}],
					"blank",
					"improvements"],
			},
		},
		freeLayers() {
			let l = new Decimal(0);
			if (player.m.unlocked) l = l.plus(tmp.m.buyables[13].effect);
			if (tmp.q.impr[43].unlocked) l = l.plus(improvementEffect("q", 43));
			if (player.i.buyables[11].gte(3)) l = l.plus(buyableEffect("s", 18));
			return l;
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Quirk Layers",
				costBase() {
					let base = new Decimal(2);
					if (hasUpgrade("q", 43)) base = base.sub(.25);
					if (hasChallenge("h", 42)) base = base.sub(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.2:.15);
					if (hasAchievement("a", 101)) base = base.sub(.2);
					if (hasUpgrade("q", 25) && player.i.buyables[12].gte(6)) base = base.root(upgradeEffect("q", 25));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.pow(.75);
					return base;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = this.costBase();
                    let cost = Decimal.pow(base, Decimal.pow(base, x).sub(1));
                    return cost.floor()
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = (tmp.nerdMode?("Cost Formula: "+format(data.costBase)+"^("+format(data.costBase)+"^x-1)"):("Cost: " + formatWhole(data.cost) + " Quirks")+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.q.freeLayers?(tmp.q.freeLayers.gt(0)?(" + "+format(tmp.q.freeLayers)):""):""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.q.points = player.q.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					if (!this.unlocked || !this.canAfford()) return;
					let base = this.costBase();
					let target = player.q.points.max(1).log(base).plus(1).log(base);
					target = target.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style: {'height':'222px'},
				autoed() { return hasMilestone("ba", 1) && player.q.auto },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Total Quirks",
				done() { return player.q.total.gte(2) || hasAchievement("a", 71) },
				effectDescription: "Keep Booster, Generator, Space, & Time milestones on all resets.",
			},
			1: {
				requirementDescription: "3 Total Quirks",
				done() { return player.q.total.gte(3) || hasAchievement("a", 71) },
				effectDescription: "You can buy max Time & Space, gain 100% of Enhance Point gain every second, and unlock Auto-Enhancers & Auto-Extra Time Capsules.",
				toggles: [["e", "auto"], ["t", "autoExt"]],
			},
			2: {
				requirementDescription: "4 Total Quirks",
				done() { return player.q.total.gte(4) || hasAchievement("a", 71) },
				effectDescription: "Keep Time, Enhance, & Space Upgrades on all resets, and keep Space Buildings on Quirk/Hindrance resets.",
			},
			3: {
				requirementDescription: "6 Total Quirks",
				done() { return player.q.total.gte(6) || hasAchievement("a", 71) },
				effectDescription: "Unlock Auto-Time Capsules & Auto-Space Energy.",
				toggles: [["t", "auto"], ["s", "auto"]],
			},
			4: {
				requirementDescription: "10 Total Quirks",
				done() { return player.q.total.gte(10) || hasAchievement("a", 71) },
				effectDescription: "Unlock Hindrances & Auto-Super Boosters.",
				toggles: [["sb", "auto"]],
			},
			5: {
				requirementDescription: "25 Total Quirks",
				done() { return player.q.total.gte(25) || hasAchievement("a", 71) },
				effectDescription: "Time, Space, & Super-Boosters reset nothing, and you can destroy individual Space Buildings.",
			},
			6: {
				unlocked() { return player.sg.unlocked },
				requirementDescription: "1e22 Total Quirks",
				done() { return player.q.total.gte(1e22) || hasAchievement("a", 71) },
				effectDescription: "Unlock Auto-Super Generators & Super-Generators reset nothing.",
				toggles: [["sg", "auto"]],
			},
			7: {
				unlocked() { return player.sg.unlocked },
				requirementDescription: "1e60 Total Quirks",
				done() { return player.q.total.gte(1e60) || hasAchievement("a", 71) },
				effectDescription: "You can buy max Super Boosters & Super Generators, and unlock Auto-Space Buildings.",
				toggles: [["s", "autoBld"]],
			},
		},
		upgrades: {
			rows: 4,
			cols: 5,
			11: {
				title: "Quirk Central",
				description: "Total Quirks multiply each Quirk Layer's production (boosted by Quirk Upgrades bought).",
				cost() { return player.q.time.plus(1).pow(1.2).times(100).pow(player.ma.current=="q"?this.id:1) },
				costFormula: "100*(time+1)^1.2",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasChallenge("h", 11)||((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("q"):false) },
				effect() { return player.q.total.plus(1).log10().plus(1).pow(player.q.upgrades.length).pow(improvementEffect("q", 11)) },
				effectDisplay() { return format(tmp.q.upgrades[11].effect)+"x" },
				formula: "(log(quirks+1)+1)^upgrades",
			},
			12: {
				title: "Back To Row 2",
				description: "Total Quirks multiply the Booster/Generator bases.",
				cost() { return player.q.time.plus(1).pow(1.4).times(500).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)*1.15):1) },
				costFormula: "500*(time+1)^1.4",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11) },
				effect() { return player.q.total.plus(1).log10().plus(1).pow(1.25).times(improvementEffect("q", 12)) },
				effectDisplay() { return format(tmp.q.upgrades[12].effect)+"x" },
				formula: "(log(x+1)+1)^1.25",
			},
			13: {
				title: "Skip the Skip the Second",
				description: "The Generator Power effect is raised to the power of 1.25.",
				cost() { return player.q.time.plus(1).pow(1.8).times(750).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)):1) },
				costFormula: "750*(time+1)^1.8",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11) },
			},
			14: {
				title: "Row 4 Synergy",
				description: "Hindrance Spirit & Quirks boost each other's gain.",
				cost() { return player.q.time.plus(1).pow(2.4).times(1e6).pow(player.ma.current=="q"?(this.id*8):1) },
				costFormula: "1e6*(time+1)^2.4",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 12)||hasUpgrade("q", 13) },
				effect() { 
					let q = player.q.points;
					let h = player.h.points;
					h = softcap("q14_h", h);
					q = softcap("q14_q", q);
					return {
						h: q.plus(1).cbrt().pow(improvementEffect("q", 13)),
						q: h.plus(1).root(4).pow(improvementEffect("q", 13)),
					};
				},
				effectDisplay() { return "H: "+format(tmp.q.upgrades[14].effect.h)+"x, Q: "+format(tmp.q.upgrades[14].effect.q)+"x" },
				formula() { return "H: "+(player.q.points.gte("1e1100")?"log(cbrt(Q+1))^366.67":"cbrt(Q+1)")+", Q: "+(player.h.points.gte("1e1000")?"log(H+1)^83.33":"(H+1)^0.25") },
			},
			15: {
				title: "Quirk Extension",
				description: "Quirks make the Quirk Energy effect softcap start later.",
				cost() { return Decimal.pow("e1e6", player.q.time.times(10).plus(1).log10().pow(2)).times("e1.5e7") },
				costFormula: "(e1,000,000^(log(time*10+1)^2))*e15,000,000",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "Req: 40 Achievements",
				pseudoCan() { return player.a.achievements.length>=40 },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.q.points.plus(1) },
				effectDisplay() { return format(tmp.q.upgrades[this.id].effect)+"x later" },
				formula: "x+1",
			},
			21: {
				title: "Quirk City",
				description: "Super Boosters multiply each Quirk Layer's production.",
				cost() { return player.q.time.plus(1).pow(3.2).times(1e8).pow(player.ma.current=="q"?(this.id*2.5):1) },
				costFormula: "1e8*(time+1)^3.2",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11)&&hasUpgrade("q", 13) },
				effect() { return Decimal.pow(1.25, player.sb.points).pow(improvementEffect("q", 21)) },
				effectDisplay() { return format(tmp.q.upgrades[21].effect)+"x" },
				formula: "1.25^x",
			},
			22: {
				title: "Infinite Possibilities",
				description: "Total Quirks provide free Extra Time Capsules, Enhancers, & Space Buildings.",
				cost() { return player.q.time.plus(1).pow(4.2).times(2e11).pow(player.ma.current=="q"?(this.id*4):1) },
				costFormula: "2e11*(time+1)^4.2",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 12)&&hasUpgrade("q", 14) },
				effect() { return player.q.total.plus(1).log10().sqrt().times(improvementEffect("q", 22)).floor() },
				effectDisplay() { return "+"+formatWhole(tmp.q.upgrades[22].effect) },
				formula: "floor(sqrt(log(x+1)))",
			},
			23: {
				title: "The Waiting Game",
				description: "The Quirk Energy effect is cubed.",
				cost() { return player.q.time.plus(1).pow(5.4).times(5e19).pow(player.ma.current=="q"?this.id:1) },
				costFormula: "5e19*(time+1)^5.4",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 13)&&hasUpgrade("q", 21) },
			},
			24: {
				title: "Exponential Madness",
				description: "The first Time Energy effect & the first Enhancer effect are raised ^7.5.",
				cost() { return player.q.time.plus(1).pow(6.8).times(1e24).pow(player.ma.current=="q"?(this.id*2):1) },
				costFormula: "1e24*(time+1)^6.8",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 14)&&hasUpgrade("q", 22) },
			},
			25: {
				title: "Advanced Onion",
				description: "Nebulaic Bricks reduce the Quirk Layer cost base.",
				cost() { return Decimal.pow("e3e6", player.q.time.times(4).plus(1).log10().pow(2)).times("e2e7") },
				costFormula: "(e3,000,000^(log(time*4+1)^2))*e20,000,000",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "Req: 1e200 Honour.",
				pseudoCan() { return player.hn.points.gte(1e200) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.nb.plus(1).log10().plus(1).pow(3) },
				effectDisplay() { return "brought to the "+format(upgradeEffect("q", 25))+"th root" },
				formula: "(log(x+1)+1)^3",
			},
			31: {
				title: "Scale Softening",
				description: "Post-12 scaling for static layers in rows 2-3 starts later based on your Quirk Layers.",
				cost() { return player.q.time.plus(1).pow(8.4).times(1e48).pow(player.ma.current=="q"?(this.id/1.2):1) },
				costFormula: "1e48*(time+1)^8.4",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 21)&&hasUpgrade("q", 23) },
				effect() { return player.q.buyables[11].sqrt().times(0.4).times(improvementEffect("q", 31)) },
				effectDisplay() { return "+"+format(tmp.q.upgrades[31].effect) },
				formula: "sqrt(x)*0.4",
			},
			32: {
				title: "Quinary Superspace",
				description: "The Quinary Space Building's effect is twice as strong.",
				cost() { return player.q.time.plus(1).pow(10).times(1e58).pow(player.ma.current=="q"?(this.id/1.5):1) },
				costFormula: "1e58*(time+1)^10",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 22)&&hasUpgrade("q", 24) },
			},
			33: {
				title: "Generated Progression",
				description: "Unlock Super Generators.",
				cost() { return player.q.time.plus(1).pow(12).times(1e81).pow(player.ma.current=="q"?(this.id/1.8):1) },
				costFormula: "1e81*(time+1)^12",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 23)&&hasUpgrade("q", 31) },
			},
			34: {
				title: "Booster Madness",
				description: "Anything that adds to the Booster base also multiplies it at a reduced rate.",
				cost() { return player.q.time.plus(1).pow(15).times(2.5e94).pow(player.ma.current=="q"?(this.id/1.8):1) },
				costFormula: "2.5e94*(time+1)^15",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 24)&&hasUpgrade("q", 32) },
				effect() { return tmp.b.addToBase.plus(1).root(2.5).times(improvementEffect("q", 32)) },
				effectDisplay() { return format(tmp.q.upgrades[34].effect)+"x" },
				formula: "(x+1)^0.4",
			},
			35: {
				title: "Millennial Abilities",
				description: "Hyperspatial Bricks make Quirk Improvements scale slower.",
				cost() { return Decimal.pow("e2e6", player.q.time.times(4).plus(1).log10().pow(3)).times("e3.5e7") },
				costFormula: "(e2,000,000^(log(time*4+1)^3))*e35,000,000",
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "Req: e5,000,000 Quirk Energy without any bought Quirk Layers (After a Row 5 reset).",
				pseudoCan() { return player.q.energy.gte("e5e6") && player.q.buyables[11].eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.hb.sqrt().div(25).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1).plus(1) },
				effectDisplay() { return format(upgradeEffect("q", 35).sub(1).times(100))+"% slower" },
				formula: "sqrt(x)*4%",
			},
			41: {
				title: "Quirkier",
				description: "Unlock Quirk Improvements.",
				cost() { return new Decimal((player.ma.current=="q")?"1e2325":1e125) },
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 33) && hasUpgrade("q", 34) },
			},
			42: {
				title: "Improvement Boost",
				description: "Unlock 3 more Quirk Improvements.",
				cost() { return new Decimal((player.ma.current=="q")?"1e3700":1e150) },
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 41) },
			},
			43: {
				title: "More Layers",
				description: "Quirk Layers cost scale 25% slower.",
				cost() { return new Decimal((player.ma.current=="q")?"1e5340":1e175) },
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 42) },
			},
			44: {
				title: "Improvements Galore",
				description: "Unlock another 3 Quirk Improvements.",
				cost() { return new Decimal((player.ma.current=="q")?"1e8725":1e290) },
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 43) },
			},
			45: {
				title: "Anti-Hindrance",
				description: "The Hindrance Spirit effect is raised to the power of 100 (after softcaps), and gain 200x more Nebula Energy.",
				cost: new Decimal("e55555555"),
				currencyDisplayName: "quirk energy",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "Req: e1.7e10 Prestige Points.",
				pseudoCan() { return player.p.points.gte("e1.7e10") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
		},
		impr: {
			scaleSlow() {
				let slow = new Decimal(1);
				if (tmp.ps.impr[22].unlocked) slow = slow.times(tmp.ps.impr[22].effect);
				if (hasUpgrade("q", 35) && player.i.buyables[12].gte(6)) slow = slow.times(upgradeEffect("q", 35));
				return slow;
			},
			baseReq() { 
				let req = new Decimal(1e128);
				if (player.ps.unlocked) req = req.div(tmp.ps.soulEff);
				return req;
			},
			amount() { 
				let amt = player.q.energy.div(this.baseReq()).plus(1).log10().div(2).root(layers.q.impr.scaleSlow().pow(-1).plus(1)).max(0);
				if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
				return amt.floor();
			},
			overallNextImpr() { 
				let impr = tmp.q.impr.amount.plus(1);
				if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq()) 
			},
			nextAt(id=11) { 
				let impr = getImprovements("q", id).times(tmp.q.impr.activeRows*tmp.q.impr.activeCols).add(tmp.q.impr[id].num);
				if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq());
			},
			free() {
				let free = new Decimal(0);
				if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('q'):false) free = free.plus(Decimal.div(player.s.buyables[20]||0, 4));
				return free.floor();
			},
			resName: "quirk energy",
			rows: 4,
			cols: 3,
			activeRows: 3,
			activeCols: 3,
			11: {
				num: 1,
				title: "Central Improvement",
				description: "<b>Quirk Central</b> is stronger.",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.1, getImprovements("q", 11).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[11].effect) },
				formula: "1+0.1*x",
			},
			12: {
				num: 2,
				title: "Secondary Improvement",
				description: "<b>Back to Row 2</b> is stronger.",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.05, getImprovements("q", 12).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[12].effect)+"x" },
				formula: "1+0.05*x",
			},
			13: {
				num: 3,
				title: "Level 4 Improvement",
				description: "<b>Row 4 Synergy</b> is stronger.",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.25, getImprovements("q", 13).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[13].effect) },
				formula: "1+0.25*x",
			},
			21: {
				num: 4,
				title: "Developmental Improvement",
				description: "<b>Quirk City</b> is stronger.",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.mul(1.5, getImprovements("q", 21).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[21].effect) },
				formula: "1+1.5*x",
			},
			22: {
				num: 5,
				title: "Transfinite Improvement",
				description: "<b>Infinite Possibilities</b> is stronger.",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.mul(0.2, getImprovements("q", 22).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[22].effect)+"x" },
				formula: "1+0.2*x",
			},
			23: {
				num: 6,
				title: "Energy Improvement",
				description: "The Quirk Energy effect is stronger.",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.pow(1e25, Decimal.pow(getImprovements("q", 23).plus(tmp.q.impr.free), 1.5)) },
				effectDisplay() { return format(tmp.q.impr[23].effect)+"x" },
				formula: "1e25^(x^1.5)",
			},
			31: {
				num: 7,
				title: "Scale Improvement",
				description: "<b>Scale Softening</b> is stronger.",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.mul(0.5, getImprovements("q", 31).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[31].effect)+"x" },
				formula: "1+0.5*x",
			},
			32: {
				num: 8,
				title: "Booster Improvement",
				description: "<b>Booster Madness</b> is stronger.",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.mul(0.2, getImprovements("q", 32).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[32].effect)+"x" },
				formula: "1+0.2*x",
			},
			33: {
				num: 9,
				title: "Quirk Improvement",
				description: "Quirk gain is stronger.",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.pow(1e8, Decimal.pow(getImprovements("q", 33).plus(tmp.q.impr.free), 1.2)) },
				effectDisplay() { return format(tmp.q.impr[33].effect)+"x" },
				formula: "1e8^(x^1.2)",
			},
			41: {
				num: 271,
				title: "Solar Improvement",
				description: "Solar Energy gain is stronger.",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=1 },
				effect() { return Decimal.pow("1e400", Decimal.pow(getImprovements("q", 41).plus(tmp.q.impr.free), 0.9)) },
				effectDisplay() { return format(tmp.q.impr[41].effect)+"x" },
				formula: "1e400^(x^0.9)",
			},
			42: {
				num: 281,
				title: "Subspatial Improvement",
				description: "The Subspace base is stronger.",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=2 },
				effect() { return Decimal.pow(10, Decimal.pow(getImprovements("q", 42).plus(tmp.q.impr.free), 0.75)) },
				effectDisplay() { return format(tmp.q.impr[42].effect)+"x" },
				formula: "10^(x^0.75)",
			},
			43: {
				num: 301,
				title: "Layer Improvement",
				description: "Add free Quirk Layers.",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=3 },
				effect() { return Decimal.mul(Decimal.pow(getImprovements("q", 43).plus(tmp.q.impr.free), 0.8), 1.25) },
				effectDisplay() { return "+"+format(tmp.q.impr[43].effect) },
				formula: "1.25*(x^0.8)",
			},
		},
})

addLayer("o", {
	name: "solarity", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			energy: new Decimal(0),
			first: 0,
        }},
		increaseUnlockOrder: ["ss"],
		roundUpCost: true,
        color: "#ffcd00",
		nodeStyle() {return {
			"background": (((player.o.unlocked||canReset("o"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer))))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" ,
        }},
		componentStyles: {
			"prestige-button"() {return { "background": (canReset("o"))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" }},
		},
        requires() { 
			let req = new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?16:14).sub(tmp.o.solEnEff);
			if (hasUpgrade("ba", 23)) req = req.div(tmp.ba.posBuff);
			return req;
		},
        resource: "solarity", // Name of prestige currency
        baseResource: "super boosters", // Name of resource prestige is based on
        baseAmount() {return player.sb.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
			let exp = new Decimal(10);
			if (hasUpgrade("p", 34)) exp = exp.times(upgradeEffect("p", 34));
			if (hasUpgrade("hn", 25)) exp = exp.times(upgradeEffect("hn", 25));
			if (player.n.buyables[11].gte(4)) exp = exp.times(buyableEffect("o", 32));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(player.sb.points.times(0.5/100).plus(1))
			return exp;
		}, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = buyableEffect("o", 11);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1);
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "o", description: "Press O to Solarity Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return (player.sb.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked },
        branches: ["sb", "t"],
		effect() { 
			if (!unl(this.layer)) return new Decimal(0);
			let sol = player.o.points;
			sol = softcap("sol_eff", sol);
			let eff = sol.plus(1).log10();
			let cap = 0.1;
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cap = 0.15;
			if (eff.gt(10)) eff = eff.log10().times(3).plus(7)
			return eff.div(100).min(cap);
		},
		effect2() { return player.o.points.div(1e20).plus(1).sqrt().pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
		solEnGain() { 
			let gain = player.t.energy.max(1).pow(tmp.o.effect).times(tmp.o.effect2).sub(1);
			if (player.m.unlocked) gain = gain.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (tmp.q.impr[41].unlocked) gain = gain.times(improvementEffect("q", 41));
			return gain;
		},
		solEnEff() { return Decimal.sub(4, Decimal.div(4, player.o.energy.plus(1).log10().plus(1))) },
		solEnEff2() { return player.o.energy.plus(1).pow(2) },
		effectDescription() { return "which are generating "+(tmp.nerdMode?("(timeEnergy^"+format(tmp.o.effect)+(tmp.o.effect.gt(1.01)?("*"+format(tmp.o.effect2)):"")+"-1)"):format(tmp.o.solEnGain))+" Solar Energy every second." },
		update(diff) {
			player.o.energy = player.o.energy.plus(tmp.o.solEnGain.times(diff));
			if (hasMilestone("m", 0) && player.ma.current!="o") {
				for (let i in tmp.o.buyables) if (i!="rows" && i!="cols") if (tmp.o.buyables[i].unlocked) player.o.buyables[i] = player.o.buyables[i].plus(tmp.o.buyables[i].gain.times(diff));
			}
		},
		passiveGeneration() { return player.ma.current=="o"?0:(hasMilestone("m", 0)?1:(hasMilestone("o", 0)?0.05:0)) },
		solPow() {
			let pow = new Decimal(1);
			if (hasUpgrade("ss", 33)) pow = pow.plus(upgradeEffect("ss", 33));
			if (hasUpgrade("ss", 41)) pow = pow.plus(buyableEffect("o", 21));
			if (hasUpgrade("ba", 11)) pow = pow.plus(upgradeEffect("ba", 11));
			if (hasUpgrade("hn", 55)) pow = pow.plus(upgradeEffect("hn", 55));
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			if (tmp.ps.impr[11].unlocked) pow = pow.times(tmp.ps.impr[11].effect);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.o.points.plus(1).log10().div(5));
			return softcap("solPow", pow);
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.o.energy) + ' Solar Energy, which is reducing the Solarity requirement by '+format(tmp.o.solEnEff)+(tmp.nerdMode?(" (4-4/(log(x+1)+1))"):"")+' and multiplies the Time Energy limit by '+format(tmp.o.solEnEff2)+'.'+(tmp.nerdMode?(" (x+1)^2"):"")},
					{}],
			"blank",
			"milestones",
			"blank",
			["display-text",
				function() { return "<b>Solar Power: "+format(tmp.o.solPow.times(100))+"%</b><br>" },
					{}],
			"buyables",
			"blank"
		],
		multiplyBuyables() {
			let mult = tmp.n.dustEffs.orange;
			return mult;
		},
		buyableGainExp() {
			let exp = new Decimal(1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(2.6);
			return exp;
		},
		buyables: {
			rows: 3,
			cols: 3,
			11: {
				title: "Solar Cores",
				gain() { return player.o.points.div(2).root(1.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { 
					let amt = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables)
					amt = softcap("solCores2", softcap("solCores", amt));
					return Decimal.pow(hasUpgrade("ss", 22)?(amt.plus(1).pow(tmp.o.solPow).cbrt()):(amt.plus(1).pow(tmp.o.solPow).log10().plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1)
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let x = player[this.layer].buyables[this.id].gte(5e4)?"10^(sqrt(log(x)*log(5e4)))":"x"
                    let display = ("Sacrifice all of your Solarity for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Solar Cores\n"+
					"Req: 2 Solarity\n"+
					"Amount: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("Formula: "+(hasUpgrade("ss", 22)?"cbrt("+x+"+1)":"log("+x+"+1)+1")+""):("Effect: Multiplies Solarity gain by "+format(tmp[this.layer].buyables[this.id].effect)))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(2) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px'},
				autoed() { return hasMilestone("m", 0) },
			},
			12: {
				title: "Tachoclinal Plasma",
				gain() { return player.o.points.div(100).times(player.o.energy.div(2500)).root(3.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { return Decimal.pow(hasUpgrade("p", 24)?Decimal.pow(10, player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).log10().cbrt()):(player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().times(10).plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity & Solar Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Tachoclinal Plasma\n"+
					"Req: 100 Solarity & 2,500 Solar Energy\n"+
					"Amount: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("Formula: "+(hasUpgrade("p", 24)?"10^cbrt(log(x+1))":"log(log(x+1)+1)*10+1")):("Effect: Multiplies the Super Booster base and each Quirk Layer by "+format(tmp[this.layer].buyables[this.id].effect)))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(100)&&player.o.energy.gte(2500) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			13: {
				title: "Convectional Energy",
				gain() { return player.o.points.div(1e3).times(player.o.energy.div(2e5)).times(player.ss.subspace.div(10)).root(6.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).pow(2.5).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?27.5:1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, & Subspace for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Convectional Energy\n"+
					"Req: 1,000 Solarity, 200,000 Solar Energy, & 10 Subspace\n"+
					"Amount: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("Formula: (log(x+1)+1)^2.5"):("Effect: Multiplies the Time Capsule base and Subspace gain by "+format(tmp[this.layer].buyables[this.id].effect)))
					return display;
                },
                unlocked() { return player[this.layer].unlocked&&player.ss.unlocked }, 
                canAfford() { return player.o.points.gte(1e3)&&player.o.energy.gte(2e5)&&player.ss.subspace.gte(10) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.ss.subspace = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			21: {
				title: "Coronal Waves",
				gain() { return player.o.points.div(1e5).root(5).times(player.o.energy.div(1e30).root(30)).times(player.ss.subspace.div(1e8).root(8)).times(player.q.energy.div("1e675").root(675)).pow(tmp.o.buyableGainExp).floor() },
				effect() { 
					let eff = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10();
					eff = softcap("corona", eff);
					if (hasUpgrade("hn", 24)) eff = eff.times(2);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(1.4);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Sacrifice all of your Solarity, Solar Energy, Subspace, & Quirk Energy for "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" Coronal Waves\n"+
					"Req: 100,000 Solarity, 1e30 Solar Energy, 500,000,000 Subspace, & 1e675 Quirk Energy\n"+
					"Amount: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("Formula: log(log(x+1)+1)"):("Effect: +"+format(tmp[this.layer].buyables[this.id].effect)+" to Subspace base & +"+format(tmp[this.layer].buyables[this.id].effect.times(100))+"% Solar Power"))
					return display;
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("ss", 41) }, 
                canAfford() { return player.o.points.gte(1e5)&&player.o.energy.gte(1e30)&&player.ss.subspace.gte(1e8)&&player.q.energy.gte("1e675") },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.ss.subspace = new Decimal(0);
					player.q.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			22: {
				title: "Noval Remnants",
				gain() { return player.o.buyables[11].div(1e150).pow(3).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().root(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Cores for "+formatWhole(data.gain)+" Noval Remnants\n"+
					"Req: 1e150 Solar Cores\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("Formula: (log(x+1)^0.1)+1"):("Effect: Multiply Honour gain (unaffected by softcap) and Purple, Blue, & Orange Dust gain by "+format(data.effect)+"x")))
				},
				unlocked() { return player.n.buyables[11].gte(1) },
				canAfford() { return player.o.buyables[11].gte(1e150) },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			23: {
				title: "Nuclear Forges",
				gain() { return player.o.buyables[11].div(1e175).times(player.o.energy.div("1e2500").root(10)).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(2.5).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Cores & Solar Energy for "+formatWhole(data.gain)+" Nuclear Forges\n"+
					"Req: 1e175 Solar Cores & 1e2,500 Solar Energy\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("Formula: (log(log(x+1)+1)^0.4)*100"):("Effect: Space Buildings are "+format(data.effect.times(100))+"% stronger")))
				},
				unlocked() { return player.n.buyables[11].gte(2) },
				canAfford() { return player.o.buyables[11].gte(1e175)&&player.o.energy.gte("1e2500") },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			31: {
				title: "Blueshifted Flares",
				gain() { return player.o.points.div("1e400").pow(10).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(5).div(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solarity for "+formatWhole(data.gain)+" Blueshifted Flares\n"+
					"Req: 1e400 Solarity\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("Formula: (log(log(x+1)+1)^0.2)*10"):("Effect: Spells are "+format(data.effect.times(100))+"% stronger")))
				},
				unlocked() { return player.n.buyables[11].gte(3) },
				canAfford() { return player.o.points.gte("1e400") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			32: {
				title: "Combustion Gas",
				gain() { return player.o.energy.div("1e200000").root(100).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(1.6).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solar Energy for "+formatWhole(data.gain)+" Combustion Gas\n"+
					"Req: e200,000 Solar Energy\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("Formula: log(log(log(x+1)+1)+1)/1.6+1"):("Effect: Multiply the Solarity gain exponent by "+format(data.effect)+".")))
				},
				unlocked() { return player.n.buyables[11].gte(4) },
				canAfford() { return player.o.energy.gte("1e200000") },
				buy() {
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			33: {
				title: "Thermonuclear Reactants",
				gain() { return player.o.points.div("1e500").pow(10).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(3).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1);
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("Sacrifice all of your Solarity for "+formatWhole(data.gain)+" Thermonuclear Reactants\n"+
					"Req: 1e500 Solarity\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("Formula: log(log(log(x+1)+1)+1)/3"):("Effect: Add "+format(data.effect.times(100))+"% to Solar Power, Space Building Power, & Hyper Building Power.")))
				},
				unlocked() { return player.n.buyables[11].gte(5) },
				canAfford() { return player.o.points.gte("1e750") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "50,000 Total Solarity",
				done() { return player.o.total.gte(5e4) || hasAchievement("a", 71) },
				effectDescription: "Gain 5% of Solarity gain every second.",
			},
		},
})

addLayer("ss", {
        name: "subspace", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			subspace: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#e8ffff",
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?30:28) }, // Can be a function that takes requirement increases into account
		roundUpCost: true,
        resource: "subspace energy", // Name of prestige currency
        baseResource: "space energy", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.07:1.1) }, // Prestige currency exponent
		base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.15) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("hn", 3) },
		effBase() {
			let base = new Decimal(2);
			if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
			if (hasUpgrade("ss", 41)) base = base.plus(buyableEffect("o", 21));
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (player.ba.unlocked) base = base.times(tmp.ba.posBuff);
			if (tmp.q.impr[42].unlocked) base = base.times(improvementEffect("q", 42));
			if (hasUpgrade("hn", 35)) base = base.times(upgradeEffect("hn", 35));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.times(Decimal.pow(1e10, player.ss.points));
			
			if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) base = base.pow(1.5);
			return base;
		},
		effect() { 
			if (!unl(this.layer)) return new Decimal(1);
			let gain = Decimal.pow(tmp.ss.effBase, player.ss.points).sub(1);
			if (hasUpgrade("ss", 13)) gain = gain.times(upgradeEffect("ss", 13));
			if (player.o.unlocked) gain = gain.times(buyableEffect("o", 13));
			if (player.m.unlocked) gain = gain.times(tmp.m.hexEff);
			return gain;
		},
		autoPrestige() { return player.ss.auto && hasMilestone("ba", 2) && player.ma.current!="ss" },
		effectDescription() {
			return "which are generating "+format(tmp.ss.effect)+" Subspace/sec"+(tmp.nerdMode?("\n\("+format(tmp.ss.effBase)+"x each)"):"")
		},
		update(diff) {
			if (player.ss.unlocked) player.ss.subspace = player.ss.subspace.plus(tmp.ss.effect.times(diff));
		},
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "S", description: "Press Shift+S to Subspace Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("ba", 2) },
		effPow() {
			let pow = new Decimal(1);
			if (hasUpgrade("ss", 12)) pow = pow.times(upgradeEffect("ss", 12));
			if (hasUpgrade("ba", 12)) pow = pow.times(upgradeEffect("ba", 12).plus(1));
			return pow;
		},
		eff1() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().pow(3).times(100).floor() },
		eff2() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().plus(1).log10().div(6) },
		eff3() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3e3:1e3) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["display-text",
				function() {return 'You have ' + format(player.ss.subspace) + ' Subspace, which is providing '+formatWhole(tmp.ss.eff1)+' extra Space'+(tmp.nerdMode?(" ((log(x+1)^3)*"+format(tmp.ss.effPow.pow(3).times(100))+")"):"")+', makes Space Buildings '+format(tmp.ss.eff2.times(100))+'% stronger'+(tmp.nerdMode?(" (log(log(x+1)*"+format(tmp.ss.effPow)+"+1)/6)"):"")+', and cheapens Space Buildings by '+format(tmp.ss.eff3)+'x.'+(tmp.nerdMode?(" ((x+1)^"+format(tmp.ss.effPow.times(1e3))+")"):"")},
					{}],
			"blank",
			"upgrades",
		],
        increaseUnlockOrder: ["o"],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("ba", 2)) keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return (player.s.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked},
        branches: ["s"],
		upgrades: {
			rows: 4,
			cols: 3,
			11: {
				title: "Spatial Awakening",
				description: "The Space Energy cost base is reduced (1e15 -> 1e10).",
				cost() { return new Decimal((player.ma.current=="ss")?"1e14326":180) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return player.ss.unlocked },
			},
			12: {
				title: "Subspatial Awakening",
				description: "Subspace Energy boosts all Subspace effects.",
				cost() { return new Decimal((player.ma.current=="ss")?20:2) },
				unlocked() { return hasUpgrade("ss", 11) },
				effect() { 
					let eff = player.ss.points.div(2.5).plus(1).sqrt();
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && eff.gte(2)) eff = eff.sub(1).times(100).pow(3).div(1e6).plus(1);
					return eff;
				},
				effectDisplay() { return format(tmp.ss.upgrades[12].effect.sub(1).times(100))+"% stronger" },
				formula: "sqrt(x/2.5)*100",
			},
			13: {
				title: "Emissary of Smash",
				description: "Quirks boost Subspace gain.",
				cost() { return new Decimal((player.ma.current=="ss")?"2e14382":1e3) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 11) },
				effect() { return player.q.points.plus(1).log10().div(10).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?400:1) },
				effectDisplay() { return format(tmp.ss.upgrades[13].effect)+"x" },
				formula: "log(x+1)/10+1",
			},
			21: {
				title: "Illegal Upgrade",
				description: "Super Boosters & Super Generators are 20% cheaper.",
				cost() { return new Decimal((player.ma.current=="ss")?"1e16708":1e4) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 13) },
			},
			22: {
				title: "Underneath The Sun",
				description: "<b>Solar Cores</b> use a better effect formula.",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17768":4e5) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
			},
			23: {
				title: "Anti-Timeless",
				description: "<b>Timeless</b>'s effect increases over time instead of decreasing.",
				cost() { return new Decimal((player.ma.current=="ss")?"5e17768":1e6) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
			},
			31: {
				title: "No More Progress",
				description: "Unspent Space provides free Space Buildings.",
				cost() { return new Decimal((player.ma.current=="ss")?1626:42) },
				currencyDisplayName: "space energy",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 22)||hasUpgrade("ss", 23) },
				effect() { return tmp.s.space.plus(1).cbrt().sub(1).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1).floor() },
				effectDisplay() { return "+"+formatWhole(tmp.ss.upgrades[31].effect) },
				formula: "cbrt(x+1)-1",
			},
			32: {
				title: "Beyond Infinity",
				description: "Add to the Subspace Energy & Super-Generator bases based on your Quirk Layers.",
				cost() { return new Decimal((player.ma.current=="ss")?1628:43) },
				currencyDisplayName: "space energy",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 31) },
				effect() { return player.q.buyables[11].sqrt().div(1.25) },
				effectDisplay() { return "+"+format(tmp.ss.upgrades[32].effect) },
				formula: "sqrt(x)/1.25",
			},
			33: {
				title: "Timeless Solarity",
				description: "<b>Timeless</b>'s effect is now based on your total time playing this game, and Solar Cores boost Solar Power.",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17796":2.5e7) },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 23)&&hasUpgrade("ss", 31) },
				effect() { return player.o.buyables[11].plus(1).log10().div(10) },
				effectDisplay() { return "+"+format(tmp.ss.upgrades[33].effect.times(100))+"%" },
				formula: "log(x+1)*10",
				style: {"font-size": "9px"},
			},
			41: {
				title: "More Sun",
				description: "Unlock Coronal Waves.",
				cost() { return new Decimal((player.ma.current=="ss")?1628:46) },
				currencyDisplayName: "space energy",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 33) },
			},
			42: {
				title: "Sub-Subspace",
				description: "Space Buildings are 100% stronger (additive).",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17799":"1e936") },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasChallenge("h", 42) },
			},
			43: {
				title: "Challenging Speedup",
				endpoint() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e11":"e1e6") },
				description() { return "When below "+format(tmp.ss.upgrades[43].endpoint)+", Point gain is raised to the power of 1.1. Otherwise, it is raised to the power of 1.01." },
				cost() { return new Decimal((player.ma.current=="ss")?"1e17800":"1e990") },
				currencyDisplayName: "subspace",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasChallenge("h", 42) },
				style: {"font-size": "9px"},
			},
		},
})

addLayer("m", {
		name: "magic", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spellTimes: {
				11: new Decimal(0),
				12: new Decimal(0),
				13: new Decimal(0),
				14: new Decimal(0),
				15: new Decimal(0),
				16: new Decimal(0),
			},
			spellInputs: {
				11: new Decimal(1),
				12: new Decimal(1),
				13: new Decimal(1),
				14: new Decimal(1),
				15: new Decimal(1),
				16: new Decimal(1),
			},
			spellInput: "1",
			distrAll: false,
			hexes: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#eb34c0",
        requires: new Decimal(1e285), // Can be a function that takes requirement increases into account
        resource: "magic", // Name of prestige currency
        baseResource: "hindrance spirit", // Name of resource prestige is based on
        baseAmount() {return player.h.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0085:0.007) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
            return mult.times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.purpleBlue:new Decimal(1));
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "m", description: "Press M to Magic Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("hn", 0)) keep.push("milestones")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="m")?1:0 },
        layerShown(){return player.h.unlocked&&player.o.unlocked },
        branches: ["o","h","q"],
		spellTime() { 
			let time = new Decimal(60);
			if (hasMilestone("m", 3)) time = time.times(tmp.m.spellInputAmt.div(100).plus(1).log10().plus(1));
			return time;
		},
		spellPower() { 
			if (!unl(this.layer)) return new Decimal(0);
			let power = new Decimal(1);
			if (tmp.ps.impr[21].unlocked) power = power.plus(tmp.ps.impr[21].effect.sub(1));
			if (player.n.buyables[11].gte(3)) power = power.plus(buyableEffect("o", 31));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) power = power.plus(.5);
			return power;
		},
		hexGain() { 
			let gain = new Decimal(1);
			if (tmp.ps.impr[12].unlocked) gain = gain.times(tmp.ps.impr[12].effect);
			return gain;
		},
		mainHexEff() { return player.m.hexes.times(2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:10) },
		hexEff() { return softcap("hex", tmp.m.mainHexEff) },
		update(diff) {
			if (!player.m.unlocked) return;
			if (player.m.auto && hasMilestone("hn", 2) && player.m.distrAll && player.ma.current!="m") layers.m.castAllSpells(true, diff);
			for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
				if (tmp.m.buyables[i].unlocked && player.m.auto && hasMilestone("hn", 2) && !player.m.distrAll && player.ma.current!="m") {
					player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(player.m.spellInputs[i]).times(diff)));
					player.m.spellTimes[i] = tmp.m.spellTime;
				} else if (player.m.spellTimes[i].gt(0)) player.m.spellTimes[i] = player.m.spellTimes[i].sub(diff).max(0);
			}
		},
		spellInputAmt() {
			if (hasMilestone("m", 3) && player.m.spellInput!="1") {
				let factor = new Decimal(player.m.spellInput.split("%")[0]).div(100);
				return player.m.points.times(factor.max(0.01)).floor().max(1);
			} else return new Decimal(1);
		},
		hexEffDesc() {
			let nerd = (tmp.nerdMode?" (2*x+1)^5":"")
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) return "which are multiplying Hindrance Spirit, Quirk, & Solar Energy gain by "+format(tmp.m.mainHexEff)+", and are multiplying Subspace gain by "+format(tmp.m.hexEff)+nerd
			else return "which are multiplying Hindrance Spirit, Quirk, Solar Energy, & Subspace gain by "+format(tmp.m.hexEff)+nerd
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			"milestones",
			"blank",
			["display-text", function() { return tmp.m.spellPower.eq(1)?"":("Spell Power: "+format(tmp.m.spellPower.times(100))+"%") }], "blank",
			"buyables",
			["display-text",
				function() {return "You have "+formatWhole(player.m.hexes)+" Hexes, "+tmp.m.hexEffDesc },
					{}],
		],
		spellsUnlocked() { return 3+player.i.buyables[13].toNumber() },
		castAllSpells(noSpend=false, diff=1) {
			let cost = tmp.m.spellInputAmt;
			let input = tmp.m.spellInputAmt.div(tmp.m.spellsUnlocked);
			for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
				player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(input):input);
				player.m.spellTimes[i] = tmp.m.spellTime;
			}
			if (!noSpend) player.m.points = player.m.points.sub(cost)
            player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost).times(diff)))
		},
		buyables: {
			rows: 1,
			cols: 6,
			11: {
				title: "Booster Launch",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.div(2).plus(1)
					if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
					eff = softcap("spell1", eff);
					return eff.div(1.5).max(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: Booster base ^1.05, x" + format(data.effect)+"\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: ((log(inserted+1)+1)/2+1)/1.5"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			12: {
				title: "Time Warp",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                  return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.div(5).plus(1)
					if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
					eff = softcap("spell2", eff);
					return eff.div(1.2).max(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: Time Capsule base ^1.1, x" + format(data.effect)+"\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: ((log(inserted+1)+1)/5+1)/1.2"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			13: {
				title: "Quirk Amplification",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.times(1.25)
					eff = softcap("spell3", eff);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: +" + format(data.effect)+" Free Quirk Layers\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: (log(inserted+1)+1)*1.25"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			14: {
				title: "Spatial Compression",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().div(500).plus(1).sqrt()));
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: Space Building costs scale " + format(data.effect.times(100))+"% slower\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: 1-1/sqrt(log(log(inserted+1)+1)/500+1)"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(1) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			15: {
				title: "Obstacle Override",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().times(140).plus(1).sqrt()));
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: Repeatable Hindrance requirements scale " + format(data.effect.times(100))+"% slower\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: 1-1/sqrt(log(log(inserted+1)+1)*140+1)"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(2) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			16: {
				title: "Generator Augmentation",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.plus(1).pow(400);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "Effect: Multiply the Super Generator base by " + format(data.effect)+"\n\
					Time: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("Formula: (log(inserted+1)+1)^400"):("To Insert: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(3) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Total Magic",
				done() { return player.m.total.gte(2) || (hasMilestone("hn", 0)) },
				effectDescription: "Automatically gain 100% of Solarity gain & Solarity buyables every second.",
			},
			1: {
				requirementDescription: "3 Total Magic",
				done() { return player.m.total.gte(3) || (hasMilestone("hn", 0)) },
				effectDescription: 'Keep all Hindrance completions on all resets.',
			},
			2: {
				requirementDescription: "10 Total Magic",
				done() { return player.m.total.gte(10) || (hasMilestone("hn", 0)) },
				effectDescription: "Automatically gain 100% of Hindrance Spirit gain every second.",
			},
			3: {
				requirementDescription: "5,000 Total Magic",
				done() { return player.m.total.gte(5e3) || (hasMilestone("hn", 0)) },
				effectDescription: "You can insert more Magic into your Spells to make them stronger & last longer.",
				toggles: [{
					layer: "m",
					varName: "spellInput",
					options: ["1","10%","50%","100%"],
				}],
			},
			4: {
				unlocked() { return hasMilestone("m", 3) },
				requirementDescription: "1e10 Total Magic",
				done() { return player.m.total.gte(1e10) || (hasMilestone("hn", 0)) },
				effectDescription: "When casting a Spell, all Spells are casted equally (magic is distributed).",
				toggles: [["m", "distrAll"]],
			},
		},
})

addLayer("ba", {
		name: "balance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "BA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			allotted: 0.5,
			pos: new Decimal(0),
			neg: new Decimal(0),
			keepPosNeg: false,
			first: 0,
        }},
        color: "#fced9f",
        requires: new Decimal("1e365"), // Can be a function that takes requirement increases into account
        resource: "balance energy", // Name of prestige currency
        baseResource: "quirks", // Name of resource prestige is based on
        baseAmount() {return player.q.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0125:0.005) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
			if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 22));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "a", description: "Press A to Balance Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (!(hasMilestone("ba", 4) && player.ba.keepPosNeg)) {
				player.ba.pos = new Decimal(0);
				player.ba.neg = new Decimal(0);
			}
			if (hasMilestone("hn", 0)) keep.push("milestones")
			if (hasMilestone("hn", 3)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.q.unlocked&&player.ss.unlocked },
        branches: ["q","ss"],
		update(diff) {
			if (!player.ba.unlocked) return;
			player.ba.pos = player.ba.pos.plus(tmp.ba.posGain.times(diff));
			player.ba.neg = player.ba.neg.plus(tmp.ba.negGain.times(diff));
		},
		passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="ba")?1:0 },
		dirBase() { return player.ba.points.times(10) },
		posGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).pos);
			return mult;
		},
		posGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:player.ba.allotted).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(player.ba.allotted)).times(tmp.ba.posGainMult) },
		posBuff() { 
			let eff = player.ba.pos.plus(1).log10().plus(1).div(tmp.ba.negNerf); 
			eff = softcap("posBuff", eff);
			return eff;
		},
		noNerfs() {
			return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)
		},
		posNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.pos.plus(1).sqrt().pow(inChallenge("h", 41)?100:1)) },
		negGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).neg);
			return mult;
		},
		negGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times(tmp.ba.negGainMult) },
		negBuff() { 
			let eff = player.ba.neg.plus(1).pow((hasUpgrade("ba", 13))?10:1).div(tmp.ba.posNerf);
			eff = softcap("negBuff", eff);
			return eff;
		},
		negNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.neg.plus(1).log10().plus(1).sqrt().pow(inChallenge("h", 41)?100:1).div(hasUpgrade("ba", 14)?2:1).max(1)) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			"milestones",
			"blank",
			["clickable", 31],
			["row", [["clickable", 21], ["clickable", 11], "blank", ["bar", "balanceBar"], "blank", ["clickable", 12], ["clickable", 22]]],
			["row", [
				["column", [["display-text", function() {return tmp.nerdMode?("Gain Formula: "+format(tmp.ba.dirBase)+"^(1-barPercent/100)*(1-barBercent/100)"+(tmp.ba.negGainMult.eq(1)?"":("*"+format(tmp.ba.negGainMult)))):("+"+format(tmp.ba.negGain)+"/sec")}, {}], ["display-text", function() {return "Negativity: "+format(player.ba.neg)}, {}], ["display-text", function() {return (tmp.nerdMode?("Buff Formula: "+((hasUpgrade("ba", 13))?"(x+1)^10":"x+1")):("Buff: Multiply each Quirk Layer by "+format(tmp.ba.negBuff)))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("Nerf Formula: "+(hasUpgrade("ba", 14)?"sqrt(log(x+1)+1)"+(inChallenge("h", 41)?"^100":"")+"/2":"sqrt(log(x+1)+1)")):("Nerf: Divide the Positivity buff by "+format(tmp.ba.negNerf)))}, {}], "blank", ["row", [["upgrade", 11], ["upgrade", 13]]]], {"max-width": "240px"}], 
				"blank", "blank", "blank", 
				["column", 
				[["display-text", function() {return tmp.nerdMode?("Gain Formula: "+format(tmp.ba.dirBase)+"^(barPercent/100)*(barBercent/100)"+(tmp.ba.posGainMult.eq(1)?"":("*"+format(tmp.ba.posGainMult)))):("+"+format(tmp.ba.posGain)+"/sec")}, {}], ["display-text", function() {return "Positivity: "+format(player.ba.pos)}, {}], ["display-text", function() {return (tmp.nerdMode?("Buff Formula: log(x+1)+1"):("Buff: Multiply the Subspace & Time base by "+format(tmp.ba.posBuff)))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("Nerf Formula: sqrt(x+1)"+(inChallenge("h", 41)?"^100":"")):("Nerf: Divide the Negativity buff by "+format(tmp.ba.posNerf)))}, {}], "blank", ["row", [["upgrade", 14], ["upgrade", 12]]]], {"max-width": "240px"}]], {"visibility": function() { return player.ba.unlocked?"visible":"hidden" }}],
			["row", [["upgrade", 22], ["upgrade", 21], ["upgrade", 23]]],
			["row", [["upgrade", 31], ["upgrade", 24], ["upgrade", 32]]],
			["upgrade", 33],
			"blank", "blank"
		],
		bars: {
			balanceBar: {
				direction: RIGHT,
				width: 400,
				height: 20,
				progress() { return player.ba.allotted },
				unlocked() { return player.ba.unlocked },
				fillStyle() { 
					let r = 235 + (162 - 235) * tmp.ba.bars.balanceBar.progress;
					let g = 64 + (249 - 64) * tmp.ba.bars.balanceBar.progress;
					let b = 52 + (252 - 52) * tmp.ba.bars.balanceBar.progress;
					return {"background-color": ("rgb("+r+", "+g+", "+b+")") } 
				},
				borderStyle() { return {"border-color": "#fced9f"} },
			},
		},
		clickables: {
			rows: 3,
			cols: 2,
			11: {
				title: "-",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted>0 },
				onClick() { player.ba.allotted = Math.max(player.ba.allotted-0.05, 0) },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
			},
			12: {
				title: "+",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted<1 },
				onClick() { player.ba.allotted = Math.min(player.ba.allotted+0.05, 1) },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
			},
			21: {
				title: "&#8592;",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted>0 },
				onClick() { player.ba.allotted = 0 },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
			},
			22: {
				title: "&#8594;",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted<1 },
				onClick() { player.ba.allotted = 1 },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
			},
			31: {
				title: "C",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted!=.5 },
				onClick() { player.ba.allotted = .5 },
				style: {"height": "50px", "width": "50px", "background-color": "yellow"},
			},
		},
		upgrades: {
			rows: 3,
			cols: 4,
			11: {
				title: "Negative Ion",
				description: "Negativity boosts Solar Power.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
				currencyDisplayName: "negativity",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
				effect() { 
					let ret = player.ba.neg.plus(1).log10().sqrt().div(10);
					ret = softcap("ba11", ret);
					return ret;
				},
				effectDisplay() { return "+"+format(tmp.ba.upgrades[11].effect.times(100))+"%" },
				formula: "sqrt(log(x+1))*10",
			},
			12: {
				title: "Positive Ion",
				description: "Positivity boosts Space Building Power & all Subspace effects.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
				currencyDisplayName: "positivity",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
				effect() { return softcap("ba12", player.ba.pos.plus(1).log10().cbrt().div(10)) },
				effectDisplay() { return "+"+format(tmp.ba.upgrades[12].effect.times(100))+"%" },
				formula: "cbrt(log(x+1))*10",
			},
			13: {
				title: "Negative Energy",
				description: "Raise the Negativity buff to the power of 10.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				currencyDisplayName: "negativity",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
			},
			14: {
				title: "Positive Vibe",
				description: "Halve the Negativity nerf.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				currencyDisplayName: "positivity",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
			},
			21: {
				title: "Neutral Atom",
				description: "The Hindrance Spirit effect is raised to the power of 8.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				unlocked() { return hasUpgrade("ba", 13)&&hasUpgrade("ba", 14) },
			},
			22: {
				title: "Negative Mass",
				description: "The Negativity buff also multiplies Hindrance Spirit & Quirk gain.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
				currencyDisplayName: "negativity",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasUpgrade("ba", 21) },
			},
			23: {
				title: "Complete Plus",
				description: "The Positivity buff also divides the Solarity requirement.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
				currencyDisplayName: "positivity",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasUpgrade("ba", 21) },
			},
			24: {
				title: "Net Neutrality",
				description: "Positivity and Negativity boost each other's generation.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205000":2.5e12) },
				unlocked() { return hasUpgrade("ba", 22) && hasUpgrade("ba", 23) },
				effect() { 
					let ret = {
						pos: player.ba.neg.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
						neg: player.ba.pos.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
					} 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) {
						ret.pos = Decimal.pow(10, ret.pos.log10().pow(1.5));
						ret.neg = Decimal.pow(10, ret.neg.log10().pow(1.5));
					}
					return ret;
				},
				effectDisplay() { return "Pos: "+format(tmp.ba.upgrades[24].effect.pos)+"x, Neg: "+format(tmp.ba.upgrades[24].effect.neg)+"x" },
				formula() { return "Pos: (log(neg/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5)+", Neg: (log(pos/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5) },
				style: {"font-size": "9px"},
			},
			31: {
				title: "Tangible Degeneration",
				description: "The first two Spells use better formulas.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
				currencyDisplayName: "negativity",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasChallenge("h", 41) },
			},
			32: {
				title: "Visible Regeneration",
				description: "Positivity multiplies the Super-Generator base.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
				currencyDisplayName: "positivity",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasChallenge("h", 41) },
				effect() { 
					let eff = softcap("ba32", player.ba.pos.plus(1).log10().div(50).plus(1).pow(10));
					if (hasUpgrade("hn", 44)) eff = eff.times(upgradeEffect("p", 44));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(10);
					return eff;
				},
				effectDisplay() { return format(tmp.ba.upgrades[32].effect)+"x" },
				formula: "(log(x+1)/50+1)^10",
				style: {"font-size": "9px"},
			},
			33: {
				title: "True Equality",
				description: "Both <b>Net Neutrality</b> effects are cubed.",
				cost() { return new Decimal(player.ma.current=="ba"?"1e207500":2.5e51) },
				unlocked() { return hasChallenge("h", 41) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 Total Balance Energy",
				done() { return player.ba.total.gte(2) || (hasMilestone("hn", 0)) },
				effectDescription: "Gain 100% of Quirks gained every second, and keep Quirk Upgrades on all resets.",
			},
			1: {
				requirementDescription: "3 Total Balance Energy",
				done() { return player.ba.total.gte(3) || (hasMilestone("hn", 0)) },
				effectDescription: "Unlock Auto-Quirk Layers.",
				toggles: [["q", "auto"]],
			},
			2: {
				requirementDescription: "10 Total Balance Energy",
				done() { return player.ba.total.gte(10) || (hasMilestone("hn", 0)) },
				effectDescription: "Keep Subspace Upgrades on all resets, unlock Auto-Subspace Energy, and Subspace Energy resets nothing.",
				toggles: [["ss", "auto"]],
			},
			3: {
				unlocked() { return hasMilestone("ba", 2) },
				requirementDescription: "200,000 Total Balance Energy",
				done() { return player.ba.total.gte(2e5) || (hasMilestone("hn", 0)) },
				effectDescription: "Unlock Balance Upgrades.",
			},
			4: {
				unlocked() { return hasMilestone("ba", 3) },
				requirementDescription: "1e12 Total Balance Energy",
				done() { return player.ba.total.gte(1e12) || (hasMilestone("hn", 0)) },
				effectDescription: "You can keep Positivity & Negativity on reset.",
				toggles: [["ba", "keepPosNeg"]],
			},
		},
})

addLayer("ps", {
		name: "phantom souls", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "PS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			prevH: new Decimal(0),
			souls: new Decimal(0),
			power: new Decimal(0),
			auto: false,
			autoW: false,
			autoGhost: false,
			first: 0,
        }},
        color: "#b38fbf",
        requires() { return new Decimal("1e16000") }, // Can be a function that takes requirement increases into account
        resource: "phantom souls", // Name of prestige currency
        baseResource: "quirk energy", // Name of resource prestige is based on
        baseAmount() {return player.q.energy}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.5), // Prestige currency exponent
		base() { 
			let b = new Decimal("1e8000").root(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1);
			if (tmp.ps.impr[32].unlocked) b = b.root(improvementEffect("ps", 32));
			return b;
		},
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (player.i.buyables[11].gte(2)) mult = mult.div(buyableEffect("s", 17));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("hn", 9) },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "P", description: "Press Shift+P to Phantom Soul Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("hn", 6) },
        doReset(resettingLayer){ 
			let keep = [];
			player.ps.souls = new Decimal(0);
			let keptGS = new Decimal(0);
			if (layers[resettingLayer].row <= this.row+1) keptGS = new Decimal(player.ps.buyables[21]);
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			player.ps.buyables[21] = keptGS;
        },
		update(diff) {
			if (hasMilestone("hn", 5)) {
				if (player.ps.autoW) layers.ps.buyables[11].buyMax();
				player.ps.souls = player.ps.souls.max(tmp.ps.soulGain.times(player.h.points.max(1).log10()))
			} else player.ps.souls = player.ps.souls.plus(player.h.points.max(1).log10().sub(player.ps.prevH.max(1).log10()).max(0).times(tmp.ps.soulGain));
			player.ps.prevH = new Decimal(player.h.points);
			if (hasMilestone("hn", 7)) player.ps.power = player.ps.power.root(tmp.ps.powerExp).plus(tmp.ps.powerGain.times(diff)).pow(tmp.ps.powerExp);
			else player.ps.power = new Decimal(0);
			if (player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps") layers.ps.buyables[21].buyMax();
		},
		autoPrestige() { return hasMilestone("hn", 4) && player.ps.auto && player.ma.current!="ps" },
        layerShown(){return player.m.unlocked && player.ba.unlocked},
        branches: ["q", ["h", 2]],
		soulGainExp() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.2:1.5 },
		soulGainMult() {
			let mult = new Decimal(1);
			if (tmp.ps.buyables[11].effects.damned) mult = mult.times(tmp.ps.buyables[11].effects.damned||1);
			if (player.i.buyables[11].gte(1)) mult = mult.times(buyableEffect("s", 16));
			return mult.times(tmp.n.dustEffs.purple);
		},
		soulGain() {
			let gain = (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?Decimal.pow(tmp.ps.soulGainExp, player.ps.points):Decimal.pow(player.ps.points, tmp.ps.soulGainExp)).div(9.4).times(layers.ps.soulGainMult());
			return gain;
		},
		gainDisplay() {
			let gain = tmp.ps.soulGain;
			let display = "";
			if (gain.eq(0)) display = "0"
			else if (gain.gte(1)) display = format(gain)+" per OoM of Hindrance Spirit"
			else display = "1 per "+format(gain.pow(-1))+" OoMs of Hindrance Spirit"
			return display;
		},
		soulEffExp() {
			let exp = new Decimal(1.5e3);
			if (tmp.ps.buyables[11].effects.damned) exp = exp.times(tmp.ps.buyables[11].effects.damned||1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(100);
			return exp;
		},
		soulEff() {
			let eff = player.ps.souls.plus(1).pow(layers.ps.soulEffExp());
			return eff;
		},
		powerGain() { return player.ps.souls.plus(1).times(tmp.ps.buyables[21].effect).times(tmp.n.dustEffs.purple) },
		powerExp() { return player.ps.points.sqrt().times(tmp.ps.buyables[21].effect) },
		tabFormat: {
			"Main Tab": {
				content: ["main-display",
					"prestige-button",
					"resource-display",
					"blank",
					["display-text", function() { return "You have "+formatWhole(player.ps.souls)+" Damned Souls "+(tmp.nerdMode?("(Formula: ("+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("ps"):false)?(format(tmp.ps.soulGainExp)+"^PS"):("PS^"+format(tmp.ps.soulGainExp)))+")*"+format(tmp.ps.soulGainMult.div(10))+")"):("(Gain: "+tmp.ps.gainDisplay+")"))+": Divide Quirk Improvement requirements by "+format(tmp.ps.soulEff)+(tmp.nerdMode?(" (x+1)^("+formatWhole(tmp.ps.soulEffExp)+")"):"") }],
					"blank",
					["buyable", 11],
				],
			},
			Boosters: {
				unlocked() { return hasMilestone("hn", 7) },
				buttonStyle() { return {'background-color': '#b38fbf'} },
				content: [
					"main-display",
					"blank",
					["buyable", 21],
					"blank",
					["display-text",
						function() {return 'You have ' + formatWhole(player.ps.power)+' Phantom Power'+(tmp.nerdMode?(" (Gain Formula: (damned+1), Exp Formula: sqrt(ps))"):" (+"+format(tmp.ps.powerGain)+"/sec (based on Damned Souls), then raised to the power of "+format(tmp.ps.powerExp)+" (based on Phantom Souls))")+', which has provided the below Phantom Boosters (next at '+format(tmp.ps.impr.overallNextImpr)+')'},
							{}],
					"blank",
					"improvements"],
			},
		},
		buyables: {
			rows: 2,
			cols: 1,
			11: {
				title: "Wraiths",
				scaleSlow() {
					let speed = new Decimal(1);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) speed = speed.times(2);
					return speed;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost1 = x.div(tmp.ps.buyables[this.id].scaleSlow).times(2).plus(1).floor();
					let cost2 = x.div(tmp.ps.buyables[this.id].scaleSlow).plus(1).pow(4).times(174).plus(200).floor();
                    return { phantom: cost1, damned: cost2 };
                },
				effects(adj=0) {
					let data = {};
					let x = player[this.layer].buyables[this.id].plus(adj);
					if (x.gte(1)) data.hindr = x.min(3).toNumber();
					if (x.gte(2)) data.damned = x.sub(1).times(0.5).div(10/9.4).plus(1);
					if (x.gte(4)) data.quirkImpr = x.div(2).sub(1).floor().min(3).toNumber();
					return data;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((tmp.nerdMode?("Cost Formula: 2*x+1 Phantom Souls, (x+1)^4*174+200 Damned Souls"):("Cost: " + formatWhole(data.cost.phantom) + " Phantom Souls, "+formatWhole(data.cost.damned)+" Damned Souls"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
					Effects: ")
					let curr = data.effects;
					let next = this.effects(1);
					if (Object.keys(next).length>0) {
						if (next.hindr) {
							display += "\n"
							if (curr.hindr) display += curr.hindr+" New Hindrance"+(curr.hindr==1?"":"s")+(curr.hindr>=3?" (MAXED)":"")
							else display += "<b>NEXT: Unlock a new Hindrance</b>"
						}
						if (next.damned) {
							display += "\n"
							if (curr.damned) display += "Multiply Damned Soul gain & effect exponent by "+format(curr.damned)+(tmp.nerdMode?" ((x-1)*0.5+1)":"");
							else display += "<b>NEXT: Multiply Damned Soul gain & effect exponent</b>"
						}
						if (next.quirkImpr) {
							display += "\n"
							if (curr.quirkImpr) display += curr.quirkImpr+" New Quirk Improvement"+(curr.quirkImpr==1?"":"s")+(curr.quirkImpr>=3?" (MAXED)":"")
							else if (next.quirkImpr>(curr.quirkImpr||0)) display += "<b>NEXT: Unlock a new Quirk Improvement</b>"
						}
					} else display += "None"
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.ps.points.gte(tmp[this.layer].buyables[this.id].cost.phantom)&&player.ps.souls.gte(tmp[this.layer].buyables[this.id].cost.damned)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (!hasMilestone("hn", 4)) {
						player.ps.points = player.ps.points.sub(cost.phantom)
						player.ps.souls = player.ps.souls.sub(cost.damned)
					} 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let target = player.ps.points.sub(1).div(2).min(player.ps.souls.sub(200).div(174).root(4).sub(1)).times(tmp.ps.buyables[this.id].scaleSlow).plus(1).floor().max(0)
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return hasMilestone("hn", 5) && player.ps.autoW },
			},
			21: {
				title: "Ghost Spirit",
				scaleSlow() {
					let slow = new Decimal(1);
					if (hasUpgrade("hn", 51)) slow = slow.times(2);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) slow = slow.times(1.2);
					if (tmp.ps.impr[31].unlocked) slow = slow.times(improvementEffect("ps", 31));
					return slow;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, Decimal.pow(2, x.div(this.scaleSlow()))).times(x.eq(0)?1e21:1e22);
					if (hasUpgrade("hn", 51)) cost = cost.div(upgradeEffect("hn", 51));
					return cost;
                },
				effect() {
					return player[this.layer].buyables[this.id].div(25).plus(1).pow(2);
				},
				effect2() {
					return player[this.layer].buyables[this.id].div(10).plus(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((tmp.nerdMode?("Cost Formula: (10^(2^x))*1e22"):("Cost: " + formatWhole(data.cost) + " Phantom Power"))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
					Effect: "+(tmp.nerdMode?("Formula 1: (x/25+1)^2, Formula 2: (x/10+1)"):("Multiply Phantom Power gain/exponent by "+format(tmp.ps.buyables[this.id].effect)+", and boost Phantom Booster effectiveness by "+format(tmp.ps.buyables[this.id].effect2.sub(1).times(100))+"%")))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.ps.power.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.ps.power = player.ps.power.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let target = player.ps.power.times(hasUpgrade("hn", 51)?upgradeEffect("hn", 51):1).div(1e22).max(1).log10().max(1).log(2).times(this.scaleSlow()).plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps" },
			},
		},
		impr: {
			baseReq() { 
				let req = new Decimal(1e20).div(99);
				return req;
			},
			amount() { 
				let amt = player.ps.power.div(this.baseReq()).plus(1).log10().div(4).root(1.5).max(0);
				//if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
				return amt.floor();
			},
			overallNextImpr() { 
				let impr = tmp.ps.impr.amount.plus(1);
				//if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq()) 
			},
			nextAt(id=11) { 
				let impr = getImprovements("ps", id).times(tmp.ps.impr.activeRows*tmp.ps.impr.activeCols).add(tmp.ps.impr[id].num);
				//if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq());
			},
			power() { return tmp.ps.buyables[21].effect2.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
			resName: "phantom power",
			rows: 3,
			cols: 2,
			activeRows: 2,
			activeCols: 2,
			11: {
				num: 1,
				title: "Phantom Booster I",
				description: "Boost Solar Power.",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 11).times(tmp.ps.impr.power).div(20).plus(1).sqrt() },
				effectDisplay() { return "+"+format(tmp.ps.impr[11].effect.sub(1).times(100))+"% (multiplicative)" },
				formula: "sqrt(x*5%)",
				style: {height: "150px", width: "150px"},
			},
			12: {
				num: 2,
				title: "Phantom Booster II",
				description: "Boost Hex gain.",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return Decimal.pow(10, getImprovements("ps", 11).times(tmp.ps.impr.power).pow(2.5)) },
				effectDisplay() { return format(tmp.ps.impr[12].effect)+"x" },
				formula: "10^(x^2.5)",
				style: {height: "150px", width: "150px"},
			},
			21: {
				num: 3,
				title: "Phantom Booster III",
				description: "Spells are more effective.",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 21).times(tmp.ps.impr.power).div(10).plus(1) },
				effectDisplay() { return format(tmp.ps.impr[21].effect.sub(1).times(100))+"% stronger" },
				formula: "x*10%",
				style: {height: "150px", width: "150px"},
			},
			22: {
				num: 4,
				title: "Phantom Booster IV",
				description: "Quirk Improvement requirements increase slower.",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 22).times(tmp.ps.impr.power).div(20).plus(1) },
				effectDisplay() { return format(tmp.ps.impr[22].effect)+"x slower" },
				formula: "x/20+1",
				style: {height: "150px", width: "150px"},
			},
			31: {
				num: 1500,
				title: "Phantom Booster V",
				description: "The Ghost Spirit cost scaling is weakened.",
				unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(1) },
				effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).plus(1).log10().div(25).plus(1) },
				effectDisplay() { return format(Decimal.sub(1, tmp.ps.impr[31].effect.pow(-1)).times(100))+"% slower" },
				formula: "log(x+1)/25+1",
				style: {height: "150px", width: "150px"},
			},
			32: {
				num: 1751,
				title: "Phantom Booster VI",
				description: "The Phantom Soul cost base is reduced based on your Phantom Souls.",
				unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(2) },
				effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).pow(2).times(player.ps.points).plus(1).log10().plus(1).pow(1.2) },
				effectDisplay() { return "brought to the "+format(tmp.ps.impr[32].effect)+"th root" },
				formula: "(log((x^2)*PS+1)+1)^1.2",
				style: {height: "150px", width: "150px"},
			},
		},
})

addLayer("hn", {
		name: "honour", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "HN", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
        }},
        color: "#ffbf00",
		nodeStyle() {return {
			"background-color": (((player.hn.unlocked||canReset("hn"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#ffbf00":"#bf8f8f"),
        }},
        resource: "honour", // Name of prestige currency
        type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		baseResource: "magic and balance energy",
		baseAmount() { return new Decimal(0) },
		req: {m: new Decimal(1e150), ba: new Decimal(1e179)},
		requires() { return this.req },
		exp() { return {m: new Decimal(0.025), ba: new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.02)} },
		exponent() { return tmp[this.layer].exp },
		gainMult() {
			let mult = new Decimal(1);
			if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
			if (hasAchievement("a", 91)) mult = mult.times(1.1);
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("s", 35) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 35));
			if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
			return mult;
		},
		getResetGain() {
			let gain = player.m.points.div(tmp.hn.req.m).pow(tmp.hn.exp.m).times(player.ba.points.div(tmp.hn.req.ba).pow(tmp.hn.exp.ba));
			if (gain.gte(1e5)) gain = softcap("HnG", gain);
			return gain.times(tmp.hn.gainMult).floor();
		},
		resetGain() { return this.getResetGain() },
		getNextAt() {
			let gain = tmp.hn.getResetGain.div(tmp.hn.gainMult)
			gain = reverse_softcap("HnG", gain).plus(1);
			let next = {m: gain.sqrt().root(tmp.hn.exp.m).times(tmp.hn.req.m), ba: gain.sqrt().root(tmp.hn.exp.ba).times(tmp.hn.req.ba)};
			return next;
		},
		passiveGeneration() { return (hasMilestone("ma", 1)&&player.ma.current!="hn")?1:0 },
		canReset() {
			return player.m.points.gte(tmp.hn.req.m) && player.ba.points.gte(tmp.hn.req.ba) && tmp.hn.getResetGain.gt(0) 
		},
		dispGainFormula() {
			let vars = ["m", "ba"]
			let txt = "";
			for (let i=0;i<vars.length;i++) {
				let layer = vars[i];
				let start = tmp.hn.req[layer];
				let exp = tmp.hn.exp[layer];
				if (i>0) txt += ", "
				txt += layer.toUpperCase()+": (x / "+format(start)+")^"+format(exp)
			}
			return txt;
		},
		prestigeButtonText() {
			if (tmp.nerdMode) return "Gain Formula: "+tmp.hn.dispGainFormula;
			else return `${ player.hn.points.lt(1e3) ? (tmp.hn.resetDescription !== undefined ? tmp.hn.resetDescription : "Reset for ") : ""}+<b>${formatWhole(tmp.hn.getResetGain)}</b> ${tmp.hn.resource} ${tmp.hn.resetGain.lt(100) && player.hn.points.lt(1e3) ? `<br><br>Next at ${ ('Magic: '+format(tmp.hn.nextAt.m)+', Balance Energy: '+format(tmp.hn.nextAt.ba))}` : ""}`
		},
		prestigeNotify() {
			if (!canReset("hn")) return false;
			if (tmp.hn.getResetGain.gte(player.hn.points.times(0.1).max(1)) && !tmp.hn.passiveGeneration) return true;
			else return false;
		},
		tooltip() { return formatWhole(player.hn.points)+" Honour" },
		tooltipLocked() { return "Reach "+formatWhole(tmp.hn.req.m)+" Magic & "+formatWhole(tmp.hn.req.ba)+" Balance Energy to unlock (You have "+formatWhole(player.m.points)+" Magic & "+formatWhole(player.ba.points)+" Balance Energy)" },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "H", description: "Press Shift+H to Honour Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("ma", 1)) {
				keep.push("milestones")
				keep.push("upgrades")
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.m.unlocked&&player.ba.unlocked },
        branches: ["m","ba"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return player.hn.unlocked?("You have "+formatWhole(player.p.points)+" Prestige Points"):"" }],
			"blank",
			"milestones",
			"blank",
			"upgrades"
		],
		milestones: {
			0: {
				requirementDescription: "1 Total Honour",
				done() { return player.hn.total.gte(1) },
				effectDescription: "Always have all Magic/Balance milestones.",
			},
			1: {
				requirementDescription: "2 Total Honour",
				done() { return player.hn.total.gte(2) },
				effectDescription: "Gain 100% of Magic & Balance Energy every second.",
			},
			2: {
				requirementDescription: "3 Total Honour",
				done() { return player.hn.total.gte(3) },
				effectDescription: "The Balance bar behaves as if it is always at the two extremes, and unlock Auto-Spells.",
				toggles: [["m", "auto"]],
			},
			3: {
				requirementDescription: "4 Total Honour",
				done() { return player.hn.total.gte(4) },
				effectDescription: "You can buy max Subspace Energy, and keep Balance Upgrades on all resets.",
			},
			4: {
				requirementDescription: "5 Total Honour",
				done() { return player.hn.total.gte(5) },
				effectDescription: "Buying Wraiths does not spend Phantom Souls or Damned Souls, and unlock Auto-Phantom Souls.",
				toggles: [["ps", "auto"]],
			},
			5: {
				requirementDescription: "6 Total Honour",
				done() { return player.hn.total.gte(6) },
				effectDescription: "Unlock Auto-Wraiths.",
				toggles: [["ps", "autoW"]],
			},
			6: {
				requirementDescription: "10 Total Honour",
				done() { return player.hn.total.gte(10) },
				effectDescription: "Phantom Souls reset nothing.",
			},
			7: {
				requirementDescription: "100,000 Total Honour & e11,000,000 Prestige Points",
				unlocked() { return hasMilestone("hn", 6) },
				done() { return player.hn.total.gte(1e5) && player.p.points.gte("e11000000") },
				effectDescription: "Unlock Phantom Boosters & more Honour Upgrades.",
			},
			8: {
				requirementDescription: "1e30 Total Honour",
				unlocked() { return hasMilestone("hn", 7) && hasUpgrade("hn", 15) },
				done() { return player.hn.total.gte(1e30) },
				effectDescription: "You can activate all 3 secondary Dust effects at once.",
			},
			9: {
				requirementDescription: "1e300 Total Honour",
				unlocked() { return hasMilestone("hn", 8) },
				done() { return player.hn.total.gte(1e300) },
				effectDescription: "You can buy max Phantom Souls.",
			},
		},
		upgrades: {
			rows: 5,
			cols: 5,
			11: {
				title: "Begin Again",
				description: "You can explore further Prestige Upgrades.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e1000":4) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"ee10":"1e4000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 11) },
			},
			12: {
				title: "Honour Boost",
				description: "<b>Prestige Boost</b>'s softcap starts later based on your Total Honour.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e6800":1) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.175e10":"1e1000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 12) },
				effect() { return softcap("hn12", player.hn.total.plus(1).pow(1e4)) },
				effectDisplay() { return format(tmp.hn.upgrades[12].effect)+"x later" },
				formula: "(x+1)^1e4",
			},
			13: {
				title: "Self-Self-Synergy",
				description: "<b>Self-Synergy</b> is stronger based on its effect.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7000":2) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.5e10":"1e3900000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 13) },
				effect() { return tmp.p.upgrades[13].effect.max(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?200:40).plus(1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[13].effect) },
				formula: "log(log(x+1)+1)*40+1",
			},
			14: {
				title: "Anti-Calm",
				description: "<b>Prestigious Intensity</b>'s effect is 5% stronger.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7010":1e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.55e10":"1e11000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 14) && hasMilestone("hn", 7) },
			},
			15: {
				title: "Lightspeed Black Hole",
				description: "You can activate two secondary Dust effects at once.",
				multiRes: [
					{
						cost: new Decimal(3.5e10),
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e30000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
			},
			21: {
				title: "Point Efficiency",
				description: "<b>Prestige Boost</b>'s softcap is weaker based on your Hexes.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7025":25) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.58e10":"1e4700000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 21) },
				cap() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?.92:.9) },
				effect() { return player.m.hexes.plus(1).log10().plus(1).log10().times(0.15).min(tmp.hn.upgrades[this.id].cap) },
				effectDisplay() { return format(tmp.hn.upgrades[21].effect.times(100))+"% weaker"+(tmp.hn.upgrades[21].effect.gte(tmp.hn.upgrades[this.id].cap)?" (MAXED)":"") },
				formula() { return "log(log(x+1)+1)*15, maxed at "+format(tmp.hn.upgrades[this.id].cap.times(100))+"%" },
			},
			22: {
				title: "Superpowered Upgrades",
				description: "<b>Upgrade Power</b> is stronger based on your Damned Souls.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12640":4) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e4000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 22) },
				effect() { return Decimal.pow(10, player.ps.souls.plus(1).log10().plus(1).log10().sqrt().times(5)).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?3:1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[22].effect) },
				formula: "10^(sqrt(log(log(x+1)+1))*5)",
			},
			23: {
				title: "Reversal Sensational",
				description: "<b>Reverse Prestige Boost</b> is stronger based on your Balance Energy.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12625":100) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e5400000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 23) },
				effect() { return player.ba.points.plus(1).log10().plus(1).pow(.75).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[23].effect) },
				formula: "(log(x+1)+1)^0.75",
			},
			24: {
				title: "Coronal Energies",
				description: "Both Coronal Wave effects are doubled (unaffected by softcap).",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12645":1.5e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.05e11":"1e12000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 24) && hasMilestone("hn", 7) },
			},
			25: {
				title: "Imploded Hypernova",
				description: "Hyperspace Energy & Nebula Energy multiply the Solarity gain exponent & Dust gain.",
				multiRes: [
					{
						cost: new Decimal(5e10),
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e32500000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked && player.hs.unlocked },
				effect() { return player.hs.points.times(player.n.points.pow(3)).plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[25].effect)+"x" },
				formula: "log(log(HS*(N^3)+1)+1)+1",
				style: {"font-size": "9px"},
			},
			31: {
				title: "Exponential Drift",
				description: "Point gain is raised to the power of 1.05.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12650":64) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.06e11":"1e5600000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 31) },
			},
			32: {
				title: "Less Useless",
				description: "<b>Upgrade Power</b> is raised ^7.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12800":1e4) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.3e11":"1e10250000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 32) },
			},
			33: {
				title: "Column Leader Leader",
				description: "<b>Column Leader</b> is stronger based on your Best Honour.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12900":500) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.325e11":"1e6900000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 33) },
				effect() { return Decimal.pow(10, player.hn.best.plus(1).log10().plus(1).log10().sqrt()).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
				effectDisplay() { return format(tmp.hn.upgrades[33].effect)+"x" },
				formula: "10^sqrt(log(log(x+1)+1))",
			},
			34: {
				title: "Solar Exertion",
				description: "The <b>Solar Potential</b> effect is boosted by your Total Honour.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12820":5e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.32e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 34) && hasMilestone("hn", 7) },
				effect() { return player.hn.total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[34].effect)+"x" },
				formula: "log(log(log(x+1)+1)+1)+1",
			},
			35: {
				title: "Below Death",
				description: "Purple & Blue Dust multiply the Subspace base.",
				multiRes: [
					{
						cost: new Decimal(1.5e13),
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e40000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10) },
				effectDisplay() { return format(tmp.hn.upgrades[35].effect)+"x" },
				formula: "(B*P+1)^10",
			},
			41: {
				title: "Again and Again",
				description: "<b>Prestige Recursion</b> is stronger based on your Phantom Power.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e13050":1e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.75e11":"1e11000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 41) && hasMilestone("hn", 7) },
				effect() { return player.ps.power.plus(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?4.8:2.4).plus(1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[41].effect) },
				formula: "log(log(x+1)+1)*2.4+1",
				style: {"font-size": "9px"},
			},
			42: {
				title: "Spatial Awareness II",
				description: "Space Building costs scale 20% slower.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e13100":1.5e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.8e11":"1e12000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 42) && hasMilestone("hn", 7) },
			},
			43: {
				title: "Quir-cursion",
				description: "Quirk Energy boosts Quirk gain at a reduced rate.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14300":5e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.9e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 43) && hasMilestone("hn", 7) },
				effect() { return Decimal.pow(10, tmp.q.enEff.max(1).log10().root(1.8)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?50:1) },
				effectDisplay() { return format(tmp.hn.upgrades[43].effect)+"x" },
				formula() { return "10^(log(quirkEnergyEff)^"+((hasUpgrade("t", 35) && player.i.buyables[12].gte(4))?"0.565":"0.556")+")" },
			},
			44: {
				title: "Numerical Lexicon",
				description: "<b>Spelling Dictionary</b> also affects <b>Visible Regeneration</b> (a Balance Upgrade)'s effect (unaffected by softcap).",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14275":5e5) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.95e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 44) && hasMilestone("hn", 7) },
				style: {"font-size": "8px"},
			},
			45: {
				title: "Under the Fridge",
				description: "Blue & Orange Dust multiply Nebula Energy gain.",
				multiRes: [
					{
						cost: new Decimal(1e14),
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e42500000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.blueDust.times(player.n.orangeDust).plus(1).log10().plus(1).pow(3) },
				effectDisplay() { return format(tmp.hn.upgrades[45].effect)+"x" },
				formula: "(log(B*O+1)+1)^3",
			},
			51: {
				title: "Ghostly Reduction",
				description: "The Ghost Spirit cost is divided based on your Total Honour, and cost scales half as fast.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14500":1e6) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.975e11":"1e12800000") },
					},
				],
				unlocked() { return player.hn.upgrades.length>=16 },
				effect() { return player.hn.total.plus(1).pow(5) },
				effectDisplay() { return "/"+format(tmp.hn.upgrades[51].effect) },
				formula: "(x+1)^5",
				style: {"font-size": "8px"},
			},
			52: {
				title: "Circular Growth",
				description: "<b>Tachoclinal Plasma</b> affects the Super-Generator base.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e30000":1e7) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e7.5e11":"e16000000") },
					},
				],
				unlocked() { return player.hn.upgrades.length>=16 && (player.n.unlocked||player.hs.unlocked) },
				style: {"font-size": "9px"},
			},
			53: {
				title: "Nebulaic Luminosity",
				description: "There are 3 new Nebula Dust effects, but you can only have 1 active at a time, and keep dusts on Row 6 resets.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("e17250000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 52) && player.n.unlocked },
				style: {"font-size": "9px"},
			},
			54: {
				title: "Hypersonic Masterpiece",
				description: "Hyper Buildings are stronger based on your Total Hyperspace Energy.",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("e17250000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 52) && player.hs.unlocked },
				style: {"font-size": "9px"},
				effect() { return player.hs.total.pow(2).plus(1).log10().plus(1).log10().plus(1).log10().times(4).plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[54].effect.sub(1).times(100))+"% stronger" },
				formula: "log(log(log(x^2+1)+1)+1)*400",
			},
			55: {
				title: "Beneath The Sun",
				description: "Orange & Purple Dust boost Solar Power.",
				multiRes: [
					{
						cost: new Decimal(2.5e14),
					},
					{
						currencyDisplayName: "prestige points",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e45000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.orangeDust.times(player.n.purpleDust).plus(1).log10() },
				effectDisplay() { return "+"+format(tmp.hn.upgrades[55].effect.times(100))+"%" },
				formula: "log(O*P+1)*100",
			},
		},
})

addLayer("n", {
		name: "nebula", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			purpleDust: new Decimal(0),
			blueDust: new Decimal(0),
			orangeDust: new Decimal(0),
			activeSecondaries: {purpleBlue: false, blueOrange: false, orangePurple: false},
			first: 0,
        }},
        color: "#430082",
		nodeStyle() { return {
			"background-color": (((player.n.unlocked||canReset("n"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#430082":"#bf8f8f"),
			color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
		}},
		componentStyles() { return {
			"prestige-button": {
				color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
			},
		}},
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?"1e288":"1e280") }, // Can be a function that takes requirement increases into account
		increaseUnlockOrder: ["hs"],
        resource: "nebula energy", // Name of prestige currency
        baseResource: "solarity", // Name of resource prestige is based on
        baseAmount() {return player.o.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.03) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasUpgrade("hn", 45)) mult = mult.times(upgradeEffect("hn", 45));
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
			if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) mult = mult.times(200);
			if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.nb));
            return mult
        },
		passiveGeneration() { return (hasMilestone("ma", 3)&&player.ma.current!="n")?1:0 },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "n", description: "Press N to Nebula Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (!hasUpgrade("hn", 53)) {
				player.n.purpleDust = new Decimal(0);
				player.n.blueDust = new Decimal(0);
				player.n.orangeDust = new Decimal(0);
			}
			if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) keep.push("buyables");
			let as = JSON.parse(JSON.stringify(player.n.activeSecondaries));
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
			if (hasMilestone("ma", 0)) player.n.activeSecondaries = as;
        },
        layerShown(){return player.o.unlocked && player.hn.unlocked },
        branches: ["o", ["ps", 2]],
		tabFormat() { 
			let second = !(!tmp.n.secondariesAvailable);
			
			return ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["column", 
				[(second?["clickable", 14]:[]),
				
				"blank",
				
				["display-text", (player.ma.unlocked?("Product of all Dusts: "+format(tmp.n.dustProduct)):"") ],
				
				"blank",
			
				["row", [["display-text", ("<span style='color: #bd6afc; font-size: 24px'>"+format(player.n.purpleDust)+"</span> Purple Dust"+(tmp.nerdMode?" (Gain Formula: (x^0.333)*"+format(tmp.n.dustGainMult.div(20))+")":((tmp.n.effect.purple||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.purple||new Decimal(1))+"/sec)"):""))+"<br><br>Multiply Damned Soul and Phantom Power gain by <span style='color: #bd6afc; font-size: 24px'>"+format(tmp.n.dustEffs.purple)+"</span>"+(tmp.nerdMode?" (Effect Formula: 10^sqrt(log(x+1)))":""))]], {"background-color": "rgba(189, 106, 252, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 11], ["display-text", ("Multiply Magic gain by <span style='color: #ee82ee; font-size: 24px'>"+format(tmp.n.dustEffs2.purpleBlue)+"</span>"+(tmp.nerdMode?" (Effect Formula: (purple*blue+1)^10)":" (based on Purple & Blue Dust)"))]], {"background-color": "rgba(238, 130, 238, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
				
				["row", [["display-text", ("<span style='color: #7569ff; font-size: 24px'>"+format(player.n.blueDust)+"</span> Blue Dust"+(tmp.nerdMode?" (Gain Formula: (x^0.5)*"+format(tmp.n.dustGainMult.div(1e3))+")":((tmp.n.effect.blue||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.blue||new Decimal(1))+"/sec)"):""))+"<br><br>Multiply Super-Booster base by <span style='color: #7569ff; font-size: 24px'>"+format(tmp.n.dustEffs.blue)+"</span>"+(tmp.nerdMode?" (Effect Formula: (x+1)^50)":""))]], {"background-color": "rgba(117, 105, 255, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 12], ["display-text", ("Multiply the <b>Timeless</b> and <b>Option D</b> rewards by <span style='color: #ba9397; font-size: 24px'>"+format(tmp.n.dustEffs2.blueOrange)+"</span><br>(unaffected by softcaps)"+(tmp.nerdMode?" (Effect Formula: (blue*orange+1)^5)":" (based on Blue & Orange Dust)"))]], {"background-color": "rgba(186, 147, 151, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
				
				["row", [["display-text", ("<span style='color: #ffbd2e; font-size: 24px'>"+format(player.n.orangeDust)+"</span> Orange Dust"+(tmp.nerdMode?" (Gain Formula: (x^0.2)*"+format(tmp.n.dustGainMult.div(5))+")":((tmp.n.effect.orange||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.orange||new Decimal(1))+"/sec)"):""))+"<br><br>Multiply amounts of all Solarity buyables by <span style='color: #ffbd2e; font-size: 24px'>"+format(tmp.n.dustEffs.orange)+"</span>"+(tmp.nerdMode?" (Effect Formula: (x+1)^75)":""))]], {"background-color": "rgba(255, 189, 46, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 13], ["display-text", ("Multiply the Time Capsule limit base by <span style='color: #94de95; font-size: 24px'>"+format(tmp.n.dustEffs2.orangePurple)+"</span><br>"+(tmp.nerdMode?" (Effect Formula: (orange*purple+1)^0.6)":" (based on Orange & Purple Dust)"))]], {"background-color": "rgba(148, 222, 149, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
			]],
			"blank", "blank", ["buyable", 11], "blank", "blank",
		]},
		dustGainMult() {
			let mult = new Decimal(1);
			if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
			if (hasUpgrade("hn", 25)) mult = mult.times(upgradeEffect("hn", 25));
			if (hasUpgrade("g", 33) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 33));
			if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.times(1e30);
			return mult;
		},
		effect() {
			let amt = player.n.points;
			return {
				purple: amt.cbrt().div(20).times(tmp.n.dustGainMult),
				blue: amt.sqrt().div(1e3).times(tmp.n.dustGainMult),
				orange: amt.root(5).div(5).times(tmp.n.dustGainMult),
			};
		},
		dustProduct() { return player.n.purpleDust.times(player.n.blueDust).times(player.n.orangeDust) },
		dustEffs() {
			let mod = player.n.unlocked?1:0
			let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.6:1
			return {
				purple: Decimal.pow(10, player.n.purpleDust.times(mod).plus(1).log10().sqrt()).pow(exp),
				blue: player.n.blueDust.times(mod).plus(1).pow(50).pow(exp),
				orange: player.n.orangeDust.times(mod).plus(1).pow(75).pow(exp),
			}
		},
		dustEffs2() {
			let mod = hasUpgrade("hn", 53)?1:0
			let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1
			return {
				purpleBlue: player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10).pow(exp),
				blueOrange: player.n.blueDust.times(player.n.orangeDust).plus(1).pow(5).pow(exp),
				orangePurple: player.n.orangeDust.times(player.n.purpleDust).plus(1).pow(0.6).pow(exp),
			}
		},
		realDustEffs2() {
			let avail = player.n.activeSecondaries
			let data = tmp.n.dustEffs2;
			return {
				purpleBlue: avail.purpleBlue?data.purpleBlue:new Decimal(1),
				blueOrange: avail.blueOrange?data.blueOrange:new Decimal(1),
				orangePurple: avail.orangePurple?data.orangePurple:new Decimal(1),
			}
		},
		effectDescription: "which generate the dusts below",
		update(diff) {
			if (!player.n.unlocked) return;
			player.n.purpleDust = player.n.purpleDust.plus(tmp.n.effect.purple.times(diff));
			player.n.blueDust = player.n.blueDust.plus(tmp.n.effect.blue.times(diff));
			player.n.orangeDust = player.n.orangeDust.plus(tmp.n.effect.orange.times(diff));
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Stellar Clusters",
				cap() { return new Decimal(5) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let exp = (player.ma.current=="n")?26.5:1
					let cost = { purple: Decimal.pow(1e3, x.pow(2)).cbrt().times(50).pow(Math.pow(exp, 0.966)), blue: Decimal.pow(200, x.pow(2)).sqrt().pow(exp), orange: Decimal.pow(1e3, x.pow(2)).root(5).times(150).pow(exp) }
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"MAXED":(("Cost: " + formatWhole(data.cost.purple) + " Purple Dust"+(tmp.nerdMode?" (Formula: ((1e3^(x^2))^0.333)*50)":"")+"\nCost: "+formatWhole(data.cost.blue)+" Blue Dust"+(tmp.nerdMode?" (Formula: ((200^(x^2))^0.5))":"")+"\nCost: "+formatWhole(data.cost.orange)+" Orange Dust")+(tmp.nerdMode?" (Formula: ((1e3^(x^2))^0.2)*150)":"")))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					Unlocked "+formatWhole(player[this.layer].buyables[this.id])+" new Solarity Buyable"+(player[this.layer].buyables[this.id].eq(1)?"":"s"))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.n.unlocked && player.n.purpleDust.gte(cost.purple) && player.n.blueDust.gte(cost.blue) && player.n.orangeDust.gte(cost.orange) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.n.purpleDust = player.n.purpleDust.sub(cost.purple)
					player.n.blueDust = player.n.blueDust.sub(cost.blue)
					player.n.orangeDust = player.n.orangeDust.sub(cost.orange)
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'200px', 'width':'200px', color:(tmp[this.layer].buyables[this.id].canAfford?"white":"black")}},
				autoed() { return false },
			},
		},
		secondariesAvailable() { return hasUpgrade("hn", 53)?((hasMilestone("hn", 8)&&player.ma.current!="n")?3:(hasUpgrade("hn", 15)?2:1)):0 },
		secondariesActive() { 
			let n = 0;
			Object.values(player.n.activeSecondaries).forEach(x => function() { n += x?1:0 }());
			return Math.min(n, layers.n.secondariesAvailable());
		},
		clickables: {
			rows: 1,
			cols: 4,
			11: {
				name: "purpleBlue",
				display() { return player.n.activeSecondaries[this.name]?"ON":((!this.canClick())?"LOCKED":"OFF") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#ee82ee"},
			},
			12: {
				name: "blueOrange",
				display() { return player.n.activeSecondaries[this.name]?"ON":((!this.canClick())?"LOCKED":"OFF") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#ba9397"},
			},
			13: {
				name: "orangePurple",
				display() { return player.n.activeSecondaries[this.name]?"ON":((!this.canClick())?"LOCKED":"OFF") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#94de95"},
			},
			14: {
				display: "Reset Secondary Dust Effects (forces a Row 6 reset)",
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return layers.n.secondariesActive()>0 },
				onClick() { 
					doReset("n", true);
					player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false}
				},
				style() { return {color: this.canClick()?"white":"black"}},
			},
		},
})

addLayer("hs", {
		name: "hyperspace", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "HS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spentHS: new Decimal(0),
			buildLim: new Decimal(1),
			first: 0,
			auto: false,
        }},
		roundUpCost: true,
        color: "#dfdfff",
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?420:360) }, // Can be a function that takes requirement increases into account
		increaseUnlockOrder: ["n"],
        resource: "hyperspace energy", // Name of prestige currency 
        baseResource: "space energy", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
			let exp = new Decimal(60);
			if (player.i.buyables[11].gte(4)) exp = exp.times(buyableEffect("s", 19));
			return exp;
		}, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("e", 41) && player.i.buyables[12].gte(3)) mult = mult.times(upgradeEffect("e", 41));
			if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) mult = mult.times(2.5e3);
			if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
			if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.hb));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "ctrl+s", description: "Press Ctrl+S to Hyperspace Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return (hasMilestone("ma", 2)&&player.ma.current!="hs")?1:0 },
        doReset(resettingLayer){ 
			let keep = [];
			let hs = player.hs.buyables[11];
			if (hasMilestone("ma", 2)) {
				keep.push("buyables");
				keep.push("spentHS");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) player.hs.buyables[11] = hs;
        },
        layerShown(){return player.ss.unlocked && player.hn.unlocked },
        branches: ["ss", "ba"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return "You have "+formatWhole(player.ba.points)+" Balance Energy" }],
			"blank",
			["buyable", 11],
			"blank", "blank",
			"respec-button",
			"blank",
			["display-text", function() { return tmp.hs.buildingPower.eq(1)?"":("Hyper Building Power: "+format(tmp.hs.buildingPower.times(100))+"%")}], "blank",
			["row", [["buyable", 21], ["buyable", 22], ["buyable", 23], ["buyable", 24], ["buyable", 25], ["buyable", 26], ["buyable", 27], ["buyable", 28], ["buyable", 29], ["buyable", 30]]],
			"blank",
			["display-text", function() { return "Hyper Building Limit: "+formatWhole(player.hs.buildLim)+", Next: "+formatWhole(player.sg.points)+" / "+formatWhole(tmp.hs.nextBuildLimit)+" Super-Generators" }], "blank",
		],
		update(diff) {
			player.hs.buildLim = player.hs.buildLim.max(tmp.hs.buildLimit);
			if (hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs") tmp.hs.buyables[11].buyMax();
		},
		hyperspace() {
			let total = player.hs.buyables[11];
			let amt = total.sub(player.hs.spentHS);
			return amt;
		},
		buildLimScaling() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.8:1 },
		nextBuildLimit() { return player.hs.buildLim.plus(1).times(tmp.hs.buildLimScaling).pow(2).plus(20) },
		buildLimit() { return player.sg.points.sub(21).max(0).plus(1).sqrt().div(tmp.hs.buildLimScaling).floor() },
		buildingPower() {
			if (!unl(this.layer)) return new Decimal(0);
			let pow = new Decimal(1)
			if (hasUpgrade("hn", 54)) pow = pow.times(upgradeEffect("hn", 54));
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			if (player.i.buyables[11].gte(5)) pow = pow.plus(buyableEffect("s", 20));
			if (player.ma.unlocked) pow = pow.plus(tmp.ma.effect.max(1).log10().div(40));
			if (hasAchievement("a", 113)) pow = pow.plus(.1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.hs.buyables[11].div(1000))
			return pow;
		},
		buyables: {
			rows: 2,
			cols: 10,
			showRespec() { return player.hs.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
				player.hs.spentHS = new Decimal(0);
				let totalHS = player[this.layer].buyables[11]
                resetBuyables(this.layer)
				player[this.layer].buyables[11] = totalHS;
                doReset(this.layer, true) // Force a reset
            },
            respecText: "Respec Hyper Buildings", // Text on Respec button, optional
			11: {
				title: "Hyperspace",
				scaleRate() {
					let rate = new Decimal(1);
					if (hasUpgrade("t", 32) && player.i.buyables[12].gte(4)) rate = new Decimal(2/3);
					if (player.ma.current=="hs") rate = rate.times(4)
					return rate;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    x = x.times(tmp[this.layer].buyables[this.id].scaleRate);
					let y = x;
					if (y.gte(10)) y = y.pow(5).div(1e4);
					let cost = {hs: Decimal.pow(10, y.pow(0.9)).floor(), ba: Decimal.pow(10, x.max(x.div(1.5).pow(2)).times(40).add(360))}
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let primeX = "x"+(data.scaleRate.eq(1)?"":("*"+format(data.scaleRate)))
                    let display = ("Cost: " + formatWhole(data.cost.hs) + " Hyperspace Energy"+(tmp.nerdMode?" (Formula: (10^("+(player[this.layer].buyables[this.id].gte(10)?"(("+primeX+"^5)/1e4)":primeX)+"^0.9)))":"")+"\nCost: "+formatWhole(data.cost.ba)+" Balance Energy"+(tmp.nerdMode?" (Formula: (10^(((x*"+format(data.scaleRate.div(1.5))+")^2)*40+360)))":"")+"\n\
					Amount: " + formatWhole(tmp.hs.hyperspace)+" / "+formatWhole(player[this.layer].buyables[this.id]))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.hs.unlocked && player.hs.points.gte(cost.hs) && player.ba.points.gte(cost.ba)
				},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.hs.points = player.hs.points.sub(cost.hs);
					player.ba.points = player.ba.points.sub(cost.ba);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let y = player.hs.points.max(1).log10().root(.9);
					if (y.gte(10)) y = y.times(1e4).root(5);
					let target = y.min(player.ba.points.max(1).log10().sub(360).div(40).sqrt().times(1.5)).div(tmp[this.layer].buyables[this.id].scaleRate).plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style() { return {'height':'200px', 'width':'200px'}},
				autoed() { return hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs" },
			},
			21: {
				title: "Primary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Primary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: level*5e3+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(5e3).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			22: {
				title: "Secondary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Secondary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: level*40+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(40).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			23: {
				title: "Tertiary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Tertiary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: (level^0.8)*800+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(800).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			24: {
				title: "Quaternary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Quaternary Space Building Effect: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: (level^0.8)*5e3+1)":" (unaffected by softcap)"))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(5e3).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			25: {
				title: "Quinary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Quinary Space Building Effect: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: (level^0.75)*0.25+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.75).times(0.25).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			26: {
				title: "Senary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Senary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: (level^1.1)/1.2+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(1) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(1.1).div(1.2).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			27: {
				title: "Septenary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Septenary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: level/5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(2) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			28: {
				title: "Octonary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Octonary Space Building Effect: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: level/1.15+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(3) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(1.15).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			29: {
				title: "Nonary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Nonary Space Building Effect: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: level/5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(4) && player.ma.current!="hs" }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			30: {
				title: "Decary Hyper Building",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("Cost: 1 Hyperspace\n\
					Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					Decary Space Building Effect: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (Formula: sqrt(level)/1.5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(5) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).sqrt().div(1.5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
		},
})

addLayer("i", {
		name: "imperium", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			nb: new Decimal(0),
			hb: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#e5dab7",
        requires() { return new Decimal("1e11750") }, // Can be a function that takes requirement increases into account
        resource: "imperium bricks", // Name of prestige currency
        baseResource: "subspace", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.8), // Prestige currency exponent
		base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e100":"1e250") },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("ma", 1) },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "i", description: "Press I to Imperium Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("ma", 1) },
        doReset(resettingLayer){ 
			let keep = [];
			let i2 = player.i.buyables[12];
			if (hasMilestone("ma", 2)) keep.push("buyables")
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			player.i.buyables[12] = i2;
        },
		autoPrestige() { return player.i.auto && hasMilestone("ma", 4) && player.ma.current!="i" },
        layerShown(){return player.hn.unlocked},
        branches: ["ss"],
		update(diff) {
			if (!player.i.unlocked) return;
			player.i.nb = player.i.nb.max(tmp.i.nbAmt);
			player.i.hb = player.i.hb.max(tmp.i.hbAmt);
		},
		nbAmt() {
			let amt = player.n.points.div(2e3).plus(1).log10().root(1.25)
			return amt.floor();
		},
		nextNB() {
			let next = Decimal.pow(10, player.i.nb.plus(1).pow(1.25)).sub(1).times(2e3);
			return next;
		},
		hbAmt() {
			let amt = player.hs.points.div(1e6).plus(1).log10().root(1.35)
			return amt.floor();
		},
		nextHB() {
			let next = Decimal.pow(10, player.i.hb.plus(1).pow(1.35)).sub(1).times(1e6);
			return next;
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return player.i.unlocked?("You have "+formatWhole(player.i.nb)+" Nebulaic Bricks "+(tmp.nerdMode?"(Formula: log(N/2e3+1)^0.8)":("(next at "+format(tmp.i.nextNB)+" Nebula Energy)"))):"" }],
			["display-text", function() { return player.i.unlocked?("You have "+formatWhole(player.i.hb)+" Hyperspatial Bricks "+(tmp.nerdMode?"(Formula: log(HS/1e6+1)^0.74)":("(next at "+format(tmp.i.nextHB)+" Hyperspace Energy)"))):"" }],
			"blank",
			["display-text", function() { return (player.ma.current=="i"&&player.i.unlocked)?"NOTICE: While Mastering Imperium, Imperium Buildings make each other more expensive!":"" }],
			"blank",
			"buyables",
		],
		buyables: {
			rows: 1,
			cols: 4,
			11: {
				title: "Imperium Building I",
				cap() { return new Decimal(5) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.times(1.4).pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[12].div(4).plus(1):1).floor(), nb: x.pow(1.4).times(2).plus(4).pow(player.ma.current=="i"?player.i.buyables[12].div(6).plus(1):1).floor() }
					return cost;
                },
				formulas: {
					ib: "(x*1.4)^1.2+1",
					nb: "(x^1.4)*2+4",
					hb: "N/A",
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
                    let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"MAXED":((cost.ib?("Cost: "+formatWhole(cost.ib)+" Imperium Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("Cost: "+formatWhole(cost.nb)+" Nebulaic Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("Cost: "+formatWhole(cost.hb)+" Hyperspatial Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					Unlocked "+formatWhole(player[this.layer].buyables[this.id])+" new Space Building"+(player[this.layer].buyables[this.id].eq(1)?"":"s")+" (which are not impacted by extra Space Buildings)")
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			12: {
				title: "Imperium Building II",
				cap() { return new Decimal(6) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[11].div(2).plus(1):1).floor(), hb: x.pow(1.6).plus(5).pow(player.ma.current=="i"?player.i.buyables[11].div(5).plus(1):1).floor() }
					return cost;
                },
				formulas: {
					ib: "x^1.2+1",
					nb: "N/A",
					hb: "x^1.6+5",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = ""
					if (amt.gte(1)) disp += "3 new Booster Upgrades\n";
					if (amt.gte(2)) disp += "5 new Generator Upgrades\n";
					if (amt.gte(3)) disp += "5 new Enhance Upgrades\n";
					if (amt.gte(4)) disp += "6 new Time Upgrades\n";
					if (amt.gte(5)) disp += "5 new Space Upgrades\n";
					if (amt.gte(6)) disp += "4 new Quirk Upgrades\n";
					if (disp=="") disp = "Nothing yet"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"MAXED":((cost.ib?("Cost: "+formatWhole(cost.ib)+" Imperium Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("Cost: "+formatWhole(cost.nb)+" Nebulaic Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("Cost: "+formatWhole(cost.hb)+" Hyperspatial Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    Amount: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					Unlocked: \n"
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			13: {
				title: "Imperium Building III",
				cap() { return new Decimal(3) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { nb: x.pow(.6).times(15).plus(380).floor(), hb: x.pow(.825).times(9e4).plus(8.2e5).floor() }
					return cost;
                },
				formulas: {
					ib: "N/A",
					nb: "(x^0.6)*15+380",
					hb: "(x^0.8)*90,000+820,000",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = formatWhole(amt)+" new Spells"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"MAXED":((cost.ib?("Cost: "+formatWhole(cost.ib)+" Imperium Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("Cost: "+formatWhole(cost.nb)+" Nebulaic Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("Cost: "+formatWhole(cost.hb)+" Hyperspatial Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    Amount: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					Unlocked: "
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			14: {
				title: "Imperium Building IV",
				cap() { return new Decimal(2) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.pow(2).plus(44), nb: x.pow(1.3).times(6).plus(390).floor(), hb: x.pow(2.25).times(9e4).plus(8.75e5).floor() }
					return cost;
                },
				formulas: {
					ib: "x^2+44",
					nb: "(x^1.3)*6+390",
					hb: "(x^2.25)*90,000+875,000",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = formatWhole(amt)+" new Phantom Boosters"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"MAXED":((cost.ib?("Cost: "+formatWhole(cost.ib)+" Imperium Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("Cost: "+formatWhole(cost.nb)+" Nebulaic Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("Cost: "+formatWhole(cost.hb)+" Hyperspatial Bricks"+(tmp.nerdMode?(" (Formula: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    Amount: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					Unlocked: "
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
})

addLayer("ma", {
		name: "mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "MA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			mastered: [],
			selectionActive: false,
			current: null,
        }},
        color: "#ff9f7f",
        requires() { return new Decimal(100) }, // Can be a function that takes requirement increases into account
        resource: "mastery", // Name of prestige currency
        baseResource: "phantom souls", // Name of resource prestige is based on
        baseAmount() {return player.ps.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.1), // Prestige currency exponent
		base: new Decimal(1.05),
		effectBase() {
			return new Decimal(1e20);
		},
		effect() {
			return Decimal.pow(tmp.ma.effectBase, player.ma.points);
		},
		effectDescription() {
			return "which multiplies Honour & Hyperspace Energy gain by "+format(tmp.ma.effect)+(tmp.nerdMode?(" ("+format(tmp.ma.effectBase)+"x each)"):"")+", and adds "+format(tmp.ma.effect.max(1).log10().times(2.5))+"% to Hyper Building Power"+(tmp.nerdMode?(" (+"+format(tmp.ma.effectBase.max(1).log10().times(2.5))+"% each)"):"")
		},
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasAchievement("a", 131)) mult = mult.div(1.1);
			if (hasAchievement("a", 95)) mult = mult.div(1.15);
			if (hasAchievement("a", 134)) mult = mult.times(Decimal.pow(.999925, player.ps.points));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return false },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "A", description: "Press Shift+A to Mastery Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return false },
        doReset(resettingLayer){ 
			let keep = [];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		autoPrestige() { return false },
        layerShown(){return player.ps.unlocked && player.i.unlocked},
        branches: ["hn", "hs", ["ps", 2]],
		tabFormat: {
			Mastery: {
				content: ["main-display",
					"prestige-button",
					"resource-display",
					"blank", "milestones",
					"blank", "blank",
					"clickables",
				],
			}, 
			"Mastery Rewards": {
				buttonStyle() { return {'background-color': '#ff9f7f', 'color': 'black'} },
				content: ["blank", "blank", "blank", ["raw-html", function() { return tmp.ma.rewardDesc }]],
			},
		},
		rewardDesc() {
			let desc = "";
			if (player.ma.mastered.includes("p")) desc += "<h2>Prestige</h2><br><br><ul><li>Base Prestige gain exponent is better (0.5 -> 0.75)</li><li><b>Prestige Boost</b> is raised ^1.1 (after softcaps)</li><li><b>Self Synergy</b> is raised ^75</li><li><b>More Prestige</b> is much stronger (+80% -> +1e52%)</li><li><b>Upgrade Power</b> is raised ^40</li><li><b>Reverse Prestige Boost</b> is raised ^1.5</li></ul><br><br>";
			if (player.ma.mastered.includes("b")) desc += "<h2>Boosters</h2><br><br><ul><li>Booster cost base is reduced (5 -> 1.5)</li><li>Base Booster cost exponent is reduced (1.25 -> 0.75)</li><li><b>BP Combo</b> & <b>Discount One</b> are raised ^1.5</li><li><b>Cross Contamination</b> & <b>PB Reversal</b> also multiply the SB base</li><li><b>Worse BP Combo</b> is raised ^20,000</li><li><b>Even More Additions</b> is cubed</li></ul><br><br>";
			if (player.ma.mastered.includes("g")) desc += "<h2>Generators</h2><br><br><ul><li>Generator cost base is reduced (5 -> 2.5)</li><li>Base Generator cost exponent is reduced (1.25 -> 1.1)</li><li>Generator Power effect is raised ^1.05</li><li><b>GP Combo</b> is raised ^500,000</li><li><b>I Need More III</b> is raised ^10,000</li></ul><br><br>";
			if (player.ma.mastered.includes("t")) desc += "<h2>Time</h2><br><br><ul><li>Time cost base is reduced (1e15 -> 10)</li><li>Base Time cost exponent is reduced (1.85 -> 1.4)</li><li>Time Capsules have a new effect</li><li>Anything that multiplies the Time Energy limit base now multiplies the Booster & Generator bases</li><li>The first Time Energy effect softcaps later (e3.1e9)</li><li>The Extra Time Capsule cost is raised ^0.9</li><li><b>Pseudo-Boost</b> & <b>Basic</b> also multiply the Time Energy gain base, and are both cubed</li><li><b>Enhanced Time</b> is raised to the power of 1.1</li></ul><br><br>";
			if (player.ma.mastered.includes("e")) desc += "<h2>Enhance</h2><br><br><ul><li>Enhance gain exponent is increased (0.02 -> 0.025)</li><li>The second Enhancer effect is raised to the power of 100</li><li><b>Enhanced Prestige</b> also affects Point gain, and it is raised ^1.5</li><li><b>Enter the E-Space</b> is 250% stronger</li><li><b>Monstrous Growth</b>'s base is much better (1.1 -> 1e2,000)</li><li><b>To the Next Level</b> is cubed</li></ul><br><br>";
			if (player.ma.mastered.includes("s")) desc += "<h2>Space</h2><br><br><ul><li>Space cost base is reduced (1e10 -> 10)</li><li>Base Space cost exponent is reduced (1.85 -> 1.4)</li><li>Space Building Power is divided by 3.85, but Space Buildings cost scale 5x slower</li></ul><br><br>";
			if (player.ma.mastered.includes("sb")) desc += "<h2>Super Boosters</h2><br><br><ul><li>Super Booster cost base is reduced (1.05 -> 1.025)</li><li>Base Super Booster cost exponent is reduced (1.25 -> 1.075)</li><li>The Super Booster cost is divided by 1.333</li><li>Super Boosters provide Spectral Boosters</li></ul><br><br>";
			if (player.ma.mastered.includes("sg")) desc += "<h2>Super Generators</h2><br><br><ul><li>Super Generator cost base is reduced (1.05 -> 1.04)</li><li>Base Super Booster cost exponent is reduced (1.25 -> 1.225)</li><li>The Super Generator cost is divided by 1.1</li><li>The Super Generator Power effect is squared</li><li>Super Generators give Spectral Generators over time</li></ul><br><br>";
			if (player.ma.mastered.includes("q")) desc += "<h2>Quirks</h2><br><br><ul><li>Quirk gain exponent is increased (7.5e-3 -> 8e-3)</li><li>The Quirk Energy effect softcap start is raised ^1.5</li><li>The Quirk Layer cost base is raised ^0.75</li><li><b>Millennial Abilities</b> is 50% stronger</li><li>Bought Decary Space Building Levels add free Quirk Improvements (equal to the Level/4)</li></ul><br><br>";
			if (player.ma.mastered.includes("h")) desc += "<h2>Hindrances</h2><br><br><ul><li>Hindrance Spirit gain exponent is increased (0.125 -> 0.2)</li><li>The Hindrance Spirit effect softcap is much weaker (exponent to the 4th root -> exponent to the 2.5th root)</li><li>Unlock a Hindrance milestone</li><li><b>Speed Demon</b> has a secondary effect</li><li><b>Out of Room</b>'s effect is 40% stronger</li><li><b>Timeless</b> & <b>Option D</b> no longer have a completion limit</li><li><b>Timeless</b>'s effect is raised ^5</li><li><b>Productionless</b>'s reduction to the Quirk Layer cost base is stronger (0.15 -> 0.2)</li></ul><br><br>";
			if (player.ma.mastered.includes("o")) desc += "<h2>Solarity</h2><br><br><ul><li>The Solarity gain exponent is increased by 0.5% for every Super Booster you have (additive)</li><li>The Solar Energy gain exponent limit is increased to 0.15, but beyond 0.1 it grows much slower</li><li>Solar Energy's second effect is 10% stronger</li><li>Solar Power is increased by 20% for every OoM of Solarity you have</li><li>Solarity buyable gain is raised ^2.6</li><li>All effects of the first row of Solarity buyables are raised ^1.1</li><li><b>Convectional Energy</b>'s effect is raised ^25</li><li>All effects of the second row of Solarity buyables are multiplied by 1.4</li><li>All effects of the third row of Solarity buyables are multiplied by 1.9</li></ul><br><br>";
			if (player.ma.mastered.includes("ss")) desc += "<h2>Subspace</h2><br><br><ul><li>The Subspace cost base is reduced (1.15 -> 1.1)</li><li>The base Subspace cost exponent is reduced (1.1 -> 1.07)</li><li>The Subspace base is multiplied by 1e10 for each Subspace Energy you have</li><li>The third Subspace effect is raised ^3</li><li>If <b>Subspatial Awakening</b>'s effect is above 100%, it is cubed but divided by 10,000</li><li><b>Emissary of Smash</b>'s effect is raised ^400</li><li><b>No More Progress</b>'s effect is doubled</li><li><b>Challenging Speedup</b>'s endpoint is much higher (e1,000,000 -> e1e11)</li></ul><br><br>";
			if (player.ma.mastered.includes("m")) desc += "<h2>Magic</h2><br><br><ul><li>The Magic gain exponent is increased (7e-3 -> 8.5e-3)</li><li>Add 50% to Spell Power</li><li>The Hex effect softcap does not apply to the boost to Hindrance Spirit, Quirk, and Solar Energy gain, but this effect is square rooted</li><li>The Hex effect softcap starts 1e-3% later for every OoM of Magic you have</li><li>The Hex effect softcap exponent is increased (10 -> 2e3)</li></ul><br><br>";
			if (player.ma.mastered.includes("ba")) desc += "<h2>Balance</h2><br><br><ul><li>The Balance Energy gain exponent is increased (5e-3 -> 0.0125)</li><li>There are no Positivity/Negativity nerfs</li><li>Both <b>Net Neutrality</b> effects have their exponents raised ^2.5</li><li><b>Visible Regeneration</b> is raised ^10</li></ul><br><br>";
			if (player.ma.mastered.includes("ps")) desc += "<h2>Phantom Souls</h2><br><br><ul><li>The Phantom Soul cost base is square rooted</li><li>The base Damned Soul gain formula is improved (PS^1.5 -> 1.2^PS)</li><li>The Damned Soul effect is raised ^100</li><li>Wraiths cost scale 50% slower</li><li>Ghost Spirit cost scales 20% slower</li><li>Phantom Boosters are 10% stronger</li></ul><br><br>";
			if (player.ma.mastered.includes("hn")) desc += "<h2>Honour</h2><br><br><ul><li>The Honour gain exponent for its Balance Energy requirement is improved (0.02 -> 0.05)</li><li>Remove the softcap to the second Honour Upgrade</li><li><b>Self-Self-Synergy</b>'s effect is multiplied by 5</li><li><b>Point Efficiency</b> is maxed at 92% instead of 90%</li><li><b>Superpowered Upgrades</b>'s effect is tripled</li><li><b>Reversal Sensational</b> is 10% stronger</li><li><b>Column Leader Leader</b> is 10% stronger</li><li><b>Again and Again</b>'s effect is doubled</li><li><b>Quir-cursion</b>'s effect is raised ^50</li></ul><br><br>";
			if (player.ma.mastered.includes("n")) desc += "<h2>Nebula</h2><br><br><ul><li>The Nebula gain exponent is improved (0.03 -> 0.05)</li><li>All primary dust effects are raised ^1.6</li><li>All secondary dust effects are raised ^1.4</li><li>Gain 1e30x more Dust</li></ul><br><br>";
			if (player.ma.mastered.includes("hs")) desc += "<h2>Hyperspace</h2><br><br><ul><li>The Hyper Building Limit requirement scales 20% slower</li><li>Add 0.1% to Hyper Building Power for every Hyperspace bought</li><li>The Hyper Building softcap starts 0.1 Levels later</li></ul><br><br>";
			if (player.ma.mastered.includes("i")) desc += "<h2>Imperium</h2><br><br><ul><li>The Imperium Building cost base is reduced (1e250 -> 1e100)</li><li>Each Nebulaic Brick multiplies Nebula Energy gain by 10</li><li>Each Hyperspatial Brick multiplies Hyperspace Energy gain by 10</li><li>There are 2 new Imperium Buildings</li></ul><br><br>";
			return desc;
		},
		milestones: {
			0: {
				requirementDescription: "1 Mastery",
				done() { return player.ma.best.gte(1) },
				effectDescription: "Keep Hyperspace & Stellar Clusters on all Row 7 resets, and unlock Auto-Ghost Spirit.",
				toggles: [["ps", "autoGhost"]],
			},
			1: {
				requirementDescription: "2 Mastery",
				done() { return player.ma.best.gte(2) },
				effectDescription: "You can buy max Imperium Bricks (which now reset nothing), gain 100% of Honour gain every second, and keep all Honour milestones & upgrades on all resets.",
			},
			2: {
				requirementDescription: "3 Mastery",
				done() { return player.ma.best.gte(3) },
				effectDescription: "Keep Imperium Building I & Hyper Buildings on reset, and gain 100% of Hyperspace Energy gain every second.",
			},
			3: {
				requirementDescription: "4 Mastery",
				done() { return player.ma.best.gte(4) },
				effectDescription: "Gain 100% of Nebula Energy every second.",
			},
			4: {
				requirementDescription: "5 Mastery",
				done() { return player.ma.best.gte(5) },
				effectDescription: "Unlock Auto-Imperium Bricks.",
				toggles: [["i", "auto"]],
			},
			5: {
				unlocked() { return hasMilestone("ma", 4) },
				requirementDescription: "16 Mastery",
				done() { return player.ma.best.gte(16) },
				effectDescription: "Unlock Auto-Hyperspace.",
				toggles: [["hs", "auto"]],
			},
		},
		clickables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Mastery",
				cap: 19,
				display() {
					if (player.ma.current!==null) return "Currently Mastering: "+tmp[player.ma.current].name+". Click to exit the run.";
					else return player.ma.selectionActive?"You are in a Mastery Search. Click the node of the layer you wish to attempt to Master. Click to exit this search.":("Begin a Mastery Search.<br><br>"+((tmp.ma.amtMastered>=this.cap)?"MAXED":("Req: "+formatWhole(tmp[this.layer].clickables[this.id].req)+" Mastery.")));
				},
				unlocked() { return player.ma.unlocked },
				req() { return [2,5,7,8,9,9,10,10,11,12,14,14,15,16,18,20,21,22,23,(1e300)][tmp.ma.amtMastered||0] },
				canClick() { return player.ma.unlocked && (player.ma.selectionActive?true:(tmp.ma.amtMastered<this.cap&&player.ma.points.gte(tmp[this.layer].clickables[this.id].req))) },
				onClick() { 
					if (player.ma.current !== null) {
						if (!confirm("Are you sure you want to exit this Mastery run?")) return;
						player.ma.selectionActive = false;
						player.ma.current = null;
						doReset("ma", true);
					} else player.ma.selectionActive = !player.ma.selectionActive;
				},
				style: {"height": "200px", "width": "200px"},
			},
		},
		amtMastered() {
			let amt = tmp.ma.mastered.length;
			if (player.ma.current!==null) if (player.ma.mastered.includes(player.ma.current)) amt--;
			return amt;
		},
		mastered() {
			if (player.ma.current!==null) return player.ma.mastered.concat(player.ma.current);
			return player.ma.mastered;
		},
		canBeMastered() {
			if (!player.ma.selectionActive) return [];
			if (player.ma.mastered.length==0) return ["p"];
			let rows = player.ma.mastered.map(x => tmp[x].row)
			let realRows = rows.filter(y => Object.keys(ROW_LAYERS[y]).every(z => player.ma.mastered.includes(z)));
			let furthestRow = Math.max(...realRows)+((player.ma.current !== null)?0:1);
			let m = Object.keys(layers).filter(x => (tmp[x].row<=furthestRow&&(tmp.ma.specialReqs[x]?tmp.ma.specialReqs[x].every(y => player.ma.mastered.includes(y)):true))||player.ma.mastered.includes(x));
			if (player.ma.current !== null) m.push(player.ma.current);
			
			return m;
		},
		startMastery(layer) {
			if (!confirm("Are you sure you want to start Mastering "+tmp[layer].name+"? This will force a Row 7 reset and put you in a run where only Mastered Layers & this layer will be active!")) return;
			player.ma.current = layer;
			
			if (player[layer].upgrades) player[layer].upgrades = [];
			if (player[layer].challenges) for (let n in player[layer].challenges) player[layer].challenges[n] = null;
			if (player.subtabs[layer]) player.subtabs[layer].mainTabs = "Main Tab";
			if (layer=="n") {
				resetBuyables("n");
				player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false};
			}
			if (layer=="hs") {
				resetBuyables("hs")
				player.hs.spentHS = new Decimal(0);
			}
			if (layer=="i") resetBuyables("i");
			
			doReset("ma", true);
		},
		completeMastery(layer) {
			let data = tmp.ma;
			if (player[layer].points.lt(data.masteryGoal[layer])) return;
			if (!player.ma.mastered.includes(layer)) player.ma.mastered.push(layer);
			player.ma.selectionActive = false;
			player.ma.current = null;
			doReset("ma", true);
		},
		specialReqs: {
			sb: ["t","e","s"],
			sg: ["t","e","s"],
			h: ["q"],
			o: ["q","h"],
			ss: ["q","h"],
			ps: ["m","ba"],
			n: ["hn"],
			hs: ["hn"],
			i: ["n","hs"],
		},
		masteryGoal: {
			p: new Decimal("1e11488"),
			b: new Decimal(2088),
			g: new Decimal(1257),
			t: new Decimal(814),
			e: new Decimal("e3469000"),
			s: new Decimal(817),
			sb: new Decimal(36),
			sg: new Decimal(20),
			q: new Decimal("e480000"),
			h: new Decimal("e416000"),
			o: new Decimal(1e34),
			ss: new Decimal(21),
			m: new Decimal("1e107350"),
			ba: new Decimal("1e207500"),
			ps: new Decimal(115),
			hn: new Decimal("1e31100"),
			n: new Decimal("1e397"),
			hs: new Decimal("1e512"),
			i: new Decimal(43),
		},
		rowLimit: 6,
})

addLayer("ge", {
		name: "gears", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "GE", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			rotations: new Decimal(0),
			energy: new Decimal(0),
			toothPower: new Decimal(0),
			shrinkPower: new Decimal(0),
			boosted: new Decimal(0),
			maxToggle: false,
        }},
        color: "#bfbfbf",
		nodeStyle() { return {
			background: (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#838586"):"#bf8f8f",
		}},
		componentStyles: {
			background() { return (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#bfbfbf"):"#bf8f8f" },
		},
        requires: new Decimal(1e256), // Can be a function that takes requirement increases into account
        resource: "gears", // Name of prestige currency 
        baseResource: "dust product", // Name of resource prestige is based on
        baseAmount() {return tmp.n.dustProduct}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(0.01), // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 12));
			if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "E", description: "Press Shift+E to Gear Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return false },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			if (layers[resettingLayer].row >= this.row) {
				player.ge.energy = new Decimal(0);
				player.ge.toothPower = new Decimal(0);
				player.ge.shrinkPower = new Decimal(0);
				player.ge.rotations = new Decimal(0);
			}
        },
        layerShown(){return player.ma.unlocked },
        branches: ["n"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			"milestones",
			"blank", "blank", 
			["display-text", function() { return "<h3>Gear Speed: "+format(tmp.ge.gearSpeed)+"x</h3>"+(tmp.nerdMode?" (cbrt(gears))":"") }],
			"blank",
			["display-text", function() { return "<b>Gear Radius: "+format(tmp.ge.radius)+"m</b>"+(tmp.nerdMode?" (teeth*toothSize/6.28)":"") }], "blank",
			["row", [["display-text", function() { return "<h3>Rotations: "+formatWhole(player.ge.rotations, true)+" ("+tmp.ge.rotDesc+")</h3><br>Rotation Effect: Multiply Nebula Energy & Dust gain by "+format(tmp.ge.rotEff)+(tmp.nerdMode?" ((x+1)^5)":"") }]]],
			"blank", "blank",
			["clickable", 21],
			"blank", "blank",
			["row", [["column", [["raw-html", function() { return "<h3>Teeth: "+formatWhole(tmp.ge.teeth, true)+"</h3>" }], "blank", ["clickable", 11]], {"background-color": "#b0babf", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>Kinetic Energy: "+format(player.ge.energy)+" J</h3><br><br>Velocity: "+format(tmp.ge.speed)+"m/s"+(tmp.nerdMode?" (sqrt(x))":"") }], "blank", ["clickable", 12]], {"background-color": "#dec895", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>Tooth Size: "+format(tmp.ge.toothSize)+"m</h3><br><br>" }], "blank", ["clickable", 13]], {"background-color": "#bfa1b8", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}]]], "blank",
			["buyable", 11], "blank",
		],
		update(diff) {
			if (!player.ge.unlocked) return;
			let factor = tmp.ge.gearSpeed
			player.ge.energy = player.ge.energy.plus(factor.times(diff).times(tmp.ge.clickables[12].effect));
			player.ge.toothPower = player.ge.toothPower.plus(factor.times(diff));
			player.ge.shrinkPower = player.ge.shrinkPower.plus(factor.times(diff));
			player.ge.rotations = player.ge.rotations.plus(tmp.ge.rps.times(diff));
		},
		rotEff() {
			return softcap("rotEff", player.ge.rotations.round().plus(1).pow(5));
		},
		gearSpeed() {
			let speed = player.ge.points.cbrt().times(player.mc.unlocked?tmp.mc.mechEff:1);
			if (player.mc.upgrades.includes(11)) speed = speed.times(buyableEffect("mc", 12));
			return speed;
		},
		rps() {
			return tmp.ge.speed.div(tmp.ge.teeth.times(tmp.ge.toothSize)).times(tmp.ge.gearSpeed)
		},
		rotDesc() {
			let rps = tmp.ge.rps;
			let desc = "";
			if (rps.lt(1)) desc = format(rps.times(60))+" RPM";
			else desc = format(rps)+" RPS";
			
			if (tmp.nerdMode) desc += " </h3>((velocity*gearSpeed)/(radius*6.28))<h3>"
			return desc;
		},
		speed() {
			return player.ge.energy.sqrt();
		},
		teeth() {
			return player.ge.toothPower.pow(1.5).plus(100).div(tmp.ge.clickables[11].unlocked?tmp.ge.clickables[11].effect:1).floor().max(1);
		},
		toothSize() {
			return player.ge.shrinkPower.plus(1).pow(-0.5).div(tmp.ge.clickables[13].effect).times(player.mc.unlocked?tmp.mc.buyables[11].effect.pow(hasAchievement("a", 125)?(-1):1):1);
		},
		radius() { return tmp.ge.teeth.times(tmp.ge.toothSize).div(2*Math.PI) },
		boostReducedPurch() { return tmp.ge.buyables[11].effect.times(4) },
		boostReq() { 
			let x = player.ge.boosted.sub(tmp.ge.boostReducedPurch);
			if (x.gte(20)) x = x.pow(2).div(20);
			return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
		},
		boostReqFormula() { return player.ge.boosted.sub(tmp.ge.boostReducedPurch).gte(20)?"1e10^(((totalBought^2)/20)^1.2) * 1e280":"1e10^(totalBought^1.2) * 1e280" },
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "Gear Evolution",
				costDiv() {
					let div = new Decimal(1);
					if (hasAchievement("a", 124)) div = div.times(3);
					return div;
				},
				free() {
					let free = new Decimal(0);
					if (hasAchievement("a", 132)) free = free.plus(2);
					return free;
				},
				power() {
					let pow = new Decimal(1);
					if (hasAchievement("a", 124)) pow = pow.times(1.2);
					return pow;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(15)) x = x.times(1.63);
					return Decimal.pow(125, x.pow(1.425)).times(1e3).div(tmp.ge.buyables[this.id].costDiv)
                },
				effectPer() { return Decimal.div(tmp.ge.buyables[this.id].power, 2) },
				effect() { return Decimal.mul(tmp[this.layer].buyables[this.id].effectPer, player[this.layer].buyables[this.id].plus(tmp.ge.buyables[this.id].free)) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "Reset all Gear Upgrades and force a Row 7 reset to add "+format(data.effectPer)+" to each of their effect bases and reduce their costs by "+format(data.effectPer.times(4))+" purchases.<br><br>Req: "+formatWhole(cost)+" Rotations"+(tmp.nerdMode?" (Cost Formula: 125^(x^1.425)*1e3)":"")+".<br>Currently: +"+format(data.effect)+" to bases, costs reduced by "+format(data.effect.times(4))+" purchases";
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.ge.rotations.gte(cost);
				},
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					player.ge.boosted = new Decimal(0);
					for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
					doReset("ge", true);
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
		clickables: {
			rows: 2,
			cols: 3,
			11: {
				title() { return "Divide Teeth by "+format(tmp.ge.clickables[this.id].effectPer) },
				display() { 
					return "Req: "+format(tmp.ge.clickables[this.id].req)+" dust product"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>Currently: /"+format(tmp.ge.clickables[this.id].effect);
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked && hasAchievement("a", 133) },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			12: {
				title() { return "Multiply Kinetic Energy gain by "+format(tmp.ge.clickables[this.id].effectPer) },
				display() { 
					return "Req: "+format(tmp.ge.clickables[this.id].req)+" dust product"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>Currently: "+format(tmp.ge.clickables[this.id].effect)+"x";
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(6, tmp.ge.buyables[11].effect).times(hasAchievement("a", 123)?4:1) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			13: {
				title() { return "Divide Tooth Size by "+format(tmp.ge.clickables[this.id].effectPer) },
				display() { 
					return "Req: "+format(tmp.ge.clickables[this.id].req)+" dust product"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>Currently: /"+format(tmp.ge.clickables[this.id].effect);
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			21: {
				title: "Reset Gear Upgrades",
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && player.ge.boosted.gt(0) },
				onClick() { 
					if (!confirm("Are you sure you want to reset your Gear Upgrades? This will force a Gear reset!")) return;
					player.ge.boosted = new Decimal(0);
					for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
					doReset("ge", true);
				},
				style: {"height": "75px", "width": "100px"},
			},
		},
		milestones: {
			0: {
				requirementDescription: "1,000,000 Gears",
				done() { return player.ge.best.gte(1e6) },
				effectDescription: "You can buy max Gear Upgrades.",
				toggles: [["ge", "maxToggle"]],
			},
			1: {
				requirementDescription: "2e22 Gears",
				unlocked() { return player.ge.best.gte(1e6) },
				done() { return player.ge.best.gte(2e22) },
				effectDescription: "Gear Upgrade costs increase independently.",
			},
		},
})

addLayer("mc", {
		name: "machines", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "MC", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			mechEn: new Decimal(0),
        }},
        color: "#c99a6b",
		nodeStyle() { return {
			background: (player.mc.unlocked||canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f",
		}},
		componentStyles: {
			"prestige-button": {
				background() { return (canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f" },
			},
		},
        requires: new Decimal(128000), // Can be a function that takes requirement increases into account
        resource: "machine parts", // Name of prestige currency 
        baseResource: "hyperspatial bricks", // Name of resource prestige is based on
        baseAmount() {return player.i.hb}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(4), // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "c", description: "Press C to Machine Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return false },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.ma.unlocked },
        branches: ["hs", "i"],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			player.mc.mechEn = player.mc.mechEn.plus(player.ge.rotations.times(tmp.mc.mechPer).times(diff)).times(tmp.mc.decayPower.pow(diff));
		},
		mechPer() { return tmp.mc.buyables[11].effect.pow(tmp.mc.buyables[11].buffExp).times(clickableEffect("mc", 11)) },
		decayPower() { return player.mc.mechEn.plus(1).log10().plus(1).pow(-2) },
		mechEff() { return Decimal.pow(10, player.mc.mechEn.plus(1).log10().root(4).div(2)) },
		tabFormat: {
			"The Shell": {
				buttonStyle() { return {'background-color': '#706d6d'} },
				content: ["main-display",
				"prestige-button",
				"resource-display", "blank",
				"blank", 
				"respec-button", "blank", ["buyable", 11],
			]},
			"The Motherboard": {
				buttonStyle() { return {'background-color': '#c99a6b', color: "black"} },
				content: ["blank", ["display-text", function() { return "Each Gear Rotation provides "+format(tmp.mc.mechPer)+" Mech-Energy, which adds to <h3>"+format(player.mc.mechEn)+" Mech-Energy</h3>" }],
				"blank", ["display-text", function() { return tmp.mc.decayPower.eq(1)?"":("Due to inadequate storage, Mech-Energy is being lost by "+format(tmp.mc.decayPower.pow(-1).log10())+" OoMs per second.") }],
				"blank", ["display-text", function() { return "Your Mech-Energy is multiplying Gear Speed by "+format(tmp.mc.mechEff)+(tmp.nerdMode?" (Formula: 10^((log(x+1)^0.25)/2))":"") }],
				"blank", ["upgrade", 11], "blank",
				"clickables",
			]},
			"The Core": {
				unlocked() { return player.mc.upgrades.includes(11) },
				buttonStyle() { return {'background-color': '#c76e6b', "border-color": "#c76e6b", color: "black"} },
				content: ["blank", ["buyable", 12]],
			},
		},
		clickables: {
			rows: 2,
			cols: 2,
			activeLimit() { return hasAchievement("a", 133)?2:1 },
			11: {
				title: "CPU",
				display() { 
					return "Active Mech-Energy: "+format(player.mc.clickables[this.id])+"<br><br>Currently: Kinetic Energy multiplies Mech-Energy gain by "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?" (Formula: (kineticEnergy+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"");
				},
				effect() { return Decimal.pow(player.ge.energy.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt()))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn);
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "11", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			12: {
				title: "The Port",
				display() { 
					return "Active Mech-Energy: "+format(player.mc.clickables[this.id])+"<br><br>Currently: Phantom Souls multiply Gear gain by "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?" (Formula: (phantomSouls+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"");
				},
				effect() { return Decimal.pow(player.ps.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt()))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn);
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "12", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			21: {
				title: "Northbridge",
				display() { 
					return "Active Mech-Energy: "+format(player.mc.clickables[this.id])+"<br><br>Currently: Solarity multiplies the Super Generator base by "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?" (Formula: (solarity+1)^("+formatWhole(tmp.mc.clickables[this.id].effExp)+"-"+formatWhole(tmp.mc.clickables[this.id].effExp)+"/((log(activeMechEnergy+1)+1)^0.125)))":"");
				},
				effExp() { return hasAchievement("a", 133)?3:1 },
				effect() { return Decimal.pow(player.o.points.plus(1), Decimal.sub(tmp.mc.clickables[this.id].effExp, Decimal.div(tmp.mc.clickables[this.id].effExp, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).root(8)))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn);
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "21", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			22: {
				title: "Southbridge",
				display() { 
					return "Active Mech-Energy: "+format(player.mc.clickables[this.id])+"<br><br>Currently: Hyperspace Energy multiplies Balance Energy gain by "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?" (Formula: (hyperspaceEnergy+1)^(1-1/cbrt(log(activeMechEnergy+1)+1)))":"");
				},
				effect() { return Decimal.pow(player.hs.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).cbrt()))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn);
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "22", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
		},
		buyables: {
			showRespec() { return player.mc.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
			rows: 1,
			cols: 2,
			11: {
				title: "Shell Expansion",
				costDiv() { return new Decimal(hasAchievement("a", 132)?7:1) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    return x.div(10).plus(0.5).div(tmp[this.layer].buyables[this.id].costDiv).ceil();
                },
				buffExp() { return hasAchievement("a", 132)?25:5 },
				effect() { return player[this.layer].buyables[this.id].plus(1).sqrt() },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "Req: "+formatWhole(cost)+" Machine Parts"+(tmp.nerdMode?" (Cost Formula: floor((x/10+0.5)^1.1)":"")+".<br><br><h3>Current Shell Size: "+formatWhole(amt)+"m</h3>, which multiplies Mech-Energy gain by "+format(data.effect.pow(data.buffExp))+(tmp.nerdMode?" (Formula: (x+1)^2.5)":"")+" "+(hasAchievement("a", 125)?"and also divides":"but also multiplies")+" Tooth Size of Gears by "+format(data.effect)+(tmp.nerdMode?" (Formula: sqrt(x+1))":"");
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.mc.points.gte(cost);
				},
                buy() { 
					let b = player[this.layer].buyables[this.id];
					let c = player.mc.points.times(tmp[this.layer].buyables[this.id].costDiv);
					let n = b.pow(2).times(4).plus(b.times(36)).plus(c.times(80)).plus(81).sqrt().sub(11).div(2).plus(1).floor();
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(n)
					if (n.sub(b).eq(1)) player.mc.points = player.mc.points.sub(tmp[this.layer].buyables[this.id].cost);
					else player.mc.points = player.mc.points.sub(b.sub(n).sub(1).times(b.plus(n).plus(10)).times(-0.05).floor()).max(0);
                },
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			12: {
				title: "The Core",
				cost(x=player[this.layer].buyables[this.id]) {
					if (x.gte(4)) x = x.pow(4).div(64);
					return Decimal.pow(10, Decimal.pow(1.5, x.plus(1).cbrt()).times(3e14))
				},
				effect() { return player[this.layer].buyables[this.id].times(1e4).plus(1).pow(.56) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "Cost: "+format(cost)+" Points"+(tmp.nerdMode?" (Cost Formula: 10^((1.5^cbrt("+(amt.gte(4)?"(x^4)/64":"x")+"+1))*3e14)":"")+".<br><br>Level: "+formatWhole(amt)+"<br><br>Effect: The Generator Power effect is raised ^"+format(data.effect)+" and Gear gain, Machine Part gain, & Gear Speed are multiplied by "+format(data.effect)+(tmp.nerdMode?" (Formula: (10,000*level+1)^0.56)":"");
					return display;
                },
                unlocked() { return unl(this.layer) && player.mc.upgrades.includes(11) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.points.gte(cost);
				},
                buy() { 
					player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
					player.mc.buyables[this.id] = player.mc.buyables[this.id].plus(1);
                },
                style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.mc.buyables[12].canAfford?'#c76e6b':'#bf8f8f' }, "border-color": "#c76e6b"},
				autoed() { return false },
			},
		},
		upgrades: {
			rows: 1,
			cols: 1,
			11: {
				title: "Unlock The Core",
				unlocked() { return !player.mc.upgrades.includes(11) },
				multiRes: [
					{
						cost: new Decimal(5e3),
					},
					{
						currencyDisplayName: "mech-energy",
						currencyInternalName: "mechEn",
						currencyLayer: "mc",
						cost: new Decimal("1e420"),
					},
				],
			},
		},
})

addLayer("a", {
        startData() { return {
            unlocked: true,
        }},
        color: "yellow",
        row: "side",
        layerShown() {return true}, 
        tooltip() { // Optional, tooltip displays when the layer is locked
            return ("Achievements")
        },
        achievements: {
            rows: 13,
            cols: 5,
            11: {
                name: "All that progress is gone!",
                done() { return player.p.points.gt(0) },
                tooltip: "Perform a Prestige reset.",
				image: "images/achs/11.png",
            },
			12: {
				name: "Point Hog",
				done() { return player.points.gte(25) },
				tooltip: "Reach 25 Points.",
				image: "images/achs/12.png",
			},
			13: {
				name: "Prestige all the Way",
				done() { return player.p.upgrades.length>=3 },
				tooltip: "Purchase 3 Prestige Upgrades. Reward: Gain 10% more Prestige Points.",
				image: "images/achs/13.png",
			},
			14: {
				name: "Prestige^2",
				done() { return player.p.points.gte(25) },
				tooltip: "Reach 25 Prestige Points.",
				image: "images/achs/14.png",
			},
			15: {
				name: "Primary Termination",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("p") },
				tooltip: "Master Prestige.",
				image: "images/achs/15.png",
			},
			21: {
				name: "New Rows Await!",
				done() { return player.b.unlocked||player.g.unlocked },
				tooltip: "Perform a Row 2 reset. Reward: Generate Points 10% faster, and unlock 3 new Prestige Upgrades.",
				image: "images/achs/21.png",
			},
			22: {
				name: "I Will Have All of the Layers!",
				done() { return player.b.unlocked&&player.g.unlocked },
				tooltip: "Unlock Boosters & Generators.",
				image: "images/achs/22.png",
			},
			23: {
				name: "Prestige^3",
				done() { return player.p.points.gte(1e45) },
				tooltip: "Reach 1e45 Prestige Points. Reward: Unlock 3 new Prestige Upgrades.",
				image: "images/achs/23.png",
			},
			24: {
				name: "Hey I don't own that company yet!",
				done() { return player.points.gte(1e100) },
				tooltip: "Reach 1e100 Points.",
				image: "images/achs/24.png",
			},
			25: {
				name: "Secondary Increment",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("b")&&player.ma.mastered.includes("g") },
				tooltip: "Master Boosters & Generators.",
				image: "images/achs/25.png",
			},
			31: {
				name: "Further Further Down",
				done() { return player.e.unlocked||player.t.unlocked||player.s.unlocked },
				tooltip: "Perform a Row 3 reset. Reward: Generate Points 50% faster, and Boosters/Generators don't increase each other's requirements.",
				image: "images/achs/31.png",
			},
			32: {
				name: "Why no meta-layer?",
				done() { return player.points.gte(Number.MAX_VALUE) },
				tooltip: "Reach 1.8e308 Points. Reward: Double Prestige Point gain.",
				image: "images/achs/32.png",
			},
			33: {
				name: "That Was Quick",
				done() { return player.e.unlocked&&player.t.unlocked&&player.s.unlocked },
				tooltip: "Unlock Time, Enhance, & Space. Reward: Unlock some new Time, Enhance, & Space Upgrades.",
				image: "images/achs/33.png",
			},
			34: {
				name: "Who Needs Row 2 Anyway?",
				done() { return player.b.best.eq(0) && player.g.best.eq(0) && player.points.gte("1e525") },
				tooltip: "Reach 1e525 Points without any Boosters or Generators.",
				image: "images/achs/34.png",
			},
			35: {
				name: "Tool Enhanced Speedrun",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("t")&&player.ma.mastered.includes("e")&&player.ma.mastered.includes("s") },
				tooltip: "Master Time, Enhance, & Space.",
				image: "images/achs/35.png",
			},
			41: {
				name: "Super Super",
				done() { return player.sb.unlocked },
				tooltip: "Unlock Super-Boosters. Reward: Prestige Upgrades are always kept on reset, and unlock 3 new Booster Upgrades.",
				image: "images/achs/41.png",
			},
			42: {
				name: "Yet Another Inf- [COPYRIGHT]",
				done() { return player.g.power.gte(Number.MAX_VALUE) },
				tooltip: "Reach 1.8e308 Generator Power.",
				image: "images/achs/42.png",
			},
			43: {
				name: "Enhancing a Company",
				done() { return player.e.points.gte(1e100) },
				tooltip: "Reach 1e100 Enhance Points.",
				image: "images/achs/43.png",
			},
			44: {
				name: "Space is for Dweebs",
				done() { return tmp.s.manualBuildingLevels.eq(0) && player.g.power.gte("1e370") },
				tooltip: "Reach 1e370 Generator Power without any Space Buildings.",
				image: "images/achs/44.png",
			},
			45: {
				name: "Super Precision",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("sb")&&player.ma.mastered.includes("sg") },
				tooltip: "Master Super Boosters & Super Generators.",
				image: "images/achs/45.png",
			},
			51: {
				name: "Yet Another Row, Huh",
				done() { return player.h.unlocked||player.q.unlocked },
				tooltip: "Perform a Row 4 reset. Reward: Time/Enhance/Space don't increase each other's requirements.",
				image: "images/achs/51.png",
			},
			52: {
				name: "Hinder is Coming",
				done() { return inChallenge("h", 11) && player.points.gte("1e7250") },
				tooltip: 'Reach e7,250 Points in "Upgrade Desert".',
				image: "images/achs/52.png",
			},
			53: {
				name: "Already????",
				done() { return player.sg.unlocked },
				tooltip: "Perform a Super-Generator reset. Reward: Get 2 extra Space.",
				image: "images/achs/53.png",
			},
			54: {
				name: "The Superless Bug",
				done() { return player.sg.best.eq(0) && player.sb.best.eq(0) && player.points.gte("1e15500") },
				tooltip: "Reach 1e15,500 Points without Super-Boosters & Super-Generators.",
				image: "images/achs/54.png",
			},
			55: {
				name: "Evil HQ",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("q")&&player.ma.mastered.includes("h") },
				tooltip: "Master Quirks & Hindrances.",
				image: "images/achs/55.png",
			},
			61: {
				name: "Seriously Specific",
				done() { return player.ss.unlocked || player.o.unlocked },
				tooltip: "Perform a Solarity reset or a Subspace reset.",
				image: "images/achs/61.png",
			},
			62: {
				name: "Gotta Get Em All",
				done() { return player.ss.unlocked && player.o.unlocked },
				tooltip: "Perform a Solarity & Subspace reset. Reward: Both Solarity & Subspace behave as if you chose them first.",
				image: "images/achs/62.png",
			},
			63: {
				name: "Spaceless",
				done() { return inChallenge("h", 21) && player.g.best.eq(0) && player.points.gte("1e25000") },
				tooltip: 'Reach 1e25,000 Points in "Out of Room" without any Generators.',
				image: "images/achs/63.png",
			},
			64: {
				name: "Timeless^2",
				done() { return player.h.challenges[31]>=10 },
				tooltip: 'Complete "Timeless" 10 times. Reward: Always keep Row 2 & 3 Upgrades.',
				image: "images/achs/64.png",
			},
			65: {
				name: "The Blood Moon",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("o")&&player.ma.mastered.includes("s") },
				tooltip: "Master Solarity & Subspace.",
				image: "images/achs/65.png",
			},
			71: {
				name: "Another One Bites the Rust",
				done() { return player.m.unlocked || player.ba.unlocked },
				tooltip: 'Perform a Row 5 reset. Reward: Always have all milestones of Row 2, 3, and 4, and you can complete "Timeless" 10 more times.',
				image: "images/achs/71.png",
			},
			72: {
				name: "Generator Slowdown",
				done() { return player.g.best.gte(1225) },
				tooltip: "Reach 1,225 Generators.",
				image: "images/achs/72.png",
			},
			73: {
				name: "Seems Familiar?",
				done() { return player.ps.unlocked },
				tooltip: "Unlock Phantom Souls.",
				image: "images/achs/73.png",
			},
			74: {
				name: "Super Balanced",
				done() { return player.ba.points.gte(1e100) },
				tooltip: 'Reach 1e100 Balance Energy. Reward: You can complete "Timeless" 10 more times, and the "Option D" effect also affects Magic & Balance Energy gain.',
				image: "images/achs/74.png",
			},
			75: {
				name: "Practices in Perfection",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("m")&&player.ma.mastered.includes("ba")&&player.ma.mastered.includes("ps") },
				tooltip: "Master Magic, Balance, & Phantom Souls.",
				image: "images/achs/75.png",
			},
			81: {
				name: "Yes I Am",
				done() { return player.hn.unlocked },
				tooltip: 'Perform a Row 6 reset. Reward: Hindrances do not reset your Prestige/Booster Upgrades.',
				image: "images/achs/81.png",
			},
			82: {
				name: "Not So Hindered Now",
				done() { return player.points.gte("ee7") && player.h.activeChallenge>20 },
				tooltip: "Reach e10,000,000 Points while in a Hindrance (cannot be one of the first two).",
				image: "images/achs/82.png",
			},
			83: {
				name: "The Impossible Task",
				done() { return hasMilestone("hn", 7) },
				tooltip: "Unlock Phantom Boosters.",
				image: "images/achs/83.png",
			},
			84: {
				name: "Beyond the Basics",
				done() { return player.points.gte("e9250000") && player.b.best.eq(0) && player.g.best.eq(0) },
				tooltip: "Reah e9,250,000 Points without any Boosters or Generators.",
				image: "images/achs/84.png",
			},
			85: {
				name: "I Understand Your Pain",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("hn") },
				tooltip: "Master Honour.",
				image: "images/achs/85.png",
			},
			91: {
				name: "SPAAACE!!!!",
				done() { return player.n.unlocked || player.hs.unlocked },
				tooltip: "Unlock Nebula or Hyperspace. Reward: Gain 10% more Honour.",
				image: "images/achs/91.png",
			},
			92: {
				name: "Galactic Strats",
				done() { return player.n.unlocked && player.hs.unlocked },
				tooltip: "Unlock Nebula and Hyperspace. Reward: Nebula and Hyperspace behave as if they were unlocked first.",
				image: "images/achs/92.png",
			},
			93: {
				name: "No More Meters!",
				done() { return player.i.unlocked },
				tooltip: "Unlock Imperium.",
				image: "images/achs/93.png",
			},
			94: {
				name: "Finally Done Being Hindered",
				done() { return player.h.challenges[31]>=30 && player.h.challenges[32]>=10 },
				tooltip: 'Complete "Timeless" 30 times and "Option D" 10 times.',
				image: "images/achs/94.png",
			},
			95: {
				name: "I Hate This Mechanic",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("n")||player.ma.mastered.includes("hs") },
				tooltip: "Master either Nebula or Hyperspace. Mastery is 15% cheaper.",
				image: "images/achs/95.png",
			},
			101: {
				name: "Realm of The Impossible",
				done() { return player.q.points.gte("e1e6") },
				tooltip: "Reach e1,000,000 Quirks. Reward: The Quirk Layer cost base is reduced by 0.2.",
				image: "images/achs/101.png",
			},
			102: {
				name: "We're Not Beyond This?",
				done() { return inChallenge("h", 31) && player.h.challenges[31]>=30 && player.points.gte("e2e7") },
				tooltip: 'Reach e20,000,000 Points while in the "Timeless" hindrance (which must be completed at least 30 times).',
				image: "images/achs/102.png",
			},
			103: {
				name: "One Billion Zeros",
				done() { return player.points.gte("e1e9") },
				tooltip: "Reach e1e9 Points. Reward: Add 10% to Space Building Power.",
				image: "images/achs/103.png",
			},
			104: {
				name: "Clustered Systems",
				done() { return player.n.buyables[11].gte(5) },
				tooltip: "Purchase 5 Stellar Clusters.",
				image: "images/achs/104.png",
			},
			105: {
				name: "True Architecture",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("i") },
				tooltip: "Master Imperium.",
				image: "images/achs/105.png",
			},
			111: {
				name: "Realm of Creation",
				done() { return player.ma.unlocked },
				tooltip: 'Perform a Row 7 reset. Reward: Keep Imperium Building II on all resets, you can complete "Timeless" and "Option D" in bulk,  those challenges do not get more lethal with more completions, and there is a new column of achievements.',
				image: "images/achs/111.png",
			},
			112: {
				name: "True Mastery",
				done() { return player.ma.points.gte(10) },
				tooltip: "Reach 10 Mastery.",
				image: "images/achs/112.png",
			},
			113: {
				name: "One Trillion Zeros",
				done() { return player.points.gte("ee12") },
				tooltip: "Reach e1e12 Points. Reward: Add 10% to Hyper Building Power.",
				image: "images/achs/113.png",
			},
			114: {
				name: "Option E?",
				done() { return player.h.challenges[32]>=900 },
				tooltip: "Complete Option D at least 900 times.",
				image: "images/achs/114.png",
			},
			115: {
				name: "Haunted Forever",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ps.points.gte(1350) },
				tooltip: "Reach 1,375 Phantom Souls. Reward: Shell Expansion's nerf to Gear size is now a buff.",
				image: "images/achs/115.png",
			},
			121: {
				name: "Geared for More",
				done() { return player.ge.unlocked },
				tooltip() { return "Unlock Gears. Reward: Total Hyperspace makes the Hyper Building softcap start later"+(tmp.nerdMode?" (Formula: (x^0.2)/100)":" (Currently: +"+format(player.hs.buyables[11].root(5).times(.1))+")") },
				image: "images/achs/121.png",
			},
			122: {
				name: "So Many Teeth!",
				done() { return tmp.ge.teeth.gte(1e4) },
				tooltip: "Make your Gears have at least 10,000 Teeth.",
				image: "images/achs/122.png",
			},
			123: {
				name: "Yearly Solar Output",
				done() { return player.ge.energy.gte(1.2e34) },
				tooltip: "Reach 1.2e34 J of Kinetic Energy. Reward: The Kinetic Energy Gear Upgrade's base is quadrupled.",
				image: "images/achs/123.png",
			},
			124: {
				name: "The Perfect Being",
				done() { return player.hn.points.gte("ee6") },
				tooltip: "Reach e1,000,000 Honour. Reward: Gear Evolution requires 3x less Rotations, and is 20% stronger.",
				image: "images/achs/124.png",
			},
			125: {
				name: "Baseless Property",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.points.gte("e2.5e13") && player.ss.best.eq(0) && player.q.buyables[11].eq(0) && player.sb.best.eq(0) && player.sg.best.eq(0) && player.t.best.eq(0) && player.s.best.eq(0) && player.e.buyables[11].eq(0) && player.t.buyables[11].eq(0) && player.b.best.eq(0) && player.g.best.eq(0) && inChallenge("h", 42) },
				tooltip: 'Reach e2.5e13 Points while in the "Productionless" Hindrance and without Subspace Energy, Quirk Layers, any Row 3 currencies or buyables (except Enhance Points & Space Buildings), Boosters, or Generators.',
				image: "images/achs/125.png",
			},
			131: {
				name: "Artificially Mindless",
				done() { return player.mc.unlocked },
				tooltip: "Unlock Machines. Reward: Mastery is 10% cheaper.",
				image: "images/achs/131.png",
			},
			132: {
				name: "God is a Turtle",
				done() { return player.mc.buyables[11].gte(200) },
				tooltip: "Reach a Shell size of at least 200m. Reward: Shell Expansion's buff is raised ^5, its cost is divided by 7, & you get 2 free Gear Evolutions.",
				image: "images/achs/132.png",
			},
			133: {
				name: "Breaching the Barriers",
				done() { return player.mc.mechEn.gte("1e375") },
				tooltip: "Reach 1e375 Mech-Energy. Reward: You can have 2 parts of The Motherboard active at once, Northbridge's effect is cubed, and there is a new Gear Upgrade.",
				image: "images/achs/133.png",
			},
			134: {
				name: "Innermost Desire",
				done() { return player.mc.upgrades.includes(11) },
				tooltip() { return "Unlock The Core. Reward: Mastery is 0.0075% cheaper for every Phantom Soul you have (Currently: "+format(Decimal.sub(1, Decimal.pow(.999925, player.ps.points)).times(100))+"% cheaper)" },
				image: "images/achs/134.png",
			},
			135: {
				name: "One Quadrillion Zeros!",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.points.gte("ee15") },
				tooltip: "Reach e1e15 Points.",
				image: "images/achs/135.png",
			},
		},
		tabFormat: [
			"blank", 
			["display-text", function() { return "Achievements: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
			"blank", "blank",
			"achievements",
		],
		update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
			adjustNotificationTime(diff);
		},	
    }, 
)

addLayer("sc", {
	startData() { return {unlocked: true}},
	color: "#e6ff69",
	symbol: "SC",
	row: "side",
	layerShown() { return hasAchievement("a", 21) && player.scShown },
	tooltip: "Softcaps",
	tabFormat: [
		"blank", "blank", "blank",
		["raw-html", function() {
			let html = ""
			for (let id in SOFTCAPS) {
				let data = SOFTCAPS[id];
				if (data.display) if (data.display()) {
					html += "<div><h3>"+data.title+"</h3><br>"+data.info();
					html += "</div><br><br>";
				}
			}
			return html;
		}],
	],
}) 
