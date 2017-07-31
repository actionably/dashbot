'use strict';

if (!process.env.DASHBOT_API_KEY_GENERIC) {
  throw new Error('"DASHBOT_API_KEY_GENERIC" environment variable must be defined');
}

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GENERIC,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).generic

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  dashbot.logOutgoing(
    dashbot.messageUtil.messageWithText('USERIDHERE111', question)
  );

  rl.question(question, function(answer) {
    dashbot.logIncoming(
      dashbot.messageUtil.messageWithText('USERIDHERE111', answer)
    )
    if (answer === 'quit') {
      rl.close();
      return;
    }
    ask('You are right when you say: ' + answer + '. What else? ');
  });
}

ask('Tell me your thoughts: ');
