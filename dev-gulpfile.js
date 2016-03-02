//Source / Destination / Path settings
var sass_src = ['sass/**/**/*.scss', '!sass/excludeme.scss']; //just in case you wanted to exclude something
var css_temp = './temp'; //add this folder to your .gitignore
var css_dest = './css';
var svg_src  = 'images/svg/*.svg';
var png_dest = './images/png';
var reload_url = 'localhost'; //can be www.example.com, just no http:// or ending /

//Gulp Module Definitions
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var debug = require('gulp-debug');
var del = require('del');
var changed = require('gulp-changed');
var globbing = require('gulp-css-globbing');
var livereload = require('gulp-livereload');
var order = require('gulp-order');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');
var svg2png = require('gulp-svg2png');
var watch = require('gulp-watch');

//Default task
gulp.task('default', ['build-css', 'build-png', 'run-reload-server', 'watch-sass', 'watch-svg']);

//Build process, runs once on load, and after every change
gulp.task('build-css', ['clean-temp', 'compile-sass']);

//Clean temporary css folder
gulp.task('clean-temp', function() {
  del([css_temp], function (err, paths) {
    console.log('Deleted temp files/folders:\n', paths.join('\n'));
  });
});

//Compile Sass in correct order
gulp.task('compile-sass', function() {
  gulp.src(sass_src, {base: 'sass/'})
    .pipe(plumber())
    .pipe(order([
      'libraries/*',
      "variables/*",
      "abstractions/*",
      "base/*reset.scss",
      "base/*",
      "components/*",
      "*.no-query.scss"
    ]))
    .pipe(sourcemaps.init())
    .pipe(debug({title: 'sass: '}))
    .pipe(size({title: 'sass: ', showFiles: false}))
    .pipe(globbing(
      {
        extensions: ['.scss'],
        scssImportPath: {
          leading_underscore: false,
          filename_extension: false
        }
      }
    ))
    .pipe(sass().on('error', sass.logError), {
      style: 'expanded',
      includePaths: [__dirname + '/sass',
        __dirname + '/libraries'],
      sourcemap: true,
      errLogToConsole: true
    })
    .pipe(autoprefixer('last 2 version, > 5%'))
    .pipe(sourcemaps.write('.', {sourceRoot: '.'}))
    .pipe(size({title: 'css: ', showFiles: true}))
    .pipe(gulp.dest(css_temp)) //write css/map files to temp
    .pipe(changed(css_dest, {hasChanged: changed.compareSha1Digest}))
    .pipe(debug({title: 'changed: '})) //what changed since last compile
    .pipe(gulp.dest(css_dest)) //copy fresher files to destination
    .pipe(livereload()) //reloads only changed css/map files
  ;
});

//Start LiveReload browser refresher
gulp.task('run-reload-server', function() {
  livereload.listen({
    host: reload_url,
    port: 35729
  });
});

//Watch Sass source files for changes, build CSS on change
gulp.task('watch-sass', function() {
  gulp.watch(sass_src, ['build-css']);
});

//Watch SVG source files for changes, build PNG on change
gulp.task('watch-svg', function() {
  gulp.watch(svg_src, ['build-png']);
});

//Create fallback PNGs from SVGs
gulp.task('build-png', function () {
  return gulp.src(svg_src)
    .pipe(newer({dest: png_dest, ext: '.png'})) //only do the newer files
    .pipe(livereload()) //reload newer svg
    .pipe(plumber())
    .pipe(size({title: 'svg: ', showFiles: true}))
    .pipe(svg2png())
    .pipe(gulp.dest(png_dest))
    .pipe(size({title: 'png: ', showFiles: true}))
    .pipe(livereload()) //reload fresh png, maybe an overkill for fall-back images?
    ;
});
