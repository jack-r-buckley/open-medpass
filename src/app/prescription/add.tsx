import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { SAMPLE_MEDICATIONS, FREQUENCIES } from '../../types';
import { createPrescription } from '../../features/prescriptions/prescriptionService';

export default function AddPrescription() {
  const router = useRouter();
  const [medicationCode, setMedicationCode] = useState('');
  const [medicationDisplay, setMedicationDisplay] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [durationDays, setDurationDays] = useState('');
  const [prescriberName, setPrescriberName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMedicationChange = (code: string) => {
    setMedicationCode(code);
    const med = SAMPLE_MEDICATIONS.find(m => m.code === code);
    if (med) {
      setMedicationDisplay(med.display);
      setDosage(med.defaultDosage);
    }
  };

  const handleSubmit = async () => {
    if (!medicationDisplay.trim()) {
      Alert.alert('Error', 'Please select or enter a medication');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPrescription({
        medicationCode: medicationCode || undefined,
        medicationDisplay: medicationDisplay.trim(),
        dosage: dosage.trim(),
        frequency,
        durationDays: durationDays ? parseInt(durationDays) : undefined,
        prescriberName: prescriberName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Prescription added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to create prescription:', error);
      Alert.alert('Error', 'Failed to add prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Medication *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={medicationCode}
            onValueChange={handleMedicationChange}
            style={styles.picker}
          >
            <Picker.Item label="Select medication..." value="" />
            {SAMPLE_MEDICATIONS.map(med => (
              <Picker.Item
                key={med.code}
                label={med.display}
                value={med.code}
              />
            ))}
            <Picker.Item label="Custom medication..." value="custom" />
          </Picker>
        </View>

        {medicationCode === 'custom' && (
          <TextInput
            style={styles.input}
            value={medicationDisplay}
            onChangeText={setMedicationDisplay}
            placeholder="Enter medication name"
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g., 500mg, 2 tablets"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={frequency}
            onValueChange={setFrequency}
            style={styles.picker}
          >
            {FREQUENCIES.map(freq => (
              <Picker.Item key={freq} label={freq} value={freq} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Duration (days)</Text>
        <TextInput
          style={styles.input}
          value={durationDays}
          onChangeText={setDurationDays}
          placeholder="e.g., 7, 14"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Prescribed by</Text>
        <TextInput
          style={styles.input}
          value={prescriberName}
          onChangeText={setPrescriberName}
          placeholder="Doctor or clinic name"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional information..."
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Add Prescription</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#99c9ff',
  },
});

