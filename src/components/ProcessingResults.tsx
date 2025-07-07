import React from 'react';
import { ProcessingStats } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface ProcessingResultsProps {
  stats: ProcessingStats;
}

export function ProcessingResults({ stats }: ProcessingResultsProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const successRate = stats.totalFiles > 0 ? (stats.successfulExtractions / stats.totalFiles) * 100 : 0;

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span>Resultados do Processamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-secondary rounded-lg">
            <FileText className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Arquivos</p>
            <p className="text-xl font-bold text-foreground">{stats.totalFiles}</p>
          </div>

          <div className="text-center p-3 bg-gradient-success rounded-lg">
            <CheckCircle className="w-6 h-6 mx-auto text-success-foreground mb-2" />
            <p className="text-sm text-success-foreground">Processados</p>
            <p className="text-xl font-bold text-success-foreground">{stats.successfulExtractions}</p>
          </div>

          <div className="text-center p-3 bg-gradient-primary rounded-lg">
            <FileText className="w-6 h-6 mx-auto text-primary-foreground mb-2" />
            <p className="text-sm text-primary-foreground">Colaboradores</p>
            <p className="text-xl font-bold text-primary-foreground">{stats.totalEmployees}</p>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Tempo</p>
            <p className="text-xl font-bold text-foreground">{formatTime(stats.processingTime)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
          <Badge 
            variant={successRate === 100 ? "default" : successRate > 80 ? "secondary" : "destructive"}
            className="bg-gradient-success text-success-foreground"
          >
            {successRate.toFixed(1)}%
          </Badge>
        </div>

        {stats.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Erros Encontrados:</span>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <ul className="text-sm space-y-1">
                {stats.errors.map((error, index) => (
                  <li key={index} className="text-destructive">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {stats.errors.length === 0 && (
          <div className="flex items-center space-x-2 text-success bg-success/10 border border-success/20 rounded-lg p-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Todos os arquivos foram processados com sucesso!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}