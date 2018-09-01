const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });
let chatId; 
let pendingBuzz = 0;

bot.onText(/\/status/, message => {
  chatId = message.chat.id;
  bot.sendMessage(message.chat.id, '🤖!');
});

bot.onText(/\/buzz/, message => {
  console.log(message);
  chatId = message.chat.id;
  if (pendingBuzz){
    bot.sendMessage(chatId, '🛎️⛔ => Unanswered buzz already sent recently');
  }else{
    bot.sendMessage(chatId, '🛎️✅ => Buzz sent');
    client.publish('buzz/syn', "")
    pendingBuzz = 1;
  }
});

bot.onText(/\meowwwwwwwwww/, message => {
  chatId = message.chat.id;
  bot.sendMessage(chatId, "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
});

bot.onText(/\marco/, message => {
  chatId = message.chat.id;
  bot.sendMessage(chatId, "omg that isn't even implemented");
});


client.on('connect', function () { // When connected

  // subscribe to a topic
  client.subscribe('#', function () {

    // when a message arrives, do something with it
    client.on('message', function (topic, message, packet) {
      console.log("===================== GOT MESSAGE ON " + topic + " TOPIC");
      
      if(topic === 'buzz/ack'){
        console.log(message);
        bot.sendMessage(chatId, '🛎️👋 => Buzz acknowleged from the space');
        pendingBuzz = 0;
      }
      
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
