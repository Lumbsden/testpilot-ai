# TestPilot AI

Asistente web para convertir requisitos en planes de pruebas. Proyecto para Dojo AI Hackathon 2026 · **Build for Builders**.

## Estado actual

Preparación previa al hackatón: casos manuales y de ejemplo, edición, resultados y exportación CSV. Integración con OpenAI lista para configurar: genera casos, dudas y supuestos desde un requisito. **La prueba real con una clave y saldo sigue pendiente.** Los planes se guardan en este navegador. El modo manual no consume la API.

## Ejecutar

Requiere Node.js 22.12+ o 24 LTS y Git.

```bash
git clone -b develop https://github.com/Lumbsden/testpilot-ai.git
cd testpilot-ai
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. Para verificar: `npm test` y `npm run build`.

Para activar la IA consulta la [configuración local](docs/AI_SETUP.md).

## Documentación

[Arquitectura](docs/ARCHITECTURE.md) · [Plan](docs/PLAN.md) · [Trabajo previo al hackatón](docs/PRE_HACKATHON.md) · [Verificación](docs/VALIDATION.md)

Licencia: [MIT](LICENSE).
