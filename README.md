# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy to access analytics for your bot for free.

Currently we support

* [Facebook Messenger](http://developers.facebook.com)
* [Slack](http://api.slack.com)

## Setup Facebook

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

dashbot is available via NPM.

```bash
npm install --save dashbot
```

Include dashbot.

```javascript
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).facebook;
```

Then log whenver your webhook is called

```javascript
app.post('/facebook/receive/', function(req, res) {
  dashbot.logIncoming(req.body);
  ...
```

Finally, whenever you send a message log the request and response.

```javascript
    const requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {
          text: 'You are right when you say: ' + text
        }
      }
    };
    const requestId = dashbot.logOutgoing(requestData);
    request(requestData, function(error, response, body) {
      dashbot.logOutgoingResponse(requestId, error, response);
    });
```

That is it!

For a complete example see: [facebook-example.js](https://github.com/actionably/dashbot/blob/master/src/facebook-example.js)

## Setup Slack

Dashbot gives you two ways to integrate with slack: 
1. Via botkit middleware to make plugging into your slack bot easy. 
1. Without botkit and integrate with dashbot directly 

### With Botkit

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

dasbot is available via NPM.

```bash
npm install --save dashbot
```

Include dashbot.

```javascript
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;
```

After you create your botkit controller simply add a send and receive middleware

```javascript
const controller = Botkit.slackbot();

controller.configureSlackApp(...);

// Add the dashbot middleware
controller.middleware.receive.use(dashbot.receive);
controller.middleware.send.use(dashbot.send);
```

That is it!

For a complete example see: [slack-example.js](https://github.com/actionably/dashbot/blob/master/src/slack-example.js)

### Without Botkit

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

dasbot is available via NPM.

```bash
npm install --save dashbot
```

Include dashbot.

```javascript
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;
```

When you first connect tell dashbot and save the bot and team locally

```javascript
request('https://slack.com/api/rtm.start?token='+process.env.SLACK_BOT_TOKEN, function(error, response) {
  const parsedData = JSON.parse(response.body);

  // Tell dashbot when you connect.
  dashbot.logConnect(parsedData);
  const bot = parsedData.self;
  const team = parsedData.team;
```

When you receive a message on the websocket tell dashbot passing bot, team, and message.

```javascript
connection.on('message', function(message) {
  const parsedMessage = JSON.parse(message.utf8Data);

  // Tell dashbot when a message arrives
  dashbot.logIncoming(bot, team, parsedMessage);
```

When you send a reply on the websocket tell dashbot passing bot, team, and reply.

```javascript
const reply = {
  type: 'message',
  text: 'You are right when you say: '+parsedMessage.text,
  channel: parsedMessage.channel
};

// Tell dashbot about your response
dashbot.logOutgoing(bot, team, reply);

connection.sendUTF(JSON.stringify(reply));
```

For a complete example see: 
[slack-example-no-botkit.js](https://github.com/actionably/dashbot/blob/master/src/slack-example-no-botkit.js)
