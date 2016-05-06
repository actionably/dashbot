# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy to access analytics for your bot for free.

## Setup

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

Botkit is available via NPM.

```bash
npm install --save dashbot
```

Include dashbot.

```javascript
var dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY);
```

Then log whenver your webhook is called

```javascript
app.post('/facebook/receive/', function(req, res) {
  dashbot.logIncoming(req.body);
  ...
```

Finally, whenever you send a message log the request and response.

```javascript
    var data = {
      recipient: {id: sender},
      message: {
        text: 'You are right when you say: ' + text
      }
    };
    // Log the request.
    var requestId = dashbot.logOutgoing(data); 
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN}, 
      method: 'POST',
      json: data
    }, function(error, response, body) {
      // Log the response.
      dashbot.logOutgoingResponse(requestId, error, response);
    });
```

That is it!
