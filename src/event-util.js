'use strict'

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

  that.createPageLaunchEvent = function(userId, conversationId) {
    return {
      type: 'pageLaunchEvent',
      userId: userId,
      conversationId: conversationId
    }
  }

  that.createShareEvent = function(userId, conversationId, sharedMessageJson) {
    return {
      type: 'shareEvent',
      userId: userId,
      conversationId: conversationId,
      sharedMessage: sharedMessageJson
    }
  }

  that.createRevenueEvent = function(userId, conversationId, amount, referenceNumber, metadata) {
    return {
      type: 'revenueEvent',
      userId: userId,
      conversationId: conversationId,
      amount: amount,
      referenceNumber: referenceNumber,
      metadata: metadata
    }
  }
}

module.exports = DashBotEventUtil