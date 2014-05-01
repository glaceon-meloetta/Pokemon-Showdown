exports.BattleAbilities = {
	"applegift": {
		desc: "If this Pokemon is active while Sunny Day is in effect, its Attack and Special Defense stats (as well as its partner's stats in double battles) receive a 50% boost.",
		shortDesc: "If user is Malaconda and Sunny Day is active, it and allies' Attack and Sp. Def are 1.5x.",
		onStart: function(pokemon) {
			delete this.effectData.forme;
		},
		onAllyModifyAtk: function(atk) {
			if (this.effectData.target.template.speciesid !== 'malaconda') return;
			if (this.isWeather('sunnyday')) {
				return atk *= 1.5;
			}
		},
		onAllyModifySpD: function(spd) {
			if (this.effectData.target.template.speciesid !== 'malaconda') return;
			if (this.isWeather('sunnyday')) {
				return spd *= 1.5;
			}
		},
		id: "applegift",
		name: "Apple Gift",
		rating: 3,
		num: 122
	},
};
