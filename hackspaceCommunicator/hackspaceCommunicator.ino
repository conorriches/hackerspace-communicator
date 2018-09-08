#include <Adafruit_NeoPixel.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// WiFi config
#define WIFI_SSID "<WIFI_SSID_HERE>"
#define WIFI_PASS "<WIFI_PASSWORD_HERE>"

// MQTT config - can't #define as they are char arrays
const char *mqtt_server = "<MQTT_SERVER_HERE>";
const char *mqtt_pass = "<MQTT_PASSWORD_HERE>";
const char *mqtt_uname = "<MQTT_USERNAME_HERE>";
#define mqttPort 14540;

// Pin config
#define WS_PIN D1
#define DND_PIN D3
#define BUZZ_PIN D5
#define BUTTON_PIN D6
#define LED_PIN D7

// Addressable LED config
#define NUM_LEDS 4
#define BRIGHTNESS 96
#define FRAMES_PER_SECOND 120

//Define addressable LEDs
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, WS_PIN, NEO_GRB + NEO_KHZ800);

// Logic flags
int lastAck = 0;        // debounces the acknowledge button
int pendingAck = 0;     // Are we waiting for someone to acknowledge?
int previousMillis = 0; //for flashing the DND LED
int interval = 500;     // for flashing the DND LED
int ledState = LOW;     // for flashing the DND LED
int dndMode = 0;        // whether DND is on
int dndFlag = 0;        // flag to ensure MQTT command is  sent just once

// WiFi && MQTT defined
WiFiClient espClient;
PubSubClient client(espClient);

void setup()
{
  Serial.begin(115200);

  // set up the pins
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(DND_PIN, INPUT_PULLUP); // INPUT_PULLUP stops the pin from floating

  // start the adressable LEDs
  strip.setBrightness(BRIGHTNESS);
  strip.begin();

  // Fill LEDs with grey to indicate there is life.
  colourFill(strip.Color(127, 127, 127), 50);
  strip.show();
  delay(500);
  colourFill(strip.Color(0, 0, 0), 50);
  strip.show();
  delay(100);

  setup_wifi();

  client.setServer(mqtt_server, mqttPort);
  client.setCallback(callback);
}

void setup_wifi()
{
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// If we drop off the network, reconnect
void reconnect()
{
  //indicate to users that there's an error
  colourFill(strip.Color(255, 0, 0));
  strip.show();

  // Loop until we're reconnected
  while (!client.connected())
  {

    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("hackspaceBuzzer", mqtt_uname, mqtt_pass))
    {
      Serial.println("connected to mqtt");
      client.subscribe("buzz/syn");

      // clear the error LEDs
      colourFill(strip.Color(0, 0, 0));
      strip.show();
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
      colourFill(strip.Color(0, 0, 0));
      strip.show();
    }
  }
}

void loop()
{

  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  /**
   * Because we're using INPUT_PULLUP, digitalRead returns HIGH when the
   * button ISN'T being pressed. Therefore, pressing the button sets
   * digitalRead to LOW. Hence the not (!) character
   */
  if (!digitalRead(DND_PIN))
  { // DND button is pressed
    // DND mode is ON
    dndMode = 1;
  }
  else
  {
    dndMode = 0;
  }

  if (!digitalRead(BUTTON_PIN))
  { // user is pressing acknowledge button
    // Indicate the press is registered
    colourFill(strip.Color(127, 127, 127));
    strip.show();

    // If we haven't recently pressed the button, send the MQTT to acknowledge
    if (lastAck < millis() - 10000)
      client.publish("buzz/ack", "");
    lastAck = millis();

    digitalWrite(BUZZ_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);

    pendingAck = 0;
  }
  else
  { //Not pressing green button

    digitalWrite(BUZZ_PIN, LOW);
    colourFill(strip.Color(0, 0, 0));

    if (pendingAck == 1)
    { //We are waiting for user to press acknowledge

      //Flash the LEDs to get people's attention
      if (millis() - previousMillis >= interval)
      {
        // save the last time you blinked the LED
        previousMillis = millis();

        // if the LED is off turn it on and vice-versa:
        if (ledState == LOW)
        {
          ledState = HIGH;

          // Clear and set diagonals purple
          colourFill(strip.Color(0, 0, 00));
          strip.setPixelColor(0, strip.Color(255, 0, 255));
          strip.setPixelColor(2, strip.Color(255, 0, 255));
          strip.show();
        }
        else
        {
          ledState = LOW;

          // Clear and set opposite diagonals purple
          colourFill(strip.Color(0, 0, 00));
          strip.setPixelColor(1, strip.Color(255, 0, 255));
          strip.setPixelColor(3, strip.Color(255, 0, 255));
          strip.show();
        }

        // set the LED with the ledState of the variable:
        digitalWrite(LED_PIN, ledState);
      }
    }
    else
    {
      if (dndMode == 1)
      {
        if (dndFlag == 0)
        {
          // Send this just once when we've set DND,
          // in case we want a notification when DND is turned on
          client.publish("buzz/dnd", "");
        }
        dndFlag = 1;
        digitalWrite(LED_PIN, HIGH);
        colourFill(strip.Color(0, 0, 00));
        strip.setPixelColor(0, strip.Color(255, 0, 0)); //single red LED
        strip.show();
      }
      else
      {
        dndFlag = 0;
        digitalWrite(LED_PIN, LOW);
        colourFill(strip.Color(0, 0, 00));
        strip.setPixelColor(0, strip.Color(0, 255, 0)); // single green LED
        strip.show();
      }
    }
  }
}

/**
 * This is called whenever a message is received over MQTT
 */
void callback(char *topicArray, byte *payloadArray, unsigned int length)
{
  Serial.print("Message arrived!");

  // Strings are easier to deal with
  String topic = String((char *)topicArray);
  String payload = String((char *)payloadArray);

  if (dndMode)
  {
    // If we've got a message and are in DND mode, send a message back letting
    // users know the buzz won't be announced
    client.publish("buzz/dnd", "");
  }

  if (topic == "buzz/syn" && !dndMode)
  {
    Serial.println("Buzz!");
    pendingAck = 1;

    //Buzz the buzzer for 500ms
    digitalWrite(BUZZ_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZ_PIN, LOW);
  }
}

// Fill all LEDs with a given colour
void colourFill(uint32_t c)
{
  for (int i = 0; i < strip.numPixels(); i++)
  {
    strip.setPixelColor(i, c);
  }
}