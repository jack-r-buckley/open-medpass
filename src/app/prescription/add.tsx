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
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  
  // Modal states
  const [showMedicationPicker, setShowMedicationPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const handleMedicationChange = (code: string, display: string, defaultDosage: string) => {
    setMedicationCode(code);
    setMedicationDisplay(display);
    setDosage(defaultDosage);
    setShowMedicationPicker(false);
  };
  
  const handleFrequencyChange = (freq: string) => {
    setFrequency(freq);
    setShowFrequencyPicker(false);
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
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Medication *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMedicationPicker(true)}
          >
            <Text style={medicationDisplay ? styles.pickerButtonTextSelected : styles.pickerButtonTextPlaceholder}>
              {medicationDisplay || 'Select medication...'}
            </Text>
          </TouchableOpacity>

          {medicationCode === 'custom' && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
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
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowFrequencyPicker(true)}
          >
            <Text style={styles.pickerButtonTextSelected}>
              {frequency}
            </Text>
          </TouchableOpacity>
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

      {/* Medication Picker Modal */}
      <Modal
        visible={showMedicationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMedicationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Medication</Text>
              <TouchableOpacity onPress={() => setShowMedicationPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={[...SAMPLE_MEDICATIONS, { code: 'custom', display: 'Custom medication...', defaultDosage: '' }]}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleMedicationChange(item.code, item.display, item.defaultDosage)}
                >
                  <Text style={styles.modalItemText}>{item.display}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Frequency Picker Modal */}
      <Modal
        visible={showFrequencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFrequencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Frequency</Text>
              <TouchableOpacity onPress={() => setShowFrequencyPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={FREQUENCIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleFrequencyChange(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
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
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    justifyContent: 'center',
    minHeight: 50,
  },
  pickerButtonTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  pickerButtonTextPlaceholder: {
    fontSize: 16,
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

