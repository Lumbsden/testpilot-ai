export type Status = 'pending' | 'passed' | 'failed' | 'blocked';
export interface TestCase {
  id: string; title: string; kind: string; priority: string;
  steps: string; expected: string; status: Status;
}
export interface Plan { requirements: string; cases: TestCase[]; }
export const exampleRequirements = 'El paciente selecciona médico, fecha y horario, e ingresa nombre y WhatsApp para reservar una cita. No se permite reservar un horario ocupado.';
export const exampleCases: TestCase[] = [
  {id:'TC-001', title:'Reservar una cita con datos válidos', kind:'Positivo', priority:'Alta', steps:'1. Seleccionar un médico y horario disponible.\n2. Ingresar nombre y WhatsApp válidos.\n3. Confirmar la reserva.', expected:'Se crea una sola cita y se muestra la confirmación.', status:'pending'},
  {id:'TC-002', title:'Enviar la reserva sin nombre', kind:'Negativo', priority:'Alta', steps:'1. Seleccionar un horario disponible.\n2. Dejar el nombre vacío.\n3. Intentar confirmar.', expected:'Se solicita el nombre y no se crea la cita.', status:'pending'},
  {id:'TC-003', title:'Intentar reservar un horario ocupado', kind:'Negativo', priority:'Alta', steps:'1. Identificar un horario ya reservado.\n2. Intentar reservar ese mismo horario.', expected:'El sistema impide una segunda reserva.', status:'pending'},
  {id:'TC-004', title:'Reservar simultáneamente el mismo horario', kind:'Borde', priority:'Alta', steps:'1. Abrir dos sesiones independientes.\n2. Seleccionar el mismo horario.\n3. Confirmar ambas reservas simultáneamente.', expected:'Solo una reserva se confirma; la otra informa que el horario no está disponible.', status:'pending'}
];
export const statusLabels: Record<Status,string> = {pending:'Pendiente', passed:'Aprobado', failed:'Fallido', blocked:'Bloqueado'};
