"use client";

import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDWE1yLqVd6vTfX3tmYgYWLqNnr614i2xQ",
  authDomain: "improve-my-lenguages.firebaseapp.com",
  projectId: "improve-my-lenguages",
  storageBucket: "improve-my-lenguages.firebasestorage.app",
  messagingSenderId: "1034238311541",
  appId: "1:1034238311541:web:f41dce05973c99461e0c3c",
  measurementId: "G-KQT1PB2ERD",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getAnalytics(firebaseApp);
}
