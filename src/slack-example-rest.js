'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY_SLACK" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}

const rp = require('request-promise');
var WebSocketClient = require('websocket').client;
const fs = require('fs');
const _ = require('lodash');


var urlRoot = process.env.DASHBOT_URL_ROOT || 'https://tracker.dashbot.io/track';
var apiKey = process.env.DASHBOT_API_KEY_SLACK;
var version = JSON.parse(fs.readFileSync(__dirname+'/../package.json')).version+'-rest';
var debug = true;

var client = new WebSocketClient();


rp('https://slack.com/api/rtm.start?token='+process.env.SLACK_BOT_TOKEN, function(error, response) {
  const parsedData = JSON.parse(response.body);

  // Tell dashbot when you connect.
  var url = urlRoot + '?apiKey=' + apiKey + '&type=connect&platform=slack&v=' + version;
  if (debug) {
    console.log('Dashbot Connect: ' + url);
    console.log(JSON.stringify(parsedData, null, 2));
  }
  rp({
    uri: url,
    method: 'POST',
    json: parsedData
  });

  const bot = parsedData.self;
  const team = parsedData.team;
  const baseMessage = {
    token: process.env.SLACK_BOT_TOKEN,
    team: {
      id: team.id,
      name: team.name
    },
    bot: {
      id: bot.id
    }
  };
  client.on('connect', function(connection) {
    console.log('Slack bot ready');
    connection.on('message', function(message) {
      const parsedMessage = JSON.parse(message.utf8Data);

      // Tell dashbot when a message arrives
      var url = urlRoot + '?apiKey=' + apiKey + '&type=incoming&platform=slack&v=' + version;
      var toSend = _.clone(baseMessage);
      toSend.message = parsedMessage;
      if (debug) {
        console.log('Dashbot incoming: ' + url);
        console.log(JSON.stringify(toSend, null, 2));
      }
      rp({
        uri: url,
        method: 'POST',
        json: toSend
      });

      if (parsedMessage.type === 'message' && parsedMessage.channel &&
        parsedMessage.channel[0] === 'D' && parsedMessage.user !== bot.id) {
        // reply on the web socket.
        const reply = {
          type: 'message',
          text: 'You are right when you say: '+parsedMessage.text,
          channel: parsedMessage.channel
        };

        // Tell dashbot about your response
        var url = urlRoot + '?apiKey=' + apiKey + '&type=outgoing&platform=slack&v=' + version;
        var toSend = _.clone(baseMessage);
        toSend.message = reply;
        if (debug) {
          console.log('Dashbot outgoing: ' + url);
          console.log(JSON.stringify(toSend, null, 2));
        }
        rp({
          uri: url,
          method: 'POST',
          json: toSend
        });

        connection.sendUTF(JSON.stringify(reply));
      }

    });
  });
  client.connect(parsedData.url);
});
