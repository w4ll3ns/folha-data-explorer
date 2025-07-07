import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-lg-custom">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Erro na Aplicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado. Por favor, recarregue a página para tentar novamente.
              </p>
              
              {this.state.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-left">
                  <p className="text-sm text-destructive font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-primary hover:shadow-primary w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Aplicação
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}