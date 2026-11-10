import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
export function createApi() {
  return createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (request.url === '/api/health' && request.method === 'GET') {
      response.end(JSON.stringify({status:'ok', aiConfigured:false, version:'0.1.0'})); return;
    }
    if (request.url === '/api/generate' && request.method === 'POST') {
      request.resume(); response.writeHead(501); response.end(JSON.stringify({error:'La generación con IA estará disponible en una próxima versión.'})); return;
    }
    response.writeHead(404);response.end(JSON.stringify({error:'No encontramos lo que buscas.'}));
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3001);
  createApi().listen(port, '127.0.0.1', () => console.log(`TestPilot API: http://127.0.0.1:${port}`));
}
