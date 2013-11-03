export.model = function(params) {
	this.pokemon = params.name;
	this.hasItem = params.hasItem;
	this.trainerGender = params.trainerGender;
	this.trainerCountry = params.trainerCountry;
	this.trainerCountrySub = params.trainerCountrySub;
	return this;
};