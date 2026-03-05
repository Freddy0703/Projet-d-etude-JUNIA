import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/api';

export default function Header({ title }) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const photoUri = user?.photoProfil && user.photoProfil !== 'default.png'
    ? `${BASE_URL}/uploads/${user.photoProfil}`
    : null;

  return (
    <View style={styles.header}>
      {/* Hamburger */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Ionicons name="menu" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Titre */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {/* Photo profil */}
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => navigation.navigate('Profil')}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <Image source={require('../assets/default.png')} style={styles.avatar} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1565C0',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuBtn: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  profileBtn: {
    marginLeft: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#4FC3F7',
  },
});