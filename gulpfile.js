var gulp = require('gulp');

gulp.task("clean", function(){
	gulp
		.src(['build/**/*'])
		.pipe(gulp.remove());
});