import React from 'react';
import { Logo } from './Logo';

// Exemplo de como usar o componente Logo com diferentes configurações
export const LogoExamples: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Exemplos de Logo</h2>
      
      {/* Logo padrão (com ícone) */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Padrão</h3>
        <Logo size="lg" />
      </div>
      
      {/* Logo com imagem personalizada */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo com Imagem Personalizada</h3>
        <Logo 
          size="lg" 
          customImage="/logo.png" 
          customImageAlt="Logo da Empresa"
        />
      </div>
      
      {/* Logo apenas ícone */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Apenas Ícone</h3>
        <Logo size="md" showText={false} />
      </div>
      
      {/* Logo pequeno */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Pequeno</h3>
        <Logo size="sm" />
      </div>
    </div>
  );
}; 