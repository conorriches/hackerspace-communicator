const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });

let pendingBuzz = 0;

let authenticate = (chat_id) => {
  console.log("CHAT ID: " + chat_id);
  return new Promise((resolve, reject) => {
    if (true) {
      resolve();
    } else {
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

      if (topic === 'buzz/ack') {
        allowedChats.forEach(chatId => {
          pendingBuzz && bot.sendMessage(chatId, '🛎️👋 => Buzz acknowleged from the space');
        });
        pendingBuzz = 0;
      }

      if (topic === 'buzz/dnd') {
        allowedChats.forEach(chatId => {
          pendingBuzz && bot.sendMessage(chatId, '🛎️🔕 => DND mode is active, buzz not announced.');
        });
      }


    });
  });

});
