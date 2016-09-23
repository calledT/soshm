var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixerConfig = require('./autoprefixer.config');

var DEBUG = process.env.NODE_ENV !== 'production';

var plugins = [];
var entry;
var output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].js',
};

if (DEBUG) {
  plugins.push(new webpack.HotModuleReplacementPlugin({multiStep: true}));

  plugins.push(new HtmlWebpackPlugin({
    title: 'Development',
    template: path.resolve(__dirname, 'src/dev/index.html')
  }));

  entry = [
    './dev/entry.js',
    'webpack-dev-server/client?http://localhost:8080/',
    'webpack/hot/dev-server'
  ];
} else {
  entry = {soshm: './js/index.js'};

  output.library = 'Soshm';
  output.libraryTarget = 'umd';
  output.umdNamedDefine = true;
}

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, 'src'),
  entry: entry,
  output: output,
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html'
      },
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
  resolve: {extensions: ['', '.js', '.scss']},
  postcss: [autoprefixer(autoprefixerConfig)],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    inline: true,
    noInfo: false,
    stats: {
      colors: true,
      chunks: false
    }
  }
}
