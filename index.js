const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, {username:auth[0], password: auth[1]});
let lastMovement = 0;

function convertEpochToSpecificTimezone(timestamp){
  var date = new Date(timestamp*1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  if(hours < 10) hours = "0" + hours;
  if(minutes < 10) minutes = "0" + minutes;
  return(hours + ":" + minutes);
}


bot.onText(/\/status/, message => {
  bot.sendMessage(message.chat.id, '🤖!');
  console.error(message.chat.id);
});

bot.onText(/\/occupied/, message => {
  const chatId = message.chat.id;
  let sec = convertEpochToSpecificTimezone(lastMovement);
  bot.sendMessage(chatId, "🙋 last movement noted at " + sec);
});

bot.onText(/\meowwwwwwwwww/, message => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
});

bot.onText(/\marco/, message => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, "omg that isn't even implemented");
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
