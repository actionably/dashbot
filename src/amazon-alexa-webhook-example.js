'use strict';

if (!process.env.DASHBOT_API_KEY_AMAZON) {
  throw new Error('"DASHBOT_API_KEY_AMAZON" environment variable must be defined');
}

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY_AMAZON,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).alexa;

const app = express();
app.use(bodyParser.json());

var webHookPath = '/alexa';
app.get(webHookPath, function(req, res) {
  res.send('Hello from the alexa webhook');
});

app.post(webHookPath, function(request, response) {
  dashbot.logIncoming(request.body);

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


  dashbot.logOutgoing(request.body, responseBody)

  response.send(responseBody);

});

var port = 4000;
app.listen(port);
console.log('Amazon Alexa webhook available at http://localhost:' + port + webHookPath);
