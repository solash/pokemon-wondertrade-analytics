'use strict';

module.exports = {
	'Poke Ball': {
		description: '10 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.count >= 10);
		}
	},
	'Great Ball': {
		description: '50 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.count >= 50);
		}
	},
	'Ultra Ball': {
		description: '500 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.count >= 500);
		}
	},
	'Master Ball': {
		description: '1000 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.count >= 1000);
		}
	},
	'Premier Ball': {
		description: '10 Shiny Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.shinyCount >= 10);
		}
	},
	'Silver Ball': {
		description: '100 Shiny Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.shinyCount >= 100);
		}
	},
	'Gold Ball': {
		description: '1000 Shiny Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.shinyCount >= 1000);
		}
	},
	'Quick Ball': {
		description: 'Report 30 WTs in a day',
		condition: function() {}
	},
	'Fast Ball': {
		description: 'Report 90 WTs in a day',
		condition: function() {}
	},
	'Repeat Ball': {
		description: 'Report a WT every day for a week',
		condition: function() {}
	},
	'Timer Ball': {
		description: 'Report a WT every day for a month',
		condition: function() {}
	},
	'Dive Ball': {
		description: '30 Reports on Wonder Trade Wednesday',
		condition: function() {}
	},
	'Dusk Ball': {
		description: '100 Reports at Night',
		condition: function() {}
	},
	'Nest Ball': {
		description: '100 Level 1 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.levels['1'] >= 100);
		}
	},
	'Level Ball': {
		description: '100 Level 100 Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.levels['100'] >= 100);
		}
	},
	'Dream Ball': {
		description: '100 Hidden Ability Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.hiddenCount >= 100);
		}
	},
	'Heavy Ball': {
		description: '100 Egg Move Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.eggCount >= 100);
		}
	},
	'Love Ball': {
		description: '100 Nicknamed Pokemon',
		condition: function(parsedCounts) {
			return (parsedCounts.nicknameCount >= 100);
		}
	},
	'Luxury Ball': {
		description: '100 Item Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.itemCount >= 100);
		}
	},
	'Moon Ball': {
		description: '100 PKRS Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.pokerusCount >= 100);
		}
	},
	'Sport Ball': {
		description: '100 6 IV Acquisitions',
		condition: function(parsedCounts) {
			return (parsedCounts.sixIVCount >= 100);
		}
	},
	'Safari Ball': {
		description: '100 non-ENG Pokemon Acquisitions',
		condition: function() {}
	},
	'Net Ball': {
		description: '100 Male Pokemon Acquisitions',
		condition: function() {}
	},
	'Heal Ball': {
		description: '100 Female Pokemon Acquisitions',
		condition: function() {}
	},
	'Park Ball': {
		description: '"100 ""Liked"" (90% or higher) Pokemon"',
		condition: function() {}
	},
	'Friend Ball': {
		description: 'Report two WT\'s from the same person',
		condition: function() {}
	},
	'Lure Ball': {
		description: 'Acquire a Pokemon with your TID/Name',
		condition: function() {}
	},
	'Cherish Ball': {
		description: 'Special Occasions/People',
		condition: function() {}
	},
	'GS Ball': {
		description: '???',
		condition: function() {}
	},
	'Normal Ball': {
		description: '100 Normal-Type Acquisitions',
		condition: function() {}
	},
	'Fighting Ball': {
		description: '100 Fighting-Type Acquisitions',
		condition: function() {}
	},
	'Ground Ball': {
		description: '100 Ground-Type Acquisitions',
		condition: function() {}
	},
	'Rock Ball': {
		description: '100 Rock-Type Acquisitions',
		condition: function() {}
	},
	'Bug Ball': {
		description: '100 Bug-Type Acquisitions',
		condition: function() {}
	},
	'Ghost Ball': {
		description: '100 Ghost-Type Acquisitions',
		condition: function() {}
	},
	'Steel Ball': {
		description: '100 Steel-Type Acquisitions',
		condition: function() {}
	},
	'Fire Ball': {
		description: '100 Fire-Type Acquisitions',
		condition: function() {}
	},
	'Water Ball': {
		description: '100 Water-Type Acquisitions',
		condition: function() {}
	},
	'Grass Ball': {
		description: '100 Grass-Type Acquisitions',
		condition: function() {}
	},
	'Electric Ball': {
		description: '100 Electric-Type Acquisitions',
		condition: function() {}
	},
	'Psychic Ball': {
		description: '100 Psychic-Type Acquisitions',
		condition: function() {}
	},
	'Ice Ball': {
		description: '100 Ice-Type Acquisitions',
		condition: function() {}
	},
	'Dragon Ball': {
		description: '100 Dragon-Type Acquisitions',
		condition: function() {}
	},
	'Dark Ball': {
		description: '100 Dark-Type Acquisitions',
		condition: function() {}
	},
	'Fairy Ball': {
		description: '100 Fairy-Type Acquisitions',
		condition: function() {}
	},
	'X Ball': {
		description: 'Register a TID/Trainer for X',
		condition: function() {}
	},
	'Y Ball': {
		description: 'Register a TID/Trainer for Y',
		condition: function() {}
	},
	'ωR Ball': {
		description: 'Register a TID/Trainer for OR',
		condition: function() {}
	},
	'αS Ball': {
		description: 'Register a TID/Trainer for AS',
		condition: function() {}
	},
	'English Ball': {
		description: '100 English Language Pokemon',
		condition: function() {}
	},
	'Spanish Ball': {
		description: '100 Spanish Language Pokemon',
		condition: function() {}
	},
	'French Ball': {
		description: '100 French Language Pokemon',
		condition: function() {}
	},
	'German Ball': {
		description: '100 German Language Pokemon',
		condition: function() {}
	},
	'Italian Ball': {
		description: '100 Italian Language Pokemon',
		condition: function() {}
	},
	'Japanese Ball': {
		description: '100 Japanese Language Pokemon',
		condition: function() {}
	},
	'Korean Ball': {
		description: '100 Korean Language Pokemon',
		condition: function() {}
	},
	'Zigzag Ball': {
		description: 'Acquire 1000 Zigzagoons',
		condition: function() {}
	}
};