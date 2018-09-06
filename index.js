const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });

let activeChats = [-1001297263871];
let pendingBuzz = 0;

let lastMessage = {
  message_id: 0,
  chat_id: 0,
  value: ""
};

let authenticate = (chat_id) => {
  console.log("CHAT ID: " + chat_id);

  return new Promise((resolve, reject) => {
    if (chat_id == -1001297263871) {
      resolve();
    } else {
      bot.sendMessage(chat_id, '⛔ ENOENT ⛔');
      reject()
    }
  })

};

bot.onText(/\/status/, message => {
  bot.sendMessage(message.chat.id, '🤖').then(p => {
    messageId = p.message_id;
    chatId = p.chat.id;
  });
});

bot.onText(/\/buzz/, message => {

  authenticate(message.chat.id).then(() => {
    if (pendingBuzz) {
      postMessage(
        '🛎️ buzz already pending',
        message.chat.id,
        true
      );
    } else {
      messageId = postMessage(
        '🛎️ buzz sent',
        message.chat.id,
        false
      );
      client.publish('buzz/syn', "")
      pendingBuzz = 1;
    }
  });

});

bot.onText(/\meowwwwwwwwww/, message => {
  authenticate(message.chat.id).then(() => {
    let angryMode = Math.random() > 0.6;
    bot.sendMessage(message.chat.id,
      angryMode ?
        "FIRE NUCLEAR KITTEN OVER SPACE. SERIOUS. CRAFT AREA DESTROY." :
        "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
  });
});

bot.onText(/\marco/, message => {
  authenticate(message.chat.id).then(() => {
    bot.sendMessage(message.chat.id, "Polo!");
  });
});


client.on('connect', function () { // When connected

  // subscribe to a topic
  client.subscribe('#', function () {

    // when a message arrives, do something with it
    client.on('message', function (topic, message, packet) {

      if (topic === 'buzz/ack') {
        activeChats.forEach(chatId => {
          pendingBuzz &&
            postMessage('🛎️ buzz acknowleged', chatId, true);
        });
        pendingBuzz = 0;
      }

      if (topic === 'buzz/dnd') {
        activeChats.forEach(chatId => {
          pendingBuzz &&
            postMessage('🛎️ DND mode active, not annoucned', chatId, true)

        });
      }


    });
  });

});


let postMessage = (text, chatId, isUpdate = false) => {

  console.log("Last message object");
  console.log(lastMessage);

  if (isUpdate && lastMessage.message_id) {
    console.log('Editing message');
    bot.editMessageText(
      lastMessage.value + "\n\n" + text,
      {
        message_id: messageId,
        chat_id: chatId
      }
    ).then(m => {
      lastMessage.chat_id = chatId
      lastMessage.message_id = m.message_id;
    })
  } else {

    bot.sendMessage(
      chatId,
      text
    ).then(m => {
      lastMessage.chat_id = chatId
      lastMessage.message_id = m.message_id;
    });
  }

  lastMessage.value = text;

};