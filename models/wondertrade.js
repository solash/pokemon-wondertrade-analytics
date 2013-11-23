function sanitizeParams(params, userId) {
	var currentDate;

	// Sanitize Date
	if(params.date) {
		currentDate = params.date;
	} else {
		var now = new Date(),
			year = now.getFullYear(),
			month = ('0'+(now.getMonth()+1)).slice(-2),
			day = ('0'+(now.getDate())).slice(-2);
		currentDate = [year, month, day].join('-');
	}

	// Sanitize Gender values
	if(params.gender === "male" || params.gender === "female") {
		params.trainerGender = params.gender;
	} else {
		params.trainerGender = "";
	}

	// Sanitize pokemonId
	var pokemonId = parseInt(params.pokemonId, 10);
	if(pokemonId >=1 && pokemonId <=718) {
		pokemonId = pokemonId;
	} else {
		pokemonId = false;
	}

	// Sanitize Level
	var pokemonLevel = ( params.level ?  parseInt(params.level) : false );
	if(!pokemonLevel  || pokemonLevel <= 0 || pokemonLevel > 100 ) {
		pokemonLevel = '';		
	}

	if(!userId) {
		userId = 'anonymous'
	}
	

	params.pokemonId = pokemonId;
	params.pokemonNickname = params.pokemonNickname || '';
	params.hasItem = (params.hasItem ? true : false);
	params.hasHiddenAbility = (params.hasHiddenAbility ? true : false);
	params.hasEggMove = (params.hasEggMove ? true : false);
	params.hasPerfectIV = (params.hasPerfectIV ? true : false);
	params.hasPokerus = (params.hasPokerus ? true : false);	
	params.isShiny = (params.isShiny ? true : false);
	params.level = pokemonLevel;
	params.trainerGender = params.trainerGender || '';
	params.trainerCountry = params.trainerCountry || '';
	params.trainerCountrySub1 = params.trainerCountrySub1  || '';
	params.date = currentDate;
	params.userId = userId;

	return params;
}


exports.model = function(params, userId) {
	
	params = sanitizeParams(params, userId);

	var pokemonModel = {
		"pokemonId" : params.pokemonId,
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
		"userId" : params.userId
	};

	if(!pokemonModel.pokemonId) {
		return false;
	} else {
		return pokemonModel;
	}
};