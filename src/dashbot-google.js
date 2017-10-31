'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')

var VERSION = require('../package.json').version;

function DashBotGoogle(apiKey, urlRoot, debug, printErrors, config) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'google';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;
  that.config = config;

  that.assistantHandle = null;
  that.requestBody = null;

  that.configHandler = function(assistant, incomingMetadata){
    if (assistant == null) {
      throw new Error('YOU MUST SUPPLY THE ASSISTANT OBJECT TO DASHBOT!');
    }
    that.assistantHandle = assistant;

    that.assistantHandle.originalDoResponse = assistant.doResponse_;
    that.assistantHandle.doResponse_ = dashbotDoResponse;

    that.requestBody = assistant.body_;
    that.logIncoming(assistant.body_, incomingMetadata);
  };

  function dashbotDoResponse(response, responseCode){
    that.logOutgoing(that.requestBody, response, that.outgoingMetadata)
    that.outgoingMetadata = null
    that.assistantHandle.originalDoResponse(response, responseCode);
  }

  function internalLogIncoming(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact);
  }

  function internalLogOutgoing(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact);
  }

  that.setOutgoingMetadata = function(outgoingMetadata) {
    that.outgoingMetadata = outgoingMetadata
  }

  that.logIncoming = function(requestBody, metadata) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      request_body:requestBody
    };
    if (metadata) {
      data.metadata = metadata
    }
    internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(requestBody, message, metadata) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      request_body:requestBody,
      message:message
    };
    if (metadata) {
      data.metadata = metadata
    }
    internalLogOutgoing(data, 'npm');
  };
}

module.exports = DashBotGoogle;