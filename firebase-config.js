// ══════════════════════════════════════════════════
// إعدادات Firebase — عدّل القيم دي بقيم مشروعك
// ══════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// تهيئة Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db      = firebase.firestore();
const storage = firebase.storage();
const auth    = firebase.auth();

// Collections
const COLLECTIONS = {
  products: 'products',
  orders:   'orders',
  settings: 'settings',
  categories: 'categories'
};
