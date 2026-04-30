import 'dotenv/config';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyC--23sq1fWH8F42pRPTF7T590Jzut54Fw",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "scale-with-pritij.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "scale-with-pritij",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "scale-with-pritij.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "858554016676",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:858554016676:web:74ab1c4569f680919e9731"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BUCKET_DIR = '/Users/priti/Downloads/chorequest_-fun-family-chores/bucket';

if (!fs.existsSync(BUCKET_DIR)) {
  fs.mkdirSync(BUCKET_DIR, { recursive: true });
}

async function downloadCollection(collectionPath: string, fileName: string) {
  console.log(`Downloading collection: ${collectionPath}...`);
  try {
    const snapshot = await getDocs(collection(db, collectionPath));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    fs.writeFileSync(path.join(BUCKET_DIR, fileName), JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} documents to ${fileName}`);
    return data;
  } catch (error) {
    console.error(`Error downloading ${collectionPath}:`, error);
    return [];
  }
}

async function run() {
  // Download invites
  await downloadCollection('invites', 'invites.json');

  // Download families
  const families = await downloadCollection('families', 'families.json');

  // Download subcollections for each family
  for (const family of families) {
    const familyId = family.id;
    const familyDir = path.join(BUCKET_DIR, 'families', familyId);
    if (!fs.existsSync(familyDir)) {
      fs.mkdirSync(familyDir, { recursive: true });
    }

    await downloadCollection(`families/${familyId}/users`, `families/${familyId}/users.json`);
    await downloadCollection(`families/${familyId}/quests`, `families/${familyId}/quests.json`);
    await downloadCollection(`families/${familyId}/rewards`, `families/${familyId}/rewards.json`);
  }

  console.log('Download complete!');
}

run().catch(console.error);
