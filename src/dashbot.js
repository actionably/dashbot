'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');

function DashBotPlatform(apiKey, config, platform) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = platform;
  that.serverRoot = 'https://tracker.dashbot.io';
  if (!apiKey) {
    throw new Error('YOU MUST SUPPLY AN API_KEY TO DASHBOT!');
  }
  if (config) {
    that.debug = config.debug;
    that.serverRoot = config.serverRoot || that.serverRoot;
  }

  that.logIncoming = function(data) {
    var url = that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=incoming&platform=' + that.platform;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    rp({
      uri: url,
      method: 'POST',
      json: data
    });
  };

  that.logOutgoing = function(data) {
    var url = that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=outgoing&platform=' + that.platform;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    var requestId = uuid.v4();
    rp({
      uri: url,
      method: 'POST',
      json: {
        requestBody: data,
        requestId: requestId
      }
    });
    return requestId;
  };

  that.logOutgoingResponse = function(requestId, error, response) {
    var url = that.serverRoot + '/track?apiKey=' + that.apiKey + '&type=outgoingResponse&platform=' + that.platform;
    if (that.debug) {
      console.log('Dashbot Outgoing response: '+url);
      console.log(JSON.stringify(error, null, 2));
      console.log(JSON.stringify(response.body, null, 2));
    }
    rp({
      uri: url,
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

module.exports = function(apiKey, config) {
  return {
    facebook: new DashBotPlatform(apiKey, config, 'facebook'),
    slack: new DashBotPlatform(apiKey, config, 'slack')
  };
};
