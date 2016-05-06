'use strict';

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}

const botkit = require('botkit');
const dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY, {debug:true}).slack;

const controller = botkit.slackbot();

controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
}).startRTM();

controller.on('direct_message', function(bot, message) {
  bot.reply(message, 'You are right when you say: ' + message.text);
});

console.log('Slack bot ready');
