import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { createPatient } from '../../features/patient/patientService';

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryQuestion] = useState("What is your mother's maiden name?");
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    
    if (!recoveryAnswer.trim()) {
      Alert.alert('Error', 'Please answer the recovery question');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createPatient({
        name: name.trim(),
        nationalId: nationalId.trim() || undefined,
        pin,
        recoveryQuestion,
        recoveryAnswer,
      });
      
      Alert.alert('Success', 'Patient registered successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to register patient');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to Open Medpass</Text>
      <Text style={styles.subtitle}>
        Let's set up your digital health passport
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>National ID (optional)</Text>
        <TextInput
          style={styles.input}
          value={nationalId}
          onChangeText={setNationalId}
          placeholder="Enter your national ID"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Create 6-digit PIN *</Text>
        <Text style={styles.hint}>
          This PIN will be used to secure your medical records
        </Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="Enter 6-digit PIN"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Confirm PIN *</Text>
        <TextInput
          style={styles.input}
          value={confirmPin}
          onChangeText={setConfirmPin}
          placeholder="Re-enter PIN"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery Question</Text>
        <Text style={styles.hint}>
          Used to recover your account if you forget your PIN
        </Text>
        
        <Text style={styles.label}>{recoveryQuestion} *</Text>
        <TextInput
          style={styles.input}
          value={recoveryAnswer}
          onChangeText={setRecoveryAnswer}
          placeholder="Your answer"
          editable={!isSubmitting}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Complete Setup</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Your data is stored securely on your device only. No cloud backup.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#99c9ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
});

