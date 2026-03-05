import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { apiGetPatients, apiGetDossiers, apiGetExamens } from '../../api/api';
import { useNavigation } from '@react-navigation/native';

export default function MedecinDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({ patients: 0, dossiers: 0, examens: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [patients, dossiers, examens] = await Promise.all([
        apiGetPatients(), apiGetDossiers(), apiGetExamens(),
      ]);
      setStats({ patients: patients.length, dossiers: dossiers.length, examens: examens.length });
    } catch (e) {}
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Dashboard Médecin" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#4FC3F7" />}
      >
        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeText}>Dr. {user?.prenom} {user?.nom}</Text>
            <Text style={styles.welcomeSub}>Espace Médical</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsRow}>
          {[
            { icon: 'people', label: 'Patients', value: stats.patients, color: '#2196F3', screen: 'Patients' },
            { icon: 'folder', label: 'Dossiers', value: stats.dossiers, color: '#FF9800', screen: 'Dossiers' },
            { icon: 'flask', label: 'Examens', value: stats.examens, color: '#4CAF50', screen: 'Examens' },
          ].map((s) => (
            <TouchableOpacity key={s.label} style={[styles.statCard, { borderTopColor: s.color }]} onPress={() => navigation.navigate(s.screen)}>
              <Ionicons name={s.icon} size={24} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          {[
            { icon: 'people-outline', label: 'Patients', screen: 'Patients', color: '#2196F3' },
            { icon: 'folder-open-outline', label: 'Dossiers', screen: 'Dossiers', color: '#FF9800' },
            { icon: 'flask-outline', label: 'Examens', screen: 'Examens', color: '#4CAF50' },
            { icon: 'person-outline', label: 'Mon profil', screen: 'Profil', color: '#00BCD4' },
          ].map((a) => (
            <TouchableOpacity key={a.screen} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen)}>
              <Ionicons name={a.icon} size={24} color={a.color} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.footer}>© 2026 Hôpital Moulaye Abdellah</Text>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A2342' },
  scroll: { flex: 1, padding: 16 },
  welcome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#4CAF5033', borderRadius: 16, padding: 16, marginBottom: 20 },
  welcomeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcomeSub: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  logo: { width: 48, height: 48, borderRadius: 24 },
  sectionTitle: { color: '#B0BEC5', fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#132F4C', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderTopWidth: 3 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#78909C', fontSize: 11 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  actionBtn: { width: '47%', backgroundColor: '#132F4C', borderRadius: 14, padding: 16, alignItems: 'center', gap: 8 },
  actionLabel: { color: '#CFD8DC', fontSize: 13, fontWeight: '600' },
  footer: { color: '#37474F', fontSize: 11, textAlign: 'center', marginBottom: 20 },
});