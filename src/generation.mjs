// The previous plan is changed only after this function resolves successfully.
export async function generateTestPlan(requirements, { fetchImpl = fetch, timeoutMs = 55000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response = await fetchImpl('/api/generate', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({requirements}), signal:controller.signal
    });
    let result;
    try { result = await response.json(); } catch {throw new Error('No pudimos leer la respuesta del servidor. Tu plan anterior se conserva.');}
    if (!response.ok) throw new Error(typeof result?.error==='string'?result.error:'No pudimos generar el plan. Tu plan anterior se conserva.');
    if (!result || !Array.isArray(result.cases) || !result.cases.length || result.cases.length>10 ||
      !result.cases.every(c=>c && ['id','title','kind','priority','steps','expected'].every(k=>typeof c[k]==='string') && c.status==='pending') ||
      typeof result.model!=='string' || !Array.isArray(result.clarifications) || !Array.isArray(result.assumptions) ||
      ![...result.clarifications,...result.assumptions].every(s=>typeof s==='string')) {
      throw new Error('El plan recibido no es válido. Tu plan anterior se conserva.');
    }
    return result;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('La generación tardó demasiado. Tu plan anterior se conserva.');
    if (error instanceof TypeError) throw new Error('No pudimos conectar con el servidor. Verifica que la terminal siga abierta.');
    throw error;
  } finally {clearTimeout(timeout);}
}
