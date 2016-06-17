# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy access to analytics for your bot for free.

If your bot is a Facebook or Slack bot refer to [Node Docs](https://github.com/actionably/dashbot/), 
[Facebook REST Docs](https://github.com/actionably/dashbot/RESTAPI-facebook.md), or
[Slack REST Docs](https://github.com/actionably/dashbot/RESTAPI.md) using the platform specific API will give you a 
much richer feature set.

## Generic Bot with REST API

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY make sure to set the platform  
to generic.

There are two integration points:

1) When your bot receives a message POST to the following endpoint
Make sure to set the 'Content-Type' header to 'application/json'
```
    https://track.dashbot.io/track?platform=generic&v=0.6.0&type=incoming&apiKey=<API_KEY>'
```
The data to POST should be in the following format:
```
  {
    text: <messsage_text>,
    userId: <user_id>
  }
``` 

2) When your bot sends a message POST to the following endpoint
Make sure to set the 'Content-Type' header to 'application/json'
```
    https://track.dashbot.io/track?platform=generic&v=0.6.0&type=outgoing&apiKey=<API_KEY>'
```
The data to POST should be in the following format:
```
  {
    text: <messsage_text>,
    userId: <user_id>
  }
``` 
 
That's it!


