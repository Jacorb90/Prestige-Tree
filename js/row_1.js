function getPUpg2SS() {
	let ssPow = new Decimal(1)
	if (player.ge.upgrades.includes(14)) ssPow = ssPow.times(LAYER_UPGS.ge[14].currently())
	return ssPow
}