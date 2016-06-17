# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy access to analytics for your bot for free.

If you are using using Node refer to [Node Docs](https://github.com/actionably/dashbot/)

## Setup Facebook with REST API

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

There are two integration points

1) When facebook posts to your webhook endpoint post the same data facebook sent to you to the following endpoint.
Make sure to set the 'Content-Type' header to 'application/json'
```
    https://tracker.dashbot.io/track?platform=facebook&v=0.6.0&type=incoming&apiKey=<API_KEY>'
```

2) When you send a message to the facebook endpoint also POST that data to the following endpoint.
Make sure to set the 'Content-Type' header to 'application/json'
```
    https://tracker.dashbot.io/track?platform=slack&v=0.6.0&type=outgoing&apiKey=<API_KEY>'
```
The data to POST should be in the following format:
```
  {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: <access_token>},
    json: {
      recipient: {id: <recipient-user-id>},
      message: {
        text: <text>
      }
    }
  }
``` 
 
That's it!


