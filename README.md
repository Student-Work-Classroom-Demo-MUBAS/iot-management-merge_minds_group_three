# IoT Management System, GROUP THREE

## Overview
This project is a full‑stack IoT Data Management System. It collects sensor readings from ESP32‑C3 devices, transmits them securely to a backend API, stores them in a relational database, and visualizes them on a responsive web dashboard.

The system demonstrates end‑to‑end IoT integration:  
**Device → API → Database → Dashboard**

---

## Features
- Real‑time monitoring of temperature, humidity, soil moisture, and light levels  
- Secure device communication with API keys and user authentication via JWT  
- Responsive dashboard with styled cards and charts (EJS + Chart.js)  
- Database persistence with timestamps for every reading  
- Swagger API documentation at `/api-docs`  
- Calibrated sensors for intuitive percentage values  
- Auto‑refresh of dashboard data every 60 seconds  

---

## Project Structure
```
IOT-MANAGEMENT-MER/
 ├── config/              # Configuration files
 ├── docs/                # Project screenshots and documentation
 ├── firmware/            # ESP32-C3 device code
 ├── migrations/          # Database migrations
 ├── models/              # Sequelize models
 ├── routes/              # API route definitions
 ├── src/                 # Main application source
 │    ├── config/         # Environment and DB config
 │    ├── middleware/     # Authentication, validation
 │    ├── models/         # ORM models
 │    ├── public/         # Static assets (CSS, JS)
 │    ├── routes/         # Express routes
 │    └── views/          # EJS templates for frontend
 ├── app.js               # Express app setup
 ├── server.js            # Server entry point
 ├── .env                 # Environment variables
 ├── testEnv.js           # Environment test script
 ├── package.json
 ├── package-lock.json
 └── README.md
```

The `docs/` folder contains screenshots and a simple project overview.

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/Student-Work-Classroom-Demo-MUBAS/iot-management-merge_minds_group_three.git
cd IOT-MANAGEMENT-MER
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root:
```
PORT=3000
DB_HOST=localhost
DB_USER=youruser
DB_PASS=yourpassword
DB_NAME=iot_db
JWT_SECRET=yourjwtsecret
```

### 4. Run Database Migrations
```bash
npx sequelize db:migrate
```

### 5. Start Backend Server
```bash
npm start
```

### 6. Flash Device Firmware
- Open `firmware/esp32.ino` in Arduino IDE  
- Update Wi‑Fi SSID, password, and API endpoint  
- Upload to ESP32‑C3  

### 7. Access Dashboard
Open browser at:  
```
http://localhost:3000
```

---

## API Endpoints
- `POST /api/readings` → Submit new sensor reading  
- `GET /api/readings/all-latest` → Latest readings for all devices  
- `GET /api/readings/:device_id/recent?limit=20` → Recent readings for a device  
- `GET /api/devices` → List all devices  
- `POST /api/auth/login` → User login (JWT)  

Swagger documentation is available at:  
```
http://localhost:3000/api-docs
```

---

## Testing
- Use Postman or Swagger to test API routes  
- Verify readings appear in the `readings` table  
- Confirm dashboard auto‑refreshes with new data  

---

## Team Contributions
- **Hardware & Calibration**: ESP32‑C3 integration, sensor calibration  
- **Backend Development**: Express.js routes, authentication, Sequelize models  
- **Frontend Development**: EJS dashboard, Chart.js charts, responsive styling  
- **Documentation & Testing**: Swagger docs, Postman tests, README  

---

## Marking Criteria Coverage
- IoT Device Development (20)  
- Backend Development (25)  
- Frontend Dashboard (15)  
- API Documentation (10)  
- Integration & Testing (5)  
- Documentation (3)  
- Collaboration & Git Usage (2)  

---

## Notes
- All sensor readings are timestamped (`created_at`) at the backend.  
- Dashboard auto‑refreshes every 60 seconds.  
- Devices and users are validated before data is accepted.  

---

## Team Distribution & Folder Ownership

### Louiser — Backend Core & Device Ingestion
- **Database & Models**
  - `server/sql/schema.sql`
  - `server/src/models/devices.js`
  - `server/src/models/readings.js`
- **Routes**
  - `server/src/routes/devices.routes.js`
  - `server/src/routes/readings.routes.js` *(POST /ingest)*
- **Middleware**
  - `server/src/middleware/apiKey.js`

### Victoria — Frontend, Readings Query API & Firmware Sensors
- **Frontend Views**
  - `server/src/views/*.ejs`
  - `server/src/views/layouts/main.ejs`
  - `server/src/views/partials/*.ejs`
- **Frontend Logic**
  - `server/src/public/js/dashboard.js`
  - `server/src/public/css/styles.css`
- **Routes**
  - `server/src/routes/readings.routes.js` *(GET /:device_id)*
- **Firmware**
  - `firmware/greenhouse_esp32.ino` *(sensor read + payload fields)*

### Debra — Authentication, Security, Swagger & Firmware Networking
- **Auth & Security**
  - `server/src/routes/auth.routes.js`
  - `server/src/middleware/auth.js`
  - `server/src/middleware/validators.js`
- **Configuration**
  - `server/src/config/swagger.js`
  - `server/src/app.js` *(helmet, CORS, rate limiting integration)*
- **Firmware**
  - `firmware/greenhouse_esp32.ino` *(Wi‑Fi connect + HTTP POST structure)*

