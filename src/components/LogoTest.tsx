import React, { useState } from 'react';

export const LogoTest: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Teste da Logo</h3>
      
      <div className="space-y-4">
        {/* Teste 1: Imagem direta */}
        <div>
          <h4 className="font-medium mb-2">1. Teste de Carregamento Direto:</h4>
          <img 
            src="/logo.png" 
            alt="Logo Test"
            className="border-2 border-gray-300 max-w-xs"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <p className="text-sm mt-1">
            Status: {imageLoaded ? '✅ Carregada' : imageError ? '❌ Erro' : '⏳ Carregando...'}
          </p>
        </div>

        {/* Teste 2: URL completa */}
        <div>
          <h4 className="font-medium mb-2">2. URL Completa:</h4>
          <img 
            src="http://localhost:8080/logo.png" 
            alt="Logo Test Full URL"
            className="border-2 border-gray-300 max-w-xs"
          />
        </div>

        {/* Teste 3: Informações do arquivo */}
        <div>
          <h4 className="font-medium mb-2">3. Informações:</h4>
          <ul className="text-sm space-y-1">
            <li>• Arquivo: /public/logo.png</li>
            <li>• URL: /logo.png</li>
            <li>• Tamanho: 68KB</li>
            <li>• Tipo: image/png</li>
          </ul>
        </div>

        {/* Teste 4: Debug */}
        <div>
          <h4 className="font-medium mb-2">4. Debug:</h4>
          <button 
            onClick={() => {
              const img = new Image();
              img.onload = () => console.log('✅ Logo carregada com sucesso');
              img.onerror = () => console.log('❌ Erro ao carregar logo');
              img.src = '/logo.png';
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Testar Carregamento via JavaScript
          </button>
        </div>
      </div>
    </div>
  );
}; 