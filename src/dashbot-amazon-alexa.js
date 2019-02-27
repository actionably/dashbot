'use strict'

var _ = require('lodash');
var meld = require('meld');

var DashBotBase = require('./dashbot-base');
var DashbotLogger = require('dashbot-logger');

var VERSION = require('../package.json').version;

function DashBotAmazonAlexa(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'alexa');

  that.makeRequest = meld.around(require('./make-request'), require('./ignore-users')(config.ignoreUserIds, 'event.session.user.userId'));

  that.dashbotLogger = null;
  that.requestBody = null;

  function internalLogIncoming(data, source) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming&platform=' + that.platform + '&v=' + VERSION + '-' + source;
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }

    return that.makeRequest({
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
    return that.makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors, that.config.redact, that.config.timeout);
  }

  that.logIncoming = function(event, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: cleanContext(context)
    };
    if (!!that.dashbotLogger) {
      return that.dashbotLogger.log({'incoming': { event, context }})
    }
    return internalLogIncoming(data, 'npm');
  };

  that.logOutgoing = function(event, response, context) {
    var timestamp = new Date().getTime();
    var data = {
      dashbot_timestamp: timestamp,
      event: event,
      context: cleanContext(context),
      response: response
    };
    if (!!that.dashbotLogger) {
      return that.dashbotLogger.log({'outgoing': { event, response, context }})
    }
    return internalLogOutgoing(data, 'npm');
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


  const handleSuccess = function(joinpoint, event, responseBody, logIncoming) {
    if (that.outgoingIntent || that.outgoingMetadata) {
      responseBody = _.clone(responseBody)
      if (that.outgoingIntent) {
        responseBody.intent = that.outgoingIntent
      }
      if (that.outgoingMetadata) {
        responseBody.metadata = that.outgoingMetadata
      }
    }
    const logOutgoing = that.logOutgoing(event, responseBody);
    that.outgoingIntent = null
    that.outgoingMetadata = null

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
  }

  const handleFailure = function(joinpoint, logIncoming) {
    Promise.all([logIncoming]).then(function() {
      joinpoint.proceed();
    }).catch(function(errors) {
      if(that.printErrors)
        console.error(errors);
    })

  }

  const setupContextAspect = function(context, event, callback, logIncoming) {
    // send off any successes that used the context to respond
    meld.around(context, 'succeed', function(joinpoint) {
      const responseBody = joinpoint.args[0];
      handleSuccess(joinpoint, event, responseBody, logIncoming)
    })

    // send off any failures that used the context to respond
    meld.around(context, 'fail', function(joinpoint) {
      handleFailure(joinpoint, logIncoming)
    })

    if (callback) {
      const newCallback = meld.around(callback, function(joinpoint) {
        const error = joinpoint.args[0];
        const responseBody = joinpoint.args[1];
        if (error) {
          handleFailure(joinpoint, logIncoming)
          return
        }
        handleSuccess(joinpoint, event, responseBody, logIncoming)
      })
      return newCallback
    }
    return null
  }

  const setupAspectJoinpoint = function (joinpoint) {
    const event = joinpoint.args[0];
    const context = joinpoint.args[1];
    var newCallback = null
    try {
      const callback = joinpoint.args[2];

      // send off the input event
      const logIncoming = that.logIncoming(event, context);

      // setup our aspects
      newCallback = setupContextAspect(context, event, callback, logIncoming);
    } catch (ex) {
      if (that.printErrors) {
        console.error(ex);
      }
    }
    joinpoint.proceed(event, context, newCallback);
  };


  that.handler = function(handler) {
    return meld.around(handler, setupAspectJoinpoint);
  };

  that.logIntegration = function(config) {
    config.debug = _.has(config, 'debug') ? config.debug : that.debug;
    config.printErrors = _.has(config, 'printErrors') ? config.printErrors : that.printErrors;

    that.dashbotLogger = new DashbotLogger(config);

    return that
  }

  return that;
}


// remove circular properties from LambdaContext
// as defined by bespoken-tools
const contextBlackList = {
  'BST.LambdaServer': [
    'response',
    'body',
    'request',
    'verbose',
  ]
}

const cleanContext = function(context) {
  if (_.isObjectLike(context)) {
    const client = _.get(context, 'functionName');

    // check client
    if (client &&
      _.get(context, 'invokedFunctionArn') === 'N/A' &&
      _.get(context, 'memoryLimitInMB') === -1) {
      const clone = _.cloneDeep(context)
      for (const i in contextBlackList[client]) {
        delete clone[contextBlackList[client][i]]
      }
      return clone
    }
  }
  return context
}

module.exports = DashBotAmazonAlexa;