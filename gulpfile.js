var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('serve', function() {
    browserSync.init({
        port: 4200,
        server: {
            baseDir: "./"
        }
    });
});