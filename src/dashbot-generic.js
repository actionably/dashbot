'use strict'

var makeRequest = require('./make-request')
var EventLogger = require('./event-logger')
var DashBotEventUtil = require('./event-util')

var VERSION = require('../package.json').version;

function DashBotGeneric(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'generic';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;
  that.eventLogger = new EventLogger(apiKey, urlRoot, debug, printErrors)
  that.eventUtil = new DashBotEventUtil()
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
    }, that.printErrors);
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
    }, that.printErrors);
  };

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm', 'incoming');
  };

  that.logOutgoing = function(data) {
    return logOutgoingInternal(data, 'npm');
  };

  that.logEvent = function(data) {
    return that.eventLogger.logEvent(that.platform, data, 'npm');
  }
}

module.exports = DashBotGeneric;