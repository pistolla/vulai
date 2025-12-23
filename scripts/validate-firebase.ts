import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToValidate = [
  'leagues',
  'users',
  'home',
  'sports',
  'teams',
  'universities',
  'schedule',
  'admin',
  'merchandise',
  'reviews',
  'games'
];

async function validate() {
  console.log('--- Starting Firebase Data Validation ---');
  
  for (const colName of collectionsToValidate) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        console.warn(`[WARNING] Collection "${colName}" is empty.`);
      } else {
        console.log(`[OK] Collection "${colName}" has ${snapshot.size} documents.`);
        // Basic structure check for the first doc
        const firstDoc = snapshot.docs[0].data();
        console.log(`     Example keys in "${colName}":`, Object.keys(firstDoc).join(', '));
      }
    } catch (error) {
      console.error(`[ERROR] Failed to fetch collection "${colName}":`, (error as Error).message);
    }
  }

  // Check specific documents if needed
  const specificDocs = [
    { coll: 'home', id: 'main' },
    { coll: 'admin', id: 'dashboard' }
  ];

  for (const item of specificDocs) {
    try {
      const docRef = doc(db, item.coll, item.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        console.log(`[OK] Document "${item.coll}/${item.id}" exists.`);
      } else {
        console.error(`[ERROR] Document "${item.coll}/${item.id}" is missing!`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to fetch document "${item.coll}/${item.id}":`, (error as Error).message);
    }
  }

  console.log('--- Validation Complete ---');
}

validate().catch(console.error);
