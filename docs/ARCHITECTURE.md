# Arquitectura y decisiones

## Versión 0.1

React y TypeScript con Vite para interfaz; servidor HTTP de Node para API. Se mantiene una sola área de trabajo sin usuarios ni pagos. El backend solo escucha en loopback durante desarrollo.

Los casos de prueba incluyen identificador, título, tipo, prioridad, pasos, resultado esperado y estado. El requisito y los casos se almacenan con esquema versionado en localStorage. La lectura valida la forma de los datos; un fallo de almacenamiento se informa para que el usuario exporte. CSV conserva caracteres especiales y neutraliza valores que una hoja de cálculo pudiera interpretar como fórmulas.

No se transmiten requisitos a servicios externos. React renderiza los textos como contenido, sin insertar HTML. La interfaz usa fuentes de Google; si no están disponibles, se utilizan fuentes del sistema.

## Contrato actual

- `GET /api/health`: `200`, `{status:"ok", aiConfigured:false, version:"0.1.0"}`.
- `POST /api/generate`: `501` con mensaje de función pendiente, sin generación ficticia.
- Rutas no implementadas: `404` con mensaje sencillo.

## Integración de IA prevista

El navegador enviará el requisito al backend. El servidor validará tamaño y estructura, aplicará límites y tiempo de espera, invocará al proveedor con una clave privada y validará una respuesta estructurada antes de devolverla. Los requisitos se tratarán como datos no confiables, nunca como instrucciones del sistema ni código ejecutable.

La salida incluirá pruebas positivas, negativas, de borde y preguntas de aclaración. Cada supuesto deberá quedar identificado y los resultados requerirán revisión humana. La aplicación no afirmará haber ejecutado las pruebas.

Antes de exposición pública: limitar peticiones y costo, restringir tamaño del cuerpo, configurar TLS y secretos, revisar acceso al endpoint y definir retención de datos con el proveedor. No se enviarán datos reales de pacientes ni secretos de proyectos para la demo.

## Límites conocidos

Sin API de IA, nube, colaboración, autenticación ni automatización de ejecución. Persistencia limitada a un navegador y origen. Una sola copia local; no ofrece control de concurrencia entre pestañas. El editor usa formularios nativos; falta endurecer gestión de foco para los diálogos antes de publicación.

## Integración local preparada · v0.2

El plan de integración anterior se implementó para desarrollo local: `server/ai.mjs` invoca Responses API con esquema estricto y vuelve a validar sus campos. La clave se carga desde `.env` con Node; no se serializa en respuestas ni logs. `POST /api/generate` acepta exclusivamente el requisito, sin claves, URL ni modelo desde el navegador. El proveedor está fijado a `https://api.openai.com/v1/responses`; el modelo se elige en configuración del servidor.

`GET /api/health` indica si hay una clave configurada (no demuestra su validez). No se invoca al proveedor al iniciar ni al cargar ejemplos. Una petición válida tiene un solo intento, un límite de 4,500 tokens de salida y 45 segundos. Se rechazan orígenes/hosts no locales, métodos y cuerpos inválidos. Los mensajes del proveedor no se devuelven literalmente al usuario.

La interfaz comprueba la disponibilidad, muestra carga y errores, confirma reemplazos y actualiza el plan solo tras recibir una salida válida. Los planes previos en almacenamiento local siguen siendo compatibles. Las preguntas y supuestos del plan nuevo se conservan con los casos. No se ejecuta código ni pruebas sugeridas por el modelo. Falta verificar calidad real y funcionamiento con saldo.
