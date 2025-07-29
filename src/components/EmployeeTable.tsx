import React, { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter, Users, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  // Log detalhado dos dados recebidos
  console.log('[DEBUG][EmployeeTable props]', JSON.stringify(employees, null, 2));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilial, setFilterFilial] = useState<string>('all');
  const [filterFuncao, setFilterFuncao] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showOnlyNoEvents, setShowOnlyNoEvents] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Obter valores únicos para filtros
  const uniqueFiliais = useMemo(() => 
    [...new Set(employees.map(emp => emp.filial).filter(Boolean))], 
    [employees]
  );

  const uniqueFuncoes = useMemo(() => 
    [...new Set(employees.map(emp => emp.funcao).filter(Boolean))], 
    [employees]
  );

  // Filtrar e ordenar dados
  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.matricula.includes(searchTerm) ||
                           (employee.funcao?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilial = filterFilial === 'all' || employee.filial === filterFilial;
      const matchesFuncao = filterFuncao === 'all' || employee.funcao === filterFuncao;
      const matchesNoEvents = !showOnlyNoEvents || !(employee.eventos && employee.eventos.length > 0);
      
      return matchesSearch && matchesFilial && matchesFuncao && matchesNoEvents;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratamento especial para valores numéricos
      if (sortField === 'valores') {
        aValue = a.valores.liquido;
        bValue = b.valores.liquido;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [employees, searchTerm, filterFilial, filterFuncao, sortField, sortDirection, showOnlyNoEvents]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalLiquido = filteredEmployees.reduce((sum, emp) => sum + emp.valores.liquido, 0);
    const avgSalary = filteredEmployees.length > 0 ? totalLiquido / filteredEmployees.length : 0;
    
    return {
      total: filteredEmployees.length,
      totalLiquido,
      avgSalary
    };
  }, [filteredEmployees]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToExcel = () => {
    // Exportar cada evento em uma linha
    const exportData: Array<{
      Filial: string;
      Matrícula: string;
      'Código do Evento': string;
      Descrição: string;
      'Ref.': string;
      Valor: number | string;
    }> = [];
    
    filteredEmployees.forEach(emp => {
      if (emp.eventos && emp.eventos.length > 0) {
        emp.eventos.forEach(ev => {
          exportData.push({
            'Filial': emp.filial,
            'Matrícula': emp.matricula,
            'Código do Evento': ev.codigo,
            'Descrição': ev.tipo,
            'Ref.': ev.ref,
            'Valor': ev.valor
          });
        });
      } else {
        // Se não houver eventos, ainda exporta a matrícula
        exportData.push({
          'Filial': emp.filial,
          'Matrícula': emp.matricula,
          'Código do Evento': '',
          'Descrição': '',
          'Ref.': '',
          'Valor': ''
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Folha Analítica');
    
    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `folha_analitica_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Funcionários</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros e Busca</span>
            </span>
            <Button 
              onClick={exportToExcel}
              className="bg-gradient-success hover:shadow-primary"
              disabled={filteredEmployees.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, matrícula ou função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterFilial} onValueChange={setFilterFilial}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Filiais</SelectItem>
                {uniqueFiliais.map(filial => (
                  <SelectItem key={filial} value={filial}>{filial}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFuncao} onValueChange={setFilterFuncao}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Funções</SelectItem>
                {uniqueFuncoes.map(funcao => (
                  <SelectItem key={funcao} value={funcao}>{funcao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <input
              type="checkbox"
              id="no-events-filter"
              checked={showOnlyNoEvents}
              onChange={e => setShowOnlyNoEvents(e.target.checked)}
              style={{ accentColor: '#f59e42', width: 16, height: 16 }}
            />
            <label htmlFor="no-events-filter" style={{ fontSize: 14, color: '#555', cursor: 'pointer' }}>
              Mostrar apenas colaboradores sem eventos
            </label>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <Card className="shadow-lg-custom">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('matricula')}
                  >
                    Matrícula {sortField === 'matricula' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Eventos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <TableRow
                      className={`transition-colors ${(!employee.eventos || employee.eventos.length === 0) ? 'bg-yellow-50' : 'hover:bg-muted/30'}`}
                    >
                      <TableCell className="font-medium">
                        <button
                          onClick={() => toggleExpand(employee.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 6, verticalAlign: 'middle' }}
                          aria-label={expandedRows.includes(employee.id) ? 'Colapsar' : 'Expandir'}
                        >
                          {expandedRows.includes(employee.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {employee.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.matricula}</Badge>
                      </TableCell>
                      <TableCell>{employee.funcao || '-'}</TableCell>
                      <TableCell>{employee.filial || '-'}</TableCell>
                      <TableCell>
                        {employee.eventos && employee.eventos.length > 0 ? (
                          <span style={{ color: '#888', fontSize: 12 }}>{employee.eventos.length} evento(s)</span>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    {expandedRows.includes(employee.id) && employee.eventos && employee.eventos.length > 0 && (
                      employee.eventos.map(ev => (
                        <TableRow key={employee.id + '-' + ev.codigo + '-' + ev.ref} style={{ background: '#f9f9f9' }}>
                          {/* Dados do evento na primeira coluna */}
                          <TableCell style={{ padding: 0 }}>
                            <div style={{ display: 'flex', gap: 12, fontSize: 13, padding: '4px 0 4px 8px' }}>
                              <span style={{ minWidth: 60, fontWeight: 500 }}>{ev.codigo}</span>
                              <span style={{ flex: 1 }}>{ev.tipo}</span>
                              <span style={{ minWidth: 40 }}>{ev.ref}</span>
                              <span style={{ minWidth: 80, textAlign: 'right' }}>{formatCurrency(ev.valor)}</span>
                            </div>
                          </TableCell>
                          {/* 4 células vazias para alinhar com as colunas restantes */}
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                        </TableRow>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum funcionário encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}