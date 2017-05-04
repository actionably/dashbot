'use strict';

if (!process.env.DASHBOT_API_KEY_GOOGLE) {
  throw new Error('"DASHBOT_API_KEY_GOOGLE" environment variable must be defined');
}

var express = require('express');
var bodyParser = require('body-parser');

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GOOGLE,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true}).google;


// Instantiate an Express application
var app = express();

app.use(bodyParser.json());

// Handle POST requests and call the guessnumber() function
app.post('/guessnumber', function (request, response) {
  guessnumber(request, response);
});

app.get('/', function (request, response) {
  response.send("hello")
});

// Start the server
var server = app.listen(process.env.PORT || '8080', function () {
  console.log('App locally listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});

// Generate the random number
function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// Handle requests from the agent
function guessnumber(request, response) {
  if (request.body.result) {

    dashbot.logIncoming(request.body)

    var action = request.body.result.action;

    // Handle a request where the action is "generate_answer"
    if (action == "generate_answer") {
      var answer = getRandomNumber(1,100);
      let msg = {
        speech: "I’m thinking of a number from 0 to 100. What’s your first guess?",
        data: { google: { expect_user_response: true } },
        contextOut: [
          {
            name:"game",
            lifespan:100,
            parameters:{
              answer:answer
            }
          }
        ]
      }
      dashbot.logOutgoing(request.body, msg)
      response.send(msg);

    // Handle a request where the action is "check_guess"
    } else if (action == "check_guess") {
      var answer = parseInt(request.body.result.contexts[0].parameters.answer);
      var guess = parseInt(request.body.result.parameters.guess);
      var tts = "Congratulations, that’s it! I was thinking of " + answer;
      var closeMic = false;
      if (answer > guess) tts = "It's higher than " + guess + ". What's your next guess?";
      else if (answer < guess) tts = "It's lower than " + guess + ". Next guess?";
      else closeMic = true;

      let msg = {
        speech: tts,
        data: { google: { expect_user_response: !closeMic }}
      }
      dashbot.logOutgoing(request.body, msg)
      response.send(msg);
    }
    return;
  }
}
