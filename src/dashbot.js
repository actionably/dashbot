'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');

function DashBotPlatform(apiKey, config, platform) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = platform;
  if (config) {
    that.debug = config.debug;
    that.serverRoot = config.serverRoot || 'https://bot-analytics.herokuapp.com';
  }

  that.logIncoming = function(data) {
    if (that.debug) {
      console.log('Dashbot Incoming:');
      console.log(JSON.stringify(data, null, 2));
    }
    rp({
      uri: that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=incoming&platform=' + that.platform,
      method: 'POST',
      json: data
    });
  };

  that.logOutgoing = function(data) {
    if (that.debug) {
      console.log('Dashbot Outgoing');
      console.log(JSON.stringify(data, null, 2));
    }
    var requestId = uuid.v4();
    rp({
      uri: that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=outgoing&platform=' + that.platform,
      method: 'POST',
      json: {
        requestBody: data,
        requestId: requestId
      }
    });
    return requestId;
  };

  that.logOutgoingResponse = function(requestId, error, response) {
    if (that.debug) {
      console.log('Dashbot Outgoing response');
      console.log(JSON.stringify(error, null, 2));
      console.log(JSON.stringify(response.body, null, 2));
    }
    rp({
      uri: that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=outgoingResponse&platform=' + that.platform,
      method: 'POST',
      json: {
        error: error,
        responseBody: response.body,
        requestId: requestId
      }
    });
  };

  // botkit middleware endpoints
  that.send = function(bot, message, next) {
    that.logOutgoing(message);
    next();
  };

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    that.logIncoming(message);
    next();
  };
}

module.exports = function(apiKey, debug) {
  return {
    facebook: new DashBotPlatform(apiKey, debug, 'facebook'),
    slack: new DashBotPlatform(apiKey, debug, 'slack')
  };
};
