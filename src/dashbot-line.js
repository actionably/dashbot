'use strict'

var _ = require('lodash');
var makeRequest = require('./make-request');
var DashBotBase = require('./dashbot-base');

var VERSION = require('../package.json').version;

function DashBotLine(apiKey, urlRoot, debug, printErrors, config) {
  var that = new DashBotBase(apiKey, urlRoot, debug, printErrors, config, 'generic');

  function getSourceId(source) {
    switch(source.type) {
      case 'group':
        return source.groupId
      case 'room':
        return source.roomId
      default:
        return source.userId
    }
  }

  function incomingDataBuilder(event) {
    var data = {}
    if (event.type === 'message') {
      if (event.message.type === 'text') {
        data.text = event.message.text
      } else if (event.message.type === 'file') {
        data.text = `[${event.message.type}: ${event.message.fileName}]`
      } else if (event.message.type === 'location') {
        data.text = `[${event.message.type}: ${event.message.address} (${event.message.latitude}, ${event.message.longitude})]`
      } else if (event.message.type === 'sticker') {
        data.text = `[${event.message.type}: ${event.message.stickerId}]`
      } else {
        data.text = `[${event.message.type}]`
      }
    } else if (event.type === 'postback') {
      data.text = `[${event.type}: ${event.postback.data}]`
    } else {
      data.text = `[${event.type}]`
    }
    data.userId = getSourceId(event.source)
    data.platformJson = event
    return data
  }

  function outgoingDataBuilder(source, event) {
    var data = {}
    if (event.type === 'text') {
      data.text = event.text
    } else if (event.type === 'sticker') {
      data.text = `[${event.type}: ${event.stickerId}]`
    } else if (event.type === 'image' || event.type === 'video' || event.type === 'audio') {
      data.images = [{ image: { url: event.originalContentUrl } }]
      data.text = `[${event.type}: ${event.originalContentUrl}]`
    } else if (event.type === 'location') {
      data.text = `[${event.type}: ${event.address} (${event.latitude}, ${event.longitude})]`
    } else if (event.type === 'imagemap') {
      data.text = `[${event.type} (${event.baseUrl}): ${event.altText}]`
    } else if (event.type === 'template') {
      data.text = `[${event.type} (${event.template.type}): ${event.altText}]`
    } else if (event.type === 'flex') {
      data.text = `[${event.type} (${event.contents.type}): ${event.altText}]`
    } else {
      data.text = `[${event.type}]`
    }
    data.userId = getSourceId(source)
    data.platformJson = event
    return data
  }

  function logIncomingInternal(data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=incoming' + '&platform=' + that.platform + '&v=' + VERSION + '-npm';
    if (that.debug) {
      console.log('Dashbot Incoming: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: incomingDataBuilder(data)
    }, that.printErrors, that.config.redact, that.config.timeout);
  };

  function logOutgoingInternal(source, data) {
    var url = that.urlRoot + '?apiKey=' +
      that.apiKey + '&type=outgoing&platform=' + that.platform + '&v=' + VERSION + '-npm';
    if (that.debug) {
      console.log('Dashbot Outgoing: ' + url);
      console.log(JSON.stringify(data, null, 2));
    }
    return makeRequest({
      uri: url,
      method: 'POST',
      json: outgoingDataBuilder(source, data)
    }, that.printErrors, that.config.redact, that.config.timeout);
  };

  that.setNotHandled = function() {
    that.outgoingIntent = {
      name: 'NotHandled'
    }
  }

  that.logIncoming = function(data) {
    return logIncomingInternal(data)
  };

  that.logOutgoing = function(source, data) {
    return logOutgoingInternal(source, data)
  };

  return that
}

module.exports = DashBotLine;
