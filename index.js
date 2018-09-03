const { bot } = require('./config');
const mqtt = require('mqtt'), url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883');
const auth = (mqtt_url.aexputh || ':').split(':');
const client = mqtt.connect(mqtt_url, { username: auth[0], password: auth[1] });

let activeChats = [-1001297263871];
let pendingBuzz = 0;

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
  authenticate(message.chat.id).then(() => {
    bot.sendMessage(message.chat.id, '🤖!');
  });
});

bot.onText(/\/buzz/, message => {

  let angryMode = Math.random() > 0.6;
  authenticate(message.chat.id).then(() => {
    if (pendingBuzz) {
      bot.sendMessage(message.chat.id,
        angryMode ?
          '🛎️⛔ TOO NOISE. NO BUZZ. SERIOUS.' :
          '🛎️⛔ => Unanswered buzz already sent recently'
      );
    } else {
      bot.sendMessage(message.chat.id,
        angryMode ?
          angryMessage() :
          '🛎️✅ => Buzz sent'
      );
      client.publish('buzz/syn', "")
      pendingBuzz = 1;
    }
  });

});

let angryMessage = () => {
  let rnd = Math.random();
  let str;
  switch (rnd) {
    case rnd > 0.9:
      str = "WOOF WOOF. ME IS DOG. (SUPER NEW DISGUISE SO I CAN CRUSH SPACE)"
      break;
    case rnd > 0.8:
      str = "CRUSH YOUR SPACE"
      break;
    case rnd > 0.7:
      str = "HACKERS SMASH. REAL GOOD."
      break;
    case rnd > 0.6:
      str = "ANGRY HACKSCREEN PUT MAGIC BUS IN WELDY GRINDY. VERY BEND."
      break;
    case rnd > 0.5:
      str = "*WARMS LASERS* ... *SETS UP MIRRORS* ... *AIMS AT SNACKSPACE* ... *WAITS*"
      break;
    case rnd > 0.4:
      str = "WEATHER FORECAST: HAMMER BLIZZARD, BOULDERS, AND GLITTER STORM"
      break;
    default:
      str = "ME MAKE NOISE. SMASH SMASH DESTROY. GRRRRR."
      break;
  }
  return `🛎️✅ ${str}`;
}

bot.onText(/\meowwwwwwwwww/, message => {
  authenticate(message.chat.id).then(() => {
    let angryMode = Math.random() > 0.6;
    bot.sendMessage(message.chat.id,
      angryMode ?
        "ME THROW NUCLEAR KITTENS OVER SPACE. SERIOUS. CRAFT AREA DESTROY." :
        "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱");
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

      let angryMode = Math.random() > 0.6;
      if (topic === 'buzz/ack') {
        activeChats.forEach(chatId => {
          pendingBuzz && bot.sendMessage(chatId,
            angryMode ?
              '🛎️👋 => Buzz acknowleged from the space' :
              '🛎️👋 HUMAN SAY HELLO. HACKSCREEN DESTROY.'
          );
        });
        pendingBuzz = 0;
      }

      if (topic === 'buzz/dnd') {
        activeChats.forEach(chatId => {
          pendingBuzz && bot.sendMessage(chatId, '🛎️🔕 => DND mode is active, buzz not announced.');
        });
      }


    });
  });

});
