import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetPatients, apiCreateDossier } from '../../api/api';

export default function MedecinPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (s = '') => {
    setLoading(true);
    try { setPatients(await apiGetPatients(s)); }
    catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateDossier = (patient) => {
    Alert.alert('Créer dossier', `Créer un dossier pour ${patient.prenom} ${patient.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Créer', onPress: async () => {
          try {
            await apiCreateDossier(patient.idPatient);
            Alert.alert('Succès', 'Dossier créé.');
          } catch (e) { Alert.alert('Erreur', e.message); }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Liste des Patients" />
      <View style={styles.container}>
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
                  <Text style={styles.sub}>{item.age} ans • {item.sexe} • {item.nationalite || 'N/A'}</Text>
                  <Text style={styles.tel}>{item.tel || 'Pas de tél'}</Text>
                </View>
                <TouchableOpacity style={styles.dossierBtn} onPress={() => handleCreateDossier(item)}>
                  <Ionicons name="folder-open-outline" size={16} color="#FF9800" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun patient.</Text>}
          />
        )}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A2342' },
  container: { flex: 1, padding: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  count: { color: '#78909C', fontSize: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 14, padding: 12, marginBottom: 10, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF5033', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sub: { color: '#78909C', fontSize: 12, marginTop: 2 },
  tel: { color: '#4FC3F7', fontSize: 11, marginTop: 2 },
  dossierBtn: { backgroundColor: '#FF980022', padding: 10, borderRadius: 10 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
});