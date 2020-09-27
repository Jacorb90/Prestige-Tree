function buyUpg(layer, id) {
	if (!player[layer].unl) return
	if (!LAYER_UPGS[layer][id].unl()) return
	if (player[layer].upgrades.includes(id)) return
	let varType = LAYER_UPGS[layer].varType?LAYER_UPGS[layer].varType:"points"
	if (player[layer][varType].lt(LAYER_UPGS[layer][id].cost)) return 
	player[layer][varType] = player[layer][varType].sub(LAYER_UPGS[layer][id].cost)
	player[layer].upgrades.push(id);
	if (layer=="t"&&id==32) player.t.order = 0;
	if (layer=="e"&&(id==22||id==23)) {
		player.e.order = 0;
		if (!player.e.upgrades.includes(22)) player.e.upgrades.push(22)
		if (!player.e.upgrades.includes(23)) player.e.upgrades.push(23)
	}
	if (layer=="s"&&id==33) player.s.order = 0;
	if (layer=="hb"&&id==13) player.hb.order = 0;
	if (layer=="ss"&&id==15) player.ss.order = 0;
	if (layer=="m"&&id==43) for (let i=1;i<=3;i++) player.m.spellTimes[i] *= LAYER_UPGS.m[43].currently().toNumber()
	if (layer=="ps"&&id==14) player.l.order = 0;
	if (layer=="ps"&&id==24) player.hs.order = 0;
}

