# Registro de trabajo previo al hackatón

Preparación: 9 de noviembre de 2026, hora de Panamá. Este documento describe funciones preparadas antes del evento y no debe presentarse como trabajo realizado durante la competencia.

## Estado preparado

- Propuesta TestPilot AI y alcance de QA manual asistido.
- Base React/TypeScript/Vite y servidor Node local.
- Requisitos editables y ejemplo fijo de citas médicas (4 casos).
- Creación y edición manual de casos, estados y filtros.
- Persistencia en navegador y exportación CSV protegida contra fórmulas.
- Contrato inicial de API y documentación de arquitectura.

No hay generación real mediante IA, despliegue público ni consumo de APIs de pago en este estado. El diseño está alineado con los colores violeta y turquesa de las imágenes iniciales; los archivos de marca aún no están integrados.

## Uso de AI coding

ChatGPT/Codex asistió con el diseño del alcance, estructura, implementación del prototipo, pruebas y documentación. Las imágenes iniciales de marca se generaron con IA. La propietaria autorizó subir la base a la rama `develop`. Registrar en adelante pruebas ejecutadas y decisiones humanas sin atribuir validaciones que no se hayan realizado.

## Al inicio del evento

1. Registrar aquí el SHA exacto de la revisión que existía al comenzar.
2. Crear una etiqueta de referencia después de autorizar su publicación.
3. Describir el estado funcional y conservar evidencia visual.
4. Registrar por separado cada avance del 20–22 de noviembre.

Commit de referencia al inicio: pendiente.

## Preparación adicional · 10 de noviembre de 2026

Antes de comenzar el evento se preparó la integración con Responses API de OpenAI, modelo configurable (predeterminado `gpt-6-luna`), salida estructurada y validación del plan. La interfaz permite generar, mostrar dudas y supuestos y conservar el plan anterior cuando falla la solicitud. Incluye validación de entrada, límites locales, tiempo de espera y carga de `.env` solo en el servidor.

La implementación se verificó con respuestas de proveedor simuladas. No se configuró una clave real ni se realizaron generaciones pagadas. También se incorporó la confirmación de Tahilyn de que el flujo manual de v0.1 funcionó en su PC. Esta integración y cualquier validación anterior al 20 de noviembre deben declararse como trabajo previo.
