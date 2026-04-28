import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBnUxS2jzMfRfJ9_O8R8qcsZVr8Jug9ARY",
  authDomain: "projects-a1f07.firebaseapp.com",
  projectId: "projects-a1f07",
  storageBucket: "projects-a1f07.firebasestorage.app",
  messagingSenderId: "120110451018",
  appId: "1:120110451018:web:23b6060a81eb9e501799b3",
  measurementId: "G-TBPN0CR1HM"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
