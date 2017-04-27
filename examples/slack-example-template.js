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

var helloResponses = ['Hi, how are you?', 'Hello', 'Hi, how is your day going?', 'Hi, long time no talk.'];
var wildcardResponses = ['Sorry, I do not understand', 'Thats interesting', 'Hmm, fascinating', 'That is nice'];

function randomMessage(msgs) {
  return msgs[Math.floor(Math.random() * msgs.length)];
}

controller.on('direct_message', function(bot, message) {
  if (message.text === 'hi') {
    bot.reply(message, {
      dashbotTemplateId: 'helloResponse',
      text: randomMessage(helloResponses)
    });
  } else {
    bot.reply(message, {
      dashbotTemplateId: 'wildcardResponse',
      text: randomMessage(wildcardResponses)
    });
  }
});

console.log('Slack bot ready');
