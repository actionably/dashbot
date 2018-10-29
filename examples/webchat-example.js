'use strict';

if (!process.env.DASHBOT_API_KEY_GENERIC) {
  throw new Error('"DASHBOT_API_KEY_GENERIC" environment variable must be defined');
}

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GENERIC,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).webchat

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  const messageForDashbot = {
    "text": question,
    "userId": "USERIDHERE123123",
    "conversationId": "GROUPCHATID234",
    "platformJson": {
      "whateverJson": "any JSON specific to your platform can be stored here"
    }
  };
  dashbot.logOutgoing(messageForDashbot);

  rl.question(question, function(answer) {
    const messageForDashbot = {
      "text": answer,
      "userId": "USERIDHERE123123",
      "conversationId": "GROUPCHATID234",
      "platformJson": {
        "whateverJson": "any JSON specific to your platform can be stored here"
      }
    };
    dashbot.logIncoming(messageForDashbot);
    if (answer === 'quit') {
      rl.close();
      return;
    }
    ask('You are right when you say: ' + answer + '. What else? ');
  });
}

ask('Tell me your thoughts: ');
