var gulp = require('gulp');
var clean = require('gulp-clean');
var typescript = require('gulp-typescript');
var install = require('gulp-install');
var mainBowerFiles = require('main-bower-files');

gulp.task("clean", function(){
	return gulp
		.src(['build'])
		.pipe(clean());
});

gulp.task('build-static', function(){
	return gulp.src([
		'src/**/*.html',
		'src/**/*.css'])
		.pipe(gulp.dest('build'));
});

/**
 * build for dev
 */
gulp.task('build-typescript', function(){
	var tsProject = typescript.createProject('tsconfig.json');
	var tsResult = tsProject.src()
			.pipe(typescript(tsProject));

    return tsResult.js.pipe(gulp.dest('build'));
});

/**
 * Install all packages needed by the solution.
 */
gulp.task("bower-install",function(){
	return gulp
		.src(['./bower.json'])
  		.pipe(install());
});

/**
 * Copy needed packages to build.
 */
gulp.task("build-bower", function(){
	var mainFiles = mainBowerFiles();
	return gulp
			.src(mainFiles)
			.pipe(gulp.dest('build/main/bower_components'))
})

/**
 * build for dev
 */
gulp.task('build', ["build-typescript","build-static"]);

/**
 * Rebuild : clean, build static and typescript files,
 * and install bower deps.
 */
gulp.task('rebuild', ["build-bower", "build"]);