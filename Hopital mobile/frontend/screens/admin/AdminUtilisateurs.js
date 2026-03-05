import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, ScrollView, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetUtilisateurs, apiUpdateUtilisateur, apiDeleteUtilisateur } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const roleColor = { Administrateur: '#F44336', Secretaire: '#FF9800', Medecin: '#4CAF50' };

export default function AdminUtilisateurs() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetUtilisateurs(filterRole);
      setUsers(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterRole]);

  const handleDelete = (user) => {
    if (user.idUser === me.idUser) return Alert.alert('Erreur', 'Vous ne pouvez pas vous supprimer.');
    Alert.alert('Supprimer', `Supprimer ${user.prenom} ${user.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await apiDeleteUtilisateur(user.idUser);
            load();
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        }
      }
    ]);
  };

  const handleUpdate = async () => {
    try {
      await apiUpdateUtilisateur(selected.idUser, form);
      Alert.alert('Succès', 'Utilisateur modifié.');
      setEditModal(false);
      load();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Gestion des Utilisateurs" />
      <View style={styles.container}>
        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {[null, 'Administrateur', 'Secretaire', 'Medecin'].map((r) => (
            <TouchableOpacity
              key={String(r)}
              style={[styles.filterBtn, filterRole === r && styles.filterBtnActive]}
              onPress={() => setFilterRole(r)}
            >
              <Text style={[styles.filterText, filterRole === r && styles.filterTextActive]}>
                {r || 'Tous'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.idUser.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: (roleColor[item.role] || '#78909C') + '33' }]}>
                  <Text style={[styles.avatarText, { color: roleColor[item.role] || '#78909C' }]}>
                    {item.prenom[0]}{item.nom[0]}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.prenom} {item.nom}</Text>
                  <Text style={styles.login}>@{item.login}</Text>
                  <View style={styles.rowMeta}>
                    <View style={[styles.badge, { backgroundColor: (roleColor[item.role] || '#78909C') + '22' }]}>
                      <Text style={[styles.badgeText, { color: roleColor[item.role] || '#78909C' }]}>{item.role}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: item.statut === 'En ligne' ? '#4CAF5022' : '#78909C22' }]}>
                      <Text style={[styles.badgeText, { color: item.statut === 'En ligne' ? '#4CAF50' : '#78909C' }]}>
                        {item.statut}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setSelected(item); setForm({ prenom: item.prenom, nom: item.nom, login: item.login, role: item.role }); setEditModal(true); }}>
                    <Ionicons name="pencil-outline" size={16} color="#4FC3F7" />
                  </TouchableOpacity>
                  {item.idUser !== me.idUser && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={16} color="#EF5350" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun utilisateur.</Text>}
          />
        )}
      </View>

      {/* Modal Edit */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Modifier l'utilisateur</Text>
            {['prenom', 'nom', 'login'].map((f) => (
              <View key={f} style={styles.field}>
                <Text style={styles.fieldLabel}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[f] || ''}
                  onChangeText={(v) => setForm({ ...form, [f]: v })}
                  placeholderTextColor="#546E7A"
                />
              </View>
            ))}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Rôle</Text>
              <View style={styles.roleRow}>
                {['Administrateur', 'Secretaire', 'Medecin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, form.role === r && { backgroundColor: roleColor[r] }]}
                    onPress={() => setForm({ ...form, role: r })}
                  >
                    <Text style={[styles.roleBtnText, form.role === r && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={{ color: '#78909C', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Enregistrer</Text>
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
  filters: { flexDirection: 'row', marginBottom: 14, maxHeight: 40 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#132F4C', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#1565C0' },
  filterText: { color: '#78909C', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 14, padding: 12, marginBottom: 10, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  login: { color: '#78909C', fontSize: 12, marginTop: 2 },
  rowMeta: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  actions: { gap: 8 },
  editBtn: { backgroundColor: '#1E3A5F', padding: 8, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#3E1414', padding: 8, borderRadius: 8 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#132F4C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0A2342', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#0A2342', alignItems: 'center' },
  roleBtnText: { color: '#78909C', fontSize: 12, fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#0A2342', alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1565C0', alignItems: 'center' },
});