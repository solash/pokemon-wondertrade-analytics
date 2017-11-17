var HighChartsData = require('../models/HighChartsData'),
	WondertradeModel = require('../models/wondertrade'),
	fs = require('fs');

module.exports = function(app, dataStore) {

	function adminVerification(req, resp, next) {
		var currentUser = req.user;
		if(currentUser && currentUser.username == "TheIronDeveloper" || currentUser && currentUser.username == "admin") {
			next();
		} else {
			resp.send('Forbidden.');
		}
	}

	function purgeUser(req, resp) {
		var userId = req.params.userId,
			tempUser;

		console.log('Removing User ID: '+userId);
		dataStore.lrange('userTable' , 0, -1, function(error, result){
			for(var user in result) {
				tempUser = JSON.parse(result[user]);
				if(tempUser.id == userId) {
					dataStore.lrem('userTable', 0, result[user]);
					console.log('Removed: ');
					console.log(result[user]);
				}
			}

			dataStore.lrange('wondertrade' , 0, -1, function(error, result){
				for(var wondertrade in result) {
					var tempWondertrade = JSON.parse(result[wondertrade]);
					if(tempWondertrade.userId == userId) {
						dataStore.lrem('wondertrade', 0, result[wondertrade]);
						console.log('Removed: ');
						console.log(result[wondertrade]);
					}
				}
			});

			dataStore.lrange('redditUser' , 0, -1, function(error, result){
				for(var user in result) {
					tempUser = JSON.parse(result[user]);
					if(tempUser.userId == userId) {
						dataStore.lrem('redditUser', 0, result[user]);
					}
				}
			});

			resp.send('Alright, '+userId+' has officially been removed!');
		});
	}

	/**
	 * Some users made the mistake of thinking the OT field was their own field.
	 * We still want to maintain the recorded WonderTrades, but we want to remove the OT ids.
	 **/
	function purgeOT(req, resp) {
		var OTId = req.params.OTId;

		console.log('Removing OT ID: '+OTId);
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){

			for(var wondertrade in result) {
				var tempWondertrade = JSON.parse(result[wondertrade]);
				if(tempWondertrade.trainerId == OTId) {

					tempWondertrade.trainerId = "";
					tempWondertrade.trainerName = "";

					dataStore.lrem('wondertrade', 0, result[wondertrade]);
					dataStore.lpush('wondertrade', JSON.stringify(tempWondertrade));
				}
			}
			resp.send(' Wonder Trades Successfully Removed OT From: '+OTId);
		});

	}

	function cleanUpUndefined(req, resp) {
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){
			var count = 0;
			for(var wondertrade in result) {
				var currentWT = result[wondertrade];
				if(currentWT === "[object Object]" ||
					currentWT === "{}") {
					dataStore.lrem('wondertrade', 0, currentWT);
					console.log('Removed: ');
					console.log(currentWT);
					count++;
				}
			}
			resp.send('Success. ('+count+')');
		});
	}

	function getMassImport(req, resp) {
		resp.render('massImport/index', {
			title: 'Wonder Trade Full List',
			pageState: '',
			user: req.user
		});
	}

	function postMassImport(req, resp) {
		console.log('Mass Importing from File.');
		fs.readFile(req.files.massImportFile.path, function (err, data) {
			if(err) {
				resp.send('There was an error');
				return;
			}

			try {
				var parsedData = JSON.parse(data),// This could be system breaking... we need a better solution here.
					count = 0,
					wonderTradeObject,
					serializedWonderTrade;


				parsedData.forEach(function(wonderTradeParsedData) {
					wonderTradeObject = new WondertradeModel(wonderTradeParsedData, wonderTradeParsedData.userId);
					serializedWonderTrade = JSON.stringify(wonderTradeObject.toJSON());

					if(serializedWonderTrade) {
						dataStore.lpush('wondertrade', serializedWonderTrade);
						count++;
					}
				});

				console.log('Mass Importing from File Finished.');
				resp.send(count+' Wonder Trades Successfully Imported');
			} catch(e) {
				console.log(e);
				resp.send('There was an issue parsing the data :(');
			}
		});
	}

	/**
	 * Clears duplicate wondertrades.
	 *  Notable problems:
	 *    > This only checks wonder trades that are next to eachother.
	 *    > Across two different days, duplicate enteries are not found.
	 * @param req
	 * @param resp
	 */
	function clearDuplicates(req, resp) {
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){

			var i = result.length- 1,
				count = 0;

			while(i>0) {

				var currentWT = new WondertradeModel( JSON.parse(result[i]) ),
					nextWT = new WondertradeModel( JSON.parse(result[i-1]) );

				if( currentWT.equals(nextWT) ) {
					dataStore.lrem('wondertrade', 0, result[i] );
					count++;
				}

				i--;
			}

			resp.send('Success, '+count+ ' wonder trades have been removed');
		});
	}

	/**
	 * WonderTrades with trainerIds should also have trainerNames.
	 *  This function parses through the list and updates any bad results.
	 * @param req
	 * @param resp
	 */
	function cleanNamelessTrainers(req, resp) {
		dataStore.lrange('wondertrade' , 0, -1, function(error, result){

			var count = 0;

			for(var wonderTrade in result) {

				var attributes = JSON.parse(result[wonderTrade]);

				// If the wondertrade has a trainerId, but no name, update the wonderTrade.
				if( attributes.trainerName === "" && attributes.trainerId ) {
					attributes.trainerId = "";
					dataStore.lpush('wondertrade', JSON.stringify(attributes) );
					dataStore.lrem('wondertrade', 0, result[wonderTrade] );
					count++;
				}
			}

			resp.send('Success, '+count+ ' wonder trades have been updated');
		});
	}

	/**
	 * Delete a wonder trade based on the userId, date, and time
	 */
	function deleteWonderTrade(req, res) {
		var params = req.params || {},
			wtUserId = parseInt(params.userId, 10),
			wtTime = parseInt(params.time, 10),
			wtDate = params.date,
			stringifiedResult,
			tempWondertrade;

		dataStore.lrange('wondertrade' , 0, -1, function(error, result){
			for(var wondertrade in result) {
				stringifiedResult = result[wondertrade];
				tempWondertrade = JSON.parse(stringifiedResult);

				// Assumption: One individual user can not send 2 duplicate wondertrades at the exact same time.
				if(tempWondertrade.userId === wtUserId &&
					tempWondertrade.date === wtDate &&
					tempWondertrade.time === wtTime) {

					dataStore.lrem('wondertrade', 0, stringifiedResult);
					console.log('Removed Wonder Trade : ' + stringifiedResult);
					return res.send('Alright. <br/>' + stringifiedResult + '<br/> has officially been removed!');
				}
			}

			res.send('That WonderTrade was not found :( ');
		});
	}

	app.get('/admin/clearDuplicates', adminVerification, clearDuplicates);
	app.get('/admin/cleanNamelessTrainerIds', adminVerification, cleanNamelessTrainers);
	app.get('/admin/purge/users/:userId', adminVerification, purgeUser);
	app.get('/admin/purge/OT/:OTId', adminVerification, purgeOT);
	app.get('/admin/cleanUpUndefined', adminVerification, cleanUpUndefined);
	app.get('/admin/massImport', adminVerification, getMassImport);
	app.get('/admin/deleteWonderTrade/:userId/:date/:time', adminVerification, deleteWonderTrade);
	app.post('/admin/massImport', adminVerification, postMassImport);
};