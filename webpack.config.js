var path = require('path');
var webpack = require('webpack');
var fs = require('fs');


var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


module.exports = [
  {
  watch: true,
  name: 'dev-build',
  target: 'node',
  entry: './src/server.js',
  output: {
    path: __dirname,
    filename: './build/bundle.js',
    sourceMapFilename: 'bundle.map'
  },
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin()
  // ],
  externals: nodeModules,
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    root: [
      path.resolve('./src/')
    ]
  },
  devServer: {
    port: 8090,
    host: "0.0.0.0"
  }
}];
