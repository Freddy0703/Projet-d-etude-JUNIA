import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const getNavItems = (role) => {
  switch (role) {
    case 'Administrateur':
      return [
        { name: 'Dashboard', icon: 'grid-outline', label: 'Accueil' },
        { name: 'Patients', icon: 'people-outline', label: 'Patients' },
        { name: 'Utilisateurs', icon: 'shield-outline', label: 'Utilisateurs' },
        { name: 'Historique', icon: 'time-outline', label: 'Historique' },
        { name: 'Parametres', icon: 'settings-outline', label: 'Paramètres' },
      ];
    case 'Secretaire':
      return [
        { name: 'Dashboard', icon: 'grid-outline', label: 'Accueil' },
        { name: 'Patients', icon: 'people-outline', label: 'Patients' },
        { name: 'Medecins', icon: 'medkit-outline', label: 'Médecins' },
        { name: 'Profil', icon: 'person-outline', label: 'Profil' },
        { name: 'Parametres', icon: 'settings-outline', label: 'Paramètres' },
      ];
    case 'Medecin':
      return [
        { name: 'Dashboard', icon: 'grid-outline', label: 'Accueil' },
        { name: 'Patients', icon: 'people-outline', label: 'Patients' },
        { name: 'Dossiers', icon: 'folder-outline', label: 'Dossiers' },
        { name: 'Profil', icon: 'person-outline', label: 'Profil' },
        { name: 'Parametres', icon: 'settings-outline', label: 'Paramètres' },
      ];
    default:
      return [];
  }
};

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const items = getNavItems(user?.role);
  const currentScreen = route.name;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = currentScreen === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.item}
            onPress={() => navigation.navigate(item.name)}
          >
            <Ionicons
              name={isActive ? item.icon.replace('-outline', '') : item.icon}
              size={22}
              color={isActive ? '#4FC3F7' : '#78909C'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#132F4C',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    color: '#78909C',
    marginTop: 3,
    fontWeight: '500',
  },
  labelActive: {
    color: '#4FC3F7',
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4FC3F7',
  },
});