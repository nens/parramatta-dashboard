// This file needs to be at the root of the React project
// Extracts i18n tags from src/**.js
process.env.NODE_ENV = 'development';

const path = require('path');
const globSync = require('glob').sync;
const fs = require('fs');
const mkdirpSync = require('mkdirp').sync;
const babel = require('babel-core');
const jsonFormat = require('json-format');
const plugin = require('babel-plugin-react-intl');
const _ = require('lodash');
const colors = require('colors');

const paths = {
  root: `${process.env.PWD}/src/`,
  output: `${process.env.PWD}/src/translations/extracted/`
}

const all = []
var totalNodes = 0;

globSync(path.join(paths.root, '**/*.js')).map ( (filename) => {
  const result = babel.transformFileSync(filename, {
    presets: ['react'],
    plugins: ['transform-object-rest-spread','transform-class-properties',plugin.default],
  });
  const meta = result.metadata['react-intl'];

  if (meta.messages.length > 0) {
    meta.messages.map ( (message) => {
      const existing = _.find( all, (m) => m.id === message.id );
      if (existing) {
        console.log(`*** ERROR: Duplicate ID found: ${message.id} ***`.bold.red)
        console.log(`Look in file ${filename} to find duplicate`.red)
      } else {
        totalNodes++
        all.push(message);
      }
      return true;
    })
  }
  return true;
})

const outputFileName = `${paths.output}catalog.json`;
mkdirpSync(path.dirname(outputFileName));
fs.writeFile(outputFileName, jsonFormat(all, {type: 'tab', size: 1}), (error) => {
  if (error) {
    console.log('*** ERROR WRITING FILE'.bold.red.underline);
    console.log('ERROR', error);
  } else {
    console.log(`*** DONE`.bold.green);
    console.log(`${totalNodes} messages ready for translation`.green);
    console.log(`File written ${outputFileName}`.green);
  }
});
