/**
 * Middleware Helper to help render pages
 * @type {{renderError: Function, renderPage: Function}}
 */

module.exports = {
	renderError: function(req, res) {
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