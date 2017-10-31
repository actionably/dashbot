'use strict';

// Boilerplate setup
const DialogflowApp = require('actions-on-google').DialogflowApp;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GOOGLE,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true, redact: process.env.DASHBOT_REDACT}).google;

// Create an instance of ApiAiAssistant
app.post('/', function (request, response) {
  const assistant = new DialogflowApp(
    {request: request, response: response});

    // second paramter is optional metadata
    dashbot.configHandler(assistant, {
      we: 'like incoming metadata'
    });

    // Create functions to handle requests here
    const WELCOME_INTENT = 'input.welcome';  // the action name from the API.AI intent
    const NUMBER_INTENT = 'input.number';  // the action name from the API.AI intent
    const NUMBER_ARGUMENT = 'number'; //the parameter name for the number

    function welcomeIntent(assistant){
      assistant.ask('Welcome repeat a number. Please, say a number')
    }
    function numberIntent(assistant){
      const number = assistant.getArgument(NUMBER_ARGUMENT)
      // optianally set metadata
      dashbot.setOutgoingMetadata({
        we: 'also like outgoing metadata'
      })
      assistant.tell('You said ' + number)
    }

    const actionMap = new Map();
    actionMap.set(WELCOME_INTENT, welcomeIntent);
    actionMap.set(NUMBER_INTENT, numberIntent);
    assistant.handleRequest(actionMap);
})

// Start the server
const server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
