import { createServer } from 'node:http';
import { loadEnvFile } from 'node:process';
import { pathToFileURL } from 'node:url';
import { AppError, generatePlan } from './ai.mjs';
const isLocal = hostname => ['localhost','127.0.0.1','[::1]'].includes(hostname);
function permittedOrigin(request) {
  try {
    const host = new URL(`http://${request.headers.host}`);
    if (!isLocal(host.hostname)) return false;
    const origin = request.headers.origin;
    return !origin || (new URL(origin).protocol === 'http:' && isLocal(new URL(origin).hostname));
  } catch { return false; }
}
async function readBody(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) {
    request.resume(); throw new AppError(415, 'Envía el requisito en el formato de la aplicación.');
  }
  const data = await new Promise((resolve, reject) => {
    let size = 0; let exceeded = false; const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > 48000) {
        if (!exceeded) {exceeded = true;chunks.length=0;reject(new AppError(413,'El requisito es demasiado largo. Usa hasta 10,000 caracteres.'));}
      } else if (!exceeded) chunks.push(chunk);
    });
    request.on('end',()=>{if(!exceeded)resolve(Buffer.concat(chunks).toString('utf8'));});
    request.on('error',()=>reject(new AppError(400,'La solicitud se interrumpió.')));
    request.on('aborted',()=>reject(new AppError(400,'La solicitud se interrumpió.')));
  });
  let body;
  try {body = JSON.parse(data);} catch {throw new AppError(400,'No pudimos leer el requisito.');}
  if (!body || typeof body.requirements !== 'string' || body.requirements.trim().length < 20 || body.requirements.length > 10000) {
    throw new AppError(400,'Describe el requisito con entre 20 y 10,000 caracteres.');
  }
  return body.requirements.trim();
}
export function createApi({apiKey = process.env.OPENAI_API_KEY || '', model = process.env.OPENAI_MODEL || 'gpt-6-luna',
  fetchImpl = fetch, timeoutMs = 45000, hourlyLimit = 20, now = Date.now} = {}) {
  let inFlight = false; let attempts = [];
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => { if (!response.destroyed) {response.writeHead(status);response.end(JSON.stringify(body));} };
    if (!permittedOrigin(request)) {request.resume();send(403,{error:'Esta versión funciona únicamente desde tu equipo.'});return;}
    if (request.url === '/api/health' && request.method === 'GET') {
      send(200,{status:'ok', aiConfigured:Boolean(apiKey.trim()), model, version:'0.2.0'});return;
    }
    if (request.url !== '/api/generate') {request.resume();send(404,{error:'No encontramos lo que buscas.'});return;}
    if (request.method !== 'POST') {request.resume();response.setHeader('Allow','POST');send(405,{error:'Usa el botón Generar con IA de la aplicación.'});return;}
    let timeout;
    let acquired = false;
    const controller = new AbortController();
    const abort = () => { if (!response.writableEnded) controller.abort(); };
    try {
      const requirements = await readBody(request);
      if (!apiKey.trim()) throw new AppError(503,'Configura la clave de IA en el servidor y reinicia la aplicación. Puedes seguir usando el ejemplo.');
      attempts = attempts.filter(timestamp=>now()-timestamp<3600000);
      if (inFlight || attempts.length>=hourlyLimit) {
        response.setHeader('Retry-After',inFlight?'5':String(Math.max(1,Math.ceil((attempts[0]+3600000-now())/1000))));
        throw new AppError(429,inFlight?'Espera a que termine la generación actual.':'Alcanzaste el límite local de 20 generaciones por hora. Inténtalo más tarde.');
      }
      inFlight=true;acquired=true;attempts.push(now());
      response.on('close',abort);
      timeout=setTimeout(()=>controller.abort(),timeoutMs);
      const generated=await generatePlan({requirements,apiKey,model,fetchImpl,signal:controller.signal});
      send(200,generated);
    } catch (error) {
      send(error instanceof AppError?error.status:500,{error:error instanceof AppError?error.message:'No pudimos generar el plan. Tus datos anteriores se conservan.'});
    } finally {
      clearTimeout(timeout);response.off('close',abort);if(acquired)inFlight=false;
    }
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {loadEnvFile();} catch (error) {if(error.code!=='ENOENT')throw error;}
  const port = Number(process.env.PORT || 3001);
  createApi().listen(port, '127.0.0.1', () => console.log(`TestPilot API: http://127.0.0.1:${port}`));
}
