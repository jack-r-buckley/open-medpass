import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Prescription } from '../../db/schema';
import { getPrescriptions } from '../../features/prescriptions/prescriptionService';
import { getPatient } from '../../features/patient/patientService';

export default function RecordsScreen() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatient() {
      const patient = await getPatient();
      if (patient) {
        setPatientId(patient.id);
      }
    }
    loadPatient();
  }, []);

  const loadPrescriptions = async () => {
    if (!patientId) return;
    
    try {
      const data = await getPrescriptions(patientId);
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (patientId) {
        loadPrescriptions();
      }
    }, [patientId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPrescriptions();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#999';
      case 'discontinued':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/prescription/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.medicationName}>{item.medication}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.dosageText}>
        {item.dosage} • {item.frequency}
      </Text>
      
      {item.duration_days && (
        <Text style={styles.durationText}>
          Duration: {item.duration_days} days
        </Text>
      )}
      
      {item.prescriber_name && (
        <Text style={styles.prescriberText}>
          Prescribed by: {item.prescriber_name}
        </Text>
      )}
      
      <Text style={styles.dateText}>
        Added: {formatDate(new Date(item.created_at))}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prescriptions}
        renderItem={renderPrescription}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No prescriptions yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first prescription
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/prescription/add')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dosageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  prescriberText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

