#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// -------------------- Wi-Fi --------------------
const char* WIFI_SSID = "Victoria Joy";
const char* WIFI_PASS = "keltoria";

// -------------------- Backend --------------------
const char* SERVER_URL = "http://10.39.70.123:3000/api/readings";

// Device credentials
const char* DEV1_ID = "dev-001";  
const char* DEV1_KEY = "14917d60518eb0930af70a62cdd0371e4747fbfb3cae5bc9";

const char* DEV2_ID = "dev-002";  
const char* DEV2_KEY = "161b0a6f658b4111a5be40a0a4523ea104b4baaeb2f3055b";

const char* DEV3_ID = "dev-003";  
const char* DEV3_KEY = "fec21b0c33fba4ab7683a1e678f9924c22caeb57a364bbcb";

// -------------------- Pins (ESP32-C3) --------------------
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define SOIL_PIN 3
#define LDR_PIN 5

// -------------------- Calibration --------------------
// Soil sensor (capacitive v1.2 typical values)
const int SOIL_DRY = 3900;   // dry air
const int SOIL_WET = 1200;   // fully wet
const int SOIL_THRESHOLD = 40; // % moisture below this = DRY

// LDR (photoresistor typical values)
const int LDR_DARK = 3500;   // dark = high ADC
const int LDR_BRIGHT = 50;   // bright = low ADC
const int LIGHT_THRESHOLD = 30; // % light below this = DARK

// -------------------- Objects --------------------
DHT dht(DHT_PIN, DHT_TYPE);

// -------------------- Wi-Fi --------------------
void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi failed (check SSID/password or firewall).");
  }
}

void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi lost, reconnecting...");
    connectWiFi();
  }
}

// -------------------- HTTP POST --------------------
void sendData(const char* devId, const char* apiKey, const String& json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ No WiFi, skipping POST.");
    return;
  }
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", apiKey);
  http.addHeader("x-device-id", devId);

  int code = http.POST(json);
  Serial.printf("[%s] POST %d\n", devId, code);
  if (code > 0) {
    Serial.println("Response: " + http.getString());
  } else {
    Serial.printf("❌ HTTP error: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

// -------------------- Setup --------------------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("🌱 Unified ESP32-C3 starting...");
  dht.begin();
  connectWiFi();
}

// -------------------- Loop --------------------
void loop() {
  ensureWiFi();

  // --- Temperature & Humidity (dev-001) ---
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t) && !isnan(h)) {
    Serial.printf("Temp: %.1f°C, Hum: %.1f%%\n", t, h);
    String payload = "{";
    payload += "\"deviceId\":\"" + String(DEV1_ID) + "\",";
    payload += "\"temperature\":" + String(t, 1) + ",";
    payload += "\"humidity\":" + String(h, 1);
    payload += "}";
    sendData(DEV1_ID, DEV1_KEY, payload);
  } else {
    Serial.println("⚠️ DHT22 read failed.");
  }

  // --- Soil Moisture (dev-002) ---
  int soilRaw = analogRead(SOIL_PIN);
  // Map dry (high value) → 0%, wet (low value) → 100%
  int soilPercent = map(soilRaw, SOIL_DRY, SOIL_WET, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);
  String soilState = (soilPercent < SOIL_THRESHOLD) ? "DRY" : "WET";
  Serial.printf("Soil: %d%% (raw %d) → %s\n", soilPercent, soilRaw, soilState.c_str());
  {
    String payload = "{";
    payload += "\"deviceId\":\"" + String(DEV2_ID) + "\",";
    payload += "\"soil_moisture\":" + String(soilPercent) + ",";
    payload += "\"state\":\"" + soilState + "\"";
    payload += "}";
    sendData(DEV2_ID, DEV2_KEY, payload);
  }

  // --- Light Level (dev-003) ---
  int lightRaw = analogRead(LDR_PIN);
  // Map dark (high value) → 0%, bright (low value) → 100%
  int lightPercent = map(lightRaw, LDR_DARK, LDR_BRIGHT, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);
  String lightState = (lightPercent < LIGHT_THRESHOLD) ? "DARK" : "LIGHT";
  Serial.printf("Light: %d%% (raw %d) → %s\n", lightPercent, lightRaw, lightState.c_str());
  {
    String payload = "{";
    payload += "\"deviceId\":\"" + String(DEV3_ID) + "\",";
    payload += "\"light_level\":" + String(lightPercent) + ",";
    payload += "\"state\":\"" + lightState + "\"";
    payload += "}";
    sendData(DEV3_ID, DEV3_KEY, payload);
  }

  Serial.println("-----------------------------");
  delay(5000);
}
