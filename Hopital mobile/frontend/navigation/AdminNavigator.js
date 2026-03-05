import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../components/Drawer';

import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminPatients from '../screens/admin/AdminPatients';
import AdminUtilisateurs from '../screens/admin/AdminUtilisateurs';
import AdminDossiers from '../screens/admin/AdminDossiers';
import AdminHistorique from '../screens/admin/AdminHistorique';
import ProfilScreen from '../screens/shared/ProfilScreen';
import ParametresScreen from '../screens/shared/ParametresScreen';

const Drawer = createDrawerNavigator();

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboard} />
      <Drawer.Screen name="Patients" component={AdminPatients} />
      <Drawer.Screen name="Utilisateurs" component={AdminUtilisateurs} />
      <Drawer.Screen name="Dossiers" component={AdminDossiers} />
      <Drawer.Screen name="Historique" component={AdminHistorique} />
      <Drawer.Screen name="Profil" component={ProfilScreen} />
      <Drawer.Screen name="Parametres" component={ParametresScreen} />
    </Drawer.Navigator>
  );
}