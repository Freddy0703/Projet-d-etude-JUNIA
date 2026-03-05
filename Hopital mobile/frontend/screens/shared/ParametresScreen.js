import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { apiChangePassword } from '../../api/api';

export default function ParametresScreen() {
  const { user, logout } = useAuth();
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      return Alert.alert('Erreur', 'Tous les champs sont requis.');
    }
    if (newPwd !== confirmPwd) {
      return Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
    }
    if (newPwd.length < 6) {
      return Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.');
    }
    setLoading(true);
    try {
      await apiChangePassword(oldPwd, newPwd);
      Alert.alert('Succès', 'Mot de passe modifié avec succès.');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const PwdField = ({ label, value, onChange, show, toggle }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pwdWrapper}>
        <Ionicons name="lock-closed-outline" size={18} color="#4FC3F7" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.pwdInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor="#546E7A"
        />
        <TouchableOpacity onPress={toggle}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#78909C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Paramètres" />
      <ScrollView style={styles.scroll}>
        {/* Infos utilisateur */}
        <View style={styles.userCard}>
          <Ionicons name="person-circle-outline" size={40} color="#4FC3F7" />
          <View>
            <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
            <Text style={styles.userLogin}>@{user?.login} • {user?.role}</Text>
          </View>
        </View>

        {/* Changer mot de passe */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key-outline" size={20} color="#4FC3F7" />
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
          </View>

          <PwdField
            label="Ancien mot de passe"
            value={oldPwd}
            onChange={setOldPwd}
            show={showOld}
            toggle={() => setShowOld(!showOld)}
          />
          <PwdField
            label="Nouveau mot de passe"
            value={newPwd}
            onChange={setNewPwd}
            show={showNew}
            toggle={() => setShowNew(!showNew)}
          />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Confirmer le nouveau mot de passe</Text>
            <View style={styles.pwdWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#4FC3F7" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.pwdInput}
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#546E7A"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePwd} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Enregistrer le mot de passe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Mot de passe oublié */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Mot de passe oublié ?</Text>
          </View>
          <Text style={styles.forgotDesc}>
            Contactez l'administrateur pour réinitialiser votre mot de passe.
          </Text>
          <TouchableOpacity
            style={styles.mailBtn}
            onPress={() => Linking.openURL('mailto:adminhopitalMoulayeAbdellah@gmail.com?subject=Réinitialisation mot de passe')}
          >
            <Ionicons name="mail-outline" size={18} color="#fff" />
            <Text style={styles.mailBtnText}>Contacter l'administrateur</Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF5350" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2026 Hôpital Moulaye Abdellah{'\n'}Tous droits réservés</Text>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A2342' },
  scroll: { flex: 1, padding: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#132F4C', borderRadius: 16, padding: 16, marginBottom: 16 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userLogin: { color: '#78909C', fontSize: 12, marginTop: 2 },
  section: { backgroundColor: '#132F4C', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#B0BEC5', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  pwdWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A2342', borderRadius: 12, paddingHorizontal: 14, height: 48 },
  pwdInput: { flex: 1, color: '#fff', fontSize: 15 },
  saveBtn: { backgroundColor: '#1565C0', borderRadius: 14, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  forgotDesc: { color: '#78909C', fontSize: 13, marginBottom: 14, lineHeight: 20 },
  mailBtn: { backgroundColor: '#FF980022', borderWidth: 1, borderColor: '#FF9800', borderRadius: 14, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mailBtnText: { color: '#FF9800', fontWeight: '700', fontSize: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50 },
  logoutText: { color: '#EF5350', fontSize: 16, fontWeight: '700' },
  footer: { color: '#37474F', fontSize: 11, textAlign: 'center', marginVertical: 20, lineHeight: 18 },
});