'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DashBotGoogle(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'google');

  that.assistantHandle = null;
  that.requestBody = null;

  that.configHandler = function(assistant, incomingMetadata){
    if (assistant == null) {
      throw new Error('YOU MUST SUPPLY THE ASSISTANT OBJECT TO DASHBOT!');
    }
    that.assistantHandle = assistant;

  if (typeof assistant.doResponse_ !== 'undefined') {
      that.assistantHandle.originalDoResponse = assistant.doResponse_;
      that.assistantHandle.doResponse_ = dashbotDoResponse;
      that.requestBody = assistant.body_;
      that.logIncoming(assistant.body_, incomingMetadata);
    } else if (typeof assistant.handleRequest !== 'undefined') {
      // dialogflow-fulfillment npm
      that.assistantHandle.client.orginalSend = assistant.client.sendJson_;
      that.assistantHandle.client.sendJson_ = dashbotSend;
      that.requestBody = assistant.request_.body;
      that.logIncoming(assistant.request_.body, incomingMetadata);
  } else {
      that.assistantHandle.originalhandler = assistant.handler.bind(assistant);
      that.assistantHandle.handler = dashbotDoResponseV2;
      that.incomingMetadata = incomingMetadata
    }
  };

  function dashbotSend(responseJson) {
    that.logOutgoing(that.requestBody, responseJson, that.outgoingMetadata, that.outgoingIntent)
    that.outgoingMetadata = null
    that.outgoingIntent = null
    that.assistantHandle.client.orginalSend(responseJson)
  }

  function dashbotDoResponse(response, responseCode) {
    that.logOutgoing(that.requestBody, response, that.outgoingMetadata, that.outgoingIntent)
    that.outgoingMetadata = null
    that.outgoingIntent = null
    that.assistantHandle.originalDoResponse(response, responseCode);
  }

  function dashbotDoResponseV2(body, headers) {
    that.logIncoming(body, that.incomingMetadata);
    return that.assistantHandle.originalhandler(body, headers).then(function(response){
      that.logOutgoing(body, response.body, that.outgoingMetadata, that.outgoingIntent)
      that.outgoingMetadata = null
      that.outgoingIntent = null
      return response
    })
  }

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
    }, that.printErrors, that.config.redact, that.config.timeout);
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
    }, that.printErrors, that.config.redact, that.config.timeout);
  }

  that.setOutgoingMetadata = function(outgoingMetadata) {
    that.outgoingMetadata = outgoingMetadata
  }

  that.setOutgoingIntent = function(outgoingIntent) {
    that.outgoingIntent = outgoingIntent
  }

  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  }

  that.logIncoming = function(requestBody, metadata, intent) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      request_body:requestBody
    };
    if (metadata) {
      data.metadata = metadata
    }
    if (intent) {
      data.intent = intent
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
    if (that.outgoingIntent) {
      data.intent = that.outgoingIntent;
    }
    internalLogOutgoing(data, 'npm');
  };

  return that;
}

module.exports = DashBotGoogle;
