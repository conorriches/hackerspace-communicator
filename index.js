const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, {username:auth[0], password: auth[1]});
let lastMovement = 0;

function convertEpochToSpecificTimezone(epoch, offset){
  var d = new Date(epoch);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);  //This converts to UTC 00:00
  var nd = new Date(utc + (3600000*offset));
  return nd.toLocaleString();
}


bot.onText(/\/status/, message => {
  bot.sendMessage(message.chat.id, '🤖!');
  console.error(message.chat.id);
});

bot.onText(/\/occupied/, message => {
  const chatId = message.chat.id;
  let sec = convertEpochToSpecificTimezone(lastMovement, 1000);
  bot.sendMessage(chatId, "Last movement was at: " + sec);
});

bot.onText(/\meowwwwwwwwww/, message => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
});




client.on('connect', function () { // When connected

  // subscribe to a topic
  client.subscribe('/space/sensor/movement', function () {
    // when a message arrives, do something with it
    client.on('message', function (topic, message, packet) {
      lastMovement = Math.floor(Date.now() / 1000);
    });
  });

});










//Keyboard
bot.onText(/\/keyboard/, message => {
  const chatId = message.chat.id;

  const opts = {
    reply_markup: {
      keyboard: [
        ['🚲 Bike', '🚗 Car']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };


  bot.sendMessage(chatId, 'Select a transport', opts);
});

//Inline keyboard
bot.onText(/\/inlinekeyboard/, message => {
  const chatId = message.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Like', callback_data: 'Yay' },
        { text: '❌ Dislike', callback_data: 'Nah' }
      ]]
    }
  };

  bot.sendMessage(chatId, 'Random question ?', opts);
});

bot.on('callback_query', message => {
  const msg = message.message;
  const answer = message.data;

  bot.sendMessage(msg.chat.id, answer);
});

//Any message
bot.on('message', message => {
  const chatId = message.chat.id;
});
