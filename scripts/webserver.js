const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const path = require('path')
const WriteFilePlugin = require('write-file-webpack-plugin')

const config = require('../webpack.config')('dev')
const env = require('./../config/env')

// setup manifest
require('./build-manifest')

const {
  entry,
  excludeEntriesToHotReload = [],
  plugins = [],
} = config

Object.keys(entry)
  .filter(entryName => !excludeEntriesToHotReload.includes(entryName)) // not possible to hot-reload contentscript
  .forEach(entryName => {
    entry[entryName] = [
      `webpack-dev-server/client?https://localhost:${env.PORT}`,
      'webpack/hot/dev-server',
      entry[entryName],
    ]
  })

const compilerOptions = Object.assign({}, config, {
  entry,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new WriteFilePlugin({ log: false}),
    ...plugins,
  ],
})

const compiler = webpack(compilerOptions)
const server = new WebpackDevServer(compiler, {
  hot: true,
  https: true,
  contentBase: path.join(__dirname, '../build'),
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: { colors: true },
  publicPath: '/',
})

server.listen(env.PORT)
