import { View, Text, StyleSheet } from 'react-native';

export default function BackupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup & Sync</Text>
      <Text style={styles.subtitle}>Coming in Phase 2-3</Text>
      <Text style={styles.description}>
        This screen will allow you to backup your medical records to other devices via BLE.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: 300,
  },
});

