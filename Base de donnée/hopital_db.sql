-- Création de la base de données
CREATE DATABASE IF NOT EXISTS hopital_db;
USE hopital_db;

-- Table des Patients
CREATE TABLE Patient (
    idPatient INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INT,
    tel VARCHAR(20),
    sexe ENUM('Homme','Femme') NOT NULL,
    nationalite VARCHAR(100)
);

-- Table des Dossiers Médicaux
CREATE TABLE Dossier (
    idDossier INT AUTO_INCREMENT PRIMARY KEY,
    dateCreation DATE NOT NULL,
    idPatient INT NOT NULL,
    FOREIGN KEY (idPatient) REFERENCES Patient(idPatient) ON DELETE CASCADE
);

-- Table des Examens
CREATE TABLE Examen (
    idExamen INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    dateResultat DATE,
    idDossier INT NOT NULL,
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier) ON DELETE CASCADE
);

-- Table des Utilisateurs
CREATE TABLE Utilisateur (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    login VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Administrateur','Secretaire','Medecin') NOT NULL,
    statut ENUM('En ligne','Hors ligne') DEFAULT 'Hors ligne',
    dateConnexion DATETIME,
    dateDeconnexion DATETIME,
    photoProfil VARCHAR(255) DEFAULT 'default.png'
);

-- Table Historique Connexions
CREATE TABLE HistoriqueConnexion (
    idHistorique INT AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    action ENUM('Connexion','Deconnexion') NOT NULL,
    dateAction DATETIME NOT NULL,
    FOREIGN KEY (idUser) REFERENCES Utilisateur(idUser) ON DELETE CASCADE
);

-- Insertion du premier administrateur avec hash PHP ($2y$)
INSERT INTO Utilisateur (prenom, nom, login, password, role, statut, photoProfil)
VALUES ('', '', '',
        '$2y$10$1OwQLuhFkoW2oJ6T6k9vi.0Oy6ZVfyipTSaFA8k0bJ.43HMVVuODa', -- mot de passe : hopital123 --
        'Administrateur', 'Hors ligne', 'default.png');
