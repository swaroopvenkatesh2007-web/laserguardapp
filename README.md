# 🔴 Laser Guard Security System

An Arduino-based laser beam intrusion detection system that sends **SMS alerts** and makes an **automatic voice call** when the laser beam is broken — powered by the **A7670C 4G LTE GSM module**.

---

## 📸 Schematic Preview

> KiCad schematic file: `Schematic Represntation.kicad_sch`

---

## ⚙️ Hardware Components

| Component | Details |
|---|---|
| Microcontroller | Arduino Nano (ATmega328P) |
| Laser Transmitter | KY-008 Laser Diode Module |
| Light Receiver | LDR (Photoresistor) Sensor Module |
| GSM / LTE Module | SIMCom A7670C 4G LTE |
| Transistor | 2N2222 NPN (laser switching) |
| Resistors | R1: LDR, R2: 1kΩ (base), R3: 10kΩ (pull) |
| Capacitors | C1: 100µF electrolytic, C2: 100nF ceramic |
| Power Supply | 5V 2A USB Adapter |
| Connectors | DC Power Terminal + JST Connectors |

---

## 🔌 Pin Connections

### Arduino Nano ↔ A7670C GSM Module
| Arduino Nano | A7670C | Notes |
|---|---|---|
| D0 (RX) | TX | Hardware Serial |
| D1 (TX) | RX | Hardware Serial |
| GND | GND | Common ground |
| — | VCC | External 5V 2A only |

### Arduino Nano ↔ Laser (KY-008 via 2N2222)
| Arduino Nano | Component | Notes |
|---|---|---|
| D2 | R2 (1kΩ) → Base Q1 | HIGH = Laser ON |
| — | Collector Q1 → Laser+ | Switched by transistor |
| GND | Emitter Q1 + Laser− | Common ground |

### Arduino Nano ↔ LDR Sensor
| Arduino Nano | Component | Notes |
|---|---|---|
| A0 | LDR + R3 (10kΩ) junction | Voltage divider output |
| 5V | R3 top | Pull-up to 5V |
| GND | LDR bottom | To ground |

### Power Decoupling
| Component | Connection | Purpose |
|---|---|---|
| C1 (100µF) | Across VCC / GND | Bulk decoupling |
| C2 (100nF) | Across VCC / GND | HF noise bypass |

---

## 📁 File Structure

```
laser-guard/
├── laser_guard_v2.ino          # Main Arduino sketch
├── Schematic Represntation.kicad_sch  # KiCad schematic
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Arduino IDE (1.8.x or 2.x)
- Arduino Nano board with ATmega328P
- Active SIM card (with SMS + calling enabled) inserted in A7670C

> **No external libraries required.** The sketch uses only built-in Arduino `HardwareSerial` — nothing to install from the Library Manager.

### 2. Configure the sketch

Open `laser_guard_v2.ino` and update these two lines:

```cpp
const char ALERT_NUMBER[] = "+91XXXXXXXXXX";  // ← Your phone number with country code
const int  LDR_THRESHOLD  = 400;              // ← Tune to your environment (see below)
```

### 3. Tune the LDR threshold

Before connecting the GSM module, temporarily comment out the GSM init and add a Serial.println of the LDR value. With the laser aimed at the LDR:

- **Beam intact** → note the A0 reading (typically 650–900)
- **Block the beam** → note the A0 reading (typically 50–250)
- Set `LDR_THRESHOLD` to a value halfway between the two

### 4. Upload the sketch

> ⚠️ **D0/D1 are shared with the GSM module's TX/RX.**

Follow this order every time you upload:

1. **Disconnect** A7670C TX and RX wires from D0 and D1
2. Upload the sketch via USB
3. **Reconnect** A7670C wires after upload completes
4. Power cycle the board

### 5. Power the A7670C correctly

Power the A7670C from your **5V 2A USB adapter** via the JST/DC terminal directly — **never** from the Nano's 5V pin. The GSM module draws up to 2A during calls; the Nano's onboard regulator is rated for only ~500mA and will reset or damage the board under GSM load. Share GND between both.

---

## 🔁 How It Works

```
System boots → Laser ON (D2 HIGH via 2N2222) → A7670C GSM initialized
        ↓
Loop: Read LDR average (A0) every 150ms
        ↓
LDR value < LDR_THRESHOLD?
   YES → Beam broken → Intrusion detected!
            ↓
         Cooldown elapsed? (30s since last alert)
            YES → Send SMS → Wait 3s → Make voice call (20s) → Hang up
            NO  → Silent (prevent spam)
   NO  → Beam intact → continue monitoring
```

---

## 📲 Alert Behavior

When an intrusion is detected:

1. **SMS sent** to `ALERT_NUMBER`:
   > `ALERT! Laser beam broken - INTRUSION DETECTED! Check your location immediately.`

2. **Voice call made** to `ALERT_NUMBER` — rings for 20 seconds, then auto-hangs up.

3. **30-second cooldown** prevents repeated alerts for the same intrusion event.

4. **Status LED (D13)** stays ON while beam is broken, OFF when restored.

---

## ⚙️ Configurable Parameters

| Constant | Default | Description |
|---|---|---|
| `ALERT_NUMBER` | `+91XXXXXXXXXX` | Phone number to alert (with country code) |
| `LDR_THRESHOLD` | `400` | A0 value below which beam is considered broken |
| `COOLDOWN_MS` | `30000` (30s) | Minimum time between repeated alerts |
| `CALL_DURATION` | `20000` (20s) | How long the voice call rings before auto-hangup |
| `GSM_TIMEOUT` | `8000` (8s) | AT command response timeout |
| `LDR_SAMPLES` | `5` | Number of A0 readings averaged per check |

---

## 🛠️ Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| GSM not responding | A7670C not booted yet | Increase `delay(4000)` in `gsmInit()` to `6000` |
| SMS not sending | No SIM / no credit / no signal | Check SIM, antenna, and signal strength |
| False triggers | Ambient light noise | Lower `LDR_SAMPLES` or shield LDR from ambient light |
| Laser not turning on | D2 or 2N2222 issue | Check R2 (1kΩ) and transistor orientation |
| Upload fails | GSM wires on D0/D1 | Disconnect GSM TX/RX before uploading |
| Board resets during call | GSM drawing too much current | Power A7670C from external 5V 2A, not Nano pin |
| Beam never detected | Threshold wrong | Re-measure LDR values and set threshold accordingly |

---

## 📐 Circuit Notes

- **2N2222 transistor** is used to switch the laser — this protects the Arduino digital pin from direct laser current draw.
- **R2 (1kΩ)** is the base resistor for Q1, already present in the schematic.
- **R3 (10kΩ)** forms a voltage divider with the LDR — A0 reads HIGH when beam is present (LDR resistance low), LOW when blocked (LDR resistance high).
- **C1 + C2** on the power rail suppress voltage spikes from the GSM module during transmission bursts.

---

## 📄 License

MIT License — free to use, modify, and distribute with attribution.

---

## 🙋 Author

Built for a laser grid perimeter security project using off-the-shelf Arduino components and the SIMCom A7670C 4G LTE module.
