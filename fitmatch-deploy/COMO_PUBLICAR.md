# Cómo publicar FitMatch con el chat de IA funcionando de verdad

Esta versión ya no depende del entorno de Claude: usa tu propia API key de Anthropic
a través de una función que corre en el servidor de Netlify (nunca en el celular de
tus amigos, así que la key nunca queda expuesta).

## Parte 1 — Consigue tu API key de Anthropic

1. Entra a **console.anthropic.com** y crea una cuenta (te pedirá verificar tu
   número de teléfono).
2. Ve a **Billing** y agrega un método de pago. Las cuentas nuevas suelen recibir
   un crédito de prueba pequeño (unos dólares), pero no es un plan gratis
   permanente: pasado ese crédito, se cobra por uso (por token). Revisa el saldo
   directo en la consola, esa cifra cambia con el tiempo.
3. En la misma página de Billing, **pon un límite de gasto mensual** (spend limit).
   Esto es importante: evita que un uso inesperado de tus amigos te genere un
   cobro sorpresa.
4. Ve a **API Keys → Create Key**, ponle un nombre (ej. "fitmatch") y cópiala.
   Solo se muestra una vez — guárdala en un lugar seguro.

Como referencia de costo: con Claude Sonnet 5, cada mensaje de chat típico
(una respuesta corta) cuesta una fracción de centavo. Para probarlo con un grupo
de amigos durante unos días, unos cuantos dólares de saldo alcanzan de sobra.

## Parte 2 — Sube el proyecto a GitHub (sin usar la terminal)

1. Crea una cuenta gratis en **github.com** si no tienes una.
2. Click en **New repository**. Ponle un nombre (ej. `fitmatch`) y créalo,
   puede ser público o privado, no importa.
3. Dentro del repo, click en **Add file → Upload files**, y arrastra estos tres
   archivos/carpetas tal cual están:
   - `index.html`
   - `netlify.toml`
   - `netlify/functions/chat.js` (mantén esa misma ruta de carpetas)
4. Dale **Commit changes**.

## Parte 3 — Publica en Netlify

1. Crea una cuenta gratis en **netlify.com** (puedes entrar con tu cuenta de GitHub).
2. Click en **Add new site → Import an existing project**.
3. Elige **GitHub**, autoriza el acceso, y selecciona el repositorio que acabas
   de crear.
4. Netlify va a detectar solo el `netlify.toml`. Dale **Deploy site**.
5. Una vez desplegado, ve a **Site configuration → Environment variables** y
   agrega una variable:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: la key que copiaste en la Parte 1
6. Ve a la pestaña **Deploys** y dale **Trigger deploy → Deploy site** de nuevo,
   para que la función tome en cuenta la nueva variable.
7. Netlify te da una URL pública tipo `https://tu-proyecto.netlify.app`. Ese es
   el link que le compartes a tus amigos — funciona igual en cualquier celular,
   sin instalar nada.

## Si algo no funciona

- Si el chat de Desahogo responde "se me fue la conexión": revisa que la
  variable `ANTHROPIC_API_KEY` esté bien escrita (sin espacios) y que hayas
  vuelto a desplegar después de agregarla.
- Si ves un error 402 o "billing_error" en los logs de la función (Netlify →
  pestaña Functions → chat → Logs): significa que se acabó tu saldo en
  Anthropic. Solo hay que cargar más en console.anthropic.com.
- Las pestañas Descubre y Matches funcionan siempre, sin importar la API key,
  porque son datos de ejemplo que corren solo en el navegador.
