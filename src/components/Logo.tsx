import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  customImage?: string;
  customImageAlt?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  customImage,
  customImageAlt = 'Logo'
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

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon/Image */}
      <div className={`${sizeClasses[size]} bg-primary-foreground/20 rounded-lg flex items-center justify-center overflow-hidden`}>
        {customImage ? (
          <img 
            src={customImage} 
            alt={customImageAlt}
            className={`${sizeClasses[size]} object-contain`}
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