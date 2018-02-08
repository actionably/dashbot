'use strict'

var _ = require('lodash');
var EventLogger = require('./event-logger')
var DashBotEventUtil = require('./event-util')


function DashBotBase(apiKey, urlRoot, debug, printErrors, config, platform) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = platform;
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;
  that.eventLogger = new EventLogger(apiKey, urlRoot, debug, printErrors, config, platform);
  that.config = config;
  that.eventUtil = new DashBotEventUtil()

  that.logEvent = function(data) {
    return that.eventLogger.logEvent(data);
  }

}

module.exports = DashBotBase;