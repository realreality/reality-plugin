const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');

const config = require('../webpack.config');
const env = require('./../config/env');

require('./prepare');
require('./prepare-script-tags');

config.entry['webpack-server'] =
  ('webpack-dev-server/client?http://localhost:' + env.PORT);

for (const entryName in config.entry) {
  config.entry[entryName] = ['webpack/hot/dev-server'].concat(config.entry[entryName]);
}

config.output.pathinfo = true;
config.output.publicPath = ('http://localhost:' + env.PORT + '/');

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new WriteFilePlugin()
].concat(config.plugins || []);

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(__dirname, '../build'),
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: { colors: true }
});

server.listen(env.PORT);
