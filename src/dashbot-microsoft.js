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

  function interceptActivity(incomingActivity, outgoingActivity, intercepted) {
    const type = _.get(outgoingActivity, 'type')

    if (type !== "trace") {
      // do not want to log same incoming activity multiple times
      if (!intercepted) {
        that.logIncoming(incomingActivity)
        that.logOutgoing(outgoingActivity)
        return true
      } else {
        that.logOutgoing(outgoingActivity)
        return false
      }
    } else if (type === "trace") {
      let outgoing = _.clone(outgoingActivity)
      let incoming = _.clone(incomingActivity)

      // switch from and recipient fields because luis results
      // are from bot to user although it's tracking the users
      // intent
      let activity = _.assign(outgoing, incoming);
      activity.luisResults = _.get(activity, 'value.recognizerResult');

      that.logIncoming(activity)
      return true
    }

    return false
  };

  that.logIncoming = function(data) {
    return logIncomingInternal(data, 'npm');
  };

  that.setOutgoingIntent = function(intent) {
    that.outgoingIntent = intent
  };

  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  };

  that.setOutgoingMetadata = function(metadata) {
    that.outgoingMetadata = metadata
  };

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
    if (luisModel) {
      console.log('Use of luis model parameter in middleware is deprecated.' )
      console.log('Luis model results are now captured automatically by middleware.')
    }

    let intercepted = false;
    let incomingActivity;

    // Make dashbot available in the context object
    if (context.turnState.get(Symbol.for('dashbot')) && that.printErrors) {
      console.warn('Key collision on context turnState. The key Symbol(dashbot) already exists - overwriting.');
    }
    context.turnState.set(Symbol.for('dashbot'), that);

    if (context.activity) {
      incomingActivity = context.activity
    }

    context.onSendActivities((context, activities, innerNext) => {
      return innerNext().then((res) => {
        _.each(activities, outgoingActivity => {
          intercepted = intercepted || interceptActivity(incomingActivity, outgoingActivity, intercepted)
        });
        return res
      })
    });

    return next().then((res) => {
      if (!intercepted && incomingActivity) {
        that.logIncoming(incomingActivity)
      }
      return res
    }, (rej) => {
      console.error(rej);
      return rej
    })
  };

  return that;
}

module.exports = DasbbotMicrosoft;
