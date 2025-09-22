#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Replace with your actual Wi-Fi credentials
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi failed");
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
}

void loop() {
  // HTTP POST logic will go here later
}
