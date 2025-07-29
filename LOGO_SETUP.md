# 🎨 Configuração da Logo

## Como Adicionar sua Logo Personalizada

### 1. **Preparar a Imagem**
- **Formatos suportados**: PNG, JPG, SVG
- **Dimensões**: Qualquer tamanho (não precisa ser quadrada!)
- **Fundo**: Transparente (recomendado)
- **Nome do arquivo**: `logo.png`, `logo.svg`, etc.

### 2. **Adicionar a Imagem**
Coloque sua logo na pasta `public/`:
```
public/
├── logo.png          ← Sua logo aqui (qualquer dimensão)
├── favicon.ico
├── robots.txt
└── 404.html
```

### 3. **Tipos de Componente Logo**

#### **A. Logo Padrão (Tamanhos Fixos)**
```tsx
import { Logo } from '@/components/Logo';

// Tamanhos pré-definidos
<Logo size="sm" customImage="/logo.png" />
<Logo size="md" customImage="/logo.png" />
<Logo size="lg" customImage="/logo.png" />
```

#### **B. Logo Flexível (Dimensões Personalizadas)**
```tsx
import { LogoFlexible } from '@/components/Logo';

// Dimensões específicas
<LogoFlexible 
  customImage="/logo.png" 
  width="120px"
  height="40px"
/>

// Altura automática
<LogoFlexible 
  customImage="/logo.png" 
  width="200px"
  height="auto"
/>

// Limites máximos
<LogoFlexible 
  customImage="/logo.png" 
  maxWidth="100px"
  maxHeight="50px"
/>
```

#### **C. Logo Apenas Ícone**
```tsx
import { LogoIcon } from '@/components/Logo';

<LogoIcon size="md" customImage="/logo.png" />
```

### 4. **Tamanhos Disponíveis**

| Tipo | Dimensões | Uso |
|------|-----------|-----|
| `sm` | 32x32px | Ícones pequenos |
| `md` | 40x40px | Tamanho padrão |
| `lg` | 48x48px | Destaque |

### 5. **Exemplos Práticos**

#### **Logo Retangular (Header)**
```tsx
<LogoFlexible 
  customImage="/logo.png" 
  width="180px"
  height="50px"
  customImageAlt="Logo da Empresa"
/>
```

#### **Logo Alta (Sidebar)**
```tsx
<LogoFlexible 
  customImage="/logo.png" 
  width="60px"
  height="80px"
  showText={false}
/>
```

#### **Logo Compacta (Mobile)**
```tsx
<LogoFlexible 
  customImage="/logo.png" 
  maxWidth="80px"
  maxHeight="30px"
/>
```

### 6. **Implementação na Página Principal**

```tsx
// src/pages/Index.tsx
import { LogoFlexible } from '@/components/Logo';

// No header da aplicação
<div className="flex items-center justify-between">
  <LogoFlexible 
    customImage="/logo.png" 
    width="160px"
    height="auto"
    customImageAlt="Extrator de Folhas Analíticas"
  />
  {/* resto do header */}
</div>
```

### 7. **Responsividade**

O componente se adapta automaticamente:

```tsx
// Desktop
<LogoFlexible 
  customImage="/logo.png" 
  width="200px"
  height="auto"
/>

// Mobile (via CSS)
<LogoFlexible 
  customImage="/logo.png" 
  className="w-32 h-auto md:w-48"
/>
```

### 8. **Fallback Automático**
Se não especificar `customImage`, usa o ícone padrão (FileSpreadsheet).

### 9. **Estilização Avançada**

```tsx
// Logo com borda
<LogoFlexible 
  customImage="/logo.png" 
  className="border-2 border-primary rounded-lg p-2"
/>

// Logo com sombra
<LogoFlexible 
  customImage="/logo.png" 
  className="shadow-lg"
/>

// Logo com hover effect
<LogoFlexible 
  customImage="/logo.png" 
  className="hover:scale-105 transition-transform"
/>
```

---

## 🚀 Implementação Rápida

1. **Adicione sua logo** em `public/logo.png`
2. **Escolha o componente** adequado:
   - `Logo` para tamanhos fixos
   - `LogoFlexible` para dimensões personalizadas
   - `LogoIcon` para apenas ícone
3. **Teste localmente**: `npm run dev`
4. **Deploy**: `git add . && git commit -m "add: logo flexível" && git push`

---

## 📝 Vantagens do Sistema Flexível

- ✅ **Qualquer dimensão** de imagem
- ✅ **Proporções mantidas** automaticamente
- ✅ **Responsivo** em todos os dispositivos
- ✅ **Fallback** para ícone padrão
- ✅ **Acessibilidade** com alt text
- ✅ **Performance** otimizada
- ✅ **Tema adaptativo** (cores automáticas)

---

## 🎯 Casos de Uso Comuns

| Cenário | Componente | Configuração |
|---------|------------|--------------|
| Header principal | `LogoFlexible` | `width="180px", height="auto"` |
| Sidebar | `LogoFlexible` | `width="60px", height="80px"` |
| Mobile | `Logo` | `size="md"` |
| Favicon | `LogoIcon` | `size="sm"` |
| Footer | `LogoFlexible` | `maxWidth="120px"` | 