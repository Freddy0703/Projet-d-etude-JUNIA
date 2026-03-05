import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL, apiUpdatePhoto } from '../../api/api';

const roleColor = { Administrateur: '#F44336', Secretaire: '#FF9800', Medecin: '#4CAF50' };

export default function ProfilScreen() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const photoUri = user?.photoProfil && user.photoProfil !== 'default.png'
    ? `${BASE_URL}/uploads/${user.photoProfil}`
    : null;

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission refusée', 'Accès à la galerie requis.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const data = await apiUpdatePhoto(user.idUser, result.assets[0].uri);
        await updateUser({ photoProfil: data.photoProfil });
        Alert.alert('Succès', 'Photo mise à jour.');
      } catch (e) {
        Alert.alert('Erreur', e.message);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Mon Profil" />
      <ScrollView style={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <Image source={require('../../assets/default.png')} style={styles.avatar} />
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={handleChangePhoto} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <View style={[styles.roleBadge, { backgroundColor: (roleColor[user?.role] || '#78909C') + '22' }]}>
            <Text style={[styles.roleText, { color: roleColor[user?.role] || '#78909C' }]}>
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>
          {[
            { icon: 'person-outline', label: 'Prénom', value: user?.prenom },
            { icon: 'person-outline', label: 'Nom', value: user?.nom },
            { icon: 'at-outline', label: 'Login', value: user?.login },
            { icon: 'shield-outline', label: 'Rôle', value: user?.role },
            { icon: 'ellipse-outline', label: 'Statut', value: user?.statut },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={item.icon} size={18} color="#4FC3F7" />
              </View>
              <View>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value || 'N/A'}</Text>
              </View>
            </View>
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
  scroll: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#1565C0' },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#4FC3F7' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#1565C0', width: 32, height: 32,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#4FC3F7',
  },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleText: { fontSize: 13, fontWeight: '700' },
  card: { margin: 16, backgroundColor: '#132F4C', borderRadius: 16, padding: 16 },
  cardTitle: { color: '#B0BEC5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: '#78909C', fontSize: 11, fontWeight: '600' },
  infoValue: { color: '#fff', fontSize: 15, marginTop: 2 },
  footer: { color: '#37474F', fontSize: 11, textAlign: 'center', margin: 20 },
});