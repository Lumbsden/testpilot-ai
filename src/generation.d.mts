import type { Analysis, TestCase } from './plan';
export function generateTestPlan(requirements: string, options?: {fetchImpl?: typeof fetch; timeoutMs?: number}): Promise<Analysis & {cases:TestCase[]}>;
