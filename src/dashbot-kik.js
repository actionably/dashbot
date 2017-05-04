'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')

var VERSION = require('../package.json').version;

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

    return that.botHandle.originalSend(newMessages, recipient, chatId);
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
    return makeRequest({
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
    return makeRequest({
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
}

module.exports = DashBotKik;