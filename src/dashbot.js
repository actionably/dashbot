'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');
var util = require('util');
var fs = require('fs');

var VERSION = JSON.parse(fs.readFileSync(__dirname+'/../package.json')).version;

function makeRequest(data, printErrors) {
  if (printErrors) {
    rp(data);
  } else {
    rp(data).catch(function(err) {
      // ignore
    });
  }
}

function DashBotFacebook(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'facebook';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  function logIncomingInternal(data, source) {
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
  };

  function logOutgoingInternal(data, responseBody, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    data = _.clone(data);
    data.responseBody = responseBody;
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
  };

  that.logIncoming = function(data) {
    logIncomingInternal(data, 'npm');
  };

  that.logOutgoing = function(data, responseBody) {
    logOutgoingInternal(data, responseBody, 'npm');
  };

  function getAndRemove(obj, prop) {
    var temp = obj[prop];
    delete obj[prop];
    return temp;
  }

  function botkitTransformIncoming(bot, message) {
    var sendMessage = _.cloneDeep(message);
    var user = getAndRemove(sendMessage, 'user');
    var timestamp = getAndRemove(sendMessage, 'timestamp');
    delete sendMessage.channel;
    return {
      object: 'page',
      entry: [{
        time: timestamp,
        messaging: [{
          sender: {
            id: user
          },
          timestamp: timestamp,
          message: sendMessage
        }]
      }]
    };
  }

  function botkitTransformOutgoing(bot, message) {
    var sendMessage = _.cloneDeep(message);
    var channel = getAndRemove(sendMessage, 'channel');
    return {
      qs: {
        access_token: bot.botkit.config.access_token
      },
      json: {
        recipient: {
          id: channel
        },
        message: sendMessage
      }
    };
  }

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    logIncomingInternal(botkitTransformIncoming(bot, message), 'botkit');
    next();
  };


  // botkit middleware endpoints
  that.send = function(bot, message, next) {
    logOutgoingInternal(botkitTransformOutgoing(bot, message), null, 'botkit');
    next();
  };

}

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
    makeRequest({
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
    data.requestId = uuid.v4();
    makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);
    return data.requestId;
  }

  function addTeamInfo(bot, message) {
    var id = _.cloneDeep(bot.identity);
    delete id.prefs;
    var teamInfo = _.cloneDeep(bot.team_info);
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
        id: team.id,
        name: team.name
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
    makeRequest({
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
    logOutgoingInternal(addTeamInfo(bot, message), 'botkit');
    next();
  };

  // botkit middleware endpoints
  that.receive = function(bot, message, next) {
    logIncomingInternal(addTeamInfo(bot, message), 'botkit');
    next();
  };
}

function DashBotKik(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'kik';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  that.botHandle = null;
  that.kikUsername = null;
  that.kikApiKey = null;

  that.configHandler = function(bot) {
    that.botHandle = bot;
    that.botHandle.originalSend = bot.send;
    that.botHandle.send = dashBotSend;
    that.botHandle.originalBroadcast = bot.broadcast;
    that.botHandle.broadcast = dashBotBroadcast;
    that.kikUsername = bot.username;
    that.kikApiKey = bot.apiKey;
  };
  that.logHandler = function(incoming, next) {
    if (!that.botHandle || that.botHandle == null) {
      throw new Error('YOU MUST SUPPLY THE BOT OBJECT TO DASHBOT!');
    }
    var data = {
      apiKey: incoming.bot.apiKey,
      username: incoming.bot.username,
      message: incoming._state
    };
    internalLogIncoming(data, 'kiknpm');
    next();
  };
  function dashBotSend(messages, recipient, chatId) {
    if (!!messages && !util.isArray(messages)) {
      messages = [messages];
    }
    var newMessages = _.map(messages, messageToObject);
    _.each(newMessages, function(message) {
      var data = {
        apiKey: that.kikApiKey,
        username: that.kikUsername,
        message: kikPrepareMessage(message, recipient, chatId)
      };
      internalLogOutgoing(data, 'kiknpm');
    });

    that.botHandle.originalSend(newMessages, recipient, chatId);
  }

  function messageToObject(message) {
    var messageObj = {};
    if (util.isFunction(message.toJSON)) {
      Object.assign(messageObj, message.toJSON());
    }
    else if (util.isString(message)) {
      Object.assign(messageObj, {'type': 'text', 'body': message});
    }
    else {
      Object.assign(messageObj, message);
    }
    messageObj.id = uuid.v4();
    return messageObj;
  }

  function kikPrepareMessage(message, recipient, chatId) {
    var kikMessage = _.cloneDeep(message);
    kikMessage.to = recipient;
    if (chatId) {
      kikMessage.chatId = chatId
    }
    return kikMessage;
  }

  function dashBotBroadcast(messages, recipients) {
    if (!!messages && !util.isArray(messages)) {
      messages = [messages];
    }

    var newMessages = _.map(messages, messageToObject);
    if (recipients) {
      if (!!recipients && !util.isArray(recipients)) {
        recipients = [recipients];
      }

      recipients.forEach(function (recipient) {
        newMessages.forEach(function (message) {
          that.logOutgoing(that.kikApiKey, that.kikUsername, kikPrepareMessage(message, recipient));
        });
      });
    }

    return that.botHandle.originalBroadcast(newMessages, recipients);

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

  that.logIncoming = function(kikApiKey, botUsername, message) {
    var data = {
      apiKey: kikApiKey,
      username: botUsername,
      message: message
    };
    internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(kikApiKey, botUsername, message) {
    var data = {
      apiKey: kikApiKey,
      username: botUsername,
      message: message
    };
    internalLogOutgoing(data, 'npm');
  };
}

module.exports = function(apiKey, config) {
  if (!apiKey) {
    throw new Error('YOU MUST SUPPLY AN API_KEY TO DASHBOT!');
  }
  var serverRoot = 'https://tracker.dashbot.io';
  var urlRoot = serverRoot + '/track';
  var debug = false;
  var printErrors = true;
  if (config) {
    debug = config.debug;
    serverRoot = config.serverRoot || serverRoot;
    urlRoot = config.urlRoot || serverRoot + '/track';
    if (config.printErrors !== undefined) {
      printErrors = config.printErrors;
    }
  }
  return {
    facebook: new DashBotFacebook(apiKey, urlRoot, debug, printErrors),
    slack: new DashBotSlack(apiKey, urlRoot, debug, printErrors),
    kik: new DashBotKik(apiKey, urlRoot, debug, printErrors)
  };
};
