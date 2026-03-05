import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetDossiers, apiGetDossier } from '../../api/api';

export default function AdminDossiers() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetDossiers();
      setDossiers(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    try {
      const data = await apiGetDossier(id);
      setDetail(data);
      setExpanded(id);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Dossiers Médicaux" />
      <View style={styles.container}>
        <Text style={styles.count}>{dossiers.length} dossier(s)</Text>
        {loading ? (
          <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={dossiers}
            keyExtractor={(item) => item.idDossier.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.idDossier)}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="folder" size={22} color="#FF9800" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.prenom} {item.nom}</Text>
                    <Text style={styles.cardDate}>Créé le {new Date(item.dateCreation).toLocaleDateString('fr-FR')}</Text>
                  </View>
                  <Ionicons
                    name={expanded === item.idDossier ? 'chevron-up' : 'chevron-down'}
                    size={18} color="#78909C"
                  />
                </TouchableOpacity>

                {expanded === item.idDossier && detail && (
                  <View style={styles.detail}>
                    <Text style={styles.detailTitle}>Informations patient</Text>
                    <Text style={styles.detailText}>Âge: {detail.age} ans | Sexe: {detail.sexe}</Text>
                    <Text style={styles.detailText}>Tél: {detail.tel || 'N/A'} | Nationalité: {detail.nationalite || 'N/A'}</Text>

                    <Text style={[styles.detailTitle, { marginTop: 12 }]}>
                      Examens ({detail.examens?.length || 0})
                    </Text>
                    {detail.examens?.length === 0 ? (
                      <Text style={styles.noExamen}>Aucun examen.</Text>
                    ) : (
                      detail.examens?.map((ex) => (
                        <View key={ex.idExamen} style={styles.examenRow}>
                          <Ionicons name="flask-outline" size={14} color="#4FC3F7" />
                          <Text style={styles.examenName}>{ex.nom}</Text>
                          <Text style={styles.examenDate}>
                            {ex.dateResultat ? new Date(ex.dateResultat).toLocaleDateString('fr-FR') : 'En attente'}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun dossier.</Text>}
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
  count: { color: '#78909C', fontSize: 12, marginBottom: 12 },
  card: { backgroundColor: '#132F4C', borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FF980022', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cardDate: { color: '#78909C', fontSize: 12, marginTop: 2 },
  detail: { backgroundColor: '#0A2342', padding: 14, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  detailTitle: { color: '#4FC3F7', fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  detailText: { color: '#B0BEC5', fontSize: 13, marginBottom: 4 },
  noExamen: { color: '#546E7A', fontSize: 13 },
  examenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  examenName: { flex: 1, color: '#CFD8DC', fontSize: 13 },
  examenDate: { color: '#78909C', fontSize: 11 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
});