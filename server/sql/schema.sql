CREATE TABLE devices (
  device_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100),
  api_key VARCHAR(100) NOT NULL
);

CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) REFERENCES devices(device_id),
  temperature REAL,
  humidity REAL,
  soil_moisture REAL,
  light_level INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
