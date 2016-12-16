var profanityList = require('../data/profanityList');

var validPokeballList = ['pokeball', 'greatball', 'ultraball', 'masterball', 'safariball', 'levelball', 'lureball',
	'moonball', 'friendball', 'loveball', 'heavyball', 'fastball','sportball', 'premierball', 'repeatball', 'timerball',
	'nestball', 'netball', 'diveball', 'luxuryball', 'healball', 'quickball', 'duskball', 'dreamball', 'cherishball',
	'safariball', 'beastball'];

function sanitizeParams(params, userId) {
	var currentTime = params.time || "",
		currentDate;

	// Sanitize Date
	if(params.date) {
		currentDate = params.date;
	} else {
		var now = new Date(),
			year = now.getFullYear(),
			month = ('0'+(now.getMonth()+1)).slice(-2),
			day = ('0'+(now.getDate())).slice(-2);
		currentDate = [year, month, day].join('-');
		currentTime = (now.getSeconds())+(now.getMinutes()*60)+(now.getHours()*60*60);
	}

	// Sanitize Gender values
	if(params.gender === "male" || params.gender === "female") {
		params.trainerGender = params.gender;
	} else {
		params.trainerGender = "";
	}

	// Sanitize Likes
	if(params.liked !== "like" && params.liked !== "dislike") {
		params.liked = "";
	}

	// Sanitize pokemonId
	var pokemonId = parseInt(params.pokemonId, 10);
	if(!(pokemonId >=1 && pokemonId <= 801)) {
		pokemonId = false;
	}

	// Sanitize Level
	var pokemonLevel = ( params.level ?  parseInt(params.level) : false );
	if(!pokemonLevel  || pokemonLevel <= 0 || pokemonLevel > 100 ) {
		pokemonLevel = '';
	}

	// Sanitize the pokeball type
	var pokeballType = params.pokeballType;
	if (validPokeballList.indexOf(pokeballType) === -1) {
		pokeballType = '';
	}

	// Sanitize Trainer Id
	// 65535 is the maximum value for a trainerID
	var trainerId = "",
		trainerName = "";
	if(params.trainerId &&
		params.trainerName &&
		(/^\d{5}$/).test(params.trainerId) &&
		parseInt(params.trainerId, 10) <= 65535) {

		trainerId = params.trainerId;
		trainerName = params.trainerName;
	} else {
		trainerId = "";
		trainerName = "";
	}

	params.pokemonId = pokemonId;
	params.pokeballType = pokeballType || '';
	params.pokemonNickname = params.pokemonNickname || '';
	params.hasItem = (params.hasItem ? true : false);
	params.hasHiddenAbility = (params.hasHiddenAbility ? true : false);
	params.hasEggMove = (params.hasEggMove ? true : false);
	params.hasPerfectIV = (params.hasPerfectIV ? true : false);
	params.hasPokerus = (params.hasPokerus ? true : false);
	params.isShiny = (params.isShiny ? true : false);
	params.level = pokemonLevel;
	params.trainerGender = params.trainerGender || '';
	params.trainerCountry = params.trainerCountry || false;
	params.trainerCountrySub1 = params.trainerCountrySub1  || '';
	params.trainerId = trainerId;
	params.trainerName = trainerName;
	params.date = currentDate;
	params.time = currentTime;
	params.userId = userId || false;

	return params;
}

var WonderTradeModel = function(params, userId) {

	params = sanitizeParams(params, userId);

	this.attributes = {
		"pokemonId" : params.pokemonId,
		"pokeballType": params.pokeballType,
		"pokemonNickname" : params.pokemonNickname,
		"hasItem" : params.hasItem,
		"hasHiddenAbility" : params.hasHiddenAbility,
		"hasEggMove": params.hasEggMove,
		"hasPokerus" : params.hasPokerus,
		"hasPerfectIV": params.hasPerfectIV,
		"isShiny" : params.isShiny,
		"level" : params.level,
		"trainerGender" : params.trainerGender,
		"trainerCountry" : params.trainerCountry,
		"trainerCountrySub1" : params.trainerCountrySub1,
		"date" : params.date,
		"time" : params.time,
		"userId" : params.userId,
		"liked" : params.liked,
		"trainerId" : params.trainerId,
		"trainerName" : params.trainerName
	};

};

WonderTradeModel.prototype.toJSON = function() {
	return this.attributes;
};

WonderTradeModel.prototype.equals = function(otherWonderTrade) {
	var attributes = this.toJSON(),
		otherAttributes = otherWonderTrade.toJSON(),
		timeDifference = Math.abs(otherAttributes.time-attributes.time);

	if (attributes.pokemonId === otherAttributes.pokemonId &&
		attributes.pokemonNickname === otherAttributes.pokemonNickname &&
		attributes.hasItem === otherAttributes.hasItem &&
		attributes.hasHiddenAbility === otherAttributes.hasHiddenAbility &&
		attributes.hasEggMove === otherAttributes.hasEggMove &&
		attributes.hasPokerus === otherAttributes.hasPokerus &&
		attributes.hasPerfectIV === otherAttributes.hasPerfectIV &&
		attributes.isShiny === otherAttributes.isShiny &&
		attributes.level === otherAttributes.level &&
		attributes.trainerGender === otherAttributes.trainerGender &&
		attributes.trainerCountry === otherAttributes.trainerCountry &&
		attributes.trainerCountrySub1 === otherAttributes.trainerCountrySub1 &&
		attributes.userId === otherAttributes.userId &&
		attributes.liked === otherAttributes.liked &&
		attributes.trainerId === otherAttributes.trainerId &&
		attributes.trainerName === otherAttributes.trainerName &&
		timeDifference < 300) {

		return true;
	}
	return false;
};

WonderTradeModel.prototype.validate = function() {
	var attributes = this.toJSON(),
		nickname = (attributes.pokemonNickname || '').toLowerCase();

	if(!(attributes.pokemonId && attributes.userId && attributes.trainerCountry) ||
		profanityList.indexOf(nickname) !== -1) {
		return false;
	} else {
		return true;
	}
};

module.exports = WonderTradeModel;