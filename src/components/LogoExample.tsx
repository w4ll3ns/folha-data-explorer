import React from 'react';
import { Logo, LogoIcon, LogoFlexible } from './Logo';

// Exemplo de como usar o componente Logo com diferentes configurações
export const LogoExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Exemplos de Logo</h2>
      
      {/* Logo padrão (com ícone) */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Padrão</h3>
        <Logo size="lg" />
      </div>
      
      {/* Logo com imagem personalizada - tamanhos fixos */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo com Imagem - Tamanhos Fixos</h3>
        <div className="space-y-2">
          <Logo size="sm" customImage="/logo.png" customImageAlt="Logo Pequeno" />
          <Logo size="md" customImage="/logo.png" customImageAlt="Logo Médio" />
          <Logo size="lg" customImage="/logo.png" customImageAlt="Logo Grande" />
        </div>
      </div>
      
      {/* Logo flexível - dimensões personalizadas */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Flexível - Dimensões Personalizadas</h3>
        <div className="space-y-2">
          <LogoFlexible 
            customImage="/logo.png" 
            customImageAlt="Logo Retangular"
            width="120px"
            height="40px"
          />
          <LogoFlexible 
            customImage="/logo.png" 
            customImageAlt="Logo Alta"
            width="60px"
            height="80px"
          />
          <LogoFlexible 
            customImage="/logo.png" 
            customImageAlt="Logo Larga"
            width="200px"
            height="30px"
          />
        </div>
      </div>
      
      {/* Logo com limites máximos */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo com Limites Máximos</h3>
        <div className="space-y-2">
          <Logo 
            size="lg" 
            customImage="/logo.png" 
            customImageAlt="Logo Limitada"
            maxWidth="100px"
            maxHeight="50px"
          />
          <Logo 
            size="md" 
            customImage="/logo.png" 
            customImageAlt="Logo Compacta"
            maxWidth="60px"
            maxHeight="30px"
          />
        </div>
      </div>
      
      {/* Logo apenas ícone */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Apenas Ícone</h3>
        <div className="flex space-x-4">
          <LogoIcon size="sm" />
          <LogoIcon size="md" />
          <LogoIcon size="lg" />
        </div>
      </div>
      
      {/* Logo flexível apenas imagem */}
      <div>
        <h3 className="text-sm font-medium mb-2">Logo Flexível Apenas Imagem</h3>
        <div className="space-y-2">
          <LogoFlexible 
            showText={false}
            customImage="/logo.png" 
            customImageAlt="Logo Solo"
            width="80px"
            height="auto"
          />
          <LogoFlexible 
            showText={false}
            customImage="/logo.png" 
            customImageAlt="Logo Compacta"
            maxWidth="60px"
            maxHeight="40px"
          />
        </div>
      </div>
    </div>
  );
}; 