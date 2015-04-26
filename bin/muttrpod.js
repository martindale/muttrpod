#!/usr/bin/env node

'use strict';

var fs = require('fs');
var muttrpod = require('..');
var Logger = require('../lib/logger');
var program = require('commander');
var log = new Logger(3);

program.version(require('../package').version);

program
  .command('start')
  .description('start the muttrpod using the supplied config file')
  .option('-c, --config <path>', 'path to configuration file')
  .action(start);

function start(env) {
  if (!env.config) {
    return log.error('you must supply a config file')
  }

  var config;

  try {
    config = fs.readFileSync(env.config);
    config = JSON.parse(config);
  } catch(err) {
    return log.error('failed to load config: %s', err.message);
  }

  muttrpod(config).start();
}

program.parse(process.argv)

if (process.argv.length < 3) {
  return program.help();
}
