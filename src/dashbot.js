'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');

var VERSION = '0.6.2';

function DashBotFacebook(apiKey, urlRoot, debug) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'facebook';
  that.urlRoot = urlRoot;
  that.debug = debug;

  that.logIncoming = function(data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming&platform=' + that.platform + '&v='+VERSION;
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
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v='+VERSION;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    data = _.clone(data);
    data.requestId = uuid.v4();
    rp({
      uri: url,
      method: 'POST',
      json: data
    });
    return data.requestId;
  };

  that.logOutgoingResponse = function(requestId, error, response) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoingResponse&platform=' + that.platform + '&v='+VERSION;
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
}

function DashBotSlack(apiKey, urlRoot, debug) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'slack';
  that.urlRoot = urlRoot;
  that.debug = debug;

  function logIncomingInternal(data) {
    if (data.message.type === 'reconnect_url') {
      // ignore this type.
      return;
    }
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming&platform=' + that.platform + '&v='+VERSION;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    rp({
      uri: url,
      method: 'POST',
      json: data
    });
  }

  function logOutgoingInternal(data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v='+VERSION;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    data = _.clone(data);
    data.requestId = uuid.v4();
    rp({
      uri: url,
      method: 'POST',
      json: data
    });
    return data.requestId;
  }

  function addTeamInfo(bot, message) {
    var id = _.cloneDeep(bot.identity);
    delete id.prefs;
    var teamInfo = _.cloneDeep(bot.team_info);
    delete teamInfo.prefs;
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
        id: team.id,
        name: team.name
      },
      bot: {
        id: bot.id
      },
      message: message
    };

  }

  that.logConnect = function(data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=connect&platform=' + that.platform + '&v='+VERSION;
    if (that.debug) {
      console.log('Dashbot Connect: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    rp({
      uri: url,
      method: 'POST',
      json: data
    });
  };

  that.logIncoming = function(bot, team, message) {
    return logIncomingInternal(addTeamInfoNoBotkit(bot, team, message));
  };

  that.logOutgoing = function(bot, team, message) {
    return logOutgoingInternal(addTeamInfoNoBotkit(bot, team, message));
  };

  that.logOutgoingResponse = function(requestId, error, response) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoingResponse&platform=' + that.platform + '&v='+VERSION;
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

  // botkit middleware endpoints
  that.send = function(bot, message, next) {
    logOutgoingInternal(addTeamInfo(bot, message));
    next();
  };

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    logIncomingInternal(addTeamInfo(bot, message));
    next();
  };
}

module.exports = function(apiKey, config) {
  if (!apiKey) {
    throw new Error('YOU MUST SUPPLY AN API_KEY TO DASHBOT!');
  }
  var serverRoot = 'https://tracker.dashbot.io';
  var urlRoot = serverRoot + '/track';
  var debug = false;
  if (config) {
    debug = config.debug;
    serverRoot = config.serverRoot || serverRoot;
    urlRoot = config.urlRoot || serverRoot + '/track';
  }
  return {
    facebook: new DashBotFacebook(apiKey, urlRoot, debug),
    slack: new DashBotSlack(apiKey, urlRoot, debug)
  };
};
