'use strict';

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.FACEBOOK_VERIFY_TOKEN) {
  throw new Error('"FACEBOOK_VERIFY_TOKEN" environment variable must be defined');
}
if (!process.env.FACEBOOK_PAGE_TOKEN) {
  throw new Error('"FACEBOOK_PAGE_TOKEN" environment variable must be defined');
}

var port = 4000;
var webHookPath = '/facebook/receive/';

var Botkit = require('botkit');
var controller = Botkit.facebookbot({
  access_token: process.env.FACEBOOK_PAGE_TOKEN,
  verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
});

var bot = controller.spawn({
});

controller.middleware.receive.use(function(bot, message, next) {
  console.log('incoming', message);
  next();
});
controller.middleware.send.use(function(bot, message, next) {
  console.log('outgoing', message);
  next();
});


// if you are already using Express, you can use your own server instance...
// see "Use BotKit with an Express web server"
controller.setupWebserver(port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
    console.log('Facebook webhook available at http://localhost:' + port + webHookPath);
  });
});

controller.on('facebook_optin', function(bot, message) {

  bot.reply(message, 'Welcome to my app!');

});

controller.on('message_received', function(bot, message) {

  bot.reply(message,  {
    attachment: {
      type: 'image',
      payload: {
        url: 'http://images5.fanpop.com/image/photos/30500000/Pretty-purple-heart-tweetymom65-30564665-465-384.jpg'
      }
    }
  });

});

