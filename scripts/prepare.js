const fs = require('fs-extra');
const path = require('path');

const manifest = require('../src/manifest.json');
const env = require('./../config/env');

// clean de dist folder
fs.emptyDirSync(path.join(__dirname, '../build'));

// generates the manifest file using the package.json informations
manifest.description = process.env.npm_package_description;
manifest.version = process.env.npm_package_version;

fs.outputFile(
  path.join(__dirname, '../build/manifest.json'),
  JSON.stringify(manifest)
);
