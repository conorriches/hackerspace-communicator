const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });

let pendingBuzz = 0;
const allowedChats = [-1001297263871, 301807021];

let authenticate = (chat_id) => {
  return new Promise((resolve, reject) => {
    if(allowedChats.indexOf(chat_id) > 0){
      resolve();
    }else{
      bot.sendMessage(chat_id, '⛔ ENOENT ⛔');
      reject()
    }
  })
    
};

bot.onText(/\/status/, message => {
  authenticate(message.chat.id).then(() => {
    bot.sendMessage(message.chat.id, '🤖!');
  });
});

bot.onText(/\/buzz/, message => {

  authenticate(message.chat.id).then(() => {
    if (pendingBuzz) {
      bot.sendMessage(message.chat.id, '🛎️⛔ => Unanswered buzz already sent recently');
    } else {
      bot.sendMessage(message.chat.id, '🛎️✅ => Buzz sent');
      client.publish('buzz/syn', "")
      pendingBuzz = 1;
    }
  });

});

bot.onText(/\meowwwwwwwwww/, message => {
  authenticate(message.chat.id).then(() => {
    bot.sendMessage(message.chat.id, "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
  });
});

bot.onText(/\marco/, message => {
  authenticate(message.chat.id).then(() => {
    bot.sendMessage(message.chat.id, "omg that isn't even implemented");
  });
});


client.on('connect', function () { // When connected

  // subscribe to a topic
  client.subscribe('#', function () {

    // when a message arrives, do something with it
    client.on('message', function (topic, message, packet) {
      console.log("===================== GOT MESSAGE ON " + topic + " TOPIC");

      if (topic === 'buzz/ack') {
        console.log(message);
        allowedChats.forEach(chatId => {
          pendingBuzz && bot.sendMessage(chatId, '🛎️👋 => Buzz acknowleged from the space');
        })
        pendingBuzz = 0;
      }

    });
  });

});

bot.on('callback_query', message => {
  const msg = message.message;
  const answer = message.data;

  bot.sendMessage(msg.chat.id, answer);
});

