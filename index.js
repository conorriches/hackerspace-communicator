const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });

let pendingBuzz = 0;
let lastMessage = {
  message_id: 0,
  chat_id: 0,
  value: ""
};

let authenticate = (chat_id) => {
  console.log("Authenticating chat #" + chat_id);

  return new Promise((resolve, reject) => {
    resolve();
    return;
    if (chat_id == -1001297263871) {
      resolve();
    } else {
      bot.sendMessage(chat_id, '⛔ ENOENT ⛔');
      reject()
    }
  })

};

bot.onText(/\/status/, message => {
  authenticate(message.chat.id).then(() => {
    postMessage('🤖', message.chat.id);
  });
});

bot.onText(/\meow+/, message => {
  authenticate(message.chat.id).then(() => {
    let angryMode = Math.random() >= 0.5;
    postMessage(angryMode ?
      "FIRE NUCLEAR KITTEN OVER SPACE. SERIOUS. CRAFT AREA DESTROY." :
      "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱",
      message.chat.id);
  });
});

bot.onText(/\marco/, message => {
  authenticate(message.chat.id).then(() => {
    postMessage("polo!", message.chat.id);
  });
});


bot.onText(/\/buzz$/, message => {
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
        message.chat.id
      );
      client.publish('buzz/syn', "")
      pendingBuzz = 1;
    }
  });

});


client.on('connect', function () { // When connected

  // subscribe to a topic
  client.subscribe('#', function () {

    // when a message arrives, do something with it
    client.on('message', function (topic, message, packet) {

      if (topic === 'buzz/ack') {
        pendingBuzz &&
          postMessage('🛎️ buzz acknowleged', lastMessage.chat_id, true);

        pendingBuzz = 0;
      }

      if (topic === 'buzz/dnd') {
        pendingBuzz &&
          postMessage('🛎️ DND mode active, not annoucned', lastMessage.chat_id, true)
      }


    });
  });

});


let postMessage = (text, chatId, isUpdate = false) => {

  console.log("Last message object");
  console.log(lastMessage);
  console.log("isUpdate: " + isUpdate)

  if (isUpdate && lastMessage.message_id) {
    console.log('Editing message');
    let newText = lastMessage.value + "\n\n" + text;

    bot.editMessageText(
      newText,
      {
        message_id: lastMessage.message_id,
        chat_id: chatId
      }
    ).then(m => {
      lastMessage.chat_id = chatId
      lastMessage.message_id = m.message_id;
      lastMessage.value = newText;
    })

  } else {

    bot.sendMessage(
      chatId,
      text
    ).then(m => {
      lastMessage.chat_id = chatId
      lastMessage.message_id = m.message_id;
      lastMessage.value = text;
    });

  }



};