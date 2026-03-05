import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { apiGetPatients, apiGetUtilisateurs } from '../../api/api';
import { useNavigation } from '@react-navigation/native';

export default function SecretaireDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({ patients: 0, medecins: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [patients, medecins] = await Promise.all([
        apiGetPatients(),
        apiGetUtilisateurs('Medecin'),
      ]);
      setStats({ patients: patients.length, medecins: medecins.length });
    } catch (e) {}
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Dashboard Secrétaire" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#4FC3F7" />}
      >
        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeText}>Bonjour, {user?.prenom} 👋</Text>
            <Text style={styles.welcomeSub}>Espace Secrétariat</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#2196F3' }]} onPress={() => navigation.navigate('Patients')}>
            <Ionicons name="people" size={28} color="#2196F3" />
            <Text style={styles.statValue}>{stats.patients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: '#4CAF50' }]} onPress={() => navigation.navigate('Medecins')}>
            <Ionicons name="medkit" size={28} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.medecins}</Text>
            <Text style={styles.statLabel}>Médecins</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          {[
            { icon: 'person-add-outline', label: 'Ajouter patient', screen: 'Patients', color: '#2196F3' },
            { icon: 'people-outline', label: 'Liste patients', screen: 'Patients', color: '#00BCD4' },
            { icon: 'medkit-outline', label: 'Médecins', screen: 'Medecins', color: '#4CAF50' },
            { icon: 'person-outline', label: 'Mon profil', screen: 'Profil', color: '#FF9800' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen)}>
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
  welcome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF980033', borderRadius: 16, padding: 16, marginBottom: 20 },
  welcomeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcomeSub: { color: '#FFCC80', fontSize: 13, marginTop: 4 },
  logo: { width: 48, height: 48, borderRadius: 24 },
  sectionTitle: { color: '#B0BEC5', fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#132F4C', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderLeftWidth: 4 },
  statValue: { color: '#fff', fontSize: 26, fontWeight: '800' },
  statLabel: { color: '#78909C', fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  actionBtn: { width: '47%', backgroundColor: '#132F4C', borderRadius: 14, padding: 16, alignItems: 'center', gap: 8 },
  actionLabel: { color: '#CFD8DC', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  footer: { color: '#37474F', fontSize: 11, textAlign: 'center', marginBottom: 20 },
});