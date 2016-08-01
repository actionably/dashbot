'use strict';

/*
Example using Kik's NPM
*/

if (!process.env.DASHBOT_API_KEY) {
  throw new Error('"DASHBOT_API_KEY" environment variable must be defined');
}
if (!process.env.KIK_USERNAME) {
  throw new Error('"KIK_USERNAME" environment variable must be defined');
}
if (!process.env.KIK_API_KEY) {
  throw new Error('"KIK_API_KEY" environment variable must be defined');
}
if (!process.env.KIK_WEBHOOK_URL) {
  throw new Error('"KIK_WEBHOOK_URL" environment variable must be defined');
}

let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
var dashbot = require('./dashbot')(process.env.DASHBOT_API_KEY,
  {debug:true, urlRoot: process.env.DASHBOT_URL_ROOT}).kik;
let mysql = require('mysql')

// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: process.env.KIK_USERNAME,
    apiKey: process.env.KIK_API_KEY,
    baseUrl: process.env.KIK_WEBHOOK_URL
});

bot.updateBotConfiguration();

//configure dashbot for the bot
dashbot.configHandler(bot);
//set dashbot handler
bot.use(dashbot.logHandler)

bot.onTextMessage((message) => {
  message.reply("Thank you for the text message")
})

bot.onLinkMessage((message,next) => {
  message.reply("Thank you for the link")
})

bot.onPictureMessage((message,next) => {
  message.reply("Thank you for the image")
})

bot.onVideoMessage((message,next) => {
  message.reply("Thank you for the video")
})

bot.onStartChattingMessage((message,next) => {
  message.reply("Thank you for starting to chat")
})

bot.onScanDataMessage((message,next) => {
  message.reply("Thank you for the scanned data")
})

bot.onStickerMessage((message,next) => {
  message.reply("Thank you for the sticker")
})

bot.onIsTypingMessage((message,next) => {
  console.log("User is typing")
})

bot.onDeliveryReceiptMessage((message,next) => {
  console.log("Message delivered")
})

bot.onReadReceiptMessage((message,next) => {
  console.log("Message Read")
})

// Set up your server and start listening
let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);
