import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetUtilisateurs, apiCreateUtilisateur, apiUpdateUtilisateur } from '../../api/api';

const emptyForm = { prenom: '', nom: '', login: '', password: '', role: 'Medecin' };

export default function SecretaireMedecins() {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showPwd, setShowPwd] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setMedecins(await apiGetUtilisateurs('Medecin')); }
    catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ prenom: m.prenom, nom: m.nom, login: m.login, password: '', role: 'Medecin' }); setModal(true); };

  const handleSave = async () => {
    if (!form.prenom.trim() || !form.nom.trim() || !form.login.trim()) {
      return Alert.alert('Erreur', 'Prénom, nom et login requis.');
    }
    if (!editing && !form.password.trim()) {
      return Alert.alert('Erreur', 'Mot de passe requis pour un nouveau médecin.');
    }
    try {
      if (editing) {
        await apiUpdateUtilisateur(editing.idUser, { prenom: form.prenom, nom: form.nom, login: form.login, role: 'Medecin' });
        Alert.alert('Succès', 'Médecin modifié.');
      } else {
        await apiCreateUtilisateur(form);
        Alert.alert('Succès', 'Médecin ajouté.');
      }
      setModal(false);
      load();
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Gestion des Médecins" />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.count}>{medecins.length} médecin(s)</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} /> : (
          <FlatList
            data={medecins}
            keyExtractor={(item) => item.idUser.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="medkit" size={20} color="#4CAF50" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>Dr. {item.prenom} {item.nom}</Text>
                  <Text style={styles.login}>@{item.login}</Text>
                  <View style={[styles.badge, { backgroundColor: item.statut === 'En ligne' ? '#4CAF5022' : '#78909C22' }]}>
                    <Text style={{ color: item.statut === 'En ligne' ? '#4CAF50' : '#78909C', fontSize: 11 }}>
                      {item.statut}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="pencil-outline" size={16} color="#4FC3F7" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun médecin.</Text>}
          />
        )}
      </View>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Modifier le médecin' : 'Ajouter un médecin'}</Text>
            <ScrollView>
              {[
                { label: 'Prénom *', field: 'prenom' },
                { label: 'Nom *', field: 'nom' },
                { label: 'Login *', field: 'login' },
              ].map(({ label, field }) => (
                <View key={field} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form[field]}
                    onChangeText={(v) => setForm({ ...form, [field]: v })}
                    placeholderTextColor="#546E7A"
                    autoCapitalize="none"
                  />
                </View>
              ))}
              {!editing && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Mot de passe *</Text>
                  <View style={styles.pwdWrapper}>
                    <TextInput
                      style={[styles.fieldInput, { flex: 1, borderWidth: 0 }]}
                      value={form.password}
                      onChangeText={(v) => setForm({ ...form, password: v })}
                      secureTextEntry={!showPwd}
                      placeholderTextColor="#546E7A"
                    />
                    <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 8 }}>
                      <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color="#78909C" />
                    </TouchableOpacity>
                  </View>
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
  count: { color: '#78909C', fontSize: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1565C0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF5022', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  login: { color: '#78909C', fontSize: 12, marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  editBtn: { backgroundColor: '#1E3A5F', padding: 10, borderRadius: 10 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#132F4C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0A2342', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  pwdWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A2342', borderRadius: 10, paddingHorizontal: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#0A2342', alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
});