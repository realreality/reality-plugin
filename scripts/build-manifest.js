const fs = require('fs-extra')
const manifest = require('../src/manifest.json')
const packageJson = require('../package.json')
const path = require('path')

// generates the manifest file using the package.json information
fs.outputFile(
  path.join(__dirname, '../build/manifest.json'),
  JSON.stringify(Object.assign({}, manifest, {
    description: packageJson.description,
    version: packageJson.version,
  }))
)
