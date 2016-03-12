/**
 * Middleware Helper to help render pages
 * @type {{renderError: Function, renderPage: Function}}
 */

module.exports = {
	renderError: function(err, req, res) {
		console.log(req.originalUrl, ':', err);
		res.render('500', {
			title: 'Error',
			status: '500',
			user: req.user || {},
			pageState: ''
		});
	},
	renderPage: function() {
		// TODO: Implement
	},
	renderJSON: function(req, res) {
		res.json(req.data);
	}
};