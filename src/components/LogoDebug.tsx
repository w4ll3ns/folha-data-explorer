import React from 'react';

export const LogoDebug: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4">Debug da Logo</h3>
      
      <div className="space-y-4">
        {/* Teste 1: Imagem simples */}
        <div>
          <h4 className="font-medium mb-2">1. Imagem Simples:</h4>
          <img 
            src="/logo.png" 
            alt="Logo Debug"
            className="border-2 border-red-300 max-w-xs"
            style={{ width: '180px', height: 'auto' }}
          />
        </div>

        {/* Teste 2: Com container */}
        <div>
          <h4 className="font-medium mb-2">2. Com Container:</h4>
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo Debug Container"
              className="max-w-10 max-h-10 object-contain"
            />
          </div>
        </div>

        {/* Teste 3: Flexível */}
        <div>
          <h4 className="font-medium mb-2">3. Flexível:</h4>
          <img 
            src="/logo.png" 
            alt="Logo Debug Flexible"
            className="object-contain max-w-12 max-h-12"
            style={{
              width: '180px',
              height: 'auto',
              maxWidth: '180px',
              maxHeight: 'auto'
            }}
          />
        </div>

        {/* Teste 4: Console log */}
        <div>
          <h4 className="font-medium mb-2">4. Console Log:</h4>
          <button 
            onClick={() => {
              console.log('🔍 Testando carregamento da logo...');
              const img = new Image();
              img.onload = () => {
                console.log('✅ Logo carregada:', img.width, 'x', img.height);
                console.log('📁 Src:', img.src);
              };
              img.onerror = (e) => {
                console.log('❌ Erro ao carregar logo:', e);
              };
              img.src = '/logo.png';
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Log no Console
          </button>
        </div>
      </div>
    </div>
  );
}; 