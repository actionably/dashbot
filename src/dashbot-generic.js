'use strict'

var _ = require('lodash')
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
    }, that.printErrors, that.config.redact, that.config.timeout);
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
    }, that.printErrors, that.config.redact, that.config.timeout);
  };

  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  }

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm', 'incoming');
  };

  that.logOutgoing = function(data) {
    var responseBodyToSend = data

    if (that.outgoingIntent || that.outgoingMetadata) {
      responseBodyToSend = _.clone(data)
      if (that.outgoingIntent) {
        responseBodyToSend.intent = that.outgoingIntent
      }
      if (that.outgoingMetadata) {
        responseBodyToSend.metadata = that.outgoingMetadata
      }

      that.outgoingIntent = null
      that.outgoingMetadata = null
    }

    return logOutgoingInternal(responseBodyToSend, 'npm');
  };

  return that;
}

module.exports = DashBotGeneric;