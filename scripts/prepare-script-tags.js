/**
 * The main idea here is add the localhost on script tags with data-bundle
 * attribute on development mode.
 */
const env = require('./../config/env');
const fileSystem = require('fs');
const path = require('path');

const appendLocalhost = function (content) {
  content =
    content.replace(
      new RegExp('(<script data-bundle src=[\'|"])', 'g'),
      (`$1http://localhost:${env.PORT}/`)
    );

  content =
    content.replace(
      /(<\/body>)/,
      `<script src="http://localhost:${env.PORT}/webpack-dev-server.js"></script>$1`
    );

  return content;
};

const buildPath = path.join(__dirname, '../build');

const innerFilesPath = fileSystem.readdirSync(buildPath);

for (let i = 0, l = innerFilesPath.length; i < l; i++) {
  const innerFilePath = path.join(buildPath, innerFilesPath[i]);

  if (/\.html$/.test(innerFilePath)) {
    const content = fileSystem.readFileSync(innerFilePath, 'utf-8');
    fileSystem.writeFileSync(innerFilePath, appendLocalhost(content));
  }
}
