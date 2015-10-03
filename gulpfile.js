var gulp = require('gulp');
var clean = require('gulp-clean');
var typescript = require('gulp-typescript')

gulp.task("clean", function(){
	return gulp
		.src(['build/**/*'])
		.pipe(clean());
});

gulp.task('build-static', function(){
	return gulp.src([
		'src/**/*.html',
		'src/**/*.css'])
		.pipe(gulp.dest('build'));
});

gulp.task('build', ["clean", "build-static"], function(){
	var tsProject = typescript.createProject('tsconfig.json');
	var tsResult = tsProject.src()
			.pipe(typescript(tsProject));

    return tsResult.js.pipe(gulp.dest('build'));
});