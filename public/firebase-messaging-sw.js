importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDWE1yLqVd6vTfX3tmYgYWLqNnr614i2xQ',
  authDomain: 'improve-my-lenguages.firebaseapp.com',
  projectId: 'improve-my-lenguages',
  storageBucket: 'improve-my-lenguages.firebasestorage.app',
  messagingSenderId: '1034238311541',
  appId: '1:1034238311541:web:f41dce05973c99461e0c3c',
  measurementId: 'G-KQT1PB2ERD'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Improve My Languages';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación.',
    icon: '/icon.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
