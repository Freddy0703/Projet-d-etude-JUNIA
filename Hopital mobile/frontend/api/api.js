// ============================================================
// api/api.js - Hôpital Moulaye Abdellah
// Fichier central pour tous les appels API
// Remplacez NGROK_URL par l'URL ngrok active
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 REMPLACEZ PAR VOTRE URL NGROK :
// ex: https://abc123.ngrok-free.app
export const BASE_URL = 'https://2bb8-160-178-225-152.ngrok-free.app';

// Récupère le token JWT stocké
const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

// Headers avec token
const authHeaders = async (isMultipart = false) => {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  return headers;
};

// Gestion centralisée des erreurs
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }
  return data;
};

// ========================
// 🔐 AUTH
// ========================
export const apiLogin = async (login, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  return handleResponse(res);
};

export const apiLogout = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers,
  });
  return handleResponse(res);
};

export const apiMe = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/auth/me`, { headers });
  return handleResponse(res);
};

export const apiChangePassword = async (ancienPassword, nouveauPassword) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ancienPassword, nouveauPassword }),
  });
  return handleResponse(res);
};

// ========================
// 👥 PATIENTS
// ========================
export const apiGetPatients = async (search = '') => {
  const headers = await authHeaders();
  const url = search
    ? `${BASE_URL}/api/patients?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/api/patients`;
  const res = await fetch(url, { headers });
  return handleResponse(res);
};

export const apiGetPatient = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, { headers });
  return handleResponse(res);
};

export const apiCreatePatient = async (data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/patients`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiUpdatePatient = async (id, data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiDeletePatient = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/patients/${id}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(res);
};

// ========================
// 📁 DOSSIERS
// ========================
export const apiGetDossiers = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/dossiers`, { headers });
  return handleResponse(res);
};

export const apiGetDossier = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/dossiers/${id}`, { headers });
  return handleResponse(res);
};

export const apiGetDossiersByPatient = async (idPatient) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/dossiers/patient/${idPatient}`, { headers });
  return handleResponse(res);
};

export const apiCreateDossier = async (idPatient) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/dossiers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ idPatient }),
  });
  return handleResponse(res);
};

export const apiDeleteDossier = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/dossiers/${id}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(res);
};

// ========================
// 🔬 EXAMENS
// ========================
export const apiGetExamens = async (idDossier = null) => {
  const headers = await authHeaders();
  const url = idDossier
    ? `${BASE_URL}/api/examens?idDossier=${idDossier}`
    : `${BASE_URL}/api/examens`;
  const res = await fetch(url, { headers });
  return handleResponse(res);
};

export const apiCreateExamen = async (data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/examens`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiUpdateExamen = async (id, data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/examens/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiDeleteExamen = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/examens/${id}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(res);
};

// ========================
// 👤 UTILISATEURS
// ========================
export const apiGetUtilisateurs = async (role = null) => {
  const headers = await authHeaders();
  const url = role
    ? `${BASE_URL}/api/utilisateurs?role=${role}`
    : `${BASE_URL}/api/utilisateurs`;
  const res = await fetch(url, { headers });
  return handleResponse(res);
};

export const apiGetUtilisateur = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs/${id}`, { headers });
  return handleResponse(res);
};

export const apiCreateUtilisateur = async (data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiUpdateUtilisateur = async (id, data) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiDeleteUtilisateur = async (id) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs/${id}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(res);
};

export const apiUpdatePhoto = async (id, imageUri) => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('photo', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `photo_${id}.jpg`,
  });

  const res = await fetch(`${BASE_URL}/api/utilisateurs/${id}/photo`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  return handleResponse(res);
};

export const apiGetHistorique = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs/historique`, { headers });
  return handleResponse(res);
};

export const apiGetConnectes = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/utilisateurs/connectes`, { headers });
  return handleResponse(res);
};

// Construire l'URL de la photo de profil
export const getPhotoUrl = (photoProfil) => {
  if (!photoProfil || photoProfil === 'default.png') {
    return null; // Utiliser l'image locale default.png
  }
  return `${BASE_URL}/uploads/${photoProfil}`;
};