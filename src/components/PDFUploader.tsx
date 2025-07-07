import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PDFUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  processingProgress?: number;
}

export function PDFUploader({ onFilesSelected, isProcessing, processingProgress = 0 }: PDFUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast({
        title: "Arquivos inválidos",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive"
      });
    }

    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled: isProcessing
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed transition-all duration-300 hover:border-primary/50 hover:shadow-card">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'scale-105' : ''
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground transition-transform duration-300 ${
                isDragActive ? 'animate-pulse-scale' : ''
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {isDragActive ? 'Solte os arquivos aqui' : 'Upload de Folhas Analíticas'}
                </h3>
                <p className="text-muted-foreground">
                  Arraste e solte arquivos PDF ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporte para múltiplos arquivos PDF
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-foreground">
                Arquivos Selecionados ({selectedFiles.length})
              </h4>
              {!isProcessing && (
                <Button 
                  onClick={processFiles}
                  className="bg-gradient-primary hover:shadow-primary"
                >
                  Processar PDFs
                </Button>
              )}
            </div>

            {isProcessing && (
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando arquivos...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFiles.length === 0 && !isProcessing && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                Nenhum arquivo selecionado. Adicione arquivos PDF para começar a extração.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}