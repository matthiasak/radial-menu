var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('prefix', function () {
    return gulp.src('./*.css')
        .pipe(autoprefixer({}))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	gulp.watch("./*.css", ['prefix']);
});