var gulp = require('gulp');
var webpack = require('webpack');
var nodemon = require('nodemon');
var path = require('path');
var config = require('./webpack.config.js');

function onBuild(done) {
  return function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }

    if(done) {
      done();
    }
  }
}

gulp.task('backend-watch', function() {
  webpack(config).watch(100, function(err, stats) {
    onBuild()(err, stats);
    nodemon.restart();
  });
});

gulp.task('run', ['backend-watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: __dirname + "/build/bundle.js",
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', function() {
    console.log('Restarted!');
  });
});
