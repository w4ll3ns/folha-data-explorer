import React, { useMemo, useState } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { MultiSelect } from '@/components/ui/multiselect';

// Supondo que os dados dos colaboradores estejam disponíveis via props ou contexto
// Ajuste para buscar do local correto conforme sua arquitetura
import { useEmployees } from '@/components/EmployeeProvider';

export default function TotalsPage() {
  const { employees } = useEmployees();
  console.log('[DEBUG][TotalsPage][employees]', employees);
  const navigate = useNavigate();

  // Gerar listas únicas de filiais e eventos
  const filiais = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.filial) set.add(e.filial); });
    return Array.from(set);
  }, [employees]);

  const eventos = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach(e => {
      e.eventos?.forEach(ev => {
        if (ev.codigo && ev.tipo) map.set(ev.codigo, ev.tipo);
      });
    });
    return Array.from(map.entries()).map(([codigo, tipo]) => ({ codigo, tipo }));
  }, [employees]);

  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState<string[]>([]);
  const [eventosSelecionados, setEventosSelecionados] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const hasData = employees && employees.length > 0;

  // Filtrar colaboradores e somar valores
  const total = useMemo(() => {
    if (!filiaisSelecionadas.length || !eventosSelecionados.length) return 0;
    return employees
      .filter(e => filiaisSelecionadas.includes(e.filial))
      .flatMap(e => e.eventos || [])
      .filter(ev => eventosSelecionados.includes(ev.codigo))
      .reduce((sum, ev) => sum + (ev.valor || 0), 0);
  }, [employees, filiaisSelecionadas, eventosSelecionados]);

  // Lista de colaboradores e valores do total selecionado
  const detalhes = useMemo(() => {
    if (!filiaisSelecionadas.length || !eventosSelecionados.length) return [];
    return employees
      .filter(e => filiaisSelecionadas.includes(e.filial))
      .flatMap(e => (e.eventos || [])
        .filter(ev => eventosSelecionados.includes(ev.codigo))
        .map(ev => ({ colaborador: e.name, matricula: e.matricula, valor: ev.valor, evento: ev.tipo, codigo: ev.codigo, filial: e.filial }))
      );
  }, [employees, filiaisSelecionadas, eventosSelecionados]);

  // Exportar resumo e detalhes para Excel
  const exportToExcel = () => {
    const resumo = filiaisSelecionadas.flatMap(filial =>
      eventosSelecionados.map(evento => {
        const tipo = eventos.find(ev => ev.codigo === evento)?.tipo || '';
        const totalFilialEvento = employees
          .filter(e => e.filial === filial)
          .flatMap(e => e.eventos || [])
          .filter(ev => ev.codigo === evento)
          .reduce((sum, ev) => sum + (ev.valor || 0), 0);
        return {
          Filial: filial,
          Evento: evento + ' - ' + tipo,
          Total: totalFilialEvento
        };
      })
    );
    const detalhesExport = detalhes.map(d => ({
      Filial: d.filial,
      Evento: d.codigo,
      Descricao: d.evento,
      Colaborador: d.colaborador,
      Matricula: d.matricula,
      Valor: d.valor
    }));
    const wb = XLSX.utils.book_new();
    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
    if (detalhesExport.length > 0) {
      const wsDetalhes = XLSX.utils.json_to_sheet(detalhesExport);
      XLSX.utils.book_append_sheet(wb, wsDetalhes, 'Detalhes');
    }
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `totais_evento_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Totalização por Evento e Filial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasData && (
            <div className="text-center py-8 text-muted-foreground space-y-4">
              <p>Nenhum dado disponível. Faça o processamento de um arquivo primeiro.</p>
              <Button onClick={() => navigate('/')}>Ir para Processamento</Button>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <MultiSelect
              options={filiais.map(filial => ({ value: filial, label: filial }))}
              value={filiaisSelecionadas}
              onChange={setFiliaisSelecionadas}
              placeholder="Selecione a(s) Filial(is)"
              disabled={!hasData}
            />
            <MultiSelect
              options={eventos.map(ev => ({ value: ev.codigo, label: ev.codigo + ' - ' + ev.tipo }))}
              value={eventosSelecionados}
              onChange={setEventosSelecionados}
              placeholder="Selecione o(s) Evento(s)"
              disabled={!hasData}
            />
          </div>
          {hasData && (
            <div className="mt-6 flex items-center gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filial</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filiaisSelecionadas.length > 0 && eventosSelecionados.length > 0 &&
                    filiaisSelecionadas.flatMap(filial =>
                      eventosSelecionados.map(evento => {
                        const tipo = eventos.find(ev => ev.codigo === evento)?.tipo || '';
                        const totalFilialEvento = employees
                          .filter(e => e.filial === filial)
                          .flatMap(e => e.eventos || [])
                          .filter(ev => ev.codigo === evento)
                          .reduce((sum, ev) => sum + (ev.valor || 0), 0);
                        return (
                          <TableRow key={filial + '-' + evento} className="cursor-pointer hover:bg-muted/40" onClick={() => setShowDetails(v => !v)}>
                            <TableCell>{filial}</TableCell>
                            <TableCell>{evento} - {tipo}</TableCell>
                            <TableCell><b>{totalFilialEvento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></TableCell>
                          </TableRow>
                        );
                      })
                    )}
                </TableBody>
              </Table>
              <Button onClick={exportToExcel} disabled={!filiaisSelecionadas.length || !eventosSelecionados.length}>
                Exportar Excel
              </Button>
            </div>
          )}
          {hasData && showDetails && detalhes.length > 0 && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalhes.map((d, idx) => (
                    <TableRow key={d.matricula + '-' + d.codigo + '-' + idx}>
                      <TableCell>{d.colaborador}</TableCell>
                      <TableCell>{d.matricula}</TableCell>
                      <TableCell>{d.evento}</TableCell>
                      <TableCell>{d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 