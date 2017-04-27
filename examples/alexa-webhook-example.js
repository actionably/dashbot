'use strict';

if (!process.env.DASHBOT_API_KEY_ALEXA) {
  throw new Error('"DASHBOT_API_KEY_ALEXA" environment variable must be defined');
}

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_ALEXA, {
  debug: true,
  urlRoot: process.env.DASHBOT_URL_ROOT
}).alexa;

const app = express();
app.use(bodyParser.json());

var webHookPath = '/alexa';
app.get(webHookPath, function(req, res) {
  res.send('Hello from the alexa webhook');
});

app.post(webHookPath, function(req, res) {
  dashbot.logIncoming(req.body);

  const responseBody = {
    'version': '1.0',
    'response': {
      'outputSpeech': {
        'type': 'PlainText',
        'text': 'Hello World!'
      },
      'card': {
        'content': 'Hello World!',
        'title': 'Hello World',
        'type': 'Simple'
      },
      'shouldEndSession': true
    },
    'sessionAttributes': {}
  };


  dashbot.logOutgoing(req.body, responseBody)

  res.send(responseBody);

});

var port = 4000;
app.listen(port);
console.log('Amazon Alexa webhook available at http://localhost:' + port + webHookPath);
