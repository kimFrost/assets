'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var del = require('del');
var runSequence = require('run-sequence');
var wiredep = require('wiredep').stream;
var jade = require('gulp-jade');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var paths = {
    scripts: 'scripts/**/*.js',
    images: 'images/**/*',
};

// Clean output directory
gulp.task('clean', del.bind(null, ['../css/*', '../images/**/*', '../scripts/*'], { dot: true, force: true }));

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src('scripts/**/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe(reload({ stream: true }));
});

// Lint Sass
gulp.task('scss-lint', function () {
    gulp.src('styles/*.scss')
      .pipe($.scssLint({
          'config': 'scss-lint.yml'
      }));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
      'styles/*.scss'
    ])
      .pipe($.sourcemaps.init())
      .pipe($.sass({
          precision: 10,
          onError: console.error.bind(console, 'Sass error:')
      }))
      .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('../css'))
      .pipe($.size({ title: 'styles' }))
      .pipe(reload({ stream: true }));
});

// Auto inject bower-components
gulp.task('bower', function () {
    gulp.src('../Views/_Master.cshtml')
      .pipe(wiredep({
          exclude: [/es5-shim/, /json3/, /bootstrap-sass/, /normalize-css/, /jquery/]
      }))
      .pipe(gulp.dest('../Views'));
});

// Reads HTML for usemin blocks to enable smart deploys that automatically concats files
gulp.task('usemin', function () {
    return gulp.src('../Views/_Master.cshtml')
        .pipe($.usemin({
            css: [$.csso()],
            jsLibs: [$.uglify()],
            jsMain: [$.ngAnnotate(), $.uglify()]
        }))
        .pipe(gulp.dest('../'));
});

// Browser-sync
gulp.task('browser-sync', function () {
    browserSync.init({
        //proxy: "http://localhost:49746/"
        server: {
            baseDir: "../"
        }
    });
});

// Copy images
gulp.task('copyImages', function () {
    return gulp.src(['images/**/*'], { base: '.' })
      .pipe(gulp.dest('../'))
      .pipe($.size({ title: 'images' }));
});

// Optimize images
gulp.task('optimizeImages', function () {
    return gulp.src(['images/**/*'], { base: '.' })
      .pipe($.imagemin({
          progressive: true,
          optimizationLevel: 5
      }))
      .pipe(gulp.dest('../'))
      .pipe($.size({ title: 'images' }));
});

// Copy Templates
gulp.task('templates', function () {
    return gulp.src(['templates/**/*'], { base: '.' })
      .pipe(gulp.dest('../'))
      .pipe($.size({ title: 'templates' }))
      .pipe(reload({ stream: true }));
});

// Render jade files
gulp.task('renderViews', function() {
    gulp.src('views/pages/*.jade')
        .pipe(jade({
            client: false
        }))
        .pipe(gulp.dest('./test'))
        .pipe(reload({ stream: true }));
});


// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch('scripts/**/*.js', ['jshint']);
    gulp.watch('images/**/*', ['copyImages']);
    gulp.watch('styles/**/*.scss', ['styles']);
    gulp.watch('templates/**/*', ['templates']);
    gulp.watch('views/**/*', ['renderViews']);
});




// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
    runSequence('styles', ['jshint', 'copyImages', 'templates', 'renderViews', 'watch', 'browser-sync'], cb);
});

// Build production files, the default task
gulp.task('deploy', ['clean'], function (cb) {
    runSequence('styles', ['jshint', 'bower', 'optimizeImages', 'templates', 'usemin'], cb);
});