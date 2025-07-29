// Tipos para dados dos colaboradores extraídos das folhas analíticas

export interface Employee {
  id: string;
  name: string;
  matricula: string;
  funcao: string;
  secao: string;
  filial: string;
  admissao?: string;
  demissao?: string;
  salarioBase: number;
  eventos: Evento[];
  proventos: Provento[];
  descontos: Desconto[];
  bases: BasesCalculo;
  valores: ValoresCalculados;
  eventosBrutos?: string[];
}

export interface Provento {
  tipo: string;
  valor: number;
  codigo?: string;
  ref?: string;
}

export interface Desconto {
  tipo: string;
  valor: number;
  codigo?: string;
  ref?: string;
}

export interface BasesCalculo {
  inss?: number;
  irrf?: number;
  fgts?: number;
}

export interface ValoresCalculados {
  bruto: number;
  totalDescontos: number;
  liquido: number;
  fgtsAcumulado?: number;
  irrfDescontado?: number;
}

export interface ProcessingStats {
  totalFiles: number;
  totalEmployees: number;
  successfulExtractions: number;
  errors: string[];
  processingTime: number;
}

export interface ExtractionResult {
  employees: Employee[];
  stats: ProcessingStats;
  success: boolean;
}

export interface Evento {
  codigo: string;
  tipo: string;
  valor: number;
  ref: string;
}

export interface EmployeeContextType {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
}