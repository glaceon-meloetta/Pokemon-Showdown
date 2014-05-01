function clampIntRange(num, min, max) {
  num = Math.floor(num);
	if (num < min) num = min;
	if (typeof max !== 'undefined' && num > max) num = max;
	return num;
}
exports.BattleStatuses = {
	par: {
		effectType: 'Status',
		onStart: function(target) {
			this.add('-status', target, 'par');
		},
		onModifySpe: function(spe, pokemon) {
			if (pokemon.ability !== 'quickfeet') {
				return spe / 4;
			}
		},
		onBeforeMovePriority: 2,
		onBeforeMove: function(pokemon) {
			if (this.random(1) !== 0) {
				this.add('cant', pokemon, 'par');
				return false;
			}
		}
	},
	slp: {
		effectType: 'Status',
		onStart: function(target) {
			this.add('-status', target, 'slp');
			// 2 turns
			this.effectData.time = 3;
			this.effectData.startTime = 3;
		},
		onSwitchIn: function(target) {
			this.effectData.time = this.effectData.startTime;
		},
		onBeforeMovePriority: 2,
		onBeforeMove: function(pokemon, target, move) {
			if (pokemon.getAbility().isHalfSleep) {
				pokemon.statusData.time--;
			}
			pokemon.statusData.time--;
			if (pokemon.statusData.time <= 0) {
				pokemon.cureStatus();
				return;
			}
			this.add('cant', pokemon, 'slp');
			if (move.sleepUsable) {
				return;
			}
			return false;
		}
	},
	frz: {
		effectType: 'Status',
		onStart: function(target) {
			this.add('-status', target, 'frz');
		},
		onBeforeMovePriority: 2,
		onBeforeMove: function(pokemon, target, move) {
			if (move.thawsUser || this.random(1) === 0) {
				pokemon.cureStatus();
				return;
			}
			this.add('cant', pokemon, 'frz');
			return false;
		},
		onHit: function(target, source, move) {
			if (move.type === 'Fire' && move.category !== 'Status') {
				target.cureStatus();
			}
		}
	},
	confusion: {
		// this is a volatile status
		onStart: function(target, source) {
			var result = this.runEvent('TryConfusion', target, source);
			if (!result) return result;
			this.add('-start', target, 'confusion');
			this.effectData.time = 1;
		},
		onEnd: function(target) {
			this.add('-end', target, 'confusion');
		},
		onBeforeMove: function(pokemon) {
			pokemon.volatiles.confusion.time--;
			if (!pokemon.volatiles.confusion.time) {
				pokemon.removeVolatile('confusion');
				return;
			}
			this.add('-activate', pokemon, 'confusion');
			if (this.random(1) === 0) {
				return;
			}
			this.directDamage(this.getDamage(pokemon,pokemon,40));
			return false;
		}
	},
	partiallytrapped: {
		duration: 5,
		durationCallback: function(target, source) {
			if (source.item === 'gripclaw') return 8;
			return 5;
		},
		onStart: function(pokemon, source) {
			this.add('-activate', pokemon, 'move: ' +this.effectData.sourceEffect, '[of] '+source);
		},
		onResidualOrder: 11,
		onResidual: function(pokemon) {
			if (this.effectData.source && (!this.effectData.source.isActive || this.effectData.source.hp <= 0)) {
				pokemon.removeVolatile('partiallytrapped');
				return;
			}
			if (this.effectData.source.item === 'bindingband') {
				this.damage(pokemon.maxhp/8);
			} else {
				this.damage(pokemon.maxhp/16);
			}
		},
		onEnd: function(pokemon) {
			this.add('-end', pokemon, this.effectData.sourceEffect, '[partiallytrapped]');
		},
		onModifyPokemon: function(pokemon) {
			pokemon.trapped = true;
		}
	},
	lockedmove: {
		// Outrage, Thrash, Petal Dance...
		durationCallback: function() {
			return 3;
		},
		onResidual: function(target) {
			if (target.lastMove === 'struggle' || target.status === 'slp' || !target.moveThisTurn) {
				// don't lock, and bypass confusion for calming
				delete target.volatiles['lockedmove'];
			}
		},
		onStart: function(target, source, effect) {
			this.effectData.move = effect.id;
		},
		onEnd: function(target) {
			this.add('-end', target, 'rampage');
			target.addVolatile('confusion');
		},
		onLockMove: function(pokemon) {
			return this.effectData.move;
		}
	},
	stall: {
		// Protect, Detect, Endure counter
		duration: 2,
		counterMax: 256,
		onStart: function() {
			this.effectData.counter = 2;
		},
		onStallMove: function() {
			// this.effectData.counter should never be undefined here.
			// However, just in case, use 1 if it is undefined.
			var counter = this.effectData.counter || 1;
			if (counter >= 256) {
				// 2^32 - special-cased because Battle.random(n) can't handle n > 2^16 - 1
				return (this.random()*4294967296 < 1);
			}
			this.debug("Success chance: +Math.round(100 - (counter - 1)*100)+%");
			return (Math.round(counter - 1) === 0);
		},
		onRestart: function() {
			if (this.effectData.counter < this.effect.counterMax) {
				this.effectData.counter *= 2;
			}
			this.effectData.duration = 2;
		}
	}
};
