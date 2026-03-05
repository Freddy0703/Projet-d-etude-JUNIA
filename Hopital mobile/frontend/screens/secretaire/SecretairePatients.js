import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetPatients, apiCreatePatient, apiUpdatePatient, apiDeletePatient } from '../../api/api';

const emptyForm = { nom: '', prenom: '', age: '', tel: '', sexe: 'Homme', nationalite: '' };

export default function SecretairePatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async (s = '') => {
    setLoading(true);
    try { setPatients(await apiGetPatients(s)); }
    catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ nom: p.nom, prenom: p.prenom, age: String(p.age || ''), tel: p.tel || '', sexe: p.sexe, nationalite: p.nationalite || '' }); setModal(true); };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) return Alert.alert('Erreur', 'Nom et prénom requis.');
    setSaving(true);
    try {
      if (editing) {
        await apiUpdatePatient(editing.idPatient, form);
        Alert.alert('Succès', 'Patient modifié.');
      } else {
        await apiCreatePatient(form);
        Alert.alert('Succès', 'Patient ajouté.');
      }
      setModal(false);
      load(search);
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (p) => {
    Alert.alert('Supprimer', `Supprimer ${p.prenom} ${p.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await apiDeletePatient(p.idPatient); load(search); } }
    ]);
  };

  const Field = ({ label, field, keyboardType, placeholder }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={form[field]}
        onChangeText={(v) => setForm({ ...form, [field]: v })}
        keyboardType={keyboardType || 'default'}
        placeholder={placeholder || label}
        placeholderTextColor="#546E7A"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Gestion des Patients" />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#78909C" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#546E7A"
              value={search}
              onChangeText={(t) => { setSearch(t); load(t); }}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.count}>{patients.length} patient(s)</Text>

        {loading ? <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} /> : (
          <FlatList
            data={patients}
            keyExtractor={(item) => item.idPatient.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.prenom[0]}{item.nom[0]}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.prenom} {item.nom}</Text>
                  <Text style={styles.sub}>{item.age} ans • {item.sexe}</Text>
                  <Text style={styles.tel}>{item.tel || 'Pas de tél'}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="pencil-outline" size={16} color="#4FC3F7" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={16} color="#EF5350" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun patient.</Text>}
          />
        )}
      </View>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Modifier le patient' : 'Ajouter un patient'}</Text>
            <ScrollView>
              <Field label="Nom *" field="nom" />
              <Field label="Prénom *" field="prenom" />
              <Field label="Âge" field="age" keyboardType="numeric" />
              <Field label="Téléphone" field="tel" keyboardType="phone-pad" />
              <Field label="Nationalité" field="nationalite" />
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Sexe</Text>
                <View style={styles.sexeRow}>
                  {['Homme', 'Femme'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sexeBtn, form.sexe === s && styles.sexeBtnActive]}
                      onPress={() => setForm({ ...form, sexe: s })}
                    >
                      <Text style={[styles.sexeBtnText, form.sexe === s && { color: '#fff' }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={{ color: '#78909C', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{editing ? 'Modifier' : 'Ajouter'}</Text>}
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
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  addBtn: { width: 44, height: 44, backgroundColor: '#1565C0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  count: { color: '#78909C', fontSize: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 14, padding: 12, marginBottom: 10, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sub: { color: '#78909C', fontSize: 12, marginTop: 2 },
  tel: { color: '#4FC3F7', fontSize: 11, marginTop: 2 },
  actions: { gap: 8 },
  editBtn: { backgroundColor: '#1E3A5F', padding: 8, borderRadius: 8 },
  delBtn: { backgroundColor: '#3E1414', padding: 8, borderRadius: 8 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#132F4C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0A2342', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  sexeRow: { flexDirection: 'row', gap: 10 },
  sexeBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#0A2342', alignItems: 'center' },
  sexeBtnActive: { backgroundColor: '#1565C0' },
  sexeBtnText: { color: '#78909C', fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#0A2342', alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
});