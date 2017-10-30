'use strict';

if (!process.env.DASHBOT_API_KEY_GENERIC) {
  throw new Error('"DASHBOT_API_KEY_GENERIC" environment variable must be defined');
}

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GENERIC,
  {debug:false, urlRoot: process.env.DASHBOT_URL_ROOT}).generic

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {

  dashbot.logIncoming(
    dashbot.messageUtil.messageWithText('Joe', question)
  );

  rl.question(question, function(answer) {
    dashbot.logOutgoing(
      dashbot.messageUtil.messageWithText('Joe', answer)
    )
    if (answer === 'quit') {
      rl.close();
      return;
    }
    ask('You are right when you say: ' + answer + '. What else? ');
  });
}

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.post('/sendMessage', function(req, res) {
  const text = req.body.text;
  console.log(text)
  res.send('worked');
});
var port = 4000;
app.listen(port);

ask('Tell me your thoughts: ');

