# laserguardapp
## LaserGuardApp: IoT Intrusion Detection System LaserGuardApp is a real-time security solution that bridges the gap between physical hardware sensors and mobile notifications. Built with React Native and Firebase, this app provides an instant interface for monitoring a laser-perimeter security system.
### 🚀 Features
Real-Time Monitoring: Uses Firebase Realtime Database for sub-second synchronization between hardware and the mobile app.

Instant Alerts: Custom "Intruder Detected" pop-up notifications to alert the user immediately upon a beam breach.

One-Touch Reset: Integrated "Reset Alarm" logic that clears the alert status in the cloud directly from the mobile UI.

Cross-Platform Ready: Designed using React Native for a seamless experience on Android devices.

### 🛠️ The Tech Stack
Mobile Framework: React Native (TypeScript)

Backend/Database: Firebase Realtime Database

Hardware: Arduino Uno R4 WiFi, KY-008 Laser Module, LDR (Photoresistor)

Communication: JSON-based data exchange via Google Services

### 📡 How it Works
Detection: The Arduino Uno R4 monitors a laser beam hitting an LDR sensor.

Trigger: When the beam is broken (voltage drop), the Arduino updates the Firebase path /system/alert to true.

Sync: The LaserGuardApp uses a useEffect hook and a persistent listener to watch that specific database path.

Action: The app triggers a system Alert on the phone. When the user acknowledges the threat, the app sets the database value back to false, re-arming the system.
