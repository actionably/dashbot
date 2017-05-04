'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request')

var VERSION = require('../package.json').version;

function DashBotMicrosoft(apiKeyMap, urlRoot, debug, printErrors) {
  var that = this;
  that.apiKeyMap = apiKeyMap;
  that.urlRoot = urlRoot;
  that.debug = debug;
  that.printErrors = printErrors;
  that.facebookToken = null;

  // facebook token hack
  that.setFacebookToken = function(token){
    that.facebookToken = token;
  }

  // middleware endpoints
  that.receive = function(session, next) {
    logDashbot(session, true, next);
  };
  that.send = function(session, next) {
    logDashbot(session, false, next);
  };

  function logDashbot (session, isIncoming, next) {
    if (that.debug) {
      //console.log('\n*** MSFTBK Debug: ', (isIncoming ? 'incoming' : 'outgoing'), JSON.stringify(session, null, 2))
    }

    var data = {
      is_microsoft:true,
      dashbot_timestamp: new Date().getTime(),
      json: session
    };
    var platform = session.source ? session.source : _.get(session, 'address.channelId');

    // hack for facebook token
    if(platform === 'facebook' && that.facebookToken != null){
      data.token = that.facebookToken;
    }

    var apiKey = apiKeyMap[platform]
    if (!apiKey) {
      console.warn('**** Warning: No Dashbot apiKey for platform:(' + platform + ') Data not saved. ')
      next();
      return;
    }

    // if the platform is not supported by us, use generic
    if (_.indexOf(['facebook', 'kik', 'slack'], platform) === -1) {
      platform = 'generic';
    }

    var url = that.urlRoot + '?apiKey=' +
      apiKey + '&type=' + (isIncoming ? 'incoming' : 'outgoing') +
      '&platform=' + platform + '&v=' + VERSION + '-npm';
    if (that.debug) {
      console.log('\n*** Dashbot MSFT Bot Framework Debug **');
      console.log(' *** platform is ' + platform);
      console.log(' *** Dashbot Url: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    makeRequest({
      uri: url,
      method: 'POST',
      json: data
    }, that.printErrors);

    next();
  }

}

module.exports = DashBotMicrosoft;