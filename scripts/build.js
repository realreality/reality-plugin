process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const config = require('../webpack.config');

require('./prepare');

webpack(
  config,
  function (err) { if (err) throw err; }
);
