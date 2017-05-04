'use strict'

var makeRequest = require('./make-request');
var VERSION = require('../package.json').version;

function DashBotEventLogger(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.debug = debug;
  that.urlRoot = urlRoot;
  that.printErrors = printErrors;

  that.logEvent = function(platform, data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=event&platform=' + platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Event: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  }
}

module.exports = DashBotEventLogger