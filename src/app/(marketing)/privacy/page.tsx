import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad", description: "Qué datos guarda Improve My Languages, para qué y cómo controlarlos." };

export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Aviso de privacidad</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: septiembre de 2026 · Borrador pendiente de revisión jurídica</p>
      <div className="mt-8 space-y-6 leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_p]:text-muted [&_li]:text-muted">
        <section>
          <h2>Qué datos guardamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cuenta: correo electrónico y, si usas Google, tu nombre.</li>
            <li>Perfil de aprendizaje: idiomas, nivel estimado, objetivos, intereses y preferencias que tú indicas.</li>
            <li>Actividad educativa: respuestas a ejercicios, errores, tiempo de estudio y conversaciones con el tutor.</li>
          </ul>
          <p className="mt-2">No guardamos datos que no sirvan para enseñarte mejor. No vendemos datos ni mostramos publicidad.</p>
        </section>
        <section>
          <h2>Para qué</h2>
          <p>Exclusivamente para personalizar tu aprendizaje: estimar tu nivel, programar repasos, detectar errores recurrentes y recomendarte qué estudiar.</p>
        </section>
        <section>
          <h2>Inteligencia artificial</h2>
          <p>Si activas el tutor de IA, los mensajes que escribes al tutor y un resumen de tu perfil de aprendizaje (nivel, intereses, errores recientes; nunca tu correo) se envían al proveedor de IA configurado para generar respuestas. Los proveedores con capa gratuita pueden usar esos datos para mejorar sus servicios; por eso el tutor está desactivado hasta que das tu consentimiento, y puedes retirarlo en Configuración.</p>
        </section>
        <section>
          <h2>Tus derechos</h2>
          <p>Desde Configuración puedes <strong className="text-text">descargar todos tus datos</strong> en formato JSON y <strong className="text-text">eliminar tu cuenta</strong> con todos sus datos de forma permanente. Estos controles pretenden facilitar los derechos de acceso, rectificación, cancelación y oposición (ARCO) previstos en la legislación mexicana de protección de datos personales y, cuando aplique, los del RGPD europeo.</p>
        </section>
        <section>
          <h2>Seguridad</h2>
          <p>Conexiones cifradas (HTTPS), contraseñas gestionadas por nuestro proveedor de autenticación (nunca las vemos), base de datos no accesible públicamente y claves de servicio sólo en el servidor.</p>
        </section>
        <section>
          <h2>Aviso</h2>
          <p>Este texto es un borrador informativo y no constituye asesoría legal ni una declaración de cumplimiento normativo. Debe revisarlo una persona profesional del derecho antes de ofrecer el servicio al público.</p>
        </section>
      </div>
    </article>
  );
}
