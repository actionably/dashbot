'use strict'

const dashbot = require('../dashbot')('mockapikey',
  {urlRoot: 'http://localhost:3000', debug:true}).slack;

const assert = require('assert')

describe('DashBotSlack', function() {
  describe('.addTeamInfo()', function() {
    it('GIVEN there is no team info information ' +
        'WHEN constructing the response ' +
        'THEN we set the team info to unknown', function() {

      const bot = {
        identity: {
          id: 'foo'
        },
        config: {
          token: 'foo'
        }
      }
      const message = {
      }

      const retValue = dashbot._addTeamInfo(bot, message)

      assert.equal(retValue.team.id, 'unknown')
      assert.equal(retValue.team.name, 'unknown')
    })
  })
})