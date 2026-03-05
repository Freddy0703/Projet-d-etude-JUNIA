import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { apiGetHistorique, apiGetConnectes } from '../../api/api';

export default function AdminHistorique() {
  const [historique, setHistorique] = useState([]);
  const [connectes, setConnectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [hist, conn] = await Promise.all([apiGetHistorique(), apiGetConnectes()]);
      setHistorique(hist);
      setConnectes(conn);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Historique des Connexions" />
      <View style={styles.container}>
        {/* En ligne */}
        <View style={styles.onlineSection}>
          <View style={styles.onlineHeader}>
            <View style={styles.dot} />
            <Text style={styles.onlineTitle}>{connectes.length} utilisateur(s) en ligne</Text>
          </View>
          {connectes.map((u) => (
            <View key={u.idUser} style={styles.onlineUser}>
              <Text style={styles.onlineUserName}>{u.prenom} {u.nom}</Text>
              <Text style={styles.onlineUserRole}>{u.role}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Dernières activités</Text>

        {loading ? (
          <ActivityIndicator color="#4FC3F7" size="large" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={historique}
            keyExtractor={(item) => item.idHistorique.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#4FC3F7" />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[
                  styles.actionIcon,
                  { backgroundColor: item.action === 'Connexion' ? '#4CAF5022' : '#EF535022' }
                ]}>
                  <Ionicons
                    name={item.action === 'Connexion' ? 'log-in-outline' : 'log-out-outline'}
                    size={18}
                    color={item.action === 'Connexion' ? '#4CAF50' : '#EF5350'}
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{item.prenom} {item.nom}</Text>
                  <Text style={styles.rowRole}>{item.role}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={[
                    styles.actionText,
                    { color: item.action === 'Connexion' ? '#4CAF50' : '#EF5350' }
                  ]}>
                    {item.action}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(item.dateAction).toLocaleString('fr-FR')}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun historique.</Text>}
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
  onlineSection: { backgroundColor: '#132F4C', borderRadius: 14, padding: 14, marginBottom: 16 },
  onlineHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  onlineTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  onlineUser: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  onlineUserName: { color: '#CFD8DC', fontSize: 13 },
  onlineUserRole: { color: '#78909C', fontSize: 12 },
  sectionTitle: { color: '#B0BEC5', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#132F4C', borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  rowRole: { color: '#78909C', fontSize: 11 },
  rowRight: { alignItems: 'flex-end' },
  actionText: { fontSize: 12, fontWeight: '700' },
  dateText: { color: '#546E7A', fontSize: 10, marginTop: 2 },
  empty: { color: '#546E7A', textAlign: 'center', marginTop: 40 },
});