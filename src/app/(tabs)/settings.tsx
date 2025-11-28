import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getPatient } from '../../features/patient/patientService';
import { useState, useEffect } from 'react';
import { Patient } from '../../db/schema';
import { resetDatabase } from '../../db';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    const data = await getPatient();
    setPatient(data);
  };
  
  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL data including your patient identity. You will need to complete onboarding again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert('Success', 'Database reset complete', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/onboarding');
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset database');
              console.error(error);
            }
          },
        },
      ]
    );
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
          {patient.national_id && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>National ID:</Text>
              <Text style={styles.value}>{patient.national_id}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.value}>{patient.device_id.substring(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Patient ID:</Text>
            <Text style={styles.value}>{patient.id.substring(0, 8)}...</Text>
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

      {__DEV__ && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>⚠️ Developer Tools</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetDatabase}>
            <Text style={styles.dangerButtonText}>🗑️ Reset Database</Text>
          </TouchableOpacity>
          <Text style={styles.dangerHint}>
            This will delete all data and return you to onboarding
          </Text>
        </View>
      )}
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
  dangerZone: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});

