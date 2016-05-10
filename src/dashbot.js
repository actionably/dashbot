'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');

function DashBotPlatform(apiKey, config, platform) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = platform;
  if (config) {
    that.debug = config.debug;
    that.serverRoot = config.serverRoot || 'https://tracker.dashbot.io';
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

  that.addTeamInfo = function(bot, message) {
    var id = _.cloneDeep(bot.identity);
    delete id.prefs;
    var teamInfo = _.cloneDeep(bot.team_info);
    delete teamInfo.prefs;
    teamInfo.bot = id;
    return {
      teamInfo: teamInfo,
      message: message
    };
  };

  // botkit middleware endpoints
  that.send = function(bot, message, next) {
    that.logOutgoing(that.addTeamInfo(bot, message));
    next();
  };

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    if (message.type !== 'reconnect_url') {
      that.logIncoming(that.addTeamInfo(bot, message));
    }
    next();
  };
}

module.exports = function(apiKey, debug) {
  return {
    facebook: new DashBotPlatform(apiKey, debug, 'facebook'),
    slack: new DashBotPlatform(apiKey, debug, 'slack')
  };
};
