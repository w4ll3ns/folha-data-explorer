import * as pdfjsLib from 'pdfjs-dist';
import { Employee, ExtractionResult, ProcessingStats } from '@/types/employee';

// Configurar worker do PDF.js para versão 3.11.174 estável
if (typeof window !== 'undefined') {
  // Usar versão específica conhecida como estável
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  console.log('PDF.js worker configurado para versão 3.11.174 - API version:', pdfjsLib.version);
}

export class PDFExtractor {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static parseValue(value: string): number {
    // Remove pontos de milhar, troca vírgula decimal por ponto
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private static extractEmployeeData(textLines: string[]): Employee[] {
    function getNextNumericValue(lines: string[], idx: number): string {
      // Busca valor na mesma linha
      const valor = lines[idx].replace(/^[^:]+:/, '').trim();
      if (valor && /^[\d.,-]+$/.test(valor)) return valor;
      // Busca valor na próxima linha, se for numérica
      if (idx + 1 < lines.length) {
        const next = lines[idx + 1].trim();
        if (/^[\d.,-]+$/.test(next)) return next;
      }
      return '';
    }
    const employees: Employee[] = [];
    let currentEmployee: Partial<Employee> | null = null;
    const proventos: Array<{ tipo: string; valor: number; codigo?: string; ref?: string; descricao?: string }> = [];
    const descontos: Array<{ tipo: string; valor: number; codigo?: string; ref?: string; descricao?: string }> = [];
    let dentroTabela = false;
    let base_inss = 0;
    let base_irrf = 0;
    let base_fgts = 0;
    let total_bruto = 0;
    let total_liquido = 0;
    let fgtsAcumulado = 0;
    let irrfDescontado = 0;
    let competencia = '';
    let nDepIrrf = '';
    const eventosBrutos: string[] = [];
    const eventos: Array<{ codigo: string; tipo: string; valor: number; ref: string }> = [];
    let eventosPendentes: Array<{ codigo: string; tipo: string; valor: number; ref: string }> = [];

    function pushCurrentEmployee() {
      if (currentEmployee && currentEmployee.matricula && currentEmployee.name) {
        const employee: Employee = {
          id: currentEmployee.id || '',
          name: currentEmployee.name,
          matricula: currentEmployee.matricula,
          funcao: currentEmployee.funcao || '',
          secao: currentEmployee.secao || '',
          filial: currentEmployee.filial || '',
          admissao: currentEmployee.admissao || '',
          demissao: currentEmployee.demissao || '',
          salarioBase: currentEmployee.salarioBase || 0,
          eventos: eventos.slice(),
          proventos: [],
          descontos: [],
          bases: {
            inss: base_inss,
            irrf: base_irrf,
            fgts: base_fgts
          },
          valores: {
            bruto: total_bruto,
            totalDescontos: 0,
            liquido: total_liquido,
            fgtsAcumulado: fgtsAcumulado,
            irrfDescontado: irrfDescontado
          },
          eventosBrutos: eventosBrutos.slice(),
        };
        console.log('[PUSH][Employee]', employee);
        console.log('[DEBUG][Employee Final]', JSON.stringify(employee, null, 2));
        employees.push(employee);
      }
      eventos.length = 0;
      proventos.length = 0;
      descontos.length = 0;
      base_inss = 0;
      base_irrf = 0;
      base_fgts = 0;
      total_bruto = 0;
      total_liquido = 0;
      fgtsAcumulado = 0;
      irrfDescontado = 0;
      competencia = '';
      nDepIrrf = '';
      eventosBrutos.length = 0;
      currentEmployee = null;
    }

    let buscandoEventosAposTotais = false;
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i].trim();

      // Log toda linha que contenha '0096'
      if (line.includes('0096')) {
        console.log('[DEBUG][Linha com 0096]', i, JSON.stringify(line));
      }

      // Log detalhado da linha analisada
      console.log(`[DEBUG][Linha ${i}][Conteúdo]`, JSON.stringify(line));

      // Log início de nova matrícula
      if (/^\d{6}$/.test(line)) {
        console.log('[DEBUG][Nova matrícula detectada]', line, '| Linha:', i);
      }

      // Nova lógica: detectar cabeçalho de eventos em 5 linhas separadas
      if (
        line.toLowerCase() === 'descontos' &&
        textLines[i + 1]?.trim().toLowerCase() === 'proventos' &&
        textLines[i + 2]?.trim().toLowerCase() === 'ref.' &&
        textLines[i + 3]?.trim().toLowerCase() === 'descrição' &&
        textLines[i + 4]?.trim().toLowerCase() === 'evento'
      ) {
        // Encontrou o cabeçalho de eventos
        console.log('[DEBUG][Cabeçalho de eventos detectado nas linhas]', i, i+1, i+2, i+3, i+4);
        let j = i + 5;
        while (j + 3 < textLines.length) {
          const valor = textLines[j].trim();
          const referencia = textLines[j + 1]?.trim() || '';
          // Descrição pode ocupar múltiplas linhas até encontrar o código (4 dígitos)
          let descricao = '';
          let descIdx = j + 2;
          while (descIdx < textLines.length && !/^\d{4}$/.test(textLines[descIdx].trim())) {
            descricao += (descricao ? ' ' : '') + textLines[descIdx].trim();
            descIdx++;
          }
          const codigo = textLines[descIdx]?.trim() || '';
          // Checa se valor é numérico e código é 4 dígitos
          const valorNumerico = /^-?[\d.,]+$/.test(valor);
          const codigoEvento = /^\d{4}$/.test(codigo);
          if (valorNumerico && codigoEvento) {
            const valorNum = this.parseValue(valor);
            const eventoObj = {
              codigo: codigo,
              tipo: descricao,
              valor: valorNum,
              ref: referencia
            };
            eventos.push(eventoObj);
            eventosBrutos.push(`${codigo} | ${descricao} | ${referencia} | ${valor}`);
            console.log('[EVENTO][EventoUnico]', eventoObj);
            j = descIdx + 1;
          } else {
            break;
          }
        }
        // Avança o índice principal para depois do último evento capturado
        i = j - 1;
        continue;
      }
      if (/^\d{6}$/.test(line)) { // Matrícula
        // Finaliza colaborador anterior
        pushCurrentEmployee();
        // Busca nome na linha anterior
        const name = i > 0 ? textLines[i - 1].trim() : '';
        // Busca função na linha seguinte
        const funcao = (i + 1 < textLines.length) ? textLines[i + 1].trim() : '';
        // Admissão, salário, etc, podem estar nas próximas linhas, buscar por palavras-chave
        let admissao = '', demissao = '', salarioBase = 0, secao = '', filial = '';
        // Nova lógica para buscar filial nas linhas anteriores à matrícula
        // Busca padrão FILIAL: (mantém compatibilidade)
        for (let j = i + 1; j < Math.min(i + 10, textLines.length); j++) {
          const l = textLines[j].trim();
          const filialMatch = l.match(/^FILIAL\s*:\s*(.+)$/i);
          if (filialMatch) {
            filial = filialMatch[1].trim();
            console.log('[DEBUG][FILIAL extraída pelo padrão FILIAL:]', filial, '| Linha:', l);
          }
        }
        // Lista fixa de filiais válidas
        const FILIAIS_VALIDAS = [
          'UNICEUMA ANIL',
          'UNICEUMA RENASCENCA',
          'UNICEUMA TURU',
          'UNICEUMA COHAMA',
          'UNICEUMA IMPERATRIZ',
          'UNICEUMA DEODORO',
          'UNICEUMA BACABAL'
        ];
        // Função para normalizar texto removendo acentos, traços, hífens e caracteres especiais
        function normalizarFilial(str: string) {
          return str
            .normalize('NFD')
            .replace(/[^\w\s]/g, '') // remove acentos e caracteres especiais
            .replace(/[-–—]/g, ' ') // substitui traços/hífens por espaço
            .replace(/\s+/g, ' ') // múltiplos espaços para um só
            .trim()
            .toUpperCase();
        }
        // Se não encontrou pelo padrão, busca nas linhas anteriores
        if (!filial) {
          for (let k = i - 1; k >= Math.max(0, i - 5); k--) {
            const prevLine = textLines[k].trim();
            const prevLineNorm = normalizarFilial(prevLine);
            if (FILIAIS_VALIDAS.map(normalizarFilial).includes(prevLineNorm)) {
              filial = prevLine;
              console.log('[DEBUG][FILIAL extraída por lista fixa]', filial, '| Linha:', prevLine);
              break;
            }
          }
        }
        currentEmployee = {
          id: this.generateId(),
          name,
          matricula: line,
          funcao,
          secao,
          filial,
          admissao,
          demissao,
          salarioBase
        };
        // Associa eventos pendentes
        if (eventosPendentes.length > 0) {
          eventos.push(...eventosPendentes);
          eventosPendentes = [];
        }
        continue;
      }
      if (!currentEmployee) continue;
      // Captura valores financeiros dentro do bloco do colaborador
      if (/^SALÁRIO:/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        currentEmployee.salarioBase = this.parseValue(valor);
        console.log('[VALOR][Salário Base]', currentEmployee.salarioBase);
      }
      if (/^Totais:/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        total_bruto = this.parseValue(valor);
        console.log('[VALOR][Bruto]', total_bruto);
      }
      if (/^Líquido:/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        total_liquido = this.parseValue(valor);
        console.log('[VALOR][Líquido]', total_liquido);
      }
      if (/^BASE INSS/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        base_inss = this.parseValue(valor);
        console.log('[VALOR][BASE INSS]', base_inss);
      }
      if (/^BASE IRRF/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        base_irrf = this.parseValue(valor);
        console.log('[VALOR][BASE IRRF]', base_irrf);
      }
      if (/^IRRF DESC/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        irrfDescontado = this.parseValue(valor);
        console.log('[VALOR][IRRF DESC]', irrfDescontado);
      }
      if (/^BASE FGTS/i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        base_fgts = this.parseValue(valor);
        console.log('[VALOR][BASE FGTS]', base_fgts);
      }
      if (/^FGTS DEP\./i.test(line)) {
        const valor = getNextNumericValue(textLines, i);
        fgtsAcumulado = this.parseValue(valor);
        console.log('[VALOR][FGTS DEP.]', fgtsAcumulado);
      }
      // Tabela de eventos
      if (line.toLowerCase().includes('evento') || line.toLowerCase().includes('proventos') || line.toLowerCase().includes('descontos')) {
        console.log('[DEBUG][Possível Cabeçalho Evento]', line);
      }
      // Detectar cabeçalho de eventos em linha única (flexível)
      if (/^evento\s+descri[cç][aã]o\s+ref\.?\s+proventos\s+descontos$/i.test(line.replace(/\s+/g, ' ').trim())) {
        dentroTabela = true;
        console.log('[DEBUG][Cabeçalho de eventos linha única detectado (flexível)]', line, '| Linha:', i);
        continue;
      }
      if (dentroTabela && (/^BASE INSS|^Totais:|^Líquido:|^BASE IRRF|^BASE FGTS|^IRRF DESC|^FGTS DEP\./i.test(line))) {
        dentroTabela = false;
        continue;
      }
      if (dentroTabela) {
        // Tentar capturar eventos em linha única
        const matchFull = line.match(/^([0-9]{4})\s+(.+?)\s+([\d.,-]+)\s+([\d.,-]+|-)\s+([\d.,-]+|-)$/);
        if (matchFull) {
          const [_, codigo, descricao, ref, provento, desconto] = matchFull;
                      if (provento && provento !== '-' && provento !== '­') {
              proventos.push({ codigo, descricao, ref, valor: this.parseValue(provento), tipo: 'provento' });
              console.log('[EVENTO][Provento][Linha Única]', { codigo, descricao, ref, valor: this.parseValue(provento) });
            }
            if (desconto && desconto !== '-' && desconto !== '­') {
              descontos.push({ codigo, descricao, ref, valor: this.parseValue(desconto), tipo: 'desconto' });
              console.log('[EVENTO][Desconto][Linha Única]', { codigo, descricao, ref, valor: this.parseValue(desconto) });
            }
          eventosBrutos.push(`${codigo} | ${descricao} | ${ref} | ${provento} | ${desconto}`);
        } else {
          console.log('[DEBUG][Linha não reconhecida como evento]', line, '| Linha:', i);
        }
      }

      // Detecta início do rodapé (bases, totais, liquido)
      if (/^BASE INSS|^BASE IRRF|^BASE FGTS|^IRRF DESC|^Totais:|^Líquido:/i.test(line)) {
        buscandoEventosAposTotais = true;
        // Não faz continue aqui, pois pode ser linha de evento também
      }

      // Se estamos buscando eventos após totais, tente capturar eventos
      if (buscandoEventosAposTotais) {
        // Padrão: código (4 dígitos), descrição, ref, provento, desconto
        const eventoAposTotaisMatch = line.match(/^(\d{4})\s+(.+?)\s+([\d.,-]+)\s+([\d.,-]+|-)\s+([\d.,-]+|-)$|^(\d{4})\s+(.+?)\s+([\d.,-]+)\s+-\s+([\d.,-]+)$/);
        if (eventoAposTotaisMatch) {
          const codigo = eventoAposTotaisMatch[1] || eventoAposTotaisMatch[6];
          const descricao = eventoAposTotaisMatch[2] || eventoAposTotaisMatch[7];
          const ref = eventoAposTotaisMatch[3] || eventoAposTotaisMatch[8] || '';
          const provento = eventoAposTotaisMatch[4] || '-';
          const desconto = eventoAposTotaisMatch[5] || eventoAposTotaisMatch[9] || '-';
          if (codigo === '0096') {
            console.log('[DEBUG][Evento 0096 capturado]', { codigo, descricao, ref, provento, desconto });
          }
          if (codigo && descricao && (provento !== '-' || desconto !== '-')) {
            if (provento !== '-' && provento !== '­') {
              eventos.push({ codigo, tipo: descricao, valor: this.parseValue(provento), ref });
              eventosBrutos.push(`${codigo} | ${descricao} | ${ref} | ${provento}`);
            }
            if (desconto !== '-' && desconto !== '­') {
              eventos.push({ codigo, tipo: descricao, valor: this.parseValue(desconto), ref });
              eventosBrutos.push(`${codigo} | ${descricao} | ${ref} | ${desconto}`);
            }
            continue;
          }
        }
        // Se linha não bate com padrão de evento e não é vazia, provavelmente acabou a lista de eventos
        if (!/^\s*$/.test(line) && !eventoAposTotaisMatch) {
          buscandoEventosAposTotais = false;
        }
      }

      // NOVA LÓGICA: Capturar eventos isolados mesmo fora do bloco principal
      // Padrão: código (4 dígitos), descrição, ref, provento, desconto
      const eventoIsoladoMatch = line.match(/^(\d{4})\s+(.+?)\s+([\d.,-]+)\s+([\d.,-]+|-)\s+([\d.,-]+|-)$|^(\d{4})\s+(.+?)\s+([\d.,-]+)\s+-\s+([\d.,-]+)$/);
      console.log(`[DEBUG][Linha ${i}][Regex evento isolado]`, !!eventoIsoladoMatch, eventoIsoladoMatch);
      if (eventoIsoladoMatch) {
        // Tenta capturar todos os campos possíveis
        const codigo = eventoIsoladoMatch[1] || eventoIsoladoMatch[6];
        const descricao = eventoIsoladoMatch[2] || eventoIsoladoMatch[7];
        const ref = eventoIsoladoMatch[3] || eventoIsoladoMatch[8] || '';
        const provento = eventoIsoladoMatch[4] || '-';
        const desconto = eventoIsoladoMatch[5] || eventoIsoladoMatch[9] || '-';
        console.log(`[DEBUG][Linha ${i}][Evento isolado extraído]`, { codigo, descricao, ref, provento, desconto });
        // Dentro de cada lógica de captura de evento (evento isolado, evento após totais, etc):
        // Após capturar codigo, descricao, ref, provento, desconto:
        if (codigo === '0096') {
          console.log('[DEBUG][Evento 0096 capturado]', { codigo, descricao, ref, provento, desconto });
        }
        // Log eventos antes
        console.log(`[DEBUG][Linha ${i}][Eventos antes]`, JSON.stringify(eventos));
        // Só adiciona se não for cabeçalho e não for linha já capturada
        if (codigo && descricao && (provento !== '-' || desconto !== '-')) {
          if (provento !== '-' && provento !== '­') {
            eventos.push({ codigo, tipo: descricao, valor: this.parseValue(provento), ref });
            eventosBrutos.push(`${codigo} | ${descricao} | ${ref} | ${provento}`);
          }
          if (desconto !== '-' && desconto !== '­') {
            eventos.push({ codigo, tipo: descricao, valor: this.parseValue(desconto), ref });
            eventosBrutos.push(`${codigo} | ${descricao} | ${ref} | ${desconto}`);
          }
          // Log eventos depois
          console.log(`[DEBUG][Linha ${i}][Eventos depois]`, JSON.stringify(eventos));
          continue;
        }
      }
    }
    // Finalizar último colaborador
    pushCurrentEmployee();
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
      // Verificar se o worker está configurado corretamente
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        throw new Error('Worker do PDF.js não configurado');
      }

      console.log('Processando arquivo:', file.name, 'Tamanho:', file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Configuração simples e estável para o PDF
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      // Juntar todas as linhas de todas as páginas antes de processar
      const allTextLines: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
                const textLines = textContent.items
        .filter(item => 'str' in item)
        .map(item => (item as { str: string }).str)
        .filter(str => str.trim().length > 0);
          console.log(`Página ${pageNum}: ${textLines.length} linhas de texto extraídas`);
          allTextLines.push(...textLines);
        } catch (pageError) {
          console.warn(`Erro ao processar página ${pageNum}:`, pageError);
          // Continue processando outras páginas
        }
      }
      // Após juntar todas as linhas de todas as páginas antes de processar
      console.log('[DEBUG][PDF] Total de linhas extraídas:', allTextLines.length);
      // Processar todos os colaboradores de uma vez, mantendo contexto entre páginas
      const allEmployees = this.extractEmployeeData(allTextLines);
      console.log(`Total de colaboradores extraídos do arquivo ${file.name}: ${allEmployees.length}`);
      return allEmployees;
      
    } catch (error) {
      console.error('Erro detalhado ao processar PDF:', error);
      
      // Melhor tratamento de erros específicos
      if (error instanceof Error) {
        if (error.message.includes('worker')) {
          throw new Error(`Erro no worker do PDF.js para arquivo ${file.name}. Tente recarregar a página.`);
        }
        if (error.message.includes('Invalid PDF')) {
          throw new Error(`Arquivo ${file.name} não é um PDF válido ou está corrompido.`);
        }
        throw new Error(`Erro ao processar arquivo ${file.name}: ${error.message}`);
      }
      
      throw new Error(`Erro desconhecido ao processar arquivo ${file.name}`);
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

  // Adicionar método auxiliar para processar linhas de proventos/descontos
  private static processarProventosDescontos(linhas: string[], emp: Partial<Employee>) {
    if (!linhas || !emp) return;
    for (const linha of linhas) {
      // Regex para capturar: código, descrição, ref, proventos, descontos
      const match = linha.match(/^(\d{4})\s+(.+?)\s+([\d.,-]+)\s+([\d.,-]+|-)\s+([\d.,-]+|-)$/);
      if (match) {
        const codigo = match[1];
        const descricao = match[2].trim();
        const ref = match[3];
        const provento = match[4];
        const desconto = match[5];
        if (provento && provento !== '-' && parseFloat(provento.replace(',', '.')) > 0) {
          emp.proventos?.push({ tipo: descricao, valor: this.parseValue(provento), codigo });
        }
        if (desconto && desconto !== '-' && parseFloat(desconto.replace(',', '.')) > 0) {
          emp.descontos?.push({ tipo: descricao, valor: this.parseValue(desconto), codigo });
        }
      }
    }
  }
}