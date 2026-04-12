import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import init from 'react-native-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldCheck, ShieldAlert, Upload } from 'lucide-react-native';
import database from '@react-native-firebase/database';


// Add this to point to your specific database URL
const db = database().refFromURL('https://lasergridapp-default-rtdb.firebaseio.com/');
// Initialize MQTT connection logic
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: true,
});

const App = () => {{ 
  const App = () => {
  // UseEffect goes directly here
  useEffect(() => {
    startSecurityListener();
  }, []);

  // Your states (isTriggered, connStatus, etc.) go here
  const [isTriggered, setIsTriggered] = useState(false);
  // ... rest of code
};
 
const startSecurityListener = () => {
  database()
    .ref('/system/alert')
    .on('value', snapshot => {
      if (snapshot.val() === true) {
        Alert.alert(
          "INTRUDER DETECTED!", // Title
          "The laser beam has been broken.", // Message
          [
            { 
              text: "Reset Alarm", 
              onPress: () => database().ref('/system/alert').set(false) // This is the reset logic
            }
          ]
        );
      }
    });
};
  // ... the rest of your existing code (return statement, styles, etc.)
};
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [laserPos, setLaserPos] = useState<{ x: number, y: number } | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [connStatus, setConnStatus] = useState("Connecting...");

  useEffect(() => {
   // @ts-ignore
    const client = new (global as any).Paho.MQTT.Client('broker.hivemq.com', 8000, 'NIE_User_' + Math.random());

    client.onMessageArrived = (message: any) => {
      if (message.payloadString === "1") {
        setIsTriggered(true);
        Alert.alert("🚨 INTRUDER ALERT", "Laser Beam Broken in Zone 1!");
      } else {
        setIsTriggered(false);
      }
    };

    client.connect({
      onSuccess: () => {
        setConnStatus("✅ Connected to HiveMQ");
        client.subscribe("laser/zone1");
      },
      useSSL: false,
      onFailure: () => setConnStatus("❌ Connection Failed")
    });
  }, []);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      if (res.assets) setBlueprint(res.assets[0].uri!);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LASERGUARD DASHBOARD</Text>
        <Text style={styles.subStatus}>{connStatus}</Text>
      </View>

      <TouchableOpacity 
        activeOpacity={1} 
        onPress={(e) => blueprint && !laserPos && setLaserPos({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })}
        style={styles.mapFrame}
      >
        {blueprint ? (
          <View>
            <Image source={{ uri: blueprint }} style={styles.image} />
            {laserPos && (
              <View style={[styles.pin, { 
                left: laserPos.x - 15, 
                top: laserPos.y - 15, 
                backgroundColor: isTriggered ? '#FF0000' : '#00FF00' 
              }]} />
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
            <Upload color="#666" size={40} />
            <Text style={{ color: '#666', marginTop: 10 }}>Tap to Upload House Plan</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={[styles.statusBox, { backgroundColor: isTriggered ? '#441111' : '#114411' }]}>
          <Text style={styles.footerText}>
            {isTriggered ? "🚨 BREACH DETECTED" : "✅ SYSTEM SECURE"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  subStatus: { color: '#888', fontSize: 12, marginTop: 5 },
  mapFrame: { flex: 1, backgroundColor: '#1A1A1A', margin: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  uploadBtn: { alignSelf: 'center', alignItems: 'center' },
  pin: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5 },
  footer: { padding: 30 },
  statusBox: { padding: 20, borderRadius: 15, alignItems: 'center' },
  footerText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});




// This function listens for the intruder signal from your Arduino
const startSecurityListener = () => {
  database()
    .ref('/system/alert')
    .on('value', snapshot => {
      if (snapshot.val() === true) {
      Alert.alert("INTRUDER DETECTED!");
        // You can add code here to play an alarm sound
      }
    });
};
export default App;