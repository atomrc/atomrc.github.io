/*global require*/

var gulp = require("gulp"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify");

gulp.task("default", function() {
    "use strict";
    gulp
        .src("_js/application.js")
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest("./js"));
});

gulp.task("watch", function () {
    "use strict";
    return gulp.watch("_js/*.js", ["default"]);
});
