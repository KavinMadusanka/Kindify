// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore }from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, 
//   authDomain: "kindify-caa09.firebaseapp.com",
//   projectId: "kindify-caa09",
//   storageBucket: "kindify-caa09.appspot.com",
//   messagingSenderId: "290288568723",
//   appId: "1:290288568723:web:324596c5ea06036cfb4066"
// };
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "kindify-9ba49.firebaseapp.com",
  projectId: "kindify-9ba49",
  storageBucket: "kindify-9ba49.appspot.com",
  messagingSenderId: "878347969450",
  appId: "1:878347969450:web:e0c63fa5a9c8fea9f3c1d3",
  measurementId: "G-4Y9XM91CR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)