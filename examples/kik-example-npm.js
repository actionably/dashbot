'use strict';

/*
 Example using Kik's NPM
 */

if (!process.env.DASHBOT_API_KEY_KIK) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.KIK_USERNAME) {
  throw new Error('"KIK_USERNAME" environment variable must be defined');
}
if (!process.env.KIK_API_KEY) {
  throw new Error('"KIK_API_KEY" environment variable must be defined');
}
if (!process.env.KIK_BASE_URL) {
  throw new Error('"KIK_WEBHOOK_URL" environment variable must be defined');
}

var util = require('util');
var http = require('http');
var Bot = require('@kikinteractive/kik');
var dashbot = require('../src/dashbot')(process.env.DASHBOT_API_KEY_KIK,
  {debug: true, urlRoot: process.env.DASHBOT_URL_ROOT}).kik;

// Configure the bot API endpoint, details for your bot
var bot = new Bot({
  username: process.env.KIK_USERNAME,
  apiKey: process.env.KIK_API_KEY,
  baseUrl: process.env.KIK_BASE_URL,
  receiveReadReceipts: true,
  receiveDeliveryReceipts: true
});

bot.updateBotConfiguration();

//configure dashbot for the bot
dashbot.configHandler(bot);
//set dashbot handler
bot.use(dashbot.logHandler);

bot.onTextMessage(function(message) {
  message.reply('You are right when you say: ' + message.body);
});

bot.onLinkMessage(function(message, next) {
  message.reply('Thank you for the link');
});

bot.onPictureMessage(function(message, next) {
  message.reply('Thank you for the image');
});

bot.onVideoMessage(function(message, next) {
  message.reply('Thank you for the video');
});

bot.onStartChattingMessage(function(message, next) {
  message.reply('Thank you for starting to chat');
});

bot.onScanDataMessage(function(message, next) {
  message.reply('Thank you for the scanned data')
});

bot.onStickerMessage(function(message, next) {
  message.reply('Thank you for the sticker')
});

bot.onIsTypingMessage(function(message, next) {
  console.log('User is typing')
});

bot.onDeliveryReceiptMessage(function(message, next) {
  console.log('Message delivered');
});

bot.onReadReceiptMessage(function(message, next) {
  console.log('Message Read');
});

// Set up your server and start listening
var port = process.env.PORT || 4000;
var server = http
  .createServer(bot.incoming())
  .listen(port);

console.log('LISTENING ON PORT ' + port);
