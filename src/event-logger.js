'use strict'

var makeRequest = require('./make-request');
var VERSION = require('../package.json').version;

function DashBotEventLogger(apiKey, urlRoot, debug, printErrors, config, platform) {
  var that = this;
  that.apiKey = apiKey;
  that.debug = debug;
  that.urlRoot = urlRoot;
  that.printErrors = printErrors;
  that.config = config;
  that.platform = platform;

  that.logEvent = function(data) {
    var source = 'npm';
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=event&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Event: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact, that.config.timeout);
  }
}

module.exports = DashBotEventLogger