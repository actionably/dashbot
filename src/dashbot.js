'use strict';

require('es6-promise').polyfill()
var uuid = require('uuid');
var _ = require('lodash');
var util = require('util');

var DashBotFacebook = require('./dashbot-facebook')
var DashBotSlack = require('./dashbot-slack')
var DashBotKik = require('./dashbot-kik')
var DashBotMicrosoft = require('./dashbot-microsoft')
var DashBotGoogle = require('./dashbot-google')
var DashBotAmazonAlexa = require('./dashbot-amazon-alexa')
var DashBotGeneric = require('./dashbot-generic')
var DashBotTwitter = require('./dashbot-twitter')
var DashBotLine = require('./dashbot-line')
var DashBotRecast = require('./dashbot-recast')
var DashBotSkype = require('./dashbot-skype')
var DashBotViber = require('./dashbot-viber')
var DashBotWechat = require('./dashbot-wechat')


module.exports = function(apiKey, config) {
  if (!apiKey) {
    throw new Error('YOU MUST SUPPLY AN API_KEY TO DASHBOT!');
  }
  var serverRoot = 'https://tracker.dashbot.io';
  var urlRoot = serverRoot + '/track';
  var debug = false;
  var printErrors = true;
  if (config) {
    debug = config.debug;
    serverRoot = config.serverRoot || serverRoot;
    urlRoot = config.urlRoot || serverRoot + '/track';
    if (config.printErrors !== undefined) {
      printErrors = config.printErrors;
    }
  }

  return {
    facebook: new DashBotFacebook(apiKey, urlRoot, debug, printErrors),
    slack: new DashBotSlack(apiKey, urlRoot, debug, printErrors),
    kik: new DashBotKik(apiKey, urlRoot, debug, printErrors),
    microsoft: new DashBotMicrosoft(apiKey, urlRoot, debug, printErrors),
    google: new DashBotGoogle(apiKey, urlRoot, debug, printErrors),
    alexa: new DashBotAmazonAlexa(apiKey, urlRoot, debug, printErrors),
    generic: new DashBotGeneric(apiKey, urlRoot, debug, printErrors),
    twitter: new DashBotTwitter(apiKey, urlRoot, debug, printErrors),
    line: new DashBotLine(apiKey, urlRoot, debug, printErrors),
    recast: new DashBotRecast(apiKey, urlRoot, debug, printErrors),
    skype: new DashBotSkype(apiKey, urlRoot, debug, printErrors),
    viber: new DashBotViber(apiKey, urlRoot, debug, printErrors),
    wechat: new DashBotWechat(apiKey, urlRoot, debug, printErrors)
  };
};
