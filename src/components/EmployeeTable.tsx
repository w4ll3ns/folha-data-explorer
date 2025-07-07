import React, { useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter, Users, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFilial, setFilterFilial] = useState<string>('all');
  const [filterFuncao, setFilterFuncao] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.matricula.includes(searchTerm) ||
                           (employee.funcao?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilial = filterFilial === 'all' || employee.filial === filterFilial;
      const matchesFuncao = filterFuncao === 'all' || employee.funcao === filterFuncao;
      
      return matchesSearch && matchesFilial && matchesFuncao;
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
  }, [employees, searchTerm, filterFilial, filterFuncao, sortField, sortDirection]);

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
    const exportData = filteredEmployees.map(emp => ({
      'Nome': emp.name,
      'Matrícula': emp.matricula,
      'Função': emp.funcao || '',
      'Seção': emp.secao || '',
      'Filial': emp.filial || '',
      'Admissão': emp.admissao || '',
      'Salário Base': emp.salarioBase || 0,
      'Total Bruto': emp.valores.bruto,
      'Total Descontos': emp.valores.totalDescontos,
      'Valor Líquido': emp.valores.liquido,
      'Base INSS': emp.bases.inss || 0,
      'Base IRRF': emp.bases.irrf || 0,
      'Base FGTS': emp.bases.fgts || 0,
      'Proventos': emp.proventos.map(p => `${p.tipo}: ${formatCurrency(p.valor)}`).join('; '),
      'Descontos': emp.descontos.map(d => `${d.tipo}: ${formatCurrency(d.valor)}`).join('; ')
    }));

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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Folha Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalLiquido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Salário Médio</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgSalary)}</p>
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
                  <TableHead className="text-right">Sal. Base</TableHead>
                  <TableHead className="text-right">Bruto</TableHead>
                  <TableHead className="text-right">Descontos</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('valores' as keyof Employee)}
                  >
                    Líquido {sortField === 'valores' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.matricula}</Badge>
                    </TableCell>
                    <TableCell>{employee.funcao || '-'}</TableCell>
                    <TableCell>{employee.filial || '-'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.salarioBase || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.valores.bruto)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(employee.valores.totalDescontos)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      {formatCurrency(employee.valores.liquido)}
                    </TableCell>
                  </TableRow>
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