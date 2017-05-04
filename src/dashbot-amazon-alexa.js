'use strict'

var _ = require('lodash');
var makeRequest = require('make-request')

var VERSION = require('../package.json').version;

function DashBotAmazonAlexa(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'alexa';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  that.requestBody = null;

  function internalLogIncoming(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }

    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  }

  function internalLogOutgoing(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  }

  that.logIncoming = function(event, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: context
    };
    return internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(event, response, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: context,
      response: response
    };
    return internalLogOutgoing(data, 'npm');
  };
}

module.exports = DashBotAmazonAlexa