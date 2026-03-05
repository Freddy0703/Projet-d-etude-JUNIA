import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/api';
import { useNavigation } from '@react-navigation/native';

const roleColor = (role) => {
  switch (role) {
    case 'Administrateur': return '#F44336';
    case 'Secretaire': return '#FF9800';
    case 'Medecin': return '#4CAF50';
    default: return '#78909C';
  }
};

const menuItems = (role) => {
  const common = [
    { icon: 'person-outline', label: 'Mon Profil', screen: 'Profil' },
    { icon: 'settings-outline', label: 'Paramètres', screen: 'Parametres' },
  ];
  const byRole = {
    Administrateur: [
      { icon: 'grid-outline', label: 'Dashboard', screen: 'Dashboard' },
      { icon: 'people-outline', label: 'Patients', screen: 'Patients' },
      { icon: 'shield-outline', label: 'Utilisateurs', screen: 'Utilisateurs' },
      { icon: 'folder-outline', label: 'Dossiers', screen: 'Dossiers' },
      { icon: 'time-outline', label: 'Historique', screen: 'Historique' },
    ],
    Secretaire: [
      { icon: 'grid-outline', label: 'Dashboard', screen: 'Dashboard' },
      { icon: 'people-outline', label: 'Patients', screen: 'Patients' },
      { icon: 'medkit-outline', label: 'Médecins', screen: 'Medecins' },
    ],
    Medecin: [
      { icon: 'grid-outline', label: 'Dashboard', screen: 'Dashboard' },
      { icon: 'people-outline', label: 'Patients', screen: 'Patients' },
      { icon: 'folder-outline', label: 'Dossiers', screen: 'Dossiers' },
      { icon: 'flask-outline', label: 'Examens', screen: 'Examens' },
    ],
  };
  return [...(byRole[role] || []), ...common];
};

export default function CustomDrawer() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const photoUri = user?.photoProfil && user.photoProfil !== 'default.png'
    ? `${BASE_URL}/uploads/${user.photoProfil}`
    : null;

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const items = menuItems(user?.role);

  return (
    <View style={styles.container}>
      {/* En-tête drawer */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.hospitalName}>Hôpital Moulaye{'\n'}Abdellah</Text>
      </View>

      {/* Info utilisateur */}
      <View style={styles.userInfo}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <Image source={require('../assets/default.png')} style={styles.avatar} />
        )}
        <View>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor(user?.role) + '22' }]}>
            <Text style={[styles.roleText, { color: roleColor(user?.role) }]}>{user?.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu items */}
      <ScrollView style={styles.menuList}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => { navigation.navigate(item.screen); }}
          >
            <Ionicons name={item.icon} size={20} color="#4FC3F7" />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Déconnexion */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF5350" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        <Text style={styles.copyright}>© 2026 Hôpital Moulaye Abdellah</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2342',
  },
  header: {
    backgroundColor: '#1565C0',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  hospitalName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#132F4C',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4FC3F7',
  },
  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E3A5F',
    marginVertical: 4,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuLabel: {
    color: '#CFD8DC',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  logoutText: {
    color: '#EF5350',
    fontSize: 15,
    fontWeight: '600',
  },
  copyright: {
    color: '#546E7A',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});