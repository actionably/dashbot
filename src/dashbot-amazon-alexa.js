'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request');
var meld = require('meld');

var VERSION = require('../package.json').version;

function DashBotAmazonAlexa(apiKey, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKey = apiKey;
  that.platform = 'alexa';
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;

  that.requestBody = null;

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

  that.logIncoming = function(event, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: context
    };
    return internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(event, response, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: context,
      response: response
    };
    return internalLogOutgoing(data, 'npm');
  };

  const setupContextAspect = function(context, event, logIncoming) {
    // send off any successes that used the context to respond
    meld.around(context, 'succeed', function(joinpoint) {
      const responseBody = joinpoint.args[0];
      const logOutgoing = that.logOutgoing(event, responseBody);

      // wait for everything to be sent off to dashbot before proceeding due to lambda
      // not allowing the event loop to drain before terminating execution.
      Promise.all([logIncoming, logOutgoing]).then(function() {
        joinpoint.proceed();
      }).catch(function(errors) {
        if(that.printErrors) {
          console.error(errors);
        }
        // otherwise do nothing and continue with their code.
      })
    })

    // send off any failures that used the context to respond
    meld.around(context, 'fail', function(joinpoint) {
      Promise.all([logIncoming]).then(function() {
        joinpoint.proceed();
      }).catch(function(errors) {
        if(that.printErrors)
          console.error(errors);
      })
    })
  }

  const setupAspectJoinpoint = function (joinpoint) {
    try {
      const event = joinpoint.args[0];
      const context = joinpoint.args[1];

      // send off the input event
      const logIncoming = that.logIncoming(event, context);

      // setup our aspects
      setupContextAspect(context, event, logIncoming);
    } catch (ex) {
      if (that.printErrors) {
        console.error(ex);
      }
    }
    joinpoint.proceed();
  };


  that.handler = function(handler) {
    return meld.around(handler, setupAspectJoinpoint);
  };

}

module.exports = DashBotAmazonAlexa;