const fs = require('fs-extra');
const path = require('path');

const manifest = require('../src/manifest.json');
const env = require('./../config/env');

// clean de dist folder
fs.emptyDirSync(path.join(__dirname, '../build'));

// copy the src folder without the unprocessed assets
fs.copySync(
  path.join(__dirname, '../src'),
  path.join(__dirname, '../build'),
  {
    filter: function (testedPath) {
      // console.log('testedPath', testedPath)
      return !(/\/(js|templates|css)/.test(testedPath));
    }
  }
);

// because empty dirs is still copied - https://github.com/jprichardson/node-fs-extra/issues/180
fs.removeSync(path.join(__dirname, '../build/js/'));
fs.removeSync(path.join(__dirname, '../build/templates/'));

// generates the manifest file using the package.json informations
manifest.description = process.env.npm_package_description;
manifest.version = process.env.npm_package_version;

if (env.NODE_ENV === 'development') {
  manifest.content_security_policy = manifest.content_security_policy.replace('%PORT%', env.PORT);
} else {
  manifest.content_security_policy = manifest.content_security_policy.replace('http://localhost:%PORT%', '');
}

fs.outputFile(
  path.join(__dirname, '../build/manifest.json'),
  JSON.stringify(manifest)
);
