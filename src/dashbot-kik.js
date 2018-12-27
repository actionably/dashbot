'use strict'

var _ = require('lodash');
var uuid = require('uuid')
var makeRequest = require('./make-request');
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DashBotKik(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'kik');

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
    if (!!messages && !_.isArray(messages)) {
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

    return that.botHandle.originalSend(newMessages, recipient, chatId);
  }

  function messageToObject(message) {
    var messageObj = {};
    if (_.isFunction(message.toJSON)) {
      Object.assign(messageObj, message.toJSON());
    }
    else if (_.isString(message)) {
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
    if (!!messages && !_.isArray(messages)) {
      messages = [messages];
    }

    var newMessages = _.map(messages, messageToObject);
    if (recipients) {
      if (!!recipients && !_.isArray(recipients)) {
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

  that.logIncoming = function(kikApiKey, botUsername, message) {
    var data = {
      apiKey: kikApiKey,
      username: botUsername,
      message: message
    };
    return internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(kikApiKey, botUsername, message) {
    var data = {
      apiKey: kikApiKey,
      username: botUsername,
      message: message
    };
    return internalLogOutgoing(data, 'npm');
  };

  return that;
}

module.exports = DashBotKik;