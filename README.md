# Folha Data Explorer

Sistema profissional para extração e análise de dados de folhas analíticas em PDF com exportação para Excel.

## 🚀 Funcionalidades

- **Upload Múltiplo**: Suporte para múltiplos arquivos PDF
- **Extração Inteligente**: Parser avançado para diferentes formatos de folhas analíticas
- **Processamento em Lote**: Extração automática de dados de colaboradores
- **Filtros Avançados**: Busca por nome, matrícula, função e filial
- **Exportação Excel**: Geração de relatórios estruturados
- **Totalização**: Análise por eventos e filiais
- **Interface Responsiva**: Design moderno e intuitivo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **PDF Processing**: PDF.js
- **Excel Export**: xlsx
- **State Management**: React Context API
- **Routing**: React Router DOM

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd folha-data-explorer

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

## 🎯 Como Usar

1. **Upload de Arquivos**: Arraste e solte arquivos PDF ou clique para selecionar
2. **Processamento**: O sistema extrai automaticamente os dados
3. **Visualização**: Dados organizados em tabela navegável
4. **Filtros**: Use os filtros para encontrar informações específicas
5. **Exportação**: Baixe os dados em formato Excel
6. **Totalização**: Acesse a página de totais para análises agregadas

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface
│   ├── EmployeeTable.tsx
│   ├── PDFUploader.tsx
│   └── EmployeeProvider.tsx
├── pages/              # Páginas da aplicação
│   ├── Index.tsx
│   └── TotalsPage.tsx
├── services/           # Serviços e lógica de negócio
│   └── pdfExtractor.ts
├── types/              # Definições de tipos TypeScript
│   └── employee.ts
└── hooks/              # Hooks customizados
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run build:dev    # Gera build de desenvolvimento
npm run lint         # Executa linter
npm run preview      # Visualiza build de produção
```

## 📈 Recursos Avançados

- **Parser Inteligente**: Suporte a múltiplos formatos de folhas analíticas
- **Validação de Dados**: Verificação automática de integridade
- **Cache Local**: Persistência de dados no localStorage
- **Progress Tracking**: Acompanhamento do processamento
- **Error Handling**: Tratamento robusto de erros
- **Responsive Design**: Interface adaptável a diferentes dispositivos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório do projeto.
