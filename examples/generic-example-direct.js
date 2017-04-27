'use strict';

if (!process.env.DASHBOT_API_KEY_GENERIC) {
  throw new Error('"DASHBOT_API_KEY_GENERIC" environment variable must be defined');
}

var request = require('request');
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  request({
    uri: process.env.DASHBOT_URL_ROOT,
    qs : {
      type: 'outgoing',
      platform: 'generic',
      apiKey: process.env.DASHBOT_API_KEY_GENERIC,
      v: version
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
        apiKey: process.env.DASHBOT_API_KEY_GENERIC,
        v: version
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
