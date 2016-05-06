'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY);

const app = express();
app.use(bodyParser.json()); // For parsing application/json

app.get('/facebook/receive/', function(req, res) {
  if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Error, wrong validation token');
});

app.post('/facebook/receive/', function(req, res) {
  dashbot.logIncoming(req.body);
  const messagingEvents = req.body.entry[0].messaging;
  if (messagingEvents.length && messagingEvents[0].message && messagingEvents[0].message.text) {
    const event = req.body.entry[0].messaging[0];
    const sender = event.sender.id;
    const text = event.message.text;
    const data = {
      recipient: {id: sender},
      message: {
        text: 'You are right when you say: ' + text
      }
    };
    const requestId = dashbot.logOutgoing(data);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN}, //jscs:ignore
      method: 'POST',
      json: data
    }, function(error, response, body) {
      dashbot.logOutgoingResponse(requestId, error, response);
    });
  }
  res.sendStatus(200);
});

app.listen(3030);

