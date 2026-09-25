import { firebaseWebConfig } from "@/lib/firebase/config";

/**
 * Service worker de Firebase Cloud Messaging, generado desde las variables de
 * entorno (un archivo en /public no puede leerlas). Debe servirse en la raíz
 * para que su scope cubra toda la app.
 */
export const dynamic = "force-static";

const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/12.3.0";

export function GET() {
  const js = `importScripts("${FIREBASE_SDK}/firebase-app-compat.js");
importScripts("${FIREBASE_SDK}/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(firebaseWebConfig)});
// Las notificaciones con "notification" las muestra el SDK automáticamente en segundo plano.
firebase.messaging();
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification && event.notification.data.FCM_MSG.notification.click_action) || "/app";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) { c.navigate(link); return c.focus(); } }
    return clients.openWindow(link);
  }));
});
`;
  return new Response(js, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "service-worker-allowed": "/",
    },
  });
}
