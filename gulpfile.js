'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var importer = require('node-sass-globbing'),
  livereload = require('gulp-livereload'),
  ifElse = require('gulp-if-else'),
  argv = require('yargs').argv;

var sass_config = {
  importer: importer,
  includePaths: [
    './node_modules/breakpoint-sass/stylesheets/',
    require('node-bourbon').includePaths
  ],
  sourcemap: true
};

gulp.task('sass:prod', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass(sass_config).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 version']
    }))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:dev', function () {

  gulp.src('./sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sass_config).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 version']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./css'))
    .pipe(ifElse(argv.livereload, livereload));
});

gulp.task('sass:watch', ['sass:dev'], function () {
  if (argv.livereload) {
    livereload.listen();
  }
  gulp.watch('./sass/**/*.scss', ['sass:dev']);
});

gulp.task('default', ['sass:dev', 'sass:watch']);