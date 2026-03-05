import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetPatients, apiUpdatePatient, apiDeletePatient } from '../../api/api';

const PatientRow = ({ patient, onEdit, onDelete }) => (
  <View style={styles.row}>
    <View style={styles.rowAvatar}>
      <Text style={styles.rowAvatarText}>{patient.prenom[0]}{patient.nom[0]}</Text>
    </View>
    <View style={styles.rowInfo}>
      <Text style={styles.rowName}>{patient.prenom} {patient.nom}</Text>
      <Text style={styles.rowSub}>{patient.age} ans • {patient.sexe} • {patient.nationalite || 'N/A'}</Text>
      <Text style={styles.rowTel}><Ionicons name="call-outline" size={12} /> {patient.tel || 'Pas de tél'}</Text>
    </View>
    <View style={styles.rowActions}>
      <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(patient)}>
        <Ionicons name="pencil-outline" size={16} color="#4FC3F7" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(patient)}>
        <Ionicons name="trash-outline" size={16} color="#EF5350" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const load = async (s = '') => {
    setLoading(true);
    try {
      const data = await apiGetPatients(s);
      setPatients(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (text) => {
    setSearch(text);
    load(text);
  };

  const openEdit = (patient) => {
    setSelected(patient);
    setForm({ ...patient });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await apiUpdatePatient(selected.idPatient, form);
      Alert.alert('Succès', 'Patient modifié.');
      setEditModal(false);
      load(search);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleDelete = (patient) => {
    Alert.alert('Supprimer', `Supprimer ${patient.prenom} ${patient.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await apiDeletePatient(patient.idPatient);
            load(search);
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Gestion des Patients" />
      <View style={styles.container}>
        {/* Recherche */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#78909C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient..."
            placeholderTextColor="#546E7A"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <Text style={styles.count}>{patients.length} patient(s) trouvé(s)</Text>
        <Text style={styles.note}>⚠️ En tant qu'Administrateur, vous pouvez modifier/supprimer mais pas ajouter.</Text>

        {loading ? (
          <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={patients}
            keyExtractor={(item) => item.idPatient.toString()}
            renderItem={({ item }) => (
              <PatientRow patient={item} onEdit={openEdit} onDelete={handleDelete} />
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun patient trouvé.</Text>}
          />
        )}
      </View>

      {/* Modal Edit */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le patient</Text>
            <ScrollView>
              {['nom', 'prenom', 'tel', 'nationalite'].map((field) => (
                <View key={field} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(form[field] || '')}
                    onChangeText={(v) => setForm({ ...form, [field]: v })}
                    placeholderTextColor="#546E7A"
                  />
                </View>
              ))}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Âge</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={String(form.age || '')}
                  onChangeText={(v) => setForm({ ...form, age: v })}
                  keyboardType="numeric"
                  placeholderTextColor="#546E7A"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Sexe</Text>
                <View style={styles.sexeRow}>
                  {['Homme', 'Femme'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sexeBtn, form.sexe === s && styles.sexeBtnActive]}
                      onPress={() => setForm({ ...form, sexe: s })}
                    >
                      <Text style={[styles.sexeBtnText, form.sexe === s && styles.sexeBtnTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A2342' },
  container: { flex: 1, padding: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#132F4C', borderRadius: 12,
    paddingHorizontal: 12, height: 44, gap: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  count: { color: '#78909C', fontSize: 12, marginBottom: 4 },
  note: { color: '#FF9800', fontSize: 11, marginBottom: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#132F4C', borderRadius: 14,
    padding: 12, marginBottom: 10, gap: 12,
  },
  rowAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center',
  },
  rowAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rowInfo: { flex: 1 },
  rowName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  rowSub: { color: '#78909C', fontSize: 12, marginTop: 2 },
  rowTel: { color: '#4FC3F7', fontSize: 11, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#1E3A5F', padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#3E1414', padding: 8, borderRadius: 8 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#132F4C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0A2342', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  sexeRow: { flexDirection: 'row', gap: 10 },
  sexeBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#0A2342', alignItems: 'center' },
  sexeBtnActive: { backgroundColor: '#1565C0' },
  sexeBtnText: { color: '#78909C', fontWeight: '600' },
  sexeBtnTextActive: { color: '#fff' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#0A2342', alignItems: 'center' },
  cancelBtnText: { color: '#78909C', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});