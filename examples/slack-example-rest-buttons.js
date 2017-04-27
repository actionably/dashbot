'use strict';

if (!process.env.DASHBOT_API_KEY_SLACK) {
  throw new Error('"DASHBOT_API_KEY_SLACK" environment variable must be defined');
}
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error('"SLACK_BOT_TOKEN" environment variable must be defined');
}
if (!process.env.PORT) {
  throw new Error('"PORT" environment variable must be defined');
}

const rp = require('request-promise');
var WebSocketClient = require('websocket').client;
const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

var urlRoot = process.env.DASHBOT_URL_ROOT || 'https://tracker.dashbot.io/track';
var apiKey = process.env.DASHBOT_API_KEY_SLACK;
var version = JSON.parse(fs.readFileSync(__dirname+'/../package.json')).version+'-rest';
var debug = true;

var client = new WebSocketClient();

var baseMessage = null;

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
  baseMessage = {
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
        if (parsedMessage.text === 'buttons') {
          const reply = {
            channel: parsedMessage.channel,
            text: 'A button test',
            attachments: [{
              mrkdwn_in: ['text'], //jscs:ignore
              fallback: 'A button test',
              callback_id: 'foo_' + new Date().getTime(), //jscs:ignore
              color: '#3AA3E3',
              attachment_type: 'default',//jscs:ignore
              actions: [{
                name: 'rewrite',
                text: 'rewrite',
                value: 'rewrite',
                type: 'button'
              }, {
                name: 'reply',
                text: 'reply',
                value: 'reply',
                type: 'button'
              }]
            }]
          };

          // Tell dashbot about your response
          var url = urlRoot + '?apiKey=' + apiKey + '&type=outgoing&platform=slack&v=' + version;
          var toSend = _.clone(baseMessage);
          toSend.message = _.cloneDeep(reply);
          if (debug) {
            console.log('Dashbot outgoing: ' + url);
            console.log(JSON.stringify(toSend, null, 2));
          }
          rp({
            uri: url,
            method: 'POST',
            json: toSend
          });

          reply.attachments = JSON.stringify(reply.attachments);
          // send the reply using the api because websocket only likes text.
          rp.post('https://slack.com/api/chat.postMessage?token='+process.env.SLACK_BOT_TOKEN).form(reply);

        } else if (parsedMessage.subtype === 'bot_message' || parsedMessage.subtype === 'message_changed') {
          // don't reply to self messages.
        } else {
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
      }

    });
  });
  client.connect(parsedData.url);
});

// setup a webserver to receive button presses

const ws = express();
ws.use(bodyParser.json());
ws.use(bodyParser.urlencoded({ extended: true }));

ws.route('/slack/receive').post(function(req, res) {
  var payload = JSON.parse(req.body.payload)
  // Tell dashbot about the button click
  var url = urlRoot + '?apiKey=' + apiKey + '&type=incoming&platform=slack&v=' + version;
  var toSend = _.clone(baseMessage);
  toSend.message = _.cloneDeep(payload);
  if (debug) {
    console.log('Dashbot incoming: ' + url);
    console.log(JSON.stringify(toSend, null, 2));
  }
  rp({
    uri: url,
    method: 'POST',
    json: toSend
  });

  // you need to set the channel on the reply to dashbot (even though slack doesn't always require it)
  const reply = {
    channel: payload.channel.id
  };

  // respond to the button click
  if (_.get(payload, 'actions[0].name') === 'rewrite') {
    reply.text = 'you are right to rewrite'
    res.send(reply)
  } else {
    res.status(200).end();
    reply.text = 'you are right to reply'
    rp.post('https://slack.com/api/chat.postMessage?token='+process.env.SLACK_BOT_TOKEN).form(reply);
  }

  // send the reply to dashbot
  var url = urlRoot + '?apiKey=' + apiKey + '&type=outgoing&platform=slack&v=' + version;
  var toSend = _.clone(baseMessage);
  toSend.message = _.cloneDeep(reply);
  if (debug) {
    console.log('Dashbot outgoing: ' + url);
    console.log(JSON.stringify(toSend, null, 2));
  }
  rp({
    uri: url,
    method: 'POST',
    json: toSend
  });

});

ws.use(function(err, req, res, next) {
  if (!err) {
    return next()
  }

  // Log it
  console.error(err);
  console.error(err.stack);

  res.status(500).jsonp({
    error: err,
    stack: err.stack
  });
});

const port = process.env.PORT;
ws.listen(port);
