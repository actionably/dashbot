# [Dashbot](http://dashbot.io) - Analytics for your bot

Dashbot gives you easy access to analytics for your bot for free.

## Setup

Create a free account at [https://www.dashbot.io](https://www.dashbot.io) and get an API_KEY.

dashbot is available via NPM.

```bash
npm install --save dashbot
```

Follow the instructions at [https://www.dashbot.io/docs](https://www.dashbot.io/docs)

## Configuration Options
Additional configuration options are available when importing the dashbot module. The configuration options are passed through via a config object in the dashbot call. 

```javascript
const configuration = {
  'debug': true,
  'redact': true,
  'timeout': 1000,
}

const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY_ALEXA, configuration).alexa;
```

The following are the available configuration keys:

***debug*** - ```boolean``` logs helpful debugging information  
***redact*** - ```boolean``` removes personally identifiable information using redact-pii (more info [here](https://www.dashbot.io/docs/pii-redaction/))  
***timeout*** - ```number``` timeouts requests after given milliseconds