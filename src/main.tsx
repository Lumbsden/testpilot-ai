import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Check, CheckCheck, ChevronRight, ClipboardCheck, Download, FileText, FlaskConical, HelpCircle, Layers, Plus, RotateCcw, Save, ShieldCheck, Sparkles, X } from 'lucide-react';
import { exampleCases, exampleRequirements, statusLabels, type Plan, type TestCase, type Status, type Analysis } from './plan';
import { toCsv } from './csv.mjs';
import './style.css';
import { generateTestPlan } from './generation.mjs';
const STORAGE_KEY = 'testpilot.plan.v1';
function readPlan(): Plan {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const stringKeys = ['id','title','kind','priority','steps','expected'];
    if (value && typeof value.requirements === 'string' && Array.isArray(value.cases) && value.cases.every((c: TestCase) => c && stringKeys.every(k => typeof c[k as keyof TestCase] === 'string') && Object.hasOwn(statusLabels, c.status))) {
      const analysis = value.analysis;
      if (analysis && (typeof analysis.model !== 'string' || !Array.isArray(analysis.clarifications) || !Array.isArray(analysis.assumptions) || ![...analysis.clarifications,...analysis.assumptions].every(s=>typeof s==='string'))) delete value.analysis;
      return value;
    }
  } catch { /* An unavailable or invalid browser store starts an empty plan. */ }
  return { requirements:'', cases:[] };
}
function AnalysisPanel({analysis}:{analysis?:Analysis}) {
  return <section className="panel tips"><div className="panel-title"><span className="step">02</span><h2>Aclara antes de probar</h2><Sparkles size={18}/></div><p className="description">{analysis?'Preguntas y supuestos del plan generado. Confírmalos antes de probar.':'Un buen plan comienza con preguntas concretas.'}</p>
    {analysis?<><h3 className="analysis-heading">Preguntas por resolver</h3>{analysis.clarifications.length?analysis.clarifications.map((question,i)=><div className="question" key={i}><span>{i+1}</span><div><p>{question}</p></div></div>):<p className="description">La IA no propuso preguntas. Revisa si falta alguna regla.</p>}<h3 className="analysis-heading">Supuestos por confirmar</h3>{analysis.assumptions.length?<ul className="assumptions">{analysis.assumptions.map((item,i)=><li key={i}>{item}</li>)}</ul>:<p className="description">No se declararon supuestos adicionales.</p>}<div className="tip-footer">ANÁLISIS CON IA <span>{analysis.model} · Requiere revisión humana</span></div></>:<><div className="question"><span>01</span><div><strong>¿Qué hace válido un dato?</strong><p>Define formatos, campos obligatorios y límites.</p></div></div><div className="question"><span>02</span><div><strong>¿Qué pasa si algo falla?</strong><p>Especifica errores y cómo se recupera el usuario.</p></div></div><div className="question"><span>03</span><div><strong>¿Qué ocurre en los extremos?</strong><p>Considera concurrencia, duplicados y valores límite.</p></div></div><div className="tip-footer">GUÍA GENERAL <span>Genera con IA para analizar tu requisito</span></div></>}
  </section>;
}
function App() {
  const [plan,setPlan] = useState<Plan>(readPlan);
  const [filter,setFilter] = useState('all');
  const [editing,setEditing] = useState<TestCase|null>(null);
  const [notice,setNotice] = useState('');
  const [storageError,setStorageError] = useState(false);
  const [help,setHelp] = useState(false);
  const [api,setApi] = useState<'checking'|'ready'|'missing'|'offline'>('checking');
  const [generating,setGenerating] = useState(false);
  const [generationError,setGenerationError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health',{signal:controller.signal}).then(async response=>{
      if(!response.ok)throw new Error();
      const health=await response.json();setApi(health.aiConfigured?'ready':'missing');
    }).catch(()=>{if(!controller.signal.aborted)setApi('offline');});
    return ()=>controller.abort();
  },[]);
  async function generate() {
    if(generating)return;
    if(api!=='ready'){setHelp(true);return;}
    if(plan.requirements.trim().length<20){setGenerationError('Describe el requisito con al menos 20 caracteres.');return;}
    if(plan.cases.length && !window.confirm('¿Reemplazar los casos y resultados actuales por un nuevo plan generado con IA? Puedes exportarlos antes de continuar.'))return;
    const requirements=plan.requirements;
    setGenerating(true);setGenerationError('');
    try {
      const result=await generateTestPlan(requirements);
      setPlan({requirements,cases:result.cases,analysis:{clarifications:result.clarifications,assumptions:result.assumptions,model:result.model}});
      setFilter('all');setNotice('Plan generado con IA. Revisa los supuestos antes de ejecutar las pruebas.');
    } catch(error) {setGenerationError(error instanceof Error?error.message:'No pudimos generar el plan.');}
    finally {setGenerating(false);}
  }
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); setStorageError(false); } catch { setStorageError(true); } }, [plan]);
  const passed = plan.cases.filter(c=>c.status==='passed').length;
  const executed = plan.cases.filter(c=>c.status!=='pending').length;
  const shown = plan.cases.filter(c=>filter==='all'||c.status===filter);
  function updateCase(item: TestCase) {setPlan(p=>({...p,cases:p.cases.map(c=>c.id===item.id?item:c)}));}
  function example() {
    if ((plan.cases.length || plan.requirements.trim()) && !window.confirm('¿Reemplazar el plan actual con el ejemplo de citas médicas?')) return;
    setPlan({requirements:exampleRequirements,cases:structuredClone(exampleCases)});setFilter('all');setNotice('Ejemplo cargado. Son casos predefinidos, no generados por IA.');
  }
  function exportCsv() {
    const blob = new Blob([toCsv(plan.cases)], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href=url;link.download='testpilot-plan.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setNotice('Plan exportado. El archivo contiene todos los casos.');
  }
  return <div className="layout">
    <aside className="sidebar"><a className="brand" href="#workspace"><span className="brand-icon"><CheckCheck/></span><span>TestPilot <b>AI</b></span></a><div className="workspace-name">ESPACIO PERSONAL</div><div className="nav-item"><Layers size={18}/> Plan de pruebas <span>01</span></div><div className="side-note"><Sparkles size={20}/><strong>Del requisito a la confianza.</strong><p>Pruebas claras para construir mejores productos.</p><span className="pill">Preparación · v0.2</span></div><div className="side-bottom"><span className="avatar">TL</span><div>Tahilyn Lumbsden<small>Mi espacio de trabajo</small></div></div></aside>
    <main id="workspace"><header><div className="breadcrumb">Mi espacio <ChevronRight size={14}/><span>Plan de pruebas</span></div><button className="quiet" onClick={()=>setHelp(true)}><HelpCircle size={17}/> Guía rápida</button></header>
    <section className="content"><div className="heading"><div><div className="eyebrow"><span/> TU CENTRO DE CALIDAD</div><h1>Menos dudas. Mejores pruebas.</h1><p>Transforma lo que necesitas construir en lo que necesitas verificar.</p></div><span className="local-badge"><ShieldCheck size={15}/> Guardado en este navegador</span></div>
    <div className="stats"><div><span className="stat-icon purple"><ClipboardCheck/></span><div><span>Casos de prueba</span><strong>{plan.cases.length.toString().padStart(2,'0')}</strong></div></div><div><span className="stat-icon teal"><Check/></span><div><span>Aprobados</span><strong>{passed.toString().padStart(2,'0')}</strong></div></div><div><span className="stat-icon amber"><FlaskConical/></span><div><span>Avance de ejecución</span><strong>{plan.cases.length?Math.round(executed/plan.cases.length*100):0}<small>%</small></strong></div></div></div>
    <div className="work-grid"><section className="panel requirements"><div className="panel-title"><span className="step">01</span><h2>Define el requisito</h2><FileText size={18}/></div><p className="description">Describe la funcionalidad, sus reglas y el resultado que esperas.</p><label htmlFor="requirement">¿Qué vamos a probar?</label><textarea id="requirement" disabled={generating} maxLength={10000} value={plan.requirements} onChange={e=>setPlan(p=>({...p,requirements:e.target.value}))} placeholder="Ej.: Un paciente puede reservar una cita con un médico en un horario disponible…"/><div className="input-meta"><span>Incluye las reglas de negocio</span><span>{plan.requirements.length.toLocaleString()}/10,000</span></div><button className="primary generate" disabled={generating||api==='checking'} onClick={generate}><Sparkles size={17}/>{generating?'Generando tu plan…':api==='ready'?'Generar con IA':api==='checking'?'Comprobando conexión…':'Configurar IA'}<span>{api==='ready'?'OpenAI':api==='offline'?'Sin conexión':'Modo manual'}</span></button>{generationError&&<p className="generation-error" role="alert">{generationError}</p>}<button className="example" disabled={generating} onClick={example}>Explorar un ejemplo de citas médicas <ArrowUpRight size={16}/></button><div className="info"><ShieldCheck size={16}/><p>{api==='ready'?'Al generar se enviará este requisito a OpenAI y se consumirá tu saldo de API. Usa datos ficticios, sin claves ni datos personales.':'El modo manual y el ejemplo no consumen la API. Configura la IA cuando quieras generar pruebas.'}</p></div></section>
    <AnalysisPanel analysis={plan.analysis}/></div>
    <section className="panel cases"><div className="case-top"><div><h2>Tu plan de pruebas <span className="count">{plan.cases.length}</span></h2><p>Revisa cada escenario y registra lo que sucede al ejecutarlo.</p></div><div className="actions"><button disabled={generating} onClick={()=>setEditing({id:crypto.randomUUID(),title:'',kind:'Positivo',priority:'Media',steps:'',expected:'',status:'pending'})}><Plus size={16}/> Añadir caso</button><button disabled={!plan.cases.length} onClick={exportCsv}><Download size={16}/> Exportar CSV</button></div></div><div className="filters">{[['all','Todos'],['pending','Pendientes'],['passed','Aprobados'],['failed','Fallidos'],['blocked','Bloqueados']].map(([value,label])=><button key={value} className={filter===value?'selected':''} onClick={()=>setFilter(value)}>{label}</button>)}</div>
    {shown.length?<div className="table-wrap"><table><thead><tr><th>CASO / ESCENARIO</th><th>TIPO</th><th>PRIORIDAD</th><th>RESULTADO</th><th><span className="sr-only">Acción</span></th></tr></thead><tbody>{shown.map((item,i)=><tr key={item.id}><td><small>{item.id.startsWith('TC-')?item.id:`MANUAL-${i+1}`}</small><strong>{item.title}</strong></td><td><span className={'type '+item.kind.toLowerCase()}>{item.kind}</span></td><td><span className="priority">●</span> {item.priority}</td><td><select disabled={generating} aria-label={`Resultado de ${item.title}`} value={item.status} onChange={e=>updateCase({...item,status:e.target.value as Status})}>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></td><td><button className="quiet" disabled={generating} onClick={()=>setEditing({...item})}>Revisar <ChevronRight size={14}/></button></td></tr>)}</tbody></table></div>:<div className="empty"><ClipboardCheck size={34}/><h3>{plan.cases.length?'No hay casos con este estado':'Tu próximo plan comienza aquí'}</h3><p>{plan.cases.length?'Selecciona otro filtro para ver tus casos.':'Carga el ejemplo o añade tu primer caso de prueba manual.'}</p>{!plan.cases.length&&<button disabled={generating} onClick={example}>Cargar ejemplo <ArrowUpRight size={15}/></button>}</div>}
    <div className="table-footer"><span><Save size={13}/>{storageError?'No se pudo guardar. Exporta tu plan para conservarlo.':'Cambios guardados localmente'}</span><span>Revisa los casos antes de utilizarlos</span></div></section><footer>TestPilot AI <span>Construye con intención. Prueba con criterio.</span><button className="quiet" disabled={generating} onClick={()=>{if(window.confirm('¿Borrar el requisito y todos los casos de este navegador?')){setPlan({requirements:'',cases:[]});setNotice('Plan borrado.');}}}><RotateCcw size={13}/> Reiniciar plan</button></footer>
    </section></main>
    {notice&&<div className="toast" role="status">{notice}<button aria-label="Cerrar aviso" onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {editing&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="case-title"><div className="modal-head"><h2 id="case-title">Editar caso de prueba</h2><button aria-label="Cerrar editor" onClick={()=>setEditing(null)}><X/></button></div><form onSubmit={e=>{e.preventDefault();if(!editing.title.trim()||!editing.steps.trim()||!editing.expected.trim())return;if(plan.cases.some(c=>c.id===editing.id))updateCase(editing);else setPlan(p=>({...p,cases:[...p.cases,editing]}));setEditing(null);setNotice('Caso guardado.');}}><label>Título<input autoFocus required maxLength={250} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><div className="form-row"><label>Tipo<select value={editing.kind} onChange={e=>setEditing({...editing,kind:e.target.value})}>{['Positivo','Negativo','Borde'].map(v=><option key={v}>{v}</option>)}</select></label><label>Prioridad<select value={editing.priority} onChange={e=>setEditing({...editing,priority:e.target.value})}>{['Alta','Media','Baja'].map(v=><option key={v}>{v}</option>)}</select></label></div><label>Pasos<textarea required maxLength={10000} value={editing.steps} onChange={e=>setEditing({...editing,steps:e.target.value})}/></label><label>Resultado esperado<textarea required maxLength={10000} value={editing.expected} onChange={e=>setEditing({...editing,expected:e.target.value})}/></label><div className="modal-actions"><button type="button" onClick={()=>setEditing(null)}>Cancelar</button><button className="primary" type="submit"><Save size={16}/> Guardar caso</button></div></form></section></div>}
    {help&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><div className="modal-head"><h2 id="help-title">Tu primera sesión de pruebas</h2><button aria-label="Cerrar guía" onClick={()=>setHelp(false)}><X/></button></div><ol className="guide"><li>Escribe un requisito o carga el ejemplo de citas médicas.</li><li>Añade o revisa los pasos y el resultado esperado de cada caso.</li><li>Ejecuta las pruebas en tu aplicación y registra su resultado.</li><li>Exporta todos los casos a CSV para compartirlos.</li></ol><p>El plan se conserva en este navegador. Al generar con IA, el requisito se envía a OpenAI. El ejemplo sigue disponible sin consumir la API.</p>{api!=='ready'&&<div className="setup-guide"><h3>Activar IA en tu PC</h3><ol><li>Detén la terminal con Ctrl + C.</li><li>Copia <code>.env.example</code> a <code>.env</code> en la carpeta del proyecto.</li><li>Pega tu clave privada en <code>OPENAI_API_KEY</code> dentro de ese archivo.</li><li>Ejecuta <code>npm run dev</code> y recarga la página.</li></ol><p>No compartas ese archivo ni la clave. El servidor necesita una cuenta de API con saldo y acceso al modelo configurado.</p></div>}<button className="primary" onClick={()=>setHelp(false)}>Entendido</button></section></div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
