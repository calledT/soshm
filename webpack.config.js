var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

var libraryName = 'soshm';
var outputFile = libraryName + '.js';

module.exports = {
  entry: path.resolve(__dirname, 'src/js/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: 'style!css?minimize!postcss!sass'
      },
      {
        test: /\.(png|jpg|jpeg|webp|gif)$/,
        loader: 'url?limit=20000&name=img/[name].[ext]'
      },
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  resolve: {extensions: ['', '.js', '.scss']},
  postcss: [autoprefixer()]
}
