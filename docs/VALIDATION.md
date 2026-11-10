# Verificación de la preparación

- TypeScript estricto y build de producción: aprobado (`npm run build`).
- Pruebas automáticas: 2 aprobadas (`npm test`).
- CSV: comillas, comas, saltos de línea, BOM y neutralización de fórmulas.
- API: salud 200, generación pendiente 501 y ruta desconocida 404.
- Auditoría de dependencias de producción: sin vulnerabilidades reportadas al preparar esta versión (`npm audit --omit=dev`).
- Inicio de desarrollo: Vite y API imprimieron sus direcciones locales; no se pudo verificar la navegación con el navegador remoto (conexión rechazada). No se declara aprobado el flujo visual ni móvil.

Pendiente: ejecutar la lista manual del README en el PC de la propietaria, comprobar foco y teclado, estados, persistencia y descarga CSV. También revisar en pantalla pequeña antes de publicar la aplicación.

## Verificación manual

1. Cargar el ejemplo de citas médicas y verificar sus cuatro casos.
2. Editar los pasos de un caso y guardarlo.
3. Marcar un caso aprobado y otro fallido; comprobar filtros y métricas.
4. Recargar la página y comprobar persistencia.
5. Añadir un caso manual y exportar CSV; comprobar saltos de línea y caracteres especiales.
6. Reiniciar y comprobar el estado vacío.

