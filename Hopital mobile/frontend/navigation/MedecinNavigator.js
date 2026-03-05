import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../components/Drawer';

import MedecinDashboard from '../screens/medecin/MedecinDashboard';
import MedecinPatients from '../screens/medecin/MedecinPatients';
import MedecinDossiers from '../screens/medecin/MedecinDossiers';
import MedecinExamens from '../screens/medecin/MedecinExamens';
import ProfilScreen from '../screens/shared/ProfilScreen';
import ParametresScreen from '../screens/shared/ParametresScreen';

const Drawer = createDrawerNavigator();

export default function MedecinNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen name="Dashboard" component={MedecinDashboard} />
      <Drawer.Screen name="Patients" component={MedecinPatients} />
      <Drawer.Screen name="Dossiers" component={MedecinDossiers} />
      <Drawer.Screen name="Examens" component={MedecinExamens} />
      <Drawer.Screen name="Profil" component={ProfilScreen} />
      <Drawer.Screen name="Parametres" component={ParametresScreen} />
    </Drawer.Navigator>
  );
}