const LAYER_UPGS = {
	p: {
		rows: 3,
		cols: 3,
		11: {
			desc: "Gain 1 Point every second.",
			cost: new Decimal(1),
			unl() { return player.p.unl },
		},
		12: {
			desc: "Point generation is faster based on your unspent Prestige Points.",
			cost: new Decimal(1),
			unl() { return player.p.upgrades.includes(11) },
			currently() {
				if (tmp.challActive ? tmp.challActive.h[32] : true) return new Decimal(1)
				let ret = player.p.points.add(1).pow(player.g.upgrades.includes(24)?1.1:(player.g.upgrades.includes(14)?0.75:0.5)) 
				let ssPow = getPUpg2SS()
				if (ret.gte(Decimal.pow("1e20000000", ssPow))) ret = ret.sqrt().times(Decimal.pow("1e10000000", ssPow))
				if (ret.gte(Decimal.pow("1e75000000", ssPow))) ret = ret.log10().pow(8e6).times(Decimal.div(Decimal.pow("1e75000000", ssPow), Decimal.pow(Decimal.mul(75e6, ssPow), 8e6))).min(ret)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Point generation is faster based on your Point amount.",
			cost: new Decimal(5),
			unl() { return player.p.upgrades.includes(12) },
			currently() { 
				let ret = player.points.add(1).log10().pow(0.75).add(1)
				if (player.g.upgrades.includes(15)) ret = ret.pow(LAYER_UPGS.g[15].currently())
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Prestige Point gain is doubled.",
			cost: new Decimal(20),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(11) },
		},
		22: {
			desc: "Point generation is faster based on your Prestige Upgrades bought.",
			cost: new Decimal(75),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(12) },
			currently() {
				let ret = Decimal.pow(1.4, player.p.upgrades.length)
				if (IMPERIUM.collapsed(1)) ret = ret.pow(Decimal.sub(1, tmp.i.collapse[1]))
				return ret
			},
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Prestige Point gain is boosted by your Point amount.",
			cost: new Decimal(5e3),
			unl() { return (player.b.unl||player.g.unl)&&player.p.upgrades.includes(13) },
			currently() { 
				let ret = player.points.add(1).log10().cbrt().add(1) 
				if (player.g.upgrades.includes(23)) ret = ret.pow(LAYER_UPGS.g[23].currently())
				if (player.p.upgrades.includes(33)) ret = ret.pow(1.25)
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Prestige Point gain is boosted by your Prestige Point amount.",
			cost: new Decimal("1e4450"),
			unl() { return player.e.upgrades.includes(33) },
			currently() { 
				let ret = player.p.points.add(1).log10().add(1).pow(player.p.points.add(1).log10().div(200).add(1)).pow(player.p.upgrades.includes(32) ? LAYER_UPGS.p[32].currently() : 1) 
				let capStart = new Decimal("1e1000")
				if (player.sp.upgrades.includes(32)) capStart = capStart.times(LAYER_UPGS.sp[32].currently())
				if (ret.gte(capStart)) ret = ret.log10().times(capStart.div(1e3))
				if (player.sp.upgrades.includes(11)) ret = ret.pow(100)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		32: {
			desc: "The upgrade to the left is stronger based on your Points.",
			cost: new Decimal("1e5140"),
			unl() { return player.e.upgrades.includes(33) },
			currently() {
				let ret = player.points.add(1).log10().add(1).root(16);
				return ret;
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		33: {
			desc: "The above upgrade is 25% stronger.",
			cost: new Decimal("1e5500"),
			unl() { return player.e.upgrades.includes(33) },
		},
	},
	b: {
		rows: 3,
		cols: 3,
		11: {
			desc: "Boosters boost Prestige Point gain.",
			cost: new Decimal(3),
			unl() { return player.b.unl },
			currently() { return player.b.points.sqrt().add(1).max(1.5) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Generators add to the Booster effect.",
			cost: new Decimal(7),
			unl() { return player.g.unl },
			currently() { return player.g.points.add(1).log10().sqrt().div(3).times((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?8.5:1) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points add to the Booster effect.",
			cost: new Decimal(8),
			unl() { return player.b.best.gte(8) },
			currently() { return player.p.points.add(1).log10().add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		21: {
			desc: "Square the Generator Power effect.",
			cost: new Decimal(10),
			unl() { return player.b.upgrades.includes(11) && player.b.upgrades.includes(12) },
		},
		22: {
			desc: "The Generator Power effect is raised to the power of 1.2.",
			cost: new Decimal(15),
			unl() { return player.b.upgrades.includes(12) && player.b.upgrades.includes(13) },
		},
		23: {
			desc: "Boosters are cheaper based on your points.",
			cost: new Decimal(18),
			unl() { return player.b.upgrades.includes(21) || player.b.upgrades.includes(22) },
			currently() { return player.points.add(1).log10().add(1).pow(3.2).pow(tmp.s !== undefined && tmp.s.trueSbUnl >= 4 ? tmp.s.sbEff[4] : 1) },
			effDisp(x) { return "/"+format(x) },
		},
		31: {
			desc: "Hyper-Boosters multiply the Booster base.",
			cost: new Decimal(1250),
			unl() { return player.hb.upgrades.includes(14) },
			currently() { return Decimal.pow(4, player.hb.points.pow(2)) },
			effDisp(x) { return format(x)+"x" },
		},
		32: {
			desc: "Add free Boosters based on your Generator Power.",
			cost: new Decimal(1260),
			unl() { return player.hb.upgrades.includes(14) },
			currently() {
				let ret = player.g.power.add(1).log10().sqrt().floor();
				if (ret.gte(1e3)) ret = ret.log10().times(1e3/3)
				return ret;
			},
			effDisp(x) { return "+"+formatWhole(x) },
		},
		33: {
			desc: "Add 100 free Boosters.",
			cost: new Decimal(1269),
			unl() { return player.hb.upgrades.includes(14) },
		},
	},
	g: {
		rows: 3,
		cols: 5,
		11: {
			desc: "Generators boost Prestige Point gain.",
			cost: new Decimal(3),
			unl() { return player.g.unl },
			currently() { return player.g.points.sqrt().add(1).max(1.5) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Boosters boost Generator Power gain.",
			cost: new Decimal(7),
			unl() { return player.b.unl },
			currently() { return player.b.points.add(1).log10().sqrt().div(3).times((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?3.75:1) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		13: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(8),
			unl() { return player.g.best.gte(8) },
			currently() { return player.p.points.add(1).log10().add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		14: {
			desc: "Prestige Upgrade 2 uses a better formula.",
			cost: new Decimal(13),
			unl() { return player.g.best.gte(10) },
		},
		15: {
			desc: "Prestige Upgrade 3 is stronger based on your Generators.",
			cost: new Decimal(15),
			unl() { return player.g.upgrades.includes(13) },
			currently() { 
				let ret = player.g.points.sqrt().add(1).times((player.e.upgrades.includes(32)&&!(tmp.challActive?tmp.challActive.h[12]:true)) ? LAYER_UPGS.e[32].currently() : 1) 
				if (ret.gte(400)) ret = ret.cbrt().times(Math.pow(400, 2/3))
				return ret;
			},
			effDisp(x) { return "^"+format(x) },
		},
		21: {
			desc: "Generator Power generates faster based on its amount.",
			cost: new Decimal(18),
			unl() { return player.g.upgrades.includes(15) },
			currently() { return player.g.power.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Generators are cheaper based on your Prestige Points.",
			cost: new Decimal(19),
			unl() { return player.g.upgrades.includes(15) },
			currently() { return player.p.points.add(1).pow(0.25).pow(player.g.upgrades.includes(32)?2.5:1) },
			effDisp(x) { return "/"+format(x) },
		},
		23: {
			desc: "Prestige Upgrade 6 is stronger based on your Boosters.",
			cost: new Decimal(20),
			unl() { return player.b.unl && player.g.upgrades.includes(15) },
			currently() { return player.b.points.pow(0.75).add(1) },
			effDisp(x) { return "^"+format(x) },
		},
		24: {
			desc: "Prestige Upgrade 2 uses an even better formula.",
			cost: new Decimal(22),
			unl() { return player.g.upgrades.includes(14) && (player.g.upgrades.includes(21)||player.g.upgrades.includes(22)) },
		},
		25: {
			desc: "Prestige Points boost Generator Power gain.",
			cost: new Decimal(28),
			unl() { return player.g.upgrades.includes(23) && player.g.upgrades.includes(24) },
			currently() { return player.p.points.add(1).log10().sqrt().add(1).pow((player.t.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true))?2.75:1).pow(player.g.upgrades.includes(31) ? LAYER_UPGS.g[31].currently() : 1) },
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Generator Upgrade 10 is stronger based on your Generators.",
			cost: new Decimal(950),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.points.add(1).log10().pow(3.6).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		32: {
			desc: "Generator Upgrade 7 is 150% stronger.",
			cost: new Decimal(960),
			unl() { return player.ss.upgrades.includes(21) },
		},
		33: {
			desc: "Generator Power adds to the Generator base.",
			cost: new Decimal(1025),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.power.add(1).log10().div(15).add(1) },
			effDisp(x) { return "+"+format(x) },
		},
		34: {
			desc: "Generators are stronger based on their amount.",
			cost: new Decimal(1068),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.g.points.add(1).log10().add(1).log10().add(1).sqrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		35: {
			desc: "Subspace boosts Generator Power gain.",
			cost: new Decimal(1130),
			unl() { return player.ss.upgrades.includes(21) },
			currently() { return player.ss.subspace.add(1).pow(40).pow(player.q.upgrades.includes(54)?20:1) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	e: {
		rows: 3,
		cols: 5,
		11: {
			desc: "Boosters & Generators boost each other.",
			cost: new Decimal(40),
			unl() { return player.e.unl },
			currently() { 
				let exp = 1
				if (player.e.upgrades.includes(14)&&!(tmp.challActive?tmp.challActive.h[12]:true)) exp = 1.5
				return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp)} 
			},
			effDisp(x) { return "+"+format(x.g)+" to Generator base, +"+format(x.b)+" to Booster base" },
		},
		12: {
			desc: "Unspent Enhance Points boost Prestige Point gain.",
			cost: new Decimal(150),
			unl() { return player.e.unl&&player.e.best.gte(40) },
			currently() { 
				let ret = player.e.points.add(1).pow((player.e.upgrades.includes(15)&&!(tmp.challActive?tmp.challActive.h[12]:true))?3.25:1.5) 
				if (ret.gte("1e1500")) ret = ret.sqrt().times("1e750")
				return ret
			},
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "You gain 1e10x as many Prestige Points.",
			cost: new Decimal(1000),
			unl() { return player.e.upgrades.includes(11)||player.e.upgrades.includes(12) },
		},
		14: {
			desc: "Enhance Upgrade 1 uses a better formula.",
			cost: new Decimal(5e7),
			unl() { return player.e.upgrades.includes(13)&&(player.t.unl||player.s.unl) },
		},
		15: {
			desc: "Enhance Upgrade 2 uses a better formula.",
			cost: new Decimal(2e10),
			unl() { return player.e.upgrades.includes(14)&&(player.t.unl||player.s.unl)&&player.e.best.gte(1e9) },
		},
		21: {
			desc: "The Generator Power effect is raised to the power of 1.15.",
			cost: new Decimal(1e15),
			unl() { return player.t.unl&&(player.t.order==1||player.s.unl)&&player.e.upgrades.includes(14) },
		},
		22: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e22),
			unl() { return (player.t.unl&&player.s.unl&&player.e.order==2)||player.e.upgrades.includes(22) },
		},
		23: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(1e40),
			unl() { return (player.t.unl&&player.s.unl&&player.e.order==1)||player.e.upgrades.includes(23) },
		},
		24: {
			desc: "Prestige Points boost Enhance Point gain.",
			cost: new Decimal(1e65),
			unl() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e50) },
			currently() { return player.p.points.add(1).pow(0.002) },
			effDisp(x) { return format(x)+"x" },
		},
		25: {
			desc: "Enhancers are stronger based on your Space Energy & Time Capsules.",
			cost: new Decimal(7.777e77),
			unl() { return player.t.unl&&player.s.unl&&player.e.best.gte(1e60) },
			currently() { 
				let ret = player.s.points.add(player.t.points).div(32).add(1);
				if (ret.gte(2)) ret = ret.log(2).add(1).times(2).sqrt();
				return ret;
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		31: {
			desc: "Enhancers are stronger based on your Super-Boosters.",
			cost: new Decimal(1e90),
			unl() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently() { return player.sb.points.pow(0.75).div(4).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		32: {
			desc: "Generator Upgrade 5 is stronger based on your Enhance Points.",
			cost: new Decimal(7.5e108),
			unl() { return player.e.upgrades.includes(25)&&player.sb.unl },
			currently() { 
				let ret = Decimal.pow(10, player.e.points.add(1).log10().pow(0.085)).div(10).max(1).min(10);
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		33: {
			desc: "Unlock 3 new Prestige Upgrades.",
			cost: new Decimal(2.5e139),
			unl() { return player.e.upgrades.includes(31)||player.e.upgrades.includes(32) },
		},
		34: {
			desc: "You gain 1e40x as many Prestige Points.",
			cost: new Decimal(1e152),
			unl() { return player.e.upgrades.includes(31)&&player.e.upgrades.includes(32) },
		},
		35: {
			desc: "Points boost Generator Power gain.",
			cost: new Decimal(2e189),
			unl() { return player.e.upgrades.includes(33)||player.e.upgrades.includes(34) },
			currently() { return player.points.add(1).pow(0.004) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	t: {
		rows: 3,
		cols: 4,
		11: {
			desc: "Non-extra Time Capsules boost the Booster effect.",
			cost: new Decimal(2),
			unl() { return player.t.unl },
			currently() { return player.t.points.pow(0.9).add(0.5).add((player.t.upgrades.includes(13)&&!(tmp.challActive?tmp.challActive.h[12]:true))?LAYER_UPGS.t[13].currently():0) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		12: {
			desc: "The Time Energy cap starts later based on your Boosters, and you get a free Extra Time Capsule.",
			cost: new Decimal(3),
			unl() { return player.t.best.gte(2)&&player.t.unl },
			currently() { return player.b.points.pow(0.95).add(1).pow(player.q.upgrades.includes(43)?16:1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Extra Time Capsules are added to the first Time Upgrade's effect formula, but at a reduced amount.",
			cost: new Decimal(3),
			unl() { return player.t.upgrades.includes(11) },
			currently() { return player.t.extCapsules.add(tmp.freeExtCap).pow(0.95) },
			effDisp(x) { return "+"+format(x) },
		},
		14: {
			desc: "Generator Upgrades 2 & 10 are 275% stronger, and Booster Upgrade 2 is 750% stronger.",
			cost: new Decimal(4),
			unl() { return player.t.upgrades.includes(12)||player.t.upgrades.includes(13) },
		},
		21: {
			desc: "Time Energy boosts its own production & limit, and the Time Energy effect uses a better formula.",
			cost: new Decimal(4),
			unl() { return player.t.upgrades.includes(14) },
			currently() { return player.t.energy.add(1).log10().pow(1.1).add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Time Energy production & limit are boosted by your Enhance Points.",
			cost: new Decimal(5),
			unl() { return player.t.upgrades.includes(14)&&player.e.unl },
			currently() { 
				let ret = player.e.points.add(1).pow(0.8/(1+player.t.order))
				if (ret.gte("1e400")) ret = ret.log10().times(Decimal.div("1e400", 400)).min(ret)
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Time Energy production & limit are boosted by your Space Energy.",
			cost: new Decimal(5),
			unl() { return player.t.upgrades.includes(14)&&player.s.unl },
			currently() { return Decimal.pow(3, player.s.points.pow(0.9)) },
			effDisp(x) { return format(x)+"x" },
		},
		24: {
			desc: "Get 18 free boosters added to their effect.",
			cost: new Decimal(7),
			unl() { return player.t.upgrades.includes(21)&&player.t.best.gte(5) },
		},
		31: {
			desc: "Add 25 to the booster effect base.",
			cost: new Decimal(8),
			unl() { return (player.t.upgrades.includes(22)&&(player.e.order==1||player.s.unl))||(player.t.upgrades.includes(23)&&(player.s.order==1||player.e.unl)) },
		},
		32: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl() { return (player.s.unl&&player.e.unl)||player.t.upgrades.includes(32) },
		},
		33: {
			desc: "Add 40 to the booster effect base.",
			cost: new Decimal(16),
			unl() { return player.s.unl&&player.e.unl&&player.t.upgrades.includes(32) },
		},
		34: {
			desc: "Time Energy caps later and generates faster based on your non-free Time Capsules.",
			cost: new Decimal(18),
			unl() { return player.t.upgrades.includes(33)&&player.sb.unl },
			currently() { return Decimal.pow(10, player.t.points.pow(1.2)) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	s: {
		rows: 4,
		cols: 4,
		11: {
			desc: "Add a free level to all Space Buildings.",
			cost: new Decimal(2),
			unl() { return player.s.unl },
		},
		12: {
			desc: "Generator Power boosts its own generation.",
			cost: new Decimal(3),
			unl() { return player.s.best.gte(2)&&player.s.unl },
			currently() { return player.g.power.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Space Building Levels boost Generator Power gain, and get 2 extra Space.",
			cost: new Decimal(3),
			unl() { return player.s.upgrades.includes(11) },
			currently() { return Decimal.pow(20, tmp.s !== undefined ? tmp.s.sbSum : 0) },
			effDisp(x) { return format(x)+"x" },
		},
		14: {
			desc: "Unlock a 4th Space Building, and add a free level to all Space Buildings.",
			cost: new Decimal(4),
			unl() { return player.s.upgrades.includes(12)&&player.s.upgrades.includes(13) },
		},
		21: {
			desc: "All Space Buildings are stronger based on your Generators.",
			cost: new Decimal(4),
			unl() { return player.s.upgrades.includes(14) },
			currently() { return player.g.points.add(1).log10().div(1.5).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		22: {
			desc: "Space Buildings are stronger based on your Time Energy.",
			cost: new Decimal(6),
			unl() { return player.s.upgrades.includes(14)&&player.t.unl },
			currently() { return player.t.energy.add(1).log10().add(1).log10().div(5).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		23: {
			desc: "Space Buildings are stronger based on your Enhancers.",
			cost: new Decimal(5),
			unl() { return player.s.upgrades.includes(14)&&player.e.unl },
			currently() { return player.e.enhancers.sqrt().div((player.s.order==0)?5:7).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		24: {
			desc: "Space Building costs scale half as fast, and you have 3 more Space.",
			cost: new Decimal(7),
			unl() { return player.s.upgrades.includes(21)&&(player.t.unl||player.e.unl) },
		},
		31: {
			desc: "Space Building 1 uses a better formula.",
			cost: new Decimal(7),
			unl() { return (player.s.upgrades.includes(22)&&(player.t.order==0||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==0||player.t.unl)) },
		},
		32: {
			desc: "Unlock a 5th Space Building.",
			cost: new Decimal(8),
			unl() { return (player.s.upgrades.includes(22)&&(player.t.order==1||player.e.unl))||(player.s.upgrades.includes(23)&&(player.e.order==1||player.t.unl)) },
		},
		33: {
			desc: "This layer behaves as if you chose it first (base req is now 1e120 points)",
			cost: new Decimal(12),
			unl() { return (player.t.unl&&player.e.unl)||player.s.upgrades.includes(33) },
		},
		34: {
			desc: "Space Buildings boost the Generator Power effect (before all other boosts).",
			cost: new Decimal(15),
			unl() { return player.t.unl&&player.e.unl&&player.t.order==0&&player.e.order==0&&player.s.order==0 },
			currently() { return Decimal.pow(tmp.s !== undefined ? tmp.s.sbSum : 0, 0.2).div(17.5) },
			effDisp(x) { return "Add "+format(x)+" to exponent" },
		},
		41: {
			desc: "Total Space cheapens Space Buildings.",
			cost: new Decimal(128),
			unl() { return player.ba.upgrades.includes(51) },
			currently() { return Decimal.pow("1e4000", getSpace().add(player.s.spent).sqrt()) },
			effDisp(x) { return "/"+format(x) },
		},
		42: {
			desc: "The Space Building cost formula is 40% weaker.",
			cost: new Decimal(131),
			unl() { return player.ba.upgrades.includes(51) },
		},
		43: {
			desc: "Space Building 2 uses a better formula.",
			cost: new Decimal(133),
			unl() { return player.ba.upgrades.includes(51) },
		},
		44: {
			desc: "All Space Buildings are 25% stronger.",
			cost: new Decimal(140),
			unl() { return player.ba.upgrades.includes(51) },
		},
	},
	sb: {
		rows: 2,
		cols: 2,
		11: {
			desc: "Super-Boosters are stronger based on your Prestige Points.",
			cost: new Decimal(2),
			unl() { return player.sb.unl },
			currently() { 
				let ret = Decimal.pow(10, player.p.points.add(1).log10().div(1e5).sqrt());
				if (ret.gte(2.5)) ret = ret.log(2.5).add(1.5).min(ret);
				if (ret.gte(40)) ret = ret.log(40).times(40);
				return ret.max(1);
			},
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Super-Boosters are stronger based on your Generators.",
			cost: new Decimal(4),
			unl() { return player.sb.upgrades.includes(11) },
			currently() { return player.g.points.div(10).pow(0.04).max(1) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Super-Boosters add to the Booster base.",
			cost: new Decimal(8),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.sb.points.pow(2.15) },
			effDisp(x) { return "+"+format(x) },
		},
		22: {
			desc: "Super-Boosters add to the Super-Booster base.",
			cost: new Decimal(12),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.sb.points.add(1).log10().div(3) },
			effDisp(x) { return "+"+format(x) },
		},
	},
	sg: {
		res: "super-generator power",
		varType: "power",
		rows: 1,
		cols: 3,
		11: {
			desc: "Multiply the Super-Generator base based on your Super-Generator Power.",
			cost: new Decimal("1e750"),
			unl() { return player.ge.upgrades.includes(15) },
			currently() { return player.sg.power.plus(1).log10().plus(1).log10().times(2.5).plus(1).root(1.2) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Super-Boosters & Super-Generators provide free versions of each other.",
			cost: new Decimal("1e810"),
			unl() { return player.ge.upgrades.includes(15) },
			currently() { return {
				sb: player.sg.points.div(10),
				sg: player.sb.points.div(5),
			}},
			effDisp(x) { return "+"+format(x.sb)+" SB, +"+format(x.sg)+" SG" },
		},
		13: {
			desc: "Generators are stronger based on your Super-Generators.",
			cost: new Decimal("1e917"),
			unl() { return player.ge.upgrades.includes(15) },
			currently() { return player.sg.points.plus(1).log10().times(1.085).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
	},
	q: {
		rows: 5,
		cols: 4,
		11: {
			desc: "Quirks & Hindrance Spirit boost Point, Prestige Point, and Enhance Point gain.",
			cost: new Decimal(1),
			unl() { return player.q.unl&&player.q.layers.gt(0) },
			currently() { return player.q.points.add(1).times(player.h.points.add(1)).pow(0.75) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "The Quirk Energy and Hindrance Spirit effects use better formulas.",
			cost: new Decimal(3),
			unl() { return player.q.upgrades.includes(11)&&player.h.best.gte(3) },
		},
		13: {
			desc: "Quirk Layers are twice as fast.",
			cost: new Decimal(50),
			unl() { return player.q.upgrades.includes(11)&&player.h.challs.includes(11) },
		},
		14: {
			desc: "Quirk Layers are thrice as fast.",
			cost: new Decimal(2e10),
			unl() { return player.h.challs.includes(32) },
		},
		21: {
			desc: "Quirk Layers are faster based on your Quirks.",
			cost: new Decimal(160),
			unl() { return (player.q.upgrades.includes(12)||player.q.upgrades.includes(13))&&player.h.challs.includes(12) },
			currently() { return player.q.points.add(1).log10().add(1).pow(player.m.upgrades.includes(42)?1.5:1) },
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Quirk & Hindrance Spirit gain boost each other.",
			cost: new Decimal(400),
			unl() { return player.q.upgrades.includes(12)&&player.q.upgrades.includes(13)&&player.h.challs.includes(12) },
			currently() { return {
				q: player.h.points.div(10).add(1).sqrt(),
				h: player.q.points.div(10).add(1).sqrt(),
			}},
			effDisp(x) { return format(x.q)+"x to Quirk gain, "+format(x.h)+"x to Hindrance Spirit gain" },
		},
		23: {
			desc: "The Time Energy limit is 1e10x higher.",
			cost: new Decimal(5000),
			unl() { return player.q.upgrades.includes(21)||player.q.upgrades.includes(22) },
		},
		24: {
			desc: "The Time Energy limit is higher based on your Quirk Energy.",
			cost: new Decimal(5e10),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.q.energy.div(1e6).add(1).pow(0.9) },
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Get 1 of each Space Building for free.",
			cost: new Decimal(150000),
			unl() { return player.q.upgrades.includes(21)&&player.q.upgrades.includes(22) },
		},
		32: {
			desc: "The Quirk Energy effect is squared.",
			cost: new Decimal(500000),
			unl() { return player.q.upgrades.includes(23)||player.q.upgrades.includes(31) },
		},
		33: {
			desc: "Time Capsules are stronger based on their amount.",
			cost: new Decimal(2e9),
			unl() { return player.q.upgrades.includes(23)&&player.q.upgrades.includes(31) },
			currently() { return player.t.points.add(player.t.extCapsules.add(tmp.freeExtCap)).add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		34: {
			desc: "Enhance Points boost Hindrance Spirit & Quirk gain.",
			cost: new Decimal(1e11),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.e.points.add(1).log10().cbrt().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		41: {
			desc: "Space Buildings are 40% stronger.",
			cost: new Decimal(2.5e13),
			unl() { return player.h.challs.includes(32) },
		},
		42: {
			desc: "Enhancers are 40% stronger.",
			cost: new Decimal(2e14),
			unl() { return player.h.challs.includes(32) },
		},
		43: {
			desc: "Time Upgrade 2 is 1,500% stronger.",
			cost: new Decimal(1e16),
			unl() { return player.h.challs.includes(32) },
		},
		44: {
			desc: "You gain more Hindrance Spirit based on your Quirk Energy.",
			cost: new Decimal(4e16),
			unl() { return player.h.challs.includes(32) },
			currently() { return player.q.energy.add(1).log10().add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		51: {
			desc: "Get free Quirk Layers based on your Quirk Energy.",
			cost: new Decimal("1e2100"),
			unl() { return player.ba.upgrades.includes(52) },
			currently() { return player.q.energy.add(1).log10().add(1).log10() },
			effDisp(x) { return "+"+format(x) },
		},
		52: {
			desc: "Quirk Layers are faster based on your Quirk Layers.",
			cost: new Decimal("1e2400"),
			unl() { return player.ba.upgrades.includes(52) },
			currently() { return Decimal.pow(10, player.q.layers) },
			effDisp(x) { return format(x)+"x" },
		},
		53: {
			desc: "The second Enhancer effect also multiplies the Booster/Generator base.",
			cost: new Decimal("1e2750"),
			unl() { return player.ba.upgrades.includes(52) },
		},
		54: {
			desc: "Generator Upgrade 15's effect is raised to the power of 20.",
			cost: new Decimal("1e3125"),
			unl() { return player.ba.upgrades.includes(52) },
		},
	},
	hb: {
		rows: 1,
		cols: 4,
		11: {
			desc: "Super-Boosters are stronger based on your Hyper-Boosters.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
			currently() { return player.hb.points.sqrt().div(4).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		12: {
			desc: "Hyper-Boosters are stronger based on your Super-Boosters.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
			currently() { return player.sb.points.div(10).add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		13: {
			desc: "This layer behaves as if you chose it first.",
			cost: new Decimal(2),
			unl() { return player.hb.order>0||(player.ss.upgrades.includes(15))||player.hb.upgrades.includes(13)||(player.m.unl||player.ba.unl) },
		},
		14: {
			desc: "Unlock 3 new Booster Upgrades.",
			cost: new Decimal(3),
			unl() { return player.hb.upgrades.includes(13)&&player.ss.upgrades.includes(15) },
		},
	},
	ss: {
		rows: 2,
		cols: 5,
		11: {
			desc: "You get more Space based on your Subspace Energy.",
			cost: new Decimal(1),
			unl() { return player.ss.unl },
			currently() { return player.ss.points.sqrt().times(150).floor() },
			effDisp(x) { return formatWhole(x)+" more Space" },
		},
		12: {
			desc: "You generate Subspace faster based on your Points.",
			cost: new Decimal(2),
			unl() { return player.ss.unl },
			currently() { return player.points.add(1).log10().div(1e4).add(1) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Subspace's third effect is 50% stronger.",
			cost: new Decimal(2),
			unl() { return player.ss.unl },
		},
		14: {
			desc: "Super-Boosters are 8.25% cheaper.",
			cost: new Decimal(2),
			unl() { return player.hb.unl },
		},
		15: {
			desc: "This layer behaves as if you chose it first.",
			cost: new Decimal(3),
			unl() { return player.ss.order>0||(player.hb.upgrades.includes(13))||player.ss.upgrades.includes(15)||(player.m.unl||player.ba.unl) },
		},
		21: {
			desc: "Unlock 5 new Generator Upgrades.",
			cost: new Decimal(4),
			unl() { return player.hb.upgrades.includes(13)&&player.ss.upgrades.includes(15) },
		},
		22: {
			desc: "You generate Subspace faster based on its amount.",
			cost: new Decimal(5),
			unl() { return player.ss.upgrades.includes(21)&&(player.h.challs.includes(51)||player.h.challs.includes(52)) },
			currently() { return player.ss.subspace.add(1).root(2.25) },
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Subspace beyond 1e20 multiplies the Generator Power base.",
			cost: new Decimal(6),
			unl() { return player.ba.upgrades.includes(24) },
			currently() { return player.ss.subspace.sub(1e20).max(0).div(1e20).add(1).sqrt() },
			effDisp(x) { return format(x)+"x" },
		},
		24: {
			desc: "Subspace Energy boosts Subspace gain.",
			cost: new Decimal(7),
			unl() { return player.ba.upgrades.includes(24) },
			currently() {
				let x = player.ss.points
				if (player.ba.upgrades.includes(25)) x = x.times(LAYER_UPGS.ba[25].currently())
				return Decimal.pow(2, x)
			},
			effDisp(x) { return format(x)+"x" },
		},
		25: {
			desc: "Subspace is generated faster based on your Quirk Layers.",
			cost: new Decimal(8),
			unl() { return player.ba.upgrades.includes(24) },
			currently() {
				let x = player.q.layers.sqrt()
				if (player.ba.upgrades.includes(25)) x = x.times(LAYER_UPGS.ba[25].currently())
				return Decimal.pow(10, x)
			},
			effDisp(x) { return format(x)+"x" },
		},
	},
	m: {
		rows: 4,
		cols: 4,
		11: {
			desc: "Hexes boost all Spells.",
			cost: new Decimal(5),
			unl() { return player.m.unl },
			currently() { return player.m.hexes.times(3).add(1).log10().add(1).log10().add(1).log10().add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		12: {
			desc: "Unlock 2 new Hindrances.",
			cost: new Decimal(10),
			unl() { return player.m.upgrades.includes(11) },
		},
		13: {
			desc: "Hexes add to the Hyper-Booster base.",
			cost: new Decimal(15),
			unl() { return player.m.upgrades.includes(11) },
			currently() { return player.m.hexes.add(1).log10().add(1).log10().add(1).log10().div(2.5) },
			effDisp(x) { return "+"+format(x)+" to base" },
		},
		14: {
			desc: "You get more Hexes based on your best Magic.",
			cost: new Decimal(20),
			unl() { return player.m.upgrades.includes(12) },
			currently() { return player.m.best.times(1.2).add(1).pow(0.8) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Spells 2 & 3 are stronger based on your Hindrance Spirit.",
			cost: new Decimal(1000),
			unl() { return player.m.upgrades.includes(13) },
			currently() { return player.h.points.add(1).log10().add(1).log10().add(1).log10().add(1).sqrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		22: {
			desc: "Spell 2 is 900% stronger.",
			cost: new Decimal(2500),
			unl() { return player.m.upgrades.includes(14) },
		},
		23: {
			desc: "The Time Energy cap starts 1e500x later.",
			cost: new Decimal(6500),
			unl() { return player.m.upgrades.includes(21) },
		},
		24: {
			desc: "Add free Quirk Layers based on your Boosters.",
			cost: new Decimal(80000),
			unl() { return player.m.upgrades.includes(22) },
			currently() { return player.b.points.add(1).log10().times(0.9) },
			effDisp(x) { return "+"+format(x) },
		},
		31: {
			desc: "Unlock a new Hindrance.",
			cost: new Decimal(2.5e6),
			unl() { return player.m.upgrades.includes(23)&&player.sg.unl },
		},
		32: {
			desc: "Hyper-Boosters add free Space Buildings.",
			cost: new Decimal(5e9),
			unl() { return player.m.upgrades.includes(24) },
			currently() { return player.hb.points.add(1).pow(3) },
			effDisp(x) { return "+"+formatWhole(x) },
		},
		33: {
			desc: "Hindrance Spirit adds to the Hyper-Booster base.",
			cost: new Decimal(2e10),
			unl() { return player.m.upgrades.includes(31) },
			currently() { return player.h.points.add(1).log10().add(1).log10().add(1).log10().div(2) },
			effDisp(x) { return "+"+format(x) },
		},
		34: {
			desc: "Add 1 free Quirk Layer.",
			cost: new Decimal(4e10),
			unl() { return player.m.upgrades.includes(32) },
		},
		41: {
			desc: "You can insert more Magic into Spells, making them stronger.",
			cost: new Decimal(2.5e14),
			unl() { return player.m.upgrades.includes(34) },
		},
		42: {
			desc: "Quirk Upgrade 5 is 50% stronger.",
			cost: new Decimal(6e14),
			unl() { return player.m.upgrades.includes(34) },
		},
		43: {
			desc: "Spells last longer based on your Hexes.",
			cost: new Decimal(1e15),
			unl() { return player.m.upgrades.includes(41) },
			currently() { return player.m.hexes.add(1).log10().add(1).sqrt().min(86400) },
			effDisp(x) { return format(x)+"x" },
		},
		44: {
			desc: "Magic adds to the Time Capsule base.",
			cost: new Decimal(1.5e15),
			unl() { return player.m.upgrades.includes(41) },
			currently() { return player.m.points.add(1).log10().div(10) },
			effDisp(x) { return "+"+format(x) },
		},
	},
	ba: {
		rows: 5,
		cols: 5,
		11: {
			desc: "All Balance Energy effects use better formulas.",
			cost: new Decimal(5),
			unl() { return player.ba.unl },
		},
		12: {
			desc: "Subspace is generated faster based on your Positivity & Negativity.",
			cost: new Decimal(10),
			unl() { return player.ba.upgrades.includes(11) },
			currently() { return (tmp.balEff2?tmp.balEff2:new Decimal(1)).max(1).pow(4) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Multiply all Quirk Layers based on your Balance Power, and the Quirk Energy effect is cubed.",
			cost: new Decimal(25),
			unl() { return player.ba.upgrades.includes(11) },
			currently() { 
				let ret = player.ba.power.add(1).pow(1.25);
				if (ret.gte("1e1000")) ret = ret.log10().pow(10).times("1e970").min(ret);
				if (ret.gte("1e2000")) ret = ret.log10().pow(10).times("1e1967").min(ret);
				return ret;
			},
			effDisp(x) { return format(x)+"x" },
		},
		14: {
			desc: "The Balance Power effect uses a better formula.",
			cost: new Decimal(120),
			unl() { return player.ba.upgrades.includes(12) },
		},
		21: {
			desc: "Negativity boosts Super-Generator Power gain.",
			cost: new Decimal(300),
			unl() { return player.ba.upgrades.includes(13)&&player.sg.unl },
			currently() {
				let x = player.ba.negativity.add(1).sqrt()
				if (x.gte("1e400")) x = Decimal.pow(10, x.log10().times(20).pow(2/3))
				if (x.gte("1e555")) x = x.log10().pow(2).times(Decimal.div("1e555", Math.pow(555, 2))).min(x)
				return x
			},
			effDisp(x) { return format(x)+"x" },
		},
		22: {
			desc: "Balance Power boosts Positivity & Negativity gain.",
			cost: new Decimal(2000),
			unl() { return player.ba.upgrades.includes(14) },
			currently() { return player.ba.power.add(1).pow(0.15) },
			effDisp(x) { return format(x)+"x" },
		},
		23: {
			desc: "Super-Generators add to their base.",
			cost: new Decimal(7500),
			unl() { return player.ba.upgrades.includes(21) },
			currently() { return player.sg.points.pow(2).div(2) },
			effDisp(x) { return "+"+format(x) },
		},
		24: {
			desc: "Unlock 3 new Subspace Upgrades.",
			cost: new Decimal(2e4),
			unl() { return player.ba.upgrades.includes(22) },
		},
		31: {
			desc: "The Quirk Layer cost is adjusted based on your Balance Upgrades bought.",
			cost: new Decimal(4e5),
			unl() { return player.ba.upgrades.includes(23) },
			currently() { return Decimal.div(0.8, Math.pow(player.ba.upgrades.length+1, 0.1)).add(1.2) },
			effDisp(x) { return "2 -> "+format(x) },
		},
		32: {
			desc: "Enhancers are stronger based on your Positivity.",
			cost: new Decimal(5e5),
			unl() { return player.ba.upgrades.includes(24) },
			currently() { return player.ba.positivity.add(1).log10().add(1).log10().add(1).pow(2) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		33: {
			desc: "The Balance Power effect is squared.",
			cost: new Decimal(1e6),
			unl() { return player.ba.upgrades.includes(31) },
		},
		34: {
			desc: "The Positivity & Negativity effect uses a better formula.",
			cost: new Decimal(2e6),
			unl() { return player.ba.upgrades.includes(32) },
		},
		41: {
			desc: "The first Balance Energy effect is squared.",
			cost: new Decimal(2e10),
			unl() { return player.ba.upgrades.includes(33)&&player.ba.upgrades.includes(34) },
		},
		42: {
			desc: "The Space Building 1 effect is stronger based on your Space Building 1 amount.",
			cost: new Decimal(3e11),
			unl() { return player.ba.upgrades.includes(33)&&player.ba.upgrades.includes(34) },
			currently() { return tmp.s.sb[1].add(1).pow(0.8) },
			effDisp(x) { return "^"+format(x) },
		},
		43: {
			desc: "The post-25 Extra Time Capsule cost scaling is disabled.",
			cost: new Decimal(1e12),
			unl() { return player.ba.upgrades.includes(41)||player.ba.upgrades.includes(42) },
		},
		44: {
			desc: "Space Buildings are 50% stronger.",
			cost: new Decimal(2e12),
			unl() { return player.ba.upgrades.includes(42)||player.ba.upgrades.includes(43) },
		},
		51: {
			desc: "Unlock 4 new Space Upgrades.",
			cost: new Decimal(2e13),
			unl() { return player.ba.upgrades.includes(43) },
		},
		52: {
			desc: "Unlock 4 new Quirk Upgrades.",
			cost: new Decimal(1e14),
			unl() { return player.ba.upgrades.includes(51) },
		},
		53: {
			desc: "The Positivity & Negativity boost to Balance Power gain is stronger based on your Super-Generator Power.",
			cost: new Decimal(2e19),
			unl() { return player.ba.upgrades.includes(51)&&player.sg.unl },
			currently() { return player.sg.power.add(1).log10().div(25).add(1).sqrt() },
			effDisp(x) { return "^"+format(x) },
		},
		54: {
			desc: "Balance Power boosts the first Balance Energy effect. (stronger based on your Best Balance Power)",
			cost: new Decimal(5e25),
			unl() { return player.ba.upgrades.includes(53) },
			currently() { return player.ba.power.add(1).times(player.ba.best.add(1).sqrt()).cbrt() },
			effDisp(x) { return format(x)+"x" },
		},
		15: {
			desc: "Positivity and Negativity reduce the cost scaling of Space Buildings.",
			cost: new Decimal(1e200),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ba.positivity.add(1).div(player.ba.negativity.add(1)).log10().div(20).add(0.5).max(1) },
			effDisp(x) { return format(Decimal.sub(1, x.recip()).times(100))+"%" },
		},
		25: {
			desc: "Balance Power boosts Subspace Upgrades 9 and 10.",
			cost: new Decimal(1e245),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ba.power.add(1).log10().div(10).max(1).cbrt() },
			effDisp(x) { return "^"+format(x) },
		},
		35: {
			desc: "Super-Upgrades are 25% stronger.",
			cost: new Decimal(1e260),
			unl() { return player.sp.upgrades.includes(44) },
		},
		45: {
			desc: "Subspace reduces both Hyperspace costs.",
			cost: new Decimal("6.66e666"),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.ss.subspace.add(1).pow(0.02) },
			effDisp(x) { return format(x)+"x" },
		},
		55: {
			desc: "Super-Prestige Points cheapen Quirk Layers.",
			cost: new Decimal("1e920"),
			unl() { return player.sp.upgrades.includes(44) },
			currently() { return player.sp.points.max(1).log10().pow(0.75).div(2) },
			effDisp(x) { return "-"+format(x)+" layers" },
		},
	},
	ps: {
		rows: 2,
		cols: 4,
		11: {
			desc: "Hindrance Spirits reduce the requirement of Phantom Souls.",
			cost: new Decimal(2),
			unl() { return true },
			currently() { return player.h.points.add(1).pow(0.01) },
			effDisp(x) { return format(x)+"x" },
		},
		12: {
			desc: "Phantom Souls are 20% stronger.",
			cost: new Decimal(5),
			unl() { return true },
		},
		13: {
			desc: "Phantom Souls strengthen all Spells.",
			cost: new Decimal(7),
			unl() { return true },
			currently() { return player.ps.points.div(2).max(1).log10().div(10).add(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"%" },
		},
		14: {
			desc: "The Life Essence layer acts like you choose it first.",
			cost: new Decimal(8),
			unl() { return player.l.order > 0 || player.ps.upgrades.includes(14) },
		},
		21: {
			desc: "Unlock the fifth Life Booster.",
			cost: new Decimal(5),
			unl() { return player.hs.unl },
		},
		22: {
			desc: "Phantom Souls reduce the post-12 scaling of all row 1 - 4 layer requirements.",
			cost: new Decimal(19),
			unl() { return player.hs.unl },
			currently() { return player.ps.points.div(100).add(1) },
			effDisp(x) { return format(x) + "x" },
		},
		23: {
			desc: "Unlock 4 new Super-Prestige Upgrades.",
			cost: new Decimal(21),
			unl() { return player.hs.unl },
		},
		24: {
			desc: "The Hyperspace layer acts like you choose it first.",
			cost: new Decimal(17),
			unl() { return (player.hs.unl && player.hs.order > 0) || player.ps.upgrades.includes(24) },
		},
	},
	sp: {
		rows: 5,
		cols: 5,
		11: {
			desc: "The Prestige Upgrade 3, 6, & 7 effects are raised to the power of 100.",
			cost: new Decimal(1),
			unl() { return player.sp.unl },
		},
		12: {
			desc: "Total Super-Prestige Points boost Magic & Balance Power gain.",
			cost: new Decimal(2),
			unl() { return player.sp.upgrades.includes(11) },
			currently() { return player.sp.total.add(1).pow(2.5) },
			effDisp(x) { return format(x)+"x" },
		},
		13: {
			desc: "Unlock a new Spell.",
			cost: new Decimal(2),
			unl() { return player.sp.upgrades.includes(11) },
		},
		14: {
			desc: "Your Best Super-Prestige Points boost Hex & Balance Energy gain.",
			cost: new Decimal(3),
			unl() { return player.sp.upgrades.includes(12) || player.sp.upgrades.includes(13) },
			currently() { return player.sp.best.add(1).pow(1.9) },
			effDisp(x) { return format(x)+"x" },
		},
		21: {
			desc: "Super-Prestige Points add to the Super-Generator base.",
			cost: new Decimal(4),
			unl() { return player.sp.upgrades.includes(11) },
			currently() { return player.sp.points.add(1).log10().add(1).log10().times(1.5) },
			effDisp(x) { return "+"+format(x) },
		},
		22: {
			desc: 'The effects of "Anti-Upgrades" & "Prestigeless" Hindrances are 24,900% stronger.',
			cost: new Decimal(6),
			unl() { return player.sp.upgrades.includes(12) || player.sp.upgrades.includes(21) },
		},
		23: {
			desc: "Spells are stronger based on your Total Super-Prestige Points.",
			cost: new Decimal(8),
			unl() { return player.sp.upgrades.includes(13) || player.sp.upgrades.includes(22) },
			currently() {
				let sp = player.sp.total
				if (sp.gte(250)) sp = sp.log10().times(250/Math.log10(250)).min(sp)
				return sp.add(1).log10().div(5).add(1) 
			},
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		24: {
			desc: "Super-Prestige Points boost Super-Prestige Point gain.",
			cost: new Decimal(15),
			unl() { return player.sp.upgrades.includes(14) || player.sp.upgrades.includes(23) },
			currently() {
				let sp = player.sp.points
				if (sp.gte(2e4)) sp = sp.cbrt().times(Math.pow(2e4, 2/3));
				return sp.times(2).add(1).sqrt() 
			},
			effDisp(x) { return format(x)+"x" },
		},
		31: {
			desc: "Super-Generators are 45% cheaper.",
			cost: new Decimal(1000),
			unl() { return player.sp.upgrades.includes(22) },
		},
		32: {
			desc: "Prestige Upgrade 7 softcaps later based on your Super-Prestige Points.",
			cost: new Decimal(4000),
			unl() { return player.sp.upgrades.includes(23) && player.sp.upgrades.includes(31) },
			currently() { return player.sp.points.add(1).log10().add(1).pow(1e4) },
			effDisp(x) { return format(x.pow(player.sp.upgrades.includes(11)?100:1))+"x later" },
		},
		33: {
			desc: "Points boost Super-Prestige Point gain.",
			cost: new Decimal(1e4),
			unl() { return player.sp.upgrades.includes(24) && player.sp.upgrades.includes(32) },
			currently() { return player.points.add(1).log10().pow(0.1) },
			effDisp(x) { return format(x)+"x" },
		},
		34: {
			desc: "Boosters & Generators are 25% stronger.",
			cost: new Decimal(1.5e5),
			unl() { return player.sp.upgrades.includes(33) },
		},
		41: {
			desc: "Gain more Life Essence based on total SP.",
			cost: new Decimal(1e6),
			unl() { return player.l.unl },
			currently() { return player.sp.total.div(5e5).add(1).sqrt() },
			effDisp(x) { return format(x)+"x" },
		},
		42: {
			desc: "Life Essence speeds up the Life Power production.",
			cost: new Decimal(1.5e6),
			unl() { return player.l.unl },
			currently() {
				if (player.sp.upgrades.includes(15)) return Decimal.pow(8, player.l.points.max(1).log10().pow(0.4))
				return player.l.points.add(1).log10().add(1).pow(0.75)
			},
			effDisp(x) { return format(x)+"x" },
		},
		43: {
			desc: "Gain more Hyperspace Energy based on total SP.",
			cost: new Decimal(8e5),
			unl() { return player.hs.unl },
			currently() { return player.sp.total.div(7.5e5).add(1).sqr() },
			effDisp(x) { return format(x)+"x" },
		},
		44: {
			desc: "Unlock 5 new Balance Upgrades.",
			cost: new Decimal(1.5e6),
			unl() { return player.hs.unl },
		},
		15: {
			desc: "Life Essence speeds up the Life Power production more.",
			cost: new Decimal(3e16),
			unl() { return player.ps.upgrades.includes(23) },
		},
		25: {
			desc: "Super-Upgrades of Space Building 4 divides the Super-Generator requirement.",
			cost: new Decimal(2e17),
			unl() { return player.ps.upgrades.includes(23) },
			currently() { return fixValue(tmp.hs !== undefined && tmp.hs.su[4]).add(1).sqr() },
			effDisp(x) { return format(x)+"x" },
		},
		35: {
			desc: "Super-Prestige Points strengthen all Subspace effects.",
			cost: new Decimal(6e17),
			unl() { return player.ps.upgrades.includes(23) },
			currently() { return player.sp.points.max(1).log10().div(15).add(1).cbrt() },
			effDisp(x) { return format(x.sub(1).times(100))+"%" },
		},
		45: {
			desc: "Subtract the cost of Imperium Buildings by 3.",
			cost: new Decimal(1e22),
			unl() { return player.ps.upgrades.includes(23) },
		},
		51: {
			desc: "The Super-Generator boost to Imperium Building progression speed uses a better formula.",
			cost: new Decimal(1e38),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(52) },
		},
		52: {
			desc: "Imperium Buildings progress faster based on your Prestige Points.",
			cost: new Decimal(1e30),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(53) },
			currently() { return player.p.points.plus(1).log10().plus(1).log10().plus(1).log10().times(3).plus(1) },
			effDisp(x) { return format(x)+"x" },
		},
		53: {
			desc: "Imperium Buildings progress faster based on your Super-Prestige Points.",
			cost: new Decimal(1e16),
			unl() { return player.mb.unl },
			currently() { return player.sp.points.plus(1).log10().plus(1).log10().times(4).plus(1) },
			effDisp(x) { return format(x)+"x" },
		},
		54: {
			desc: "The Life Power softcap is 15% weaker.",
			cost: new Decimal(1e30),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(53) },
		},
		55: {
			desc: "Imperium Bricks & Hyperspace Energy boost Super-Prestige Point gain.",
			cost: new Decimal(2.5e41),
			unl() { return player.mb.unl&&player.sp.upgrades.includes(54) },
			currently() { return player.hs.points.plus(1).pow(0.02).times(Decimal.pow(2, player.i.points)) },
			effDisp(x) { return format(x)+"x" },
		},
	},
	ge: {
		rows: 2,
		cols: 5,
		11: {
			desc: "All Machines are stronger based on your Best Gears.",
			cost: new Decimal(1e96),
			unl() { return player.ge.total.gte(1e90) },
			currently() { return player.ge.best.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		12: {
			desc: "All Mechanical Challenge rewards are stronger based on your Time Energy.",
			cost: new Decimal(1.333e133),
			unl() { return player.ge.upgrades.includes(11) },
			currently() { return player.t.energy.plus(1).log10().plus(1).log10().plus(1).log10().div(10).plus(1) },
			effDisp(x) { return format(x.sub(1).times(100))+"% stronger" },
		},
		13: {
			desc: "Imperium Bricks are cheaper based on your Enhancers.",
			cost: new Decimal(2.5e162),
			unl() { return player.ge.upgrades.includes(12) },
			currently() { return Decimal.pow(1.14, player.e.enhancers) },
			effDisp(x) { return "/"+format(x) },
		},
		14: {
			desc: "Super-Prestige Points make Prestige Upgrade 2 softcap later.",
			cost: new Decimal(3e292),
			unl() { return player.ge.upgrades.includes(13) },
			currently() { return Decimal.pow(10, player.sp.points.plus(1).log10().plus(1).log10().root(4)) },
			effDisp(x) { return format(x.sub(1).times(100))+"% later" },
		},
		15: {
			desc: "Unlock Super-Generator Upgrades.",
			cost: new Decimal("2e316"),
			unl() { return player.ge.upgrades.includes(14) },
		},
		21: {
			desc: "Boosters are 2% stronger & Generators are 50% stronger.",
			cost: new Decimal("2.5e340"),
			unl() { return player.ge.upgrades.includes(15) },
		},
		22: {
			desc: "???",
			cost: new Decimal(1/0),
			unl() { return false },
		},
		23: {
			desc: "???",
			cost: new Decimal(1/0),
			unl() { return false },
		},
		24: {
			desc: "???",
			cost: new Decimal(1/0),
			unl() { return false },
		},
		25: {
			desc: "???",
			cost: new Decimal(1/0),
			unl() { return false },
		},
	},
	ma: {
		rows: 0,
		cols: 0,
	},
}