import React, { useState } from 'react';
import { PDFUploader } from '@/components/PDFUploader';
import { EmployeeTable } from '@/components/EmployeeTable';
import { ProcessingResults } from '@/components/ProcessingResults';
import { PDFExtractor } from '@/services/pdfExtractor';
import { Employee, ExtractionResult } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, RefreshCw, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EmployeeProvider, useEmployees } from '@/components/EmployeeProvider';
import { Link } from 'react-router-dom';

const IndexContent = () => {
  const { employees, setEmployees } = useEmployees();
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setEmployees([]);
    setExtractionResult(null);

    try {
      toast({
        title: "Processando arquivos",
        description: "Iniciando extração de dados das folhas analíticas...",
      });

      const result = await PDFExtractor.extractFromFiles(files, (progress) => {
        setProcessingProgress(progress);
      });

      setExtractionResult(result);
      setEmployees(result.employees);
      // Log detalhado dos dados extraídos
      console.log('[DEBUG][Employees extraídos]', JSON.stringify(result.employees, null, 2));

      if (result.success) {
        toast({
          title: "Processamento concluído",
          description: `${result.employees.length} colaboradores extraídos com sucesso!`,
        });
      } else {
        toast({
          title: "Processamento concluído com avisos",
          description: `${result.employees.length} colaboradores extraídos. Verifique os erros relatados.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const resetApplication = () => {
    if (window.confirm('Tem certeza que deseja iniciar um novo processamento? Todos os dados atuais serão perdidos.')) {
      setEmployees([]);
      setExtractionResult(null);
      setIsProcessing(false);
      setProcessingProgress(0);
      localStorage.removeItem('folha:employees');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground shadow-lg-custom">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Extrator de Folhas Analíticas</h1>
                <p className="text-primary-foreground/80">Processamento inteligente de PDFs para Excel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {employees.length > 0 && (
                <>
                  <Link to="/totais">
                    <Button variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0">
                      Totais por Evento
                    </Button>
                  </Link>
                  <Button
                    onClick={resetApplication}
                    variant="secondary"
                    className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Novo Processamento
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Área de Upload */}
        {employees.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg-custom">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <Upload className="w-6 h-6 text-primary" />
                  <span>Processamento de Folhas Analíticas</span>
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Carregue arquivos PDF de folhas analíticas para extrair dados estruturados de colaboradores
                </p>
              </CardHeader>
              <CardContent>
                <PDFUploader
                  onFilesSelected={handleFilesSelected}
                  isProcessing={isProcessing}
                  processingProgress={processingProgress}
                />
              </CardContent>
            </Card>

            {/* Instruções */}
            <Card className="mt-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary">Como usar esta ferramenta:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>• <strong>Upload:</strong> Selecione um ou múltiplos arquivos PDF</p>
                    <p>• <strong>Processamento:</strong> A extração é feita automaticamente</p>
                    <p>• <strong>Visualização:</strong> Dados organizados em tabela navegável</p>
                  </div>
                  <div className="space-y-2">
                    <p>• <strong>Filtros:</strong> Busque por nome, função ou filial</p>
                    <p>• <strong>Exportação:</strong> Baixe os dados em Excel (.xlsx)</p>
                    <p>• <strong>Validação:</strong> Relatório de erros e estatísticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultados do Processamento */}
        {extractionResult && (
          <div className="max-w-6xl mx-auto">
            <ProcessingResults stats={extractionResult.stats} />
          </div>
        )}

        {/* Tabela de Colaboradores */}
        {employees.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <EmployeeTable employees={employees} />
          </div>
        )}
      </div>
    </div>
  );
};

const Index = () => (
  <EmployeeProvider>
    <IndexContent />
  </EmployeeProvider>
);

export default Index;
