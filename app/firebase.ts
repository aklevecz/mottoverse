import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

if (process.env.NODE_ENV === "development") {
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectFunctionsEmulator(functions, "localhost", 5002);
  // auth.useEmulator("http://localhost:9099");
}

export const getWords = async () => {
  const wordsCol = collection(db, "Words");
  const wordSnapshot = await getDocs(wordsCol);
  const wordList = wordSnapshot.docs.map((doc) => doc.data());
  return wordList;
};

export const getMottos = async () => {
  const mottosCol = collection(db, "Mottos");
  const mottoSnapshot = await getDocs(mottosCol);
  const mottoList = mottoSnapshot.docs.map((doc) => doc.data());
  return mottoList;
};

export const getMotto = async (id: string) => {
  const mottoRef = doc(db, "Mottos", id);
  const mottoSnapshot = await getDoc(mottoRef);
  return mottoSnapshot.data();
};
