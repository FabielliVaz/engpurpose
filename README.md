# 🎵 EngPurpose

**Aprenda inglês com propósito através da música.**

O **EngPurpose** é uma plataforma Full Stack desenvolvida para auxiliar estudantes de inglês (foco nos níveis A2-B1) a praticarem o idioma de forma engajadora. O projeto utiliza a música como ferramenta de memorização e oferece recursos de filtragem por nível de dificuldade.

---

## 🛠️ Stack Técnica

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router DOM, Fetch API.
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM.
- **Banco de Dados**: MySQL.
- **Qualidade/Testes**: Vitest, Coverage (v8).

---

## 📥 Setup do Projeto

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
cd client
pnpm test
# Coverage: pnpm test --coverage
```