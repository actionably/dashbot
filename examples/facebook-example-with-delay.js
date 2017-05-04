'use strict';

if (!process.env.DASHBOT_API_KEY_FACEBOOK) {
  throw new Error('"DASHBOT_API_KEY_FACEBOOK" environment variable must be defined');
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
const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_FACEBOOK,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).facebook;

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

function sendMessage(sender, text) {
  const requestData = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
    method: 'POST',
    json: {
      dashbotTemplateId: 'right',
      recipient: {id: sender},
      message: {
        text: text
      }
    }
  };
  request(requestData, function(error, response, body) {
    dashbot.logOutgoing(requestData, response.body);
  });
}

app.post(webHookPath, function(req, res) {
  dashbot.logIncoming(req.body);
  const messagingEvents = req.body.entry[0].messaging;
  if (messagingEvents.length && messagingEvents[0].message && messagingEvents[0].message.text) {
    const event = req.body.entry[0].messaging[0];
    const sender = event.sender.id;
    const text = event.message.text;
    if (event.message.is_echo) {
      return;
    }
    sendMessage(sender, 'You are right when you say: ' + text);
    setTimeout(function() {
      sendMessage(sender, 'Change my mind. You are wrong when you say: ' + text);
    }, 5000);
    setTimeout(function() {
      sendMessage(sender, 'Now I do not know what to think');
    }, 20000);
  }
  res.sendStatus(200);
});

var port = 4000;
app.listen(port);
console.log('Facebook webhook available at http://localhost:' + port + webHookPath);
