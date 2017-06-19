const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const precss = require('precss')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const webpack = require('webpack')

const env = require('./config/env')
const basePath = fileName => path.join(__dirname, 'src', 'js', fileName)

module.exports = {
  entry: {
    background: basePath('background.js'),
    contentscript: basePath('contentscript.js'),
    popup: basePath('popup.js'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader'],
        }),
      },
    ],
  },
  plugins: [
    new ProgressBarPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer, precss],
        excludeEntriesToHotReload: ['contentscript'], // a non-standard webpack opt, see usage in `./scripts/webserver.js`
      },
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        GMAPS_API_KEY: JSON.stringify(env.GMAPS_API_KEY),
        IPR_REST_API: JSON.stringify(env.IPR_REST_API),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'src/_locales'), to: '_locales'},
      { from: path.join(__dirname, 'src/images'), to: 'images'},
      { from: path.join(__dirname, 'node_modules/font-awesome/css/font-awesome.css'), to: 'css'},
      { from: path.join(__dirname, 'node_modules/font-awesome/fonts'), to: 'fonts'},
    ]),
    new ExtractTextPlugin('./css/panel.css'),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    },
  },
}
