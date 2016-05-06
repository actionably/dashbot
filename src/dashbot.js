'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');

function DashBot(apiKey, config) {
  this.apiKey = apiKey;
  if (config) {
    this.debug = config.debug;
    this.serverRoot = config.serverRoot || 'https://bot-analytics.herokuapp.com';
  }

  this.logIncoming = function(data) {
    if (this.debug) {
      console.log('Incoming');
      console.log(JSON.stringify(data, null, 2));
    }
    rp({
      uri: this.serverRoot + '/track?apiKey=' + this.apiKey + '&type=incoming&platform=facebook',
      method: 'POST',
      json: data
    });
  };

  this.logOutgoing = function(data) {
    if (this.debug) {
      console.log('Outgoing');
      console.log(JSON.stringify(data, null, 2));
    }
    var requestId = uuid.v4();
    rp({
      uri: this.serverRoot + '/track?apiKey=' + this.apiKey + '&type=outgoing&platform=facebook',
      method: 'POST',
      json: {
        requestBody: data,
        requestId: requestId
      }
    });
    return requestId;
  };

  this.logOutgoingResponse = function(requestId, error, response) {
    if (this.debug) {
      console.log('Outgoing response');
      console.log(JSON.stringify(error, null, 2));
      console.log(JSON.stringify(response.body, null, 2));
    }
    rp({
      uri: this.serverRoot + '/track?apiKey=' + this.apiKey + '&type=outgoingResponse&platform=facebook',
      method: 'POST',
      json: {
        error: error,
        responseBody: response.body,
        requestId: requestId
      }
    });
  };

}

module.exports = function(apiKey, debug) {
  return new DashBot(apiKey, debug);
};
