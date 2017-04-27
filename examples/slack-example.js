'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY_SLACK" environment variable must be defined');
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

controller.on('direct_message', function(bot, message) {
  if (message.text.length%2==0) {
    bot.reply(message, 'You are right when you say: ' + message.text);
  } else {
    bot.reply(message, {
      "attachments": [
        {
          "fallback": "Required plain-text summary of the attachment.",

          "color": "#36a64f",

          "pretext": "Optional text that appears above the attachment block",

          "author_name": "Bobby Tables",
          "author_link": "http://flickr.com/bobby/",
          "author_icon": "http://flickr.com/icons/bobby.jpg",

          "title": "Slack API Documentation",
          "title_link": "https://api.slack.com/",

          "text": "Optional text that appears within the attachment",

          "fields": [
            {
              "title": "Priority",
              "value": "High",
              "short": false
            }
          ],

          "image_url": "http://my-website.com/path/to/image.jpg",
          "thumb_url": "http://example.com/path/to/thumb.png",

          "footer": "Slack API",
          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
          "ts": 123456789
        }
      ]
    });
  }
});

console.log('Slack bot ready');
