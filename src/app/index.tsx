import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { initDatabase } from '../db';
import { hasPatient } from '../features/patient/patientService';

export default function Index() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await initDatabase();
        
        // Check if patient exists
        const patientExists = await hasPatient();
        
        // Navigate to appropriate screen
        if (patientExists) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        // Still navigate to onboarding even if there's an error
        router.replace('/onboarding');
      } finally {
        setIsInitializing(false);
      }
    }
    
    initialize();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Medpass</Text>
      <Text style={styles.subtitle}>Digital Health Passport</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

