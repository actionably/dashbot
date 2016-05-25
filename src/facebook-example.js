'use strict';

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.FACEBOOK_VERIFY_TOKEN) {
  throw new Error('"FACEBOOK_VERIFY_TOKEN" environment variable must be defined');
}
if (!process.env.FACEBOOK_PAGE_TOKEN) {
  throw new Error('"FACEBOOK_PAGE_TOKEN" environment variable must be defined');
}

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY,
  {debug:true, serverRoot: process.env.DASHBOT_SERVER_ROOT}).facebook;

const app = express();
app.use(bodyParser.json());

var webHookPath = '/facebook/receive/';
app.get(webHookPath, function(req, res) {
  if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Error, wrong validation token');
});

app.post(webHookPath, function(req, res) {
  dashbot.logIncoming(req.body);
  const messagingEvents = req.body.entry[0].messaging;
  if (messagingEvents.length && messagingEvents[0].message && messagingEvents[0].message.text) {
    const event = req.body.entry[0].messaging[0];
    const sender = event.sender.id;
    const text = event.message.text;
    const requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {
          text: 'You are right when you say: ' + text
        }
      }
    };
    const requestId = dashbot.logOutgoing(requestData);
    request(requestData, function(error, response, body) {
      dashbot.logOutgoingResponse(requestId, error, response);
    });
  }
  res.sendStatus(200);
});

var port = 4000;
app.listen(port);
console.log('Facebook webhook available at http://localhost:' + port + webHookPath);
