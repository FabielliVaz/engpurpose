# 🎵 EngPurpose - Learn English with Music!

**Aprenda inglês com propósito através da música!**

---

## 📌 Índice
1. [Conceito](#-conceito)
2. [Setup](#-setup)
3. [Arquitetura](#-arquitetura)

---

## Conceito
O EngPurpose é uma plataforma Full Stack desenvolvida para auxiliar estudantes de inglês (com foco nos níveis A2–B1) a praticarem o idioma de forma mais engajadora. Através da plataforma, é possível:

🎵 filtrar músicas por nível de inglês <br/>
📚 estudar o vocabulário presente nas letras <br/>
🎧 praticar listening e compreensão <br/>
🕹️ aprender em um ambiente gamificado <br/>

### 🚀 Demo
Acesse a aplicação:
[EngPurpose
](https://engpurpose.vercel.app/)

## 📥 Setup

#### 🛠️ Tech Stack 
- **Linguagem**: TypeScript
- **Frontend**: React (Vite), Tailwind CSS, Vitest, @testing-library/react.
- **Backend**: Node.js, Express, Drizzle ORM, Vitest, Supertest.
- **Documentação**: Swagger UI / OpenAPI 3.0.
- **Banco de Dados**: MySQL

### 1. Requisitos
- Node.js instalado (v18+)
- Gerenciador de pacotes **pnpm** (recomendado).
- Instância MySQL rodando.

### 2. Backend (Server)
```bash
cd server
pnpm install
# Configure o arquivo .env com DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
pnpm dev
```

### 3. Frontend (Client)
```bash
cd client
pnpm install
pnpm dev
```

### 4. Testes
```bash
# Frontend (Unitários)
cd client
pnpm test
# Coverage: pnpm test --coverage

# Backend (API)
cd server
pnpm test
# Coverage: pnpm test --coverage
```

## 📈 Mudanças Recentes
- ✅ **Quiz Interativo Aprimorado**: Adicionada randomização nas opções do quiz para maior desafio e imprevisibilidade.
- ✅ **Correção de Bugs**: Corrigida lógica do quiz sobre palavras não presentes nas letras.
- ✅ **Testes Unitários**: Implementados testes para funções utilitárias (shuffle), lógica de quiz e dados mockados.
- ✅ **Testes de API**: Configurado Vitest com Supertest para testes de endpoints no backend.
- ✅ **Configuração de Testes**: Configurado Vitest com jsdom para frontend e node para backend.
- ✅ **Estrutura de Utilitários**: Criado arquivo `utils.ts` para funções reutilizáveis.

## 🏗️ Arquitetura

### client/
Interface do usuário desenvolvida em React.

### server/
API REST responsável por:

- autenticação
- gerenciamento de músicas
- vocabulário
- progresso do usuário

### database/
Persistência de dados usando MySQL e Drizzle ORM.
