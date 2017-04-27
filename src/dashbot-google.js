'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')

var VERSION = require('../package.json').version;

function DashBotGoogle(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'google';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  that.assistantHandle = null;
  that.requestBody = null;

  that.configHandler = function(assistant){
    if (assistant == null) {
      throw new Error('YOU MUST SUPPLY THE ASSISTANT OBJECT TO DASHBOT!');
    }
    that.assistantHandle = assistant;

    that.assistantHandle.originalDoResponse = assistant.doResponse_;
    that.assistantHandle.doResponse_ = dashbotDoResponse;

    that.requestBody = assistant.body_;
    that.logIncoming(assistant.body_);
  };

  function dashbotDoResponse(response, responseCode){
    that.logOutgoing(that.requestBody, response)
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
    }, that.printErrors);
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
    }, that.printErrors);
  }

  that.logIncoming = function(requestBody) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      message: requestBody
    };
    internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(requestBody, message) {
    var userId = _.has(requestBody, 'originalRequest') ? _.get(requestBody,'originalRequest.data.user.user_id') : _.get(requestBody,'user.user_id');
    var conversationId = _.has(requestBody, 'originalRequest') ? _.get(requestBody,'originalRequest.data.conversation.conversation_id') : _.get(requestBody,'conversation.conversation_id');

    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      user: {
        user_id: userId
      },
      conversation: {
        conversation_id: conversationId
      },
      message: message
    };
    internalLogOutgoing(data, 'npm');
  };
}

module.exports = DashBotGoogle;