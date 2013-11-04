exports.model = function(params) {
	var pokemonModel = {};

	pokemonModel.pokemonId = params.pokemonId || 0;
	pokemonModel.pokemonNickname = params.pokemonNickname || '';
	pokemonModel.hasItem = params.hasItem || '';
	pokemonModel.hasHiddenAbility = params.hasHiddenAbility || '';
	pokemonModel.isShiny = params.isShiny || '';
	pokemonModel.item = params.item || '';	
	pokemonModel.trainerGender = params.trainerGender || '';
	pokemonModel.trainerCountry = params.trainerCountry || '';
	pokemonModel.trainerCountrySub1 = params.trainerCountrySub1  || '';
	pokemonModel.date = params.date || new Date();
	pokemonModel.userId = params.userId || 123123123;

	return pokemonModel;
};