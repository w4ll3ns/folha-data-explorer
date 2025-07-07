import * as pdfjsLib from 'pdfjs-dist';
import { Employee, ExtractionResult, ProcessingStats } from '@/types/employee';

// Configurar worker do PDF.js de forma robusta
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export class PDFExtractor {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static parseValue(value: string): number {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleaned = value.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto para parsing
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  private static extractEmployeeData(textLines: string[]): Employee[] {
    const employees: Employee[] = [];
    let currentEmployee: Partial<Employee> | null = null;
    
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i].trim();
      
      // Detectar início de novo colaborador (geralmente contém nome e matrícula)
      const nameMatriculaMatch = line.match(/^(.+?)\s+CHAPA:\s*(\d+)/i);
      if (nameMatriculaMatch) {
        // Salvar colaborador anterior se existir
        if (currentEmployee && currentEmployee.name) {
          employees.push(this.finalizeEmployee(currentEmployee));
        }
        
        // Iniciar novo colaborador
        currentEmployee = {
          id: this.generateId(),
          name: nameMatriculaMatch[1].trim(),
          matricula: nameMatriculaMatch[2],
          proventos: [],
          descontos: [],
          bases: {},
          valores: { bruto: 0, totalDescontos: 0, liquido: 0 }
        };
        continue;
      }

      if (!currentEmployee) continue;

      // Extrair função
      const funcaoMatch = line.match(/FUNÇÃO:\s*(.+?)(?:\s+SEÇÃO:|$)/i);
      if (funcaoMatch) {
        currentEmployee.funcao = funcaoMatch[1].trim();
      }

      // Extrair seção
      const secaoMatch = line.match(/SEÇÃO:\s*(.+?)(?:\s+FILIAL:|$)/i);
      if (secaoMatch) {
        currentEmployee.secao = secaoMatch[1].trim();
      }

      // Extrair filial
      const filialMatch = line.match(/FILIAL:\s*(.+?)$/i);
      if (filialMatch) {
        currentEmployee.filial = filialMatch[1].trim();
      }

      // Extrair data de admissão
      const admissaoMatch = line.match(/ADMISSÃO:\s*(\d{2}\/\d{2}\/\d{4})/i);
      if (admissaoMatch) {
        currentEmployee.admissao = admissaoMatch[1];
      }

      // Extrair salário base
      const salarioMatch = line.match(/SALÁRIO BASE:\s*R?\$?\s*([\d.,]+)/i);
      if (salarioMatch) {
        currentEmployee.salarioBase = this.parseValue(salarioMatch[1]);
      }

      // Extrair proventos (linhas que contêm valores positivos)
      const proventoMatch = line.match(/^(.+?)\s+([\d.,]+)\s*(?:(\d+)\s*)?$/);
      if (proventoMatch && !line.toLowerCase().includes('desconto')) {
        const valor = this.parseValue(proventoMatch[2]);
        if (valor > 0) {
          currentEmployee.proventos?.push({
            tipo: proventoMatch[1].trim(),
            valor: valor,
            codigo: proventoMatch[3]
          });
        }
      }

      // Extrair descontos (linhas que contêm "desconto" ou valores negativos)
      const descontoMatch = line.match(/^(.+?)\s+([\d.,]+)\s*(?:(\d+)\s*)?$/);
      if (descontoMatch && (line.toLowerCase().includes('desconto') || line.includes('-'))) {
        currentEmployee.descontos?.push({
          tipo: descontoMatch[1].trim(),
          valor: this.parseValue(descontoMatch[2]),
          codigo: descontoMatch[3]
        });
      }

      // Extrair totais
      const brutoMatch = line.match(/TOTAL BRUTO:\s*R?\$?\s*([\d.,]+)/i);
      if (brutoMatch) {
        currentEmployee.valores!.bruto = this.parseValue(brutoMatch[1]);
      }

      const liquidoMatch = line.match(/TOTAL LÍQUIDO:\s*R?\$?\s*([\d.,]+)/i);
      if (liquidoMatch) {
        currentEmployee.valores!.liquido = this.parseValue(liquidoMatch[1]);
      }

      // Extrair bases de cálculo
      const inssMatch = line.match(/BASE INSS:\s*R?\$?\s*([\d.,]+)/i);
      if (inssMatch) {
        currentEmployee.bases!.inss = this.parseValue(inssMatch[1]);
      }

      const irrfMatch = line.match(/BASE IRRF:\s*R?\$?\s*([\d.,]+)/i);
      if (irrfMatch) {
        currentEmployee.bases!.irrf = this.parseValue(irrfMatch[1]);
      }

      const fgtsMatch = line.match(/BASE FGTS:\s*R?\$?\s*([\d.,]+)/i);
      if (fgtsMatch) {
        currentEmployee.bases!.fgts = this.parseValue(fgtsMatch[1]);
      }
    }

    // Finalizar último colaborador
    if (currentEmployee && currentEmployee.name) {
      employees.push(this.finalizeEmployee(currentEmployee));
    }

    return employees;
  }

  private static finalizeEmployee(partialEmployee: Partial<Employee>): Employee {
    const employee = partialEmployee as Employee;
    
    // Calcular totais se não foram encontrados
    if (!employee.valores.bruto && employee.proventos) {
      employee.valores.bruto = employee.proventos.reduce((sum, p) => sum + p.valor, 0);
    }
    
    if (!employee.valores.totalDescontos && employee.descontos) {
      employee.valores.totalDescontos = employee.descontos.reduce((sum, d) => sum + d.valor, 0);
    }
    
    if (!employee.valores.liquido) {
      employee.valores.liquido = employee.valores.bruto - employee.valores.totalDescontos;
    }

    return employee;
  }

  static async extractFromFile(file: File): Promise<Employee[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const allEmployees: Employee[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const textLines = textContent.items
          .filter(item => 'str' in item)
          .map(item => (item as any).str)
          .filter(str => str.trim().length > 0);

        const pageEmployees = this.extractEmployeeData(textLines);
        allEmployees.push(...pageEmployees);
      }

      return allEmployees;
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      throw new Error(`Erro ao processar arquivo ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async extractFromFiles(
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const stats: ProcessingStats = {
      totalFiles: files.length,
      totalEmployees: 0,
      successfulExtractions: 0,
      errors: [],
      processingTime: 0
    };

    const allEmployees: Employee[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const employees = await this.extractFromFile(file);
        allEmployees.push(...employees);
        stats.successfulExtractions++;
        stats.totalEmployees += employees.length;
        
        // Atualizar progresso
        const progress = ((i + 1) / files.length) * 100;
        onProgress?.(progress);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Erro ao processar ${file.name}`;
        stats.errors.push(errorMessage);
        console.error('Erro no arquivo:', file.name, error);
      }
    }

    stats.processingTime = Date.now() - startTime;

    return {
      employees: allEmployees,
      stats,
      success: stats.errors.length === 0
    };
  }
}