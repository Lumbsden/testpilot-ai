# Activar la IA en tu PC

La integración está preparada para OpenAI Responses API con `gpt-6-luna`. No necesita claves para cargar el ejemplo ni para crear casos manuales.

1. Revisa en OpenAI Platform que tu organización tenga saldo y acceso al modelo. No se configura facturación desde esta aplicación.
2. Crea una clave del proyecto. No la pegues en chats, capturas ni GitHub.
3. Detén la aplicación con **Ctrl + C** y crea `.env` a partir de `.env.example` en la carpeta del proyecto.

PowerShell:

```powershell
Copy-Item .env.example .env
notepad .env
```

macOS o Linux:

```bash
cp .env.example .env
```

4. Edita localmente `OPENAI_API_KEY=` y pega la clave a la derecha del signo igual. Mantén `OPENAI_MODEL=gpt-6-luna` salvo que elijas explícitamente otro modelo compatible. El nombre de la variable no lleva `VITE_`: la clave debe permanecer en el servidor.
5. Ejecuta `npm run dev` y recarga http://127.0.0.1:5173. Si modificas `.env` después, reinicia ambos procesos con Ctrl + C y `npm run dev`.
6. Escribe un requisito de 20–10,000 caracteres con datos ficticios y pulsa **Generar con IA**. El requisito se enviará a OpenAI y consumirá saldo de API. El aviso de la interfaz lo explica antes de generar.
7. Revisa casos, preguntas y supuestos. Cada caso comienza como pendiente; la IA no ha ejecutado las pruebas.

## Primera comprobación real

Usa el ejemplo de citas como referencia, exporta el plan actual y genera otro. Comprueba escenarios positivos y negativos, horarios ocupados y dudas sobre formatos. Los resultados no tienen que ser idénticos al ejemplo; sí deben ser coherentes y revisables.

Si aparece **Configurar IA**, falta la clave o no se pudo consultar el backend. Comprueba que la terminal siga abierta y que el archivo se llame `.env`, sin extensión `.txt`. El estado de salud solo indica que existe una clave configurada; su validez, saldo y acceso se comprueban al invocar al proveedor.

## Uso y límites

Una solicitud a la vez, máximo 20 intentos por hora por proceso, máximo 4,500 tokens de salida facturados por solicitud y espera máxima de 45 segundos. No hay reintentos automáticos. Los intentos que llegan al proveedor cuentan aunque fallen. El límite local se reinicia al reiniciar el servidor; **no es un tope de gasto de la cuenta**. Gestiona también el presupuesto desde la plataforma del proveedor. Una cancelación por tiempo de espera no garantiza evitar cargos por procesamiento ya iniciado.

Esta configuración escucha solo en `127.0.0.1` y acepta orígenes locales. No sirve para publicar sin añadir autenticación, HTTPS y límites persistentes. `store:false` evita solicitar almacenamiento de la respuesta para recuperarla después; no equivale a un compromiso de retención cero del proveedor.

## Referencias oficiales consultadas

- https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses
- https://developers.openai.com/api/docs/models/gpt-6-luna
