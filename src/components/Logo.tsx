import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  customImage?: string;
  customImageAlt?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  customImage,
  customImageAlt = 'Logo',
  maxWidth,
  maxHeight
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // Dimensões padrão para imagens personalizadas
  const imageSizes = {
    sm: 'max-w-8 max-h-8',
    md: 'max-w-10 max-h-10',
    lg: 'max-w-12 max-h-12'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon/Image Container */}
      <div className={`${sizeClasses[size]} bg-primary-foreground/20 rounded-lg flex items-center justify-center overflow-hidden`}>
        {customImage ? (
          <img 
            src={customImage} 
            alt={customImageAlt}
            className={`${imageSizes[size]} ${maxWidth || ''} ${maxHeight || ''} object-contain`}
            style={{
              maxWidth: maxWidth || undefined,
              maxHeight: maxHeight || undefined,
              width: 'auto',
              height: 'auto'
            }}
          />
        ) : (
          <FileSpreadsheet className={`${iconSizes[size]} text-primary-foreground`} />
        )}
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold text-primary-foreground`}>
            Extrator de Folhas Analíticas
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Processamento inteligente de PDFs para Excel
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para logo apenas com ícone (sem texto)
export const LogoIcon: React.FC<Omit<LogoProps, 'showText'>> = (props) => {
  return <Logo {...props} showText={false} />;
};

// Componente para logo flexível (sem container fixo)
export const LogoFlexible: React.FC<Omit<LogoProps, 'size'> & { 
  width?: string;
  height?: string;
}> = ({ 
  showText = true, 
  className = '',
  customImage,
  customImageAlt = 'Logo',
  width,
  height,
  maxWidth,
  maxHeight
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image - Flexível */}
      {customImage ? (
        <img 
          src={customImage} 
          alt={customImageAlt}
          className={`object-contain ${maxWidth || ''} ${maxHeight || ''}`}
          style={{
            width: width || 'auto',
            height: height || 'auto',
            maxWidth: maxWidth || undefined,
            maxHeight: maxHeight || undefined
          }}
        />
      ) : (
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6 text-primary-foreground" />
        </div>
      )}
      
      {/* Logo Text */}
      {showText && (
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">
            Extrator de Folhas Analíticas
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Processamento inteligente de PDFs para Excel
          </p>
        </div>
      )}
    </div>
  );
}; 