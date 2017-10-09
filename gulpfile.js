var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var recess = require('gulp-recess');
var header = require('gulp-header');
var gulpFilter = require('gulp-filter');
var complexity = require('gulp-complexity');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');


gulp.task('watch', function() {
  gulp.watch('views/css/*.css', ['styles']);
  gulp.watch(['views/js/**/*.js', '!views/app.min.js', '!views/vendor'], ['minify']);
});

gulp.task('default', ['watch', 'styles', 'minify']);