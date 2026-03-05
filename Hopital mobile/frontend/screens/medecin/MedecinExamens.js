import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetExamens, apiCreateExamen, apiUpdateExamen, apiDeleteExamen } from '../../api/api';

export default function MedecinExamens({ route }) {
  const idDossierParam = route?.params?.idDossier || null;
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', dateResultat: '', idDossier: String(idDossierParam || '') });

  const load = async () => {
    setLoading(true);
    try { setExamens(await apiGetExamens(idDossierParam)); }
    catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ nom: '', dateResultat: '', idDossier: String(idDossierParam || '') });
    setModal(true);
  };

  const openEdit = (ex) => {
    setEditing(ex);
    setForm({
      nom: ex.nom,
      dateResultat: ex.dateResultat ? ex.dateResultat.split('T')[0] : '',
      idDossier: String(ex.idDossier),
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.idDossier.trim()) {
      return Alert.alert('Erreur', 'Nom et ID dossier requis.');
    }
    try {
      if (editing) {
        await apiUpdateExamen(editing.idExamen, { nom: form.nom, dateResultat: form.dateResultat || null });
        Alert.alert('Succès', 'Examen modifié.');
      } else {
        await apiCreateExamen({ nom: form.nom, dateResultat: form.dateResultat || null, idDossier: parseInt(form.idDossier) });
        Alert.alert('Succès', 'Examen ajouté.');
      }
      setModal(false);
      load();
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  const handleDelete = (ex) => {
    Alert.alert('Supprimer', `Supprimer l'examen "${ex.nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await apiDeleteExamen(ex.idExamen); load(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Examens & Analyses" />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.count}>{examens.length} examen(s){idDossierParam ? ` — Dossier #${idDossierParam}` : ''}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} /> : (
          <FlatList
            data={examens}
            keyExtractor={(item) => item.idExamen.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Ionicons name="flask" size={20} color="#4CAF50" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.nom}</Text>
                  <Text style={styles.patient}>{item.prenom} {item.nom_patient || item.nom}</Text>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={12} color={item.dateResultat ? '#4FC3F7' : '#FF9800'} />
                    <Text style={[styles.dateText, { color: item.dateResultat ? '#4FC3F7' : '#FF9800' }]}>
                      {item.dateResultat ? new Date(item.dateResultat).toLocaleDateString('fr-FR') : 'En attente'}
                    </Text>
                  </View>
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
            ListEmptyComponent={<Text style={styles.empty}>Aucun examen.</Text>}
          />
        )}
      </View>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Modifier l\'examen' : 'Ajouter un examen'}</Text>
            <ScrollView>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nom de l'examen *</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.nom}
                  onChangeText={(v) => setForm({ ...form, nom: v })}
                  placeholder="Ex: Analyse sanguine, Radio..."
                  placeholderTextColor="#546E7A"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date du résultat (AAAA-MM-JJ)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.dateResultat}
                  onChangeText={(v) => setForm({ ...form, dateResultat: v })}
                  placeholder="Ex: 2026-03-15"
                  placeholderTextColor="#546E7A"
                />
              </View>
              {!editing && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>ID Dossier *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form.idDossier}
                    onChangeText={(v) => setForm({ ...form, idDossier: v })}
                    keyboardType="numeric"
                    placeholder="Numéro du dossier"
                    placeholderTextColor="#546E7A"
                  />
                </View>
              )}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={{ color: '#78909C', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{editing ? 'Modifier' : 'Ajouter'}</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  count: { color: '#78909C', fontSize: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1565C0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 14, padding: 12, marginBottom: 10, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#4CAF5022', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  patient: { color: '#78909C', fontSize: 12, marginTop: 2 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: 12 },
  actions: { gap: 8 },
  editBtn: { backgroundColor: '#1E3A5F', padding: 8, borderRadius: 8 },
  delBtn: { backgroundColor: '#3E1414', padding: 8, borderRadius: 8 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#132F4C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0A2342', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#0A2342', alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
});