var gulp = require('gulp'),
	jshintStylish = require('jshint-stylish'),
	gutil = require('gulp-util'),// Currently unused, but gulp strongly suggested I install...
	jshint = require('gulp-jshint');

gulp.task('lint', function() {
	var directories = ['Gruntfile.js', 'gulpfile.js', 'server.js', 'controllers/*.js', 'models/*.js'];
	console.log("\n\n*** Linting JavaScript Files ***\n\n");

	for(var dir in directories) {
		gulp.src(directories[dir])
			.pipe(jshint())
			.pipe(jshint.reporter(jshintStylish));
	}
});

gulp.task('default', ['lint']);