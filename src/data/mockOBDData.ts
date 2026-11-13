export interface MockOBDCode {
  code: string;
  symptom: string;
}

/**
 * Common OBD-II diagnostic trouble codes used for TVET classroom demos
 * when physical ELM327 hardware is not available.
 */
export const MOCK_OBD_DATA: MockOBDCode[] = [
  {
    code: 'P0300',
    symptom:
      'Engine misfire detected. Engine is running rough and shaking at idle.',
  },
  {
    code: 'P0171',
    symptom:
      'System Too Lean (Bank 1). The car is hesitating and has a loss of power.',
  },
  {
    code: 'P0420',
    symptom:
      'Catalyst System Efficiency Below Threshold. Check engine light is on.',
  },
  {
    code: 'P0401',
    symptom:
      'Exhaust Gas Recirculation (EGR) Flow Insufficient. Engine may stall at idle.',
  },
  {
    code: 'P0128',
    symptom:
      'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature). Engine takes too long to warm up.',
  },
];
