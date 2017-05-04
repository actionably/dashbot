'use strict';

if (!process.env.DASHBOT_API_KEY_FACEBOOK) {
  throw new Error('"DASHBOT_API_KEY_FACEBOOK" environment variable must be defined');
}
if (!process.env.FACEBOOK_VERIFY_TOKEN) {
  throw new Error('"FACEBOOK_VERIFY_TOKEN" environment variable must be defined');
}
if (!process.env.FACEBOOK_PAGE_TOKEN) {
  throw new Error('"FACEBOOK_PAGE_TOKEN" environment variable must be defined');
}

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_FACEBOOK,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).facebook;

const app = express();
app.use(bodyParser.json());

var webHookPath = '/facebook/receive/';
app.get(webHookPath, function(req, res) {
  if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Error, wrong validation token');
});

// In a production environment this map should be persisted to the database.
const pausedUsers = {};

// Endpoint that pauses the bot for a particular user.
app.post('/pause', function(req, res) {
  const paused = req.body.paused;
  const userId = req.body.userId;
  pausedUsers[userId] = paused;
  console.log('Setting ' + userId + ' to ' + paused);
  res.send('worked');
});

function getMessage(text, payload) {
  if (payload) {
    return {
      text: payload + ' is a good answer'
    }
  }
  if (text === 'image') {
    return {
      attachment: {
        type: 'image',
        payload: {
          url: 'http://images5.fanpop.com/image/photos/30500000/Pretty-purple-heart-tweetymom65-30564665-465-384.jpg'
        }
      }
    }
  } else if (text === 'typing_on') {
    return {
      sender_action: 'typing_on'
    };
  } else if (text === 'typing_off') {
    return {
      sender_action: 'typing_off'
    };
  } else if (text === 'mark_seen') {
    return {
      sender_action: 'mark_seen'
    };
  } else if (text === 'buttons') {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Who will win the election?',
          buttons: [
            {
              type: 'web_url',
              url: 'http://www.google.com',
              title: 'Ask google'
            },
            {
              type: 'postback',
              title: 'Hillary Clinton',
              payload: 'clinton'
            },
            {
              type: 'postback',
              title: 'Donald Trump',
              payload: 'trump'
            }
          ]
        }
      }
    }
  } else if (text === 'cards') {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Will Hillary win?',
              image_url: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRTPQTUUFIxw8RBDR7zcE-O_ar7iazWb6MsHIokw1d64B8XyZum5w',
              subtitle: 'Bills wife',
              buttons: [
                {
                  type: 'web_url',
                  url: 'http://www.google.com',
                  title: 'Ask google'
                },
                {
                  type: 'postback',
                  title: 'Yes',
                  payload: 'clinton-yes'
                },
                {
                  type: 'postback',
                  title: 'No',
                  payload: 'clinton-no'
                }
              ]
            },
            {
              title: 'Will Trump win?',
              image_url: 'http://i2.cdn.turner.com/cnnnext/dam/assets/150811084058-donald-trump-debate-file-super-169.jpg',
              subtitle: 'Business guy',
              buttons: [
                {
                  type: 'web_url',
                  url: 'http://www.google.com',
                  title: 'Ask google'
                },
                {
                  type: 'postback',
                  title: 'Yes',
                  payload: 'trump-yes'
                },
                {
                  type: 'postback',
                  title: 'No',
                  payload: 'trump-no'
                }
              ]
            }
          ]
        }
      }
    }
  } else {
    return {
      text: 'You are right when say: '+text
    }
  }
}

app.post(webHookPath, function(req, res) {
  if (process.env.FACEBOOK_IS_ECHO) {
    dashbot.log(req.body);
  } else {
    dashbot.logIncoming(req.body);
  }
  const messagingEvents = req.body.entry[0].messaging;
  if (messagingEvents.length && (messagingEvents[0].message && messagingEvents[0].message.text ||
                                messagingEvents[0].postback && messagingEvents[0].postback.payload)) {
    const event = req.body.entry[0].messaging[0];
    const sender = event.sender.id;
    if (!pausedUsers[sender]) {
      const text = event.message?event.message.text:null;
      const payload = event.postback?event.postback.payload:null;
      const message = getMessage(text, payload);
      const json = {
        recipient: {id: sender}
      };
      if (message.sender_action) {
        json.sender_action = message.sender_action;
      } else {
        json.message = message;
      }
      const requestData = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
        method: 'POST',
        json: json
      };
      request(requestData, function(error, response, body) {
        if (!process.env.FACEBOOK_IS_ECHO) {
          dashbot.logOutgoing(requestData, response.body);
        }
      });
    }
  }
  res.sendStatus(200);
});

var port = 4000;
app.listen(port);
console.log('Facebook webhook available at http://localhost:' + port + webHookPath);
