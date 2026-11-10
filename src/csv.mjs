// Quoting alone does not prevent spreadsheet formula injection.
function cell(value) {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+@\-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function toCsv(cases) {
  const keys = ['id','title','kind','priority','steps','expected','status'];
  const headers = ['ID','Título','Tipo','Prioridad','Pasos','Resultado esperado','Estado'];
  return '\uFEFF' + [headers, ...cases.map(item => keys.map(key => item[key]))].map(row => row.map(cell).join(',')).join('\r\n');
}
