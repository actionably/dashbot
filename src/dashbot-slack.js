'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')

var VERSION = require('../package.json').version;

function DashBotSlack(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'slack';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  function logIncomingInternal(data, source) {
    if (data.message.type === 'reconnect_url') {
      // ignore this type.
      return;
    }
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

  function logOutgoingInternal(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    data = _.clone(data);
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  }

  that._addTeamInfo = function addTeamInfo(bot, message) {
    var id = _.cloneDeep(bot.identity);
    delete id.prefs;
    var teamInfo = _.cloneDeep(bot.team_info);
    if(!teamInfo || !_.get(teamInfo, 'id') || !_.get(teamInfo, 'name')) {
      // if we are missing any part of the team lets tell ourselves that we dont know what team this is for. its rare
      // but it can happen.
      teamInfo = _.merge(teamInfo, {
        id: _.get(teamInfo, 'id', 'unknown'),
        name: _.get(teamInfo, 'name', 'unknown')
      })
    }
    delete teamInfo.prefs;
    if (!id.id && _.get(teamInfo, 'bot.user_id')) {
      id = {
        id: _.get(teamInfo, 'bot.user_id')
      }
    }
    teamInfo.bot = id;
    return {
      team: teamInfo,
      bot: id,
      token: bot.config.token,
      message: message
    };
  }

  function addTeamInfoNoBotkit(bot, team, message) {
    return {
      team: {
        id: _.get(team, 'id', 'unknown'),
        name: _.get(team, 'name', 'unknown')
      },
      bot: {
        id: (bot.id?bot.id:_.get(team, 'bot.user_id'))
      },
      message: message
    };

  }

  that.logConnect = function(data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=connect&platform=' + that.platform + '&v=' + VERSION + '-npm';
    if (that.debug) {
      console.log('Dashbot Connect: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  };

  that.logIncoming = function(bot, team, message) {
    return logIncomingInternal(addTeamInfoNoBotkit(bot, team, message), 'npm');
  };

  that.logOutgoing = function(bot, team, message) {
    return logOutgoingInternal(addTeamInfoNoBotkit(bot, team, message), 'npm');
  };

  // botkit middleware endpoints
  that.send = function(bot, message, next) {
    logOutgoingInternal(that._addTeamInfo(bot, message), 'botkit');
    next();
  };

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    logIncomingInternal(that._addTeamInfo(bot, message), 'botkit');
    next();
  };
}

module.exports = DashBotSlack;