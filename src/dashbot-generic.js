'use strict'

var makeRequest = require('./make-request');
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DashBotGeneric(platform, apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, platform);

  that.messageUtil = {
    messageWithText: function(userId, text, conversationId) {
      // conversationId is optional
      return {
        conversationId: conversationId,
        text: text,
        userId: userId
      }
    }
  }

  function logIncomingInternal(data, source, type) {
    type = type || 'incoming'
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=' + type + '&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact);
  };

  function logOutgoingInternal(data, source) {
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
    }, that.printErrors, that.config.redact);
  };

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm', 'incoming');
  };

  that.logOutgoing = function(data) {
    return logOutgoingInternal(data, 'npm');
  };

  return that;
}

module.exports = DashBotGeneric;