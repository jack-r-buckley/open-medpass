import { View, Text, StyleSheet } from 'react-native';
import { getPatient } from '../../features/patient/patientService';
import { useState, useEffect } from 'react';
import { Patient } from '../../types';

export default function SettingsScreen() {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    const data = await getPatient();
    setPatient(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {patient && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{patient.name}</Text>
          </View>
          {patient.nationalId && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>National ID:</Text>
              <Text style={styles.value}>{patient.nationalId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.value}>{patient.deviceId.substring(0, 8)}...</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.subtitle}>Additional features coming soon</Text>
        <Text style={styles.description}>
          • Change PIN{'\n'}
          • Export data{'\n'}
          • Audit trail viewer{'\n'}
          • App preferences
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 100,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#888',
    lineHeight: 24,
  },
});

