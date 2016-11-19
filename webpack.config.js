const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const path = require('path');
const fileSystem = require('fs');

const env = require('./config/env');

// load the secrets
const alias = {};
const secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'));

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

const basePath = fileName => path.join(__dirname, 'src', 'js', fileName);

module.exports = {
  entry: {
    background: basePath('background.js'),
    contentscript: basePath('contentscript.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/, loader: 'babel'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader'])
      }
    ]
  },
  resolve: {
    alias: alias
  },
  postcss: function() {
    return [autoprefixer, precss];
  },
  plugins: [
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env.NODE_ENV)
      }
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'node_modules/font-awesome/css/font-awesome.css'), to: 'css'},
      { from: path.join(__dirname, 'node_modules/font-awesome/fonts'), to: 'fonts'},
    ]),
    new ExtractTextPlugin('./css/panel.css')
  ]
};
