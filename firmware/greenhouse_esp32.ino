#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define LDR_PIN 35
#define STATUS_LED 2  // Optional: onboard LED

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";
const char* SERVER = "http://192.168.1.100:4000/api/readings/ingest"; // Replace with your backend IP
const char* DEVICE_ID = "gh-esp32-01";
const char* API_KEY = "PASTE_DEVICE_API_KEY";

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastPost = 0;
const unsigned long intervalMs = 10000;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\n✅ Connected" : "\n❌ Failed to connect");
}

String formatPayload(float temp, float hum, int soil, int light) {
  String payload = "{\"data\":{";
  payload += "\"temp\":" + String(temp, 1) + ",";
  payload += "\"hum\":" + String(hum, 1) + ",";
  payload += "\"soil\":" + String(soil) + ",";
  payload += "\"light\":" + String(light);
  payload += "}}";
  return payload;
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  dht.begin();
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  if (millis() - lastPost >= intervalMs) {
    lastPost = millis();

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int soil = analogRead(SOIL_PIN);
    int light = analogRead(LDR_PIN);

    if (isnan(temp) || isnan(hum)) {
      Serial.println("DHT read failed");
      return;
    }

    String payload = formatPayload(temp, hum, soil, light);
    Serial.println("Payload: " + payload);

    HTTPClient http;
    http.begin(SERVER);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-id", DEVICE_ID);
    http.addHeader("x-api-key", API_KEY);

    int code = http.POST(payload);
    Serial.printf("POST /ingest -> %d\n", code);
    http.end();

    digitalWrite(STATUS_LED, code == 200 ? HIGH : LOW); // Blink LED on success
  }

  delay(50);
}
