'use strict'

const assert = require('assert')

describe('DashbotAmazonAlexa', function() {
  describe('logIncoming', function() {
    it('WHEN there is a ignore list given then it doesnt log the user to dashbot', function() {
      const dashbot = require('../dashbot')('mockapikey',
        {urlRoot: 'http://localhost:3000', debug:true, ignoreUserIds: ['1']}).alexa;

      const retValue = dashbot.logIncoming(require('./data/event.json'), {})
    })

    it('WHEN there is no ignore list given then it logs the user to dashbot', function() {
      const dashbot = require('../dashbot')('mockapikey',
        {urlRoot: 'http://localhost:3000', debug:true}).alexa;

      const retValue = dashbot.logIncoming(require('./data/event.json'), {})
    })

    it('WHEN the ingore list is a function it still works', function() {
      const dashbot = require('../dashbot')('mockapikey',
        {urlRoot: 'http://localhost:3000', debug:true, ignoreUserIds: function() {return ['1']}}).alexa;

      const retValue = dashbot.logIncoming(require('./data/event.json'), {})
    })

    it('WHEN the ingore list is not defined it still works', function() {
      const dashbot = require('../dashbot')('mockapikey',
        {urlRoot: 'http://localhost:3000', debug:true}).alexa;

      const retValue = dashbot.logIncoming(require('./data/event.json'), {})
    })


  })
})