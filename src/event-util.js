'use strict'

var makeRequest = require('./make-request');
var VERSION = require('../package.json').version;

function DashBotEventUtil() {
  var that = this;

  that.createCustomEvent = function(eventName, userId, conversationId, extraInfo) {
    return {
      type: 'customEvent',
      name: eventName,
      userId: userId,
      conversationId: conversationId,
      extraInfo: extraInfo
    }
  }

}

module.exports = DashBotEventUtil