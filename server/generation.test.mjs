import test from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { createApi } from './index.mjs';
import { generateTestPlan } from '../src/generation.mjs';
const requirement='El paciente reserva una cita con nombre y WhatsApp en un horario disponible.';
const fixture={cases:[{title:'Reservar un horario disponible',kind:'Positivo',priority:'Alta',steps:'1. Elegir horario disponible.\n2. Ingresar datos ficticios.\n3. Confirmar.',expected:'Se confirma una sola cita.'}],clarifications:['¿Qué formato de WhatsApp se admite?'],assumptions:[]};
const upstream=(plan=fixture)=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(plan)}]}]});
async function withServer(options,run) {
  const server=createApi({apiKey:'test-placeholder-not-a-real-key',...options});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {await run(`http://127.0.0.1:${server.address().port}`);} finally {await new Promise(resolve=>server.close(resolve));}
}
function post(base,body={requirements:requirement},headers={}) {
  return fetch(base+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
}
test('Contrato completo: Responses estructuradas, clave solo en servidor y casos pendientes', async()=>{
  let calls=0;
  await withServer({fetchImpl:async(url,options)=>{
    calls++;assert.equal(url,'https://api.openai.com/v1/responses');
    const body=JSON.parse(options.body);
    assert.equal(body.model,'gpt-6-luna');assert.equal(body.store,false);
    assert.equal(body.max_output_tokens,4500);assert.equal(body.text.format.strict,true);
    assert.equal(JSON.parse(body.input[0].content).requirements,requirement);
    assert.equal(options.headers.Authorization,'Bearer test-placeholder-not-a-real-key');
    return upstream();
  }},async base=>{
    const response=await post(base);assert.equal(response.status,200);
    const plan=await response.json();assert.equal(plan.cases[0].status,'pending');assert.equal(plan.cases[0].id,'TC-001');
    assert.equal(plan.clarifications[0],fixture.clarifications[0]);assert.ok(!JSON.stringify(plan).includes('test-placeholder'));
    assert.equal(calls,1);
  });
});
test('Rechaza entradas inválidas, cuerpos grandes, origen externo y métodos sin llamar al proveedor',async()=>{
  let calls=0;
  await withServer({fetchImpl:async()=>{calls++;return upstream();}},async base=>{
    for(const body of [{},{requirements:3},{requirements:'corto'},{requirements:'x'.repeat(10001)},'no-json'])assert.equal((await post(base,body)).status,400);
    assert.equal((await post(base,{requirements:'x'.repeat(49000)})).status,413);
    assert.equal((await post(base,undefined,{'Content-Type':'text/plain'})).status,415);
    assert.equal((await post(base,undefined,{Origin:'https://otro-sitio.example'})).status,403);
    const hostStatus=await new Promise((resolve,reject)=>{
      const request=httpRequest(base+'/api/health',{headers:{Host:'host-externo.example'}},response=>{response.resume();resolve(response.statusCode);});
      request.on('error',reject);request.end();
    });
    assert.equal(hostStatus,403);
    assert.equal((await fetch(base+'/api/generate')).status,405);
    assert.equal(calls,0);
  });
});
test('Errores de proveedor se traducen sin filtrar claves ni detalles internos',async()=>{
  for(const [status,expected] of [[401,503],[403,503],[429,429],[500,502]]){
    await withServer({fetchImpl:async()=>new Response('private-provider-details',{status})},async base=>{
      const response=await post(base);assert.equal(response.status,expected);
      const text=await response.text();assert.ok(!text.includes('private-provider-details'));assert.ok(!text.includes('test-placeholder'));
    });
  }
});
test('No acepta planes inválidos, respuestas incompletas ni rechazos como éxito',async()=>{
  const values=[
    {status:'incomplete'},
    {status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'No'}]}]},
    {status:'completed',output:[{type:'message',content:[{type:'output_text',text:'not-json'}]}]},
  ];
  for(const [index,body] of values.entries())await withServer({fetchImpl:async()=>Response.json(body)},async base=>assert.equal((await post(base)).status,index===1?422:502));
  for(const plan of [{...fixture,cases:[]},{...fixture,cases:[{...fixture.cases[0],kind:'unknown'}]},{...fixture,clarifications:[3]}]){
    await withServer({fetchImpl:async()=>upstream(plan)},async base=>assert.equal((await post(base)).status,502));
  }
});
test('Tiempo de espera cancela la petición, sin reintentos automáticos',async()=>{
  let calls=0;
  await withServer({timeoutMs:10,fetchImpl:async(_url,{signal})=>{
    calls++;await new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true}));
  }},async base=>{assert.equal((await post(base)).status,504);assert.equal(calls,1);});
});
test('Límite por hora cuenta intentos fallidos y se libera tras la ventana',async()=>{
  let time=0;let calls=0;
  await withServer({hourlyLimit:1,now:()=>time,fetchImpl:async()=>{calls++;return new Response('',{status:500});}},async base=>{
    assert.equal((await post(base)).status,502);assert.equal((await post(base)).status,429);assert.equal(calls,1);
    time=3600001;assert.equal((await post(base)).status,502);assert.equal(calls,2);
  });
});
test('Solo una generación puede estar en curso por servidor',async()=>{
  let release;let started;
  const begin=new Promise(resolve=>{started=resolve;});
  await withServer({fetchImpl:async()=>{started();await new Promise(resolve=>{release=resolve;});return upstream();}},async base=>{
    const first=post(base);await begin;
    try {assert.equal((await post(base)).status,429);} finally {release();}
    assert.equal((await first).status,200);
  });
});
test('Cliente: errores y red no se convierten en casos ficticios; no hay reintento',async()=>{
  let calls=0;
  await assert.rejects(()=>generateTestPlan(requirement,{fetchImpl:async()=>{calls++;return Response.json({error:'Saldo insuficiente'},{status:429});}}),/Saldo insuficiente/);
  assert.equal(calls,1);
  await assert.rejects(()=>generateTestPlan(requirement,{fetchImpl:async()=>{throw new TypeError('fetch failed');}}),/terminal/);
  await assert.rejects(()=>generateTestPlan(requirement,{fetchImpl:async()=>Response.json({cases:[]})}),/no es válido/);
});
test('Cliente: verifica el contrato y entrega el plan al estado solo cuando hay éxito',async()=>{
  const result={...fixture,model:'gpt-6-luna',cases:fixture.cases.map((c,i)=>({...c,id:`TC-${i+1}`,status:'pending'}))};
  const plan=await generateTestPlan(requirement,{fetchImpl:async(url,options)=>{
    assert.equal(url,'/api/generate');assert.equal(JSON.parse(options.body).requirements,requirement);assert.ok(!options.headers.Authorization);
    return Response.json(result);
  }});
  assert.deepEqual(plan,result);
});
