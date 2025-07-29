# 🎨 Configuração da Logo

## Como Adicionar sua Logo Personalizada

### 1. **Preparar a Imagem**
- Formato recomendado: **PNG** ou **SVG**
- Tamanho recomendado: **64x64px** ou **128x128px**
- Fundo transparente (preferencialmente)
- Nome do arquivo: `logo.png` ou `logo.svg`

### 2. **Adicionar a Imagem**
Coloque sua logo na pasta `public/`:
```
public/
├── logo.png          ← Sua logo aqui
├── favicon.ico
├── robots.txt
└── 404.html
```

### 3. **Usar a Logo no Código**

#### Opção A: Logo com Texto
```tsx
import { Logo } from '@/components/Logo';

// Logo padrão (com ícone)
<Logo size="lg" />

// Logo com imagem personalizada
<Logo 
  size="lg" 
  customImage="/logo.png" 
  customImageAlt="Logo da Empresa"
/>
```

#### Opção B: Logo Apenas Ícone
```tsx
import { LogoIcon } from '@/components/Logo';

<LogoIcon size="md" customImage="/logo.png" />
```

### 4. **Tamanhos Disponíveis**
- `sm`: 32x32px (ícone: 20x20px)
- `md`: 40x40px (ícone: 24x24px) 
- `lg`: 48x48px (ícone: 28x28px)

### 5. **Exemplo Completo**
```tsx
// src/pages/Index.tsx
import { Logo } from '@/components/Logo';

// No header da aplicação
<div className="flex items-center justify-between">
  <Logo 
    size="lg" 
    customImage="/logo.png" 
    customImageAlt="Extrator de Folhas Analíticas"
  />
  {/* resto do header */}
</div>
```

### 6. **Fallback Automático**
Se não especificar `customImage`, o componente usa o ícone padrão (FileSpreadsheet).

### 7. **Estilização**
A logo herda automaticamente as cores do tema:
- Fundo: `bg-primary-foreground/20`
- Ícone: `text-primary-foreground`
- Texto: `text-primary-foreground`

---

## 🚀 Implementação Rápida

1. **Adicione sua logo** em `public/logo.png`
2. **Atualize o componente** em `src/pages/Index.tsx`:
   ```tsx
   <Logo 
     size="lg" 
     customImage="/logo.png" 
     customImageAlt="Sua Empresa"
   />
   ```
3. **Teste localmente**: `npm run dev`
4. **Deploy**: `git add . && git commit -m "add: logo personalizada" && git push`

---

## 📝 Notas Importantes

- ✅ A logo é responsiva e se adapta ao tema
- ✅ Suporte a PNG, JPG, SVG
- ✅ Fallback para ícone padrão
- ✅ Diferentes tamanhos disponíveis
- ✅ Acessibilidade com `alt` text 