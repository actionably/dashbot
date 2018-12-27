'use strict'

var _ = require('lodash')
var makeRequest = require('./make-request');
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DasbbotMicrosoft(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'microsoft');

  function logIncomingInternal(data, source) {
    const type = 'incoming';
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

  function logOutgoingInternal(data, source) {
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
  };

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm');
  };

  that.setOutgoingIntent = function(intent) {
    that.outgoingIntent = intent
  }

  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  }

  that.setOutgoingMetadata = function(metadata) {
    that.outgoingMetadata = metadata
  }

  that.logOutgoing = function(data) {
    var responseBodyToSend = data

    if (that.outgoingIntent || that.outgoingMetadata) {
      responseBodyToSend = _.clone(data)
      if (that.outgoingIntent) {
        responseBodyToSend.intent = that.outgoingIntent
      }
      if (that.outgoingMetadata) {
        responseBodyToSend.metadata = that.outgoingMetadata
      }

      that.outgoingIntent = null
      that.outgoingMetadata = null
    }

    return logOutgoingInternal(responseBodyToSend, 'npm');
  };

  that.middleware = (luisModel) => (context, next) => {
    if (context.activity) {
      let activity = context.activity
      if (luisModel) {
        activity = _.clone(activity)
        activity.luisResults = luisModel.get(context)
      }
      that.logIncoming(activity)
    }
    context.onSendActivities((context, activities, innerNext) => {
      return innerNext().then((res) => {
        _.each(activities, activity => {
          that.logOutgoing(activity);
        });
        return res
      })
    });
    return next()
  }

  return that;
}

module.exports = DasbbotMicrosoft;