'use strict';

require('es6-promise').polyfill()

var DashBotFacebook = require('./dashbot-facebook')
var DashBotSlack = require('./dashbot-slack')
var DashBotKik = require('./dashbot-kik')
var DashBotMicrosoft = require('./dashbot-microsoft')
var DashBotGoogle = require('./dashbot-google')
var DashBotAmazonAlexa = require('./dashbot-amazon-alexa')
var DashBotGeneric = require('./dashbot-generic')


module.exports = function(apiKey, config) {
  apiKey = process.env.DASHBOT_API_KEY_OVERRIDE || apiKey;
  if (!apiKey) {
    throw new Error('YOU MUST SUPPLY AN API_KEY TO DASHBOT!');
  }
  var serverRoot = process.env.DASHBOT_SERVER_ROOT || 'https://tracker.dashbot.io';
  var urlRoot = serverRoot + '/track';
  var debug = process.env.DASHBOT_DEBUG === 'true' || false;
  var printErrors = true;
  if (config) {
    debug = config.debug || debug;
    serverRoot = config.serverRoot || serverRoot;
    urlRoot = config.urlRoot || serverRoot + '/track';
    if (config.printErrors !== undefined) {
      printErrors = config.printErrors;
    }
  } else {
    config = {}
  }

  return {
    facebook: new DashBotFacebook(apiKey, urlRoot, debug, printErrors, config),
    slack: new DashBotSlack(apiKey, urlRoot, debug, printErrors, config),
    kik: new DashBotKik(apiKey, urlRoot, debug, printErrors, config),
    microsoft: new DashBotMicrosoft(apiKey, urlRoot, debug, printErrors, config),
    google: new DashBotGoogle(apiKey, urlRoot, debug, printErrors, config),
    alexa: new DashBotAmazonAlexa(apiKey, urlRoot, debug, printErrors, config),
    generic: new DashBotGeneric('generic', apiKey, urlRoot, debug, printErrors, config),
    twitter: new DashBotGeneric('twitter', apiKey, urlRoot, debug, printErrors, config),
    line: new DashBotGeneric('line', apiKey, urlRoot, debug, printErrors, config),
    recast: new DashBotGeneric('recast', apiKey, urlRoot, debug, printErrors, config),
    skype: new DashBotGeneric('skype', apiKey, urlRoot, debug, printErrors, config),
    viber: new DashBotGeneric('viber', apiKey, urlRoot, debug, printErrors, config),
    wechat: new DashBotGeneric('wechat', apiKey, urlRoot, debug, printErrors, config)
  };
};
