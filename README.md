# Hackspace Communicator
Telegram bot and Arduino sketch talking over MQTT, which together allows people in a group chat to "buzz" their hackerspace.
 
<img src="https://conorriches.co.uk/wp-content/uploads/2018/09/IMG_20180905_231953-225x300.jpg" >

## Telegram Bot

Shoved on Heroku, it "Just Works". I've used a CloudMQTT MQTT server. 

You'll need config values set before it'll work:
* `CLOUDMQTT_URL` - the URL that your MQTT server is running on
* `TOKEN` - Telegram bot token. Generate this by talking to the BotFather.
* `APP_URL` - used for callbacks from Telegram API
* `PORT` - defaults to 443

Run `npm run start` to get it going.

## Arduino Code
The Arduino code can be found in `/hackspaceCommunicator`.

This is designed to run on a Wemos D1 Mini but can be used with nodeMCU as they both use the ESP8266.

You'll want to insert your WiFi details, and details of the cloudMQTT server. 
The wiring diagram:

<img src="https://conorriches.co.uk/wp-content/uploads/2018/09/buzz_3.png" width=400>

## Infrastructure
I've used Heroku for it's simplicity in getting something running and free tier features. You can use other services and your own MQTT server by changing the connection details in the arduino code and bot code. 

For MQTT topics, I've used `buzz/syn` for when someone sends a buzz, `buzz/ack` for when it's acknowledged, and `buzz/dnd` for when the DND plunger is depressed.