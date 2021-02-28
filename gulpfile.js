'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
const jsdoc = require('gulp-jsdoc3');
const eslint = require('gulp-eslint');


sass.compiler = require('node-sass');

gulp.task('sass', function () {
    return gulp.src('./css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());
});

gulp.task('doc', function (cb) {
    gulp.src(['./script/*.js'], {
            read: false
        })
        .pipe(jsdoc(cb));
});


gulp.task('eslint', function () {
    return gulp.src(['./script/*.js'])
        .pipe(eslint('./.eslintrc.json'))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('serve', gulp.series(['sass'], function () {

    browserSync.init({
        server: "./"
    });

    gulp.watch("./css/*.scss", gulp.series(['sass']));
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch("./script/*.js").on('change', browserSync.reload);
    gulp.watch("./script/*.js", gulp.series(['doc']));
    gulp.watch("./script/*.js", gulp.series(['eslint']));
}));


gulp.task('default', gulp.series(['serve']));