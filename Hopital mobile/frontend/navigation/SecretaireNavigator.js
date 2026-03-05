import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../components/Drawer';

import SecretaireDashboard from '../screens/secretaire/SecretaireDashboard';
import SecretairePatients from '../screens/secretaire/SecretairePatients';
import SecretaireMedecins from '../screens/secretaire/SecretaireMedecins';
import ProfilScreen from '../screens/shared/ProfilScreen';
import ParametresScreen from '../screens/shared/ParametresScreen';

const Drawer = createDrawerNavigator();

export default function SecretaireNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen name="Dashboard" component={SecretaireDashboard} />
      <Drawer.Screen name="Patients" component={SecretairePatients} />
      <Drawer.Screen name="Medecins" component={SecretaireMedecins} />
      <Drawer.Screen name="Profil" component={ProfilScreen} />
      <Drawer.Screen name="Parametres" component={ParametresScreen} />
    </Drawer.Navigator>
  );
}