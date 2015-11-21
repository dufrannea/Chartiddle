// Node modules
var fs = require('fs'), 
	vm = require('vm'), 
	merge = require('deeply'); 

// Gulp and plugins
var gulp = require('gulp');
var clean = require('gulp-clean');
var typescript = require('gulp-typescript');
var install = require('gulp-install');
var mainBowerFiles = require('main-bower-files');
var sass = require('gulp-sass'),
	rjs = require('gulp-requirejs-bundler'),
    uglify = require('gulp-uglify'),	
    htmlreplace = require('gulp-html-replace'),
    es = require('event-stream');
    
/**
 * TASKS DEFINITION
 */
    
gulp.task("clean", function(){
	return gulp
		.src(['build'])
		.pipe(clean());
});

gulp.task('build-bootstrap', function() {
   var css = gulp.src([
       'bower_components/bootstrap/dist/css/bootstrap.min.css',
       'bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
   ]).pipe(gulp.dest('build/main/styles'));
   
   var fonts = gulp.src([
       'bower_components/bootstrap/dist/fonts/*'
   ]).pipe(gulp.dest('build/main/styles/fonts'));
   
   return es.concat(css, fonts);
});

gulp.task('build-static', ['build-bootstrap'], function(){
	return gulp.src([
		'src/**/*.html',
		'src/**/*.css'])
		.pipe(gulp.dest('build'));
});

gulp.task('build-fonts', function() {
    return gulp.src('bower_components/bootstrap/dist/fonts/*')
                .pipe(gulp.dest('build/main/fonts'))
})

/**
 * build sass
 */
gulp.task('build-sass', function () {
  return gulp.src('src/styles/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/main/styles'));
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
});

gulp.task("build-external-libs", function(){
    return gulp
            .src(["external_libs/jquery-hive/*.js"])
            .pipe(gulp.dest("build/main/bower_components"));
})

gulp.task('release-css', ['rebuild'], function(){
    return gulp.src('build/main/styles/style.css')
               .pipe(gulp.dest("dist"))
})

gulp.task('release-html', ['rebuild'], function(){
    return gulp.src('build/main/index.html')
        .pipe(htmlreplace({
            'js': 'scripts.js',
            'css': 'style.css'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('release', ['release-html', 'release-css'], function(){
	
    // read runtime Config
	var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('build/main/require.config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './build/main',
        name: 'app/main',
        paths: {
            requireLib: 'bower_components/require'
        },
        insertRequire : ["app/main"],
        include: [
            'requireLib'
        ],
        bundles: {
        }
    });
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({ preserveComments: 'none' }))
        .pipe(gulp.dest('./dist'));
})

/**
 * build for dev
 */
gulp.task('build', ["build-typescript","build-static", "build-sass", "build-fonts"]);

/**
 * Rebuild : clean, build static and typescript files,
 * and install bower deps.
 */
gulp.task('rebuild', ["build-bower","build-external-libs", "build"]);


var karmaServer = require('karma').Server;
gulp.task('testci', function (done) {
    process.env.CHROME_BIN = process.env.BUILD_REPOSITORY_LOCALPATH + '\\tools\\bin\\chrome\\Chrome-bin\\chrome.exe';
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        autoWatch: false,
        hostname: '127.0.0.1',
        reporters: ['dots', 'junit'],
        junitReporter: {
            useBrowserName: false,
            outputDir: 'build',
            outputFile: 'test-results.xml'
        }
    }, done).start();
});