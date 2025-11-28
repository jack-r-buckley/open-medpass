import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Prescription } from '../../db/schema';
import { FREQUENCIES } from '../../types';
import {
  getPrescription,
  updatePrescription,
  updatePrescriptionStatus,
  deletePrescription,
} from '../../features/prescriptions/prescriptionService';

export default function EditPrescription() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [durationDays, setDurationDays] = useState('');
  const [prescriberName, setPrescriberName] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'discontinued'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state for frequency picker
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const loadPrescription = async () => {
    try {
      const data = await getPrescription(id);
      if (data) {
        setPrescription(data);
        setMedication(data.medication);
        setDosage(data.dosage);
        setFrequency(data.frequency);
        setDurationDays(data.duration_days?.toString() || '');
        setPrescriberName(data.prescriber_name || '');
        setNotes(data.notes || '');
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to load prescription:', error);
      Alert.alert('Error', 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!medication.trim() || !dosage.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePrescription(id, {
        medication: medication.trim(),
        dosage: dosage.trim(),
        frequency,
        durationDays: durationDays ? parseInt(durationDays) : undefined,
        prescriberName: prescriberName.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      });

      Alert.alert('Success', 'Prescription updated successfully');
      setEditing(false);
      await loadPrescription();
    } catch (error) {
      console.error('Failed to update prescription:', error);
      Alert.alert('Error', 'Failed to update prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePrescription(id);
              Alert.alert('Success', 'Prescription deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete prescription');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'discontinued') => {
    try {
      await updatePrescriptionStatus(id, newStatus);
      setStatus(newStatus);
      await loadPrescription();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={styles.centered}>
        <Text>Prescription not found</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!editing ? (
        // View Mode
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Medication</Text>
            <Text style={styles.value}>{prescription.medication}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dosage</Text>
            <Text style={styles.value}>{prescription.dosage}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <Text style={styles.value}>{prescription.frequency}</Text>
          </View>

          {prescription.duration_days && (
            <View style={styles.section}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{prescription.duration_days} days</Text>
            </View>
          )}

          {prescription.prescriber_name && (
            <View style={styles.section}>
              <Text style={styles.label}>Prescribed by</Text>
              <Text style={styles.value}>{prescription.prescriber_name}</Text>
            </View>
          )}

          {prescription.notes && (
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{prescription.notes}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusButtons}>
              {(['active', 'completed', 'discontinued'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusButton,
                    status === s && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(s)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === s && styles.statusButtonTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.metadata}>{formatDate(new Date(prescription.created_at))}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Last Modified</Text>
            <Text style={styles.metadata}>{formatDate(new Date(prescription.updated_at))}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.primaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleDelete}
            >
              <Text style={styles.dangerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Edit Mode
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Medication *</Text>
            <TextInput
              style={styles.input}
              value={medication}
              onChangeText={setMedication}
              placeholder="Medication name"
            />
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
              onPress={() => {
                setEditing(false);
                loadPrescription();
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>

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
                  onPress={() => {
                    setFrequency(item);
                    setShowFrequencyPicker(false);
                  }}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  metadata: {
    fontSize: 14,
    color: '#666',
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
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  statusButtonTextActive: {
    color: '#fff',
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
  dangerButton: {
    backgroundColor: '#ff3b30',
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
  dangerButtonText: {
    color: '#fff',
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

