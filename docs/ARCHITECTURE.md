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
