'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DashBotFacebook(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'facebook');

  function logIncomingInternal(data, source, type) {
    type = type || 'incoming'
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=' + type + '&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact, that.config.timeout);
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
    return makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact, that.config.timeout);
  };

  /*
   * For use with is_echo=true just log all incoming you don't have to log outgoing.
   */
  that.log = function(data) {
    return logIncomingInternal(data, 'npm', 'all');
  };

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm');
  };

  that.logOutgoing = function(data, responseBody) {
    var dataToSend = data

    if (that.outgoingIntent || that.outgoingMetadata) {
      dataToSend = _.clone(data)
      if (that.outgoingIntent) {
        dataToSend.intent = that.outgoingIntent
      }
      if (that.outgoingMetadata) {
        dataToSend.metadata = that.outgoingMetadata
      }

      that.outgoingIntent = null
      that.outgoingMetadata = null
    }

    return logOutgoingInternal(dataToSend, responseBody, 'npm');
  };

  /**
   * this will set an internal variable that when the next outgoing message comes through it will set the intent of it
   * to NotHandled
   *
   * @returns {*}
   */
  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  }

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
  return that;
}

module.exports = DashBotFacebook;