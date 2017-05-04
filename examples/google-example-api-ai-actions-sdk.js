'use strict';

// Boilerplate setup
let ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_GOOGLE,
  {urlRoot: process.env.DASHBOT_URL_ROOT, debug:true}).google;

// Create an instance of ApiAiAssistant
app.post('/', function (request, response) {
  const assistant = new ApiAiAssistant(
    {request: request, response: response});

    dashbot.configHandler(assistant);

    // Create functions to handle requests here
    const WELCOME_INTENT = 'input.welcome';  // the action name from the API.AI intent
    const NUMBER_INTENT = 'input.number';  // the action name from the API.AI intent
    const NUMBER_ARGUMENT = 'number'; //the parameter name for the number

    function welcomeIntent(assistant){
      assistant.ask('Welcome to action snippets. say a number')
    }
    function numberIntent(assistant){
      let number = assistant.getArgument(NUMBER_ARGUMENT)
      assistant.tell('You said' + number)
    }

    let actionMap = new Map();
    actionMap.set(WELCOME_INTENT, welcomeIntent);
    actionMap.set(NUMBER_INTENT, numberIntent);
    assistant.handleRequest(actionMap);
})

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
