'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}

const botkit = require('botkit');
const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_SLACK,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true}).slack;

const controller = botkit.slackbot();

controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
}).startRTM();

const pausedChannels = {}

controller.on('direct_message', function(bot, message) {
  const channelId = message.channel
  const teamId = bot.team_info.id
  if (pausedChannels[channelId+'-'+teamId]) {
    return
  }

  if (message.text) {
    bot.reply(message, 'You are right when you say: ' + message.text);
  }
});


// For pause
const express = require('express');
const bodyParser = require('body-parser');

const webserver = express()
webserver.use(bodyParser.json());
webserver.route('/').get(function(req, res) {
  res.send('Hi');
});
webserver.route('/pause').post(function(req, res) {
  console.log('Got request', req.body)
  pausedChannels[req.body.channelId+'-'+req.body.teamId] = req.body.paused
  res.send('{"success":true}')
});

var port = 4000;
webserver.listen(port);
console.log('http://localhost:' + port);

console.log('Slack bot ready');
