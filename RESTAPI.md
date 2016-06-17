# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy access to analytics for your bot for free.

If you are using using Node refer to [Node Docs](https://github.com/actionably/dashbot/)

## Setup Slack with REST API

Create a free account at [http://dashbot.io](http://dashbot.io) and get an API_KEY.

There are three integration points

1) When you first connect slack via rtm.start POST the data that slack returns to the following endpoint. 
Make sure to set the 'Content-Type' header to 'application/json'

```
    https://tracker.dashbot.io/track?platform=slack&v=0.6.0&type=connect&apiKey=<API_KEY>'
```

2) When you receive a message on the slack websocket POST to dashbot passing botId, teamId, teamName, and message. 
Make sure to set the 'Content-Type' header to 'application/json'

```
    https://tracker.dashbot.io/track?platform=slack&v=0.6.0&type=incoming&apiKey=<API_KEY>'
```
The data to POST should be in the following format:
```
{
  team: {
    id: dataFromStep1.team.id,
    name: dataFromStep1.team.name
  },
  bot: {
    id: dataFromStep1.self.id
  },
  message: message
}
```  

3) When you send a message to slack via the websocket or the chat.postMessage endpoint POST it to dashbot passing botId, teamId, teamName, and message. 
Make sure to set the 'Content-Type' header to 'application/json'
```
    https://tracker.dashbot.io/track?platform=slack&v=0.6.0&type=outgoing&apiKey=<API_KEY>'
```
The data to POST should be in the following format:
```
{
  team: {
    id: dataFromStep1.team.id,
    name: dataFromStep1.team.name
  },
  bot: {
    id: dataFromStep1.self.id
  },
  message: message
}
``` 
 
That's it!


