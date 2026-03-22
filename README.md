# Maternellea 🌸

Application mobile de santé féminine — cycle, grossesse, post-partum, bébé.

**Stack :** React Native CLI 0.76 · TypeScript strict · Zustand · React Navigation v7 · MMKV

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install --legacy-peer-deps

# 2. Lancer le bundler Metro
npm start

# 3. Lancer sur Android (device ou émulateur connecté)
npm run android
```

> **Prérequis locaux :** Node 18+, Java 17, Android SDK, un émulateur ou appareil connecté.

---

## Build automatique (GitHub Actions)

À chaque push sur `master`, le workflow **Android APK — Build & Release** :

1. Installe les dépendances npm
2. Scaffolde `android/` via React Native CLI (les dossiers natifs ne sont pas committiés)
3. Crée le bundle JS
4. Compile un APK signé en mode release
5. Publie l'APK dans une **GitHub Release** avec un tag `vANNÉE.MOIS.JOUR.HHMM`

### Configurer les secrets (une seule fois)

Dans **Settings → Secrets and variables → Actions** de votre dépôt :

| Secret | Description |
|--------|-------------|
| `KEYSTORE_BASE64` | Keystore encodé en Base64 (voir ci-dessous) |
| `KEY_ALIAS` | Alias de la clé dans le keystore |
| `KEY_PASSWORD` | Mot de passe de la clé |
| `STORE_PASSWORD` | Mot de passe du store (souvent identique à `KEY_PASSWORD`) |

#### Générer un keystore de signature

```bash
# 1. Créer le keystore (valable 27 ans)
keytool -genkey -v \
  -keystore maternellea.keystore \
  -alias maternellea \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# 2. Encoder en Base64 pour GitHub Secrets
# macOS :
base64 -i maternellea.keystore | pbcopy

# Linux :
base64 maternellea.keystore
# → copiez la sortie dans le secret KEYSTORE_BASE64
```

> ⚠️ **Conservez le fichier `.keystore` en lieu sûr.** Si vous le perdez, vous ne pourrez plus mettre à jour l'app sur le Play Store.

### Déclencher un build manuellement

Dans l'onglet **Actions** du dépôt → **Android APK — Build & Release** → **Run workflow**.

---

## Structure du projet

```
maternellea-v2/
├── src/
│   ├── App.tsx                     # Root component
│   ├── components/                 # Design system (Text, Button, Input…)
│   ├── constants/                  # Toutes les constantes centralisées
│   ├── features/
│   │   ├── advice/                 # Module conseils / articles
│   │   ├── auth/                   # Authentification
│   │   ├── calendar/               # Calendrier unifié
│   │   ├── cycle/                  # Suivi menstruel
│   │   ├── home/                   # Dashboard dynamique (3 phases)
│   │   ├── onboarding/             # Wizard premier lancement
│   │   ├── postpartum/             # Post-partum mère + bébé
│   │   ├── pregnancy/              # Grossesse
│   │   ├── profile/                # Profil & paramètres
│   │   └── vaccines/               # Calendrier vaccinal
│   ├── navigation/                 # Stacks et tabs React Navigation
│   ├── providers/                  # AppInitializer, ThemeProvider…
│   ├── services/
│   │   ├── notifications/          # NotificationService + schedulers
│   │   └── persistence/            # PersistenceService + seed
│   ├── store/                      # Zustand stores (auth, cycle, pregnancy…)
│   ├── theme/                      # Tokens de design
│   ├── types/                      # Modèles domaine + navigation
│   └── utils/                      # Helpers date, etc.
├── .github/
│   └── workflows/
│       └── android-release.yml    # Pipeline CI/CD
├── babel.config.js
├── index.js
├── package.json
└── tsconfig.json
```

---

## Compte démo

Au premier lancement, l'app se seed automatiquement avec un profil démo :

| Champ | Valeur |
|-------|--------|
| Email | `demo@maternellea.com` |
| Mot de passe | `Demo1234` |
| Profil | Camille, grossesse SA 22 |

---

## Architecture clés

| Couche | Technologie |
|--------|-------------|
| État global | Zustand + immer + MMKV persist |
| Formulaires | React Hook Form + Zod |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| Persistence | MMKV (sync, ~30× plus rapide qu'AsyncStorage) |
| Notifications | react-native-notifee (architecture swappable) |
| Dates | date-fns + locale fr |
| Graphiques | SVG pur (react-native-svg, sans dépendance chart externe) |
