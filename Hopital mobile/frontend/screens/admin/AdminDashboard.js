import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { apiGetPatients, apiGetUtilisateurs, apiGetConnectes, apiGetDossiers } from '../../api/api';
import { useNavigation } from '@react-navigation/native';

const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({ patients: 0, utilisateurs: 0, connectes: 0, dossiers: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const [patients, utilisateurs, connectes, dossiers] = await Promise.all([
        apiGetPatients(),
        apiGetUtilisateurs(),
        apiGetConnectes(),
        apiGetDossiers(),
      ]);
      setStats({
        patients: patients.length,
        utilisateurs: utilisateurs.length,
        connectes: connectes.length,
        dossiers: dossiers.length,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Dashboard Administrateur" />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4FC3F7" />}
      >
        {/* Bienvenue */}
        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeText}>Bonjour, {user?.prenom} 👋</Text>
            <Text style={styles.welcomeSub}>Tableau de bord Administrateur</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="people" label="Patients" value={stats.patients} color="#2196F3" onPress={() => navigation.navigate('Patients')} />
          <StatCard icon="shield" label="Utilisateurs" value={stats.utilisateurs} color="#9C27B0" onPress={() => navigation.navigate('Utilisateurs')} />
          <StatCard icon="wifi" label="En ligne" value={stats.connectes} color="#4CAF50" onPress={() => navigation.navigate('Historique')} />
          <StatCard icon="folder" label="Dossiers" value={stats.dossiers} color="#FF9800" onPress={() => navigation.navigate('Dossiers')} />
        </View>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actions}>
          {[
            { icon: 'people-outline', label: 'Voir patients', screen: 'Patients', color: '#2196F3' },
            { icon: 'shield-outline', label: 'Utilisateurs', screen: 'Utilisateurs', color: '#9C27B0' },
            { icon: 'folder-outline', label: 'Dossiers', screen: 'Dossiers', color: '#FF9800' },
            { icon: 'time-outline', label: 'Historique', screen: 'Historique', color: '#00BCD4' },
          ].map((a) => (
            <TouchableOpacity
              key={a.screen}
              style={styles.actionBtn}
              onPress={() => navigation.navigate(a.screen)}
            >
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
  welcome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  welcomeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcomeSub: { color: '#90CAF9', fontSize: 13, marginTop: 4 },
  logo: { width: 48, height: 48, borderRadius: 24 },
  sectionTitle: { color: '#B0BEC5', fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%',
    backgroundColor: '#132F4C',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    elevation: 3,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#78909C', fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  actionBtn: {
    width: '47%',
    backgroundColor: '#132F4C',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: { color: '#CFD8DC', fontSize: 13, fontWeight: '600' },
  footer: { color: '#37474F', fontSize: 11, textAlign: 'center', marginBottom: 20 },
});