const logger = require('./log')();
const externals = require('./externals');
const extensions = require('./extensions');
const loaders = require('./loaders');
const findBootstrap = require('./find-bootstrap');
const { mergeDefine } = require('./custom-define');
const handleRequest = require('./handle-request');
const getVendorsName = require('./get-vendors-name');
const { create } = require('./devtool-module-template');
const otherUtils = require('./other-utils');

module.exports = {
  DEFAULT_BOOTSTRAP_PATH: findBootstrap.DEFAULT_BOOTSTRAP_PATH,
  externals,
  logger,
  extensions,
  loaders,
  findBootstrap,
  mergeDefine,
  handleRequest,
  getVendorsName,
  createDevtoolModuleFilenameTemplate: create,
  ...otherUtils,
};
