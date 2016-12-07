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

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
const fs = require('fs');

var urlRoot = process.env.DASHBOT_URL_ROOT || 'https://tracker.dashbot.io/track';
var apiKey = process.env.DASHBOT_API_KEY_FACEBOOK;
var version = JSON.parse(fs.readFileSync(__dirname+'/../package.json')).version+'-rest';
var debug = true;

var app = express();
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
  var url = urlRoot + '?apiKey=' + apiKey + '&type=incoming&platform=facebook&v=' + version;
  var data = req.body;
  if (debug) {
    console.log('Dashbot Incoming: ' + url);
    console.log(JSON.stringify(data, null, 2));
  }
  request({
    uri: url,
    method: 'POST',
    json: data
  });
  var messagingEvents = req.body.entry[0].messaging;
  if (messagingEvents.length && messagingEvents[0].message && messagingEvents[0].message.text) {
    var event = req.body.entry[0].messaging[0];
    var sender = event.sender.id;
    var text = event.message.text;
    var requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
      method: 'POST',
      json: {
        dashbotTemplateId: 'right',
        recipient: {id: sender},
        message: {
          text: 'You are right when you say: ' + text
        }
      }
    };
    request(requestData, function(error, response) {
      var url = urlRoot + '?apiKey=' + apiKey + '&type=outgoing&platform=facebook&v=' + version;
      requestData.responseBody = response.body;
      console.log('response', JSON.stringify(response, null, 2));
      if (debug) {
        console.log('Dashbot outgoing: ' + url);
        console.log(JSON.stringify(requestData, null, 2));
      }
      request({
        uri: url,
        method: 'POST',
        json: requestData
      });
    });
  }
  res.sendStatus(200);
});

var port = 4000;
app.listen(port);
console.log('Facebook webhook available at http://localhost:' + port + webHookPath);
