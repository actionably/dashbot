'use strict';

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}

var request = require('request');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var urlRoot = process.env.DASHBOT_URL_ROOT || 'https://tracker.dashbot.io/track';
var url = urlRoot + '?platform=generic&v=0.6.0&apiKey=' + process.env.DASHBOT_API_KEY + '&';

function ask(question) {
  request({
    uri: process.env.DASHBOT_URL_ROOT,
    qs : {
      type: 'outgoing',
      platform: 'generic',
      apiKey: process.env.DASHBOT_API_KEY,
      version: '0.6.0'
    },
    method: 'POST',
    json: {
      text: question,
      userId: 'Joe'
    }
  });
  rl.question(question, function(answer) {
    request({
      uri: process.env.DASHBOT_URL_ROOT,
      qs : {
        type: 'incoming',
        platform: 'generic',
        apiKey: process.env.DASHBOT_API_KEY,
        version: '0.6.0'
      },
      method: 'POST',
      json: {
        text: answer,
        userId: 'Joe'
      }
    });
    if (answer === 'quit') {
      rl.close();
      return;
    }
    ask('You are right when you say: ' + answer + '. What else? ');
  });
}

ask('Tell me your thoughts: ');

