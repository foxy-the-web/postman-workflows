// Dependencies
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const livereload = require('gulp-livereload');

// files and folder to watch
const files = ['public/js/workflow.js','public/*.html'];

// default task
gulp.task('default', () => {
	// listen for changes
	livereload.listen();
	gulp.watch(files, () => {
		gulp.src(files).pipe(livereload());
	});
});
