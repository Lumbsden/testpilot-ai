import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/csv.mjs';
import { createApi } from './index.mjs';
test('CSV conserva comillas, comas y saltos de línea y neutraliza fórmulas',()=>{
  const output=toCsv([{id:'TC-1',title:' =HYPERLINK("evil")',steps:'Uno, dos\ntres',expected:'Texto "válido"'}]);
  assert.ok(output.startsWith('\uFEFF'));
  assert.ok(output.includes('"\' =HYPERLINK(""evil"")"'));
  assert.ok(output.includes('"Uno, dos\ntres"'));
  assert.ok(output.includes('"Texto ""válido"""'));
});
test('API informa que IA no está conectada y nunca devuelve una generación ficticia',async()=>{
  const server=createApi({apiKey:''});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const base=`http://127.0.0.1:${server.address().port}`;
    const health=await fetch(base+'/api/health');assert.equal(health.status,200);assert.equal((await health.json()).aiConfigured,false);
    const generation=await fetch(base+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requirements:'Un usuario inicia sesión con su correo y contraseña.'})});assert.equal(generation.status,503);
    const missing=await fetch(base+'/api/unknown');assert.equal(missing.status,404);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
