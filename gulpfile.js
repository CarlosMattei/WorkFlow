const gulp = require('gulp');
const livereload = require('gulp-livereload');

// Tarefa para LiveReload
function watchFiles() {
  livereload.listen();
  gulp.watch(['public/**/*', 'views/**/*']).on('change', function(file) {
    livereload.changed(file);
  });
}

exports.livereload = watchFiles;
exports.default = watchFiles;