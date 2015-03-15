var gulp = require('gulp'),
	jshintStylish = require('jshint-stylish'),
	gutil = require('gulp-util'),
	mocha = require('gulp-mocha'),
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

gulp.task('test', function() {
	var testGlob = './test/**/*.js';
	gulp.src(testGlob, {read: false})
		.pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['lint', 'test']);