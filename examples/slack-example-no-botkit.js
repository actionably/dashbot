'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY_SLACK" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_SLACK,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true}).slack;
const request = require('request');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();


request('https://slack.com/api/rtm.start?token='+process.env.SLACK_BOT_TOKEN, function(error, response) {
  const parsedData = JSON.parse(response.body);

  // Tell dashbot when you connect.
  dashbot.logConnect(parsedData);

  const bot = parsedData.self;
  const team = parsedData.team;
  client.on('connect', function(connection) {
    console.log('Slack bot ready');
    connection.on('message', function(message) {
      const parsedMessage = JSON.parse(message.utf8Data);

      // Tell dashbot when a message arrives
      dashbot.logIncoming(bot, team, parsedMessage);

      if (parsedMessage.type === 'message' && parsedMessage.channel &&
        parsedMessage.channel[0] === 'D' && parsedMessage.user !== bot.id) {
        if (parsedMessage.text.length%2 === 0) {
          // reply on the web socket.
          const reply = {
            type: 'message',
            text: 'You are right when you say: '+parsedMessage.text,
            channel: parsedMessage.channel
          };

          // Tell dashbot about your response
          dashbot.logOutgoing(bot, team, reply);

          connection.sendUTF(JSON.stringify(reply));
        } else {
          // reply using chat.postMessage
          const reply = {
            text: 'You are wrong when you say: '+parsedMessage.text,
            as_user: true,
            channel: parsedMessage.channel
          };

          // Tell dashbot about your response
          dashbot.logOutgoing(bot, team, reply);

          request.post('https://slack.com/api/chat.postMessage?token='+process.env.SLACK_BOT_TOKEN).form(reply);
        }
      }

    });
  });
  client.connect(parsedData.url);
});
