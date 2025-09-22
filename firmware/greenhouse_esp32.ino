
#include <WiFi.h>

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
  Serial.println(WiFi.status() == WL_CONNECTED ? "\nWiFi connected" : "\nWiFi failed");
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
}

void loop() {
  // will add HTTP logic later
}
