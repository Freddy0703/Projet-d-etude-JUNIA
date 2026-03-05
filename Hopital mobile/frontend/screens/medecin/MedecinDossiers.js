import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetDossiers, apiGetDossier } from '../../api/api';
import { useNavigation } from '@react-navigation/native';

export default function MedecinDossiers() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setDossiers(await apiGetDossiers()); }
      catch (e) { Alert.alert('Erreur', e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggle = async (id) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    try {
      setDetail(await apiGetDossier(id));
      setExpanded(id);
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Dossiers Médicaux" />
      <View style={styles.container}>
        <Text style={styles.count}>{dossiers.length} dossier(s)</Text>
        {loading ? <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 40 }} /> : (
          <FlatList
            data={dossiers}
            keyExtractor={(item) => item.idDossier.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggle(item.idDossier)}>
                  <View style={styles.icon}>
                    <Ionicons name="folder" size={22} color="#FF9800" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.prenom} {item.nom}</Text>
                    <Text style={styles.date}>{new Date(item.dateCreation).toLocaleDateString('fr-FR')}</Text>
                  </View>
                  <Ionicons name={expanded === item.idDossier ? 'chevron-up' : 'chevron-down'} size={18} color="#78909C" />
                </TouchableOpacity>

                {expanded === item.idDossier && detail && (
                  <View style={styles.detail}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Patient:</Text>
                      <Text style={styles.detailVal}>{detail.prenom} {detail.nom} • {detail.age} ans</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tél:</Text>
                      <Text style={styles.detailVal}>{detail.tel || 'N/A'}</Text>
                    </View>

                    <View style={styles.examenHeader}>
                      <Text style={styles.examenTitle}>Examens ({detail.examens?.length || 0})</Text>
                      <TouchableOpacity
                        style={styles.addExamenBtn}
                        onPress={() => navigation.navigate('Examens', { idDossier: item.idDossier })}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#4FC3F7" />
                        <Text style={styles.addExamenText}>Ajouter</Text>
                      </TouchableOpacity>
                    </View>

                    {detail.examens?.map((ex) => (
                      <View key={ex.idExamen} style={styles.exRow}>
                        <Ionicons name="flask-outline" size={14} color="#4FC3F7" />
                        <Text style={styles.exName}>{ex.nom}</Text>
                        <Text style={styles.exDate}>
                          {ex.dateResultat ? new Date(ex.dateResultat).toLocaleDateString('fr-FR') : 'En attente'}
                        </Text>
                      </View>
                    ))}

                    {!detail.examens?.length && <Text style={styles.noEx}>Aucun examen pour ce dossier.</Text>}
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
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FF980022', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  date: { color: '#78909C', fontSize: 12, marginTop: 2 },
  detail: { backgroundColor: '#0A2342', padding: 14, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  detailRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  detailLabel: { color: '#78909C', fontSize: 13, fontWeight: '600' },
  detailVal: { color: '#CFD8DC', fontSize: 13 },
  examenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  examenTitle: { color: '#4FC3F7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  addExamenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addExamenText: { color: '#4FC3F7', fontSize: 12 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  exName: { flex: 1, color: '#CFD8DC', fontSize: 13 },
  exDate: { color: '#78909C', fontSize: 11 },
  noEx: { color: '#546E7A', fontSize: 13 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
});