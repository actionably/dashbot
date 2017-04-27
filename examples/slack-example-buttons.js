'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY_SLACK" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}

const botkit = require('botkit');
const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_SLACK,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug: true}).slack;

const cJSON = require('circular-json');

const store = {
  get : function(id, cb) {
    cb(null, null);
  },
  save : function(data, cb) {
    cb(null);
  },
  all : function(cb) {
    cb(null, []);
  }
};

const interactiveReplies = (process.env.BOTKIT_INTERACTIVE_REPLIES==='true');

const controller = botkit.slackbot({
  interactive_replies: interactiveReplies,
  storage: {
    teams: {
      get: function(id, cb) {
        cb(null, {
          "id": "T0RKXFPTP",
          "createdBy": "U0RKX8RDM",
          "url": "https://jessetestteam.slack.com/",
          "name": "jessetest",
          "bot": {
            "createdBy": "U0RKX8RDM",
            "user_id": "U0S1R3AS0",
            "token": "..."
          },
          "token": "..."
        });
      },
      save : function(data, cb) {
        cb(null);
      },
      all : function(cb) {
        cb(null, []);
      }
    },
    users : store,
    channels: store
  }
});

controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);

if (process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET && process.env.PORT) {
  controller.configureSlackApp({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot']
  });
  console.log('Starting webserver listening on port ' + process.env.PORT);
  controller.setupWebserver(process.env.PORT, function(err, webserver) {
    controller.createWebhookEndpoints(webserver);
    webserver.route('/').get(function(req, res) {
      res.send('Hi');
    });
  });
}

const mainBot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
}).startRTM();

const responseOn = ['direct_message'];
if (!interactiveReplies) {
  responseOn.push('interactive_message_callback')
}

controller.on(responseOn, function(bot, message) {
  if (message.text === 'rich') {
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
  } else if (message.text === 'buttons') {
    const replyMessage = {
      text: 'A button test',
      attachments: [{
        mrkdwn_in: ['text'], //jscs:ignore
        fallback: 'A button test',
        callback_id: 'foo_' + new Date().getTime(), //jscs:ignore
        color: '#3AA3E3',
        attachment_type: 'default',//jscs:ignore
        actions: [{
          name: 'name1',
          text: 'button1',
          value: 'value1',
          type: 'button'
        }, {
          name: 'name2',
          text: 'button2',
          value: 'value2',
          type: 'button'
        }]
      }]
    };
    bot.reply(message, replyMessage);
  } else if (message.type === 'interactive_message_callback') {
    //console.log(cJSON.stringify(bot, null, 2));
    dashbot.logIncoming(bot.identity, bot.team_info, message);
    const replyMessage = {
      text: 'You are right when you click: ' + message.text
    };
    replyMessage.channel = message.channel;
    dashbot.logOutgoing(bot.identity, bot.team_info, replyMessage);
    bot.replyInteractive(message, replyMessage);
  } else if (message.actions) {
    const replyMessage = {
      text: 'You are right when you click in: ' + message.text
    };
    replyMessage.channel = message.channel;
    dashbot.logOutgoing(bot.identity, bot.team_info, replyMessage);
    bot.replyInteractive(message, replyMessage)
  } else {
    bot.reply(message, 'You are right when you say: ' + message.text);
  }
});

console.log('Slack bot ready');
