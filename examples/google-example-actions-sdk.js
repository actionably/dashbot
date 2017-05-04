'use strict';

if (!process.env.DASHBOT_API_KEY_GOOGLE) {
  throw new Error('"DASHBOT_API_KEY_GOOGLE" environment variable must be defined');
}

var express = require('express');
var bodyParser = require('body-parser');
var ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GOOGLE,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true}).google;

var app = express();

app.use(bodyParser.json());

app.post('/helloAction', function (request, response) {
  helloAction(request, response);
});

app.post('/guessNumber', function (request, response) {
  guessNumber(request, response);
});

app.get('/', function (request, response) {
  response.send("hello")
});
// Start the server
var server = app.listen(process.env.PORT || '8090', function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});

function helloAction(request, response) {
  const assistant = new ActionsSdkAssistant({request: request, response: response});
  dashbot.configHandler(assistant);

  if (assistant.getRawInput().toLowerCase() == "talk to hello action")
    assistant.askForText({ text_to_speech: "Hi! Say anything, and I will repeat it once." });
  else
    assistant.tell("You said, " + assistant.getRawInput() + "! Thanks for playing!");
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const gameMap = {}

function guessNumber(request, response) {
  const assistant = new ActionsSdkAssistant({request: request, response: response});
  dashbot.configHandler(assistant);

  const userId = request.body.user.user_id
  if (!userId) {
    console.log('missing user id')
    // not sure what to do.
    response.status(500).send('missing user id')
  }

  const number = gameMap[userId]
  if (!number) {
    gameMap[userId] = randInt(1, 10)
    assistant.askForText({
      text_to_speech: "Guess a number between 1 and 10"
    });
  }
  const guess = parseInt(assistant.getRawInput())
  if (number === guess) {
    assistant.tell("Correct! Thanks for playing!");
    gameMap[userId] = null;
  } else if (!guess) {
    assistant.askForText({
      text_to_speech: assistant.getRawInput() + " is not a number. Guess a number between 1 and 10"
    });
  } else if (guess > number) {
    assistant.askForText({
      text_to_speech: "Too high. Guess another number between 1 and 10"
    });
  } else {
    assistant.askForText({
      text_to_speech: "Too low. Guess another number between 1 and 10"
    });
  }
}
