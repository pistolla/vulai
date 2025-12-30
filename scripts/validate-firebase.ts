import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

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
  'fixtures',
  'admin',
  'merchandise',
  'reviews',
  'games',
  'players'
];

const dataMappings: { [key: string]: { file: string; key: string; type: 'array' | 'object'; id?: string } } = {
  'sports': { file: 'sports.json', key: 'sports', type: 'array' },
  'teams': { file: 'teams.json', key: 'teams', type: 'array' },
  'universities': { file: 'universities.json', key: 'universities', type: 'array' },
  'schedule': { file: 'schedule.json', key: 'matches', type: 'array' },
  'fixtures': { file: 'schedule.json', key: 'matches', type: 'array' },
  'home': { file: 'home.json', key: 'stats', type: 'object', id: 'main' },
  'admin': { file: 'admin.json', key: 'dashboard', type: 'object', id: 'dashboard' },
  'users': { file: 'admin.json', key: 'users', type: 'array' },
  'merchandise': { file: 'admin.json', key: 'merchandise', type: 'array' },
  'reviews': { file: 'admin.json', key: 'reviews', type: 'array' },
  'players': { file: 'players.json', key: 'players', type: 'array' },
};

async function populateCollection(colName: string) {
  const mapping = dataMappings[colName];
  if (!mapping) {
    console.log(`No mapping for ${colName}, skipping population.`);
    return;
  }

  const filePath = path.join(__dirname, '..', 'public', 'data', mapping.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const items = data[mapping.key];

  if (mapping.type === 'array') {
    for (const item of items) {
      if (item.id) {
        await setDoc(doc(db, colName, item.id), item);
        console.log(`Added document ${item.id} to ${colName}`);
      } else {
        console.warn(`Item in ${colName} missing id:`, item);
      }
    }
  } else if (mapping.type === 'object') {
    await setDoc(doc(db, colName, mapping.id!), items);
    console.log(`Added document ${mapping.id} to ${colName}`);
  }
}

async function validate() {
  console.log('--- Starting Firebase Data Validation ---');
  
  for (const colName of collectionsToValidate) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        console.warn(`[WARNING] Collection "${colName}" is empty.`);
        await populateCollection(colName);
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
