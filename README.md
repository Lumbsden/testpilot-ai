# TestPilot AI

Asistente web para convertir requisitos en planes de pruebas. Proyecto para Dojo AI Hackathon 2026 · **Build for Builders**.

## Estado actual

Prototipo previo al hackatón: casos manuales y de ejemplo, edición, seguimiento de resultados y exportación CSV. Los datos se guardan en este navegador. **La generación con IA está pendiente**; esta versión no requiere claves ni servicios de pago.

## Ejecutar

Requiere Node.js 22.12+ o 24 LTS y Git.

```bash
git clone -b develop https://github.com/Lumbsden/testpilot-ai.git
cd testpilot-ai
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. Para verificar: `npm test` y `npm run build`.

## Documentación

[Arquitectura](docs/ARCHITECTURE.md) · [Plan](docs/PLAN.md) · [Trabajo previo al hackatón](docs/PRE_HACKATHON.md) · [Verificación](docs/VALIDATION.md)

Licencia: [MIT](LICENSE).
