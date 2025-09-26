# NLW Agents

Projeto desenvolvido utilizando tecnologias modernas para criação de uma API robusta e eficiente com integração Firebase Cloud Functions para processamento de IA.

## 🚀 Tecnologias

- **Node.js** com TypeScript nativo (experimental strip types)
- **Fastify** - Framework web rápido e eficiente
- **PostgreSQL** com extensão **pgvector** para vetores
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Schema validation
- **Docker** - Containerização do banco de dados
- **Biome** - Linting e formatação de código
- **Firebase Cloud Functions** - Processamento serverless de IA
- **Google Gemini AI** - Transcrição de áudio e geração de embeddings
- **Firebase Authentication** - Autenticação de usuários

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular com:

- **Separação de responsabilidades** entre rotas, schemas e conexão com banco
- **Validação de schemas** com Zod para type safety
- **ORM type-safe** com Drizzle para operações de banco de dados
- **Validação de variáveis de ambiente** centralizadas
- **Cloud Functions** para processamento de IA (transcrição, embeddings, respostas)
- **Autenticação Firebase** para segurança das operações

## ⚙️ Setup e Configuração

### Pré-requisitos

- Node.js (versão com suporte a `--experimental-strip-types`)
- Docker e Docker Compose
- Firebase CLI (`npm install -g firebase-tools`)
- Conta no Google Cloud Platform com Gemini AI ativado
- Projeto Firebase configurado

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd server
```

### 2. Configure o Firebase

#### 2.1. Instale o Firebase CLI (se ainda não tiver)

```bash
npm install -g firebase-tools
```

#### 2.2. Faça login no Firebase

```bash
firebase login
```

#### 2.3. Configure o projeto Firebase

```bash
firebase use --add
# Selecione seu projeto Firebase
```

#### 2.4. Configure as variáveis de ambiente do Firebase

```bash
firebase functions:config:set gemini.api_key="SUA_GEMINI_API_KEY"
```

### 3. Configure o banco de dados

```bash
docker-compose up -d
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
GEMINI_API_KEY=sua_gemini_api_key_aqui
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_CLIENT_EMAIL=seu_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_private_key_aqui\n-----END PRIVATE KEY-----\n"
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Configure e faça deploy das Firebase Cloud Functions

#### 5.1. Instale as dependências das Functions

```bash
cd functions
npm install
cd ..
```

#### 5.2. Faça o deploy das Cloud Functions

```bash
firebase deploy --only functions
```

#### 5.3. Verifique se as Functions foram deployadas

```bash
firebase functions:list
```

Você deve ver 4 functions ativas:

- `transcribeAudio` - Transcreve áudio em texto
- `generateEmbeddings` - Gera embeddings de texto
- `generateAnswer` - Gera respostas com contexto
- `generateGeneralAnswer` - Gera respostas gerais

### 6. Execute as migrações do banco

```bash
npx drizzle-kit migrate
```

### 7. (Opcional) Popule o banco com dados de exemplo

```bash
npm run db:seed
```

### 8. Execute o projeto

**Desenvolvimento:**

```bash
npm run dev
```

**Produção:**

```bash
npm start
```

## 📚 Scripts Disponíveis

- `npm run dev` - Executa o servidor em modo de desenvolvimento com hot reload
- `npm start` - Executa o servidor em modo de produção
- `npm run db:seed` - Popula o banco de dados com dados de exemplo

## 🔥 Firebase Cloud Functions

### Deploy das Functions

```bash
# Deploy de todas as functions
firebase deploy --only functions

# Deploy de uma function específica
firebase deploy --only functions:transcribeAudio

# Visualizar logs das functions
firebase functions:log

# Configurar variáveis de ambiente
firebase functions:config:set gemini.api_key="SUA_API_KEY"
```

### Functions Disponíveis

- **`transcribeAudio`** - Transcreve arquivos de áudio em texto
- **`generateEmbeddings`** - Gera embeddings vetoriais para texto
- **`generateAnswer`** - Gera respostas baseadas em contexto de áudio
- **`generateGeneralAnswer`** - Gera respostas gerais sem contexto específico

## 🔐 Autenticação

O projeto usa Firebase Authentication. Para testar as rotas protegidas:

1. Execute o script de login:

```bash
node --env-file .env --experimental-strip-types login.ts
```

2. Use o token JWT retornado nas requisições:

```http
Authorization: Bearer SEU_JWT_TOKEN
```

## 🌐 Endpoints

A API estará disponível em `http://localhost:3333`

### Rotas Públicas

- `GET /health` - Health check da aplicação
- `GET /rooms` - Lista as salas disponíveis

### Rotas Protegidas (Firebase Auth)

- `POST /rooms` - Cria nova sala
- `POST /rooms/:id/questions` - Cria pergunta em uma sala
- `POST /rooms/:id/audio` - Upload e processamento de áudio
- `GET /rooms/:id/questions` - Lista perguntas de uma sala

## 🛠️ Troubleshooting

### Problemas com Firebase Functions

**Erro: "Failed to call Cloud Function"**

- Verifique se as functions foram deployadas: `firebase functions:list`
- Confirme se o token JWT está sendo enviado corretamente
- Verifique os logs: `firebase functions:log`

**Erro: "User must be authenticated"**

- Execute o script de login para obter um token válido
- Certifique-se de incluir o token no header Authorization

### Problemas com Banco de Dados

**Erro de conexão PostgreSQL**

- Confirme se o Docker está rodando: `docker-compose ps`
- Verifique se a extensão pgvector está instalada
- Execute as migrações: `npx drizzle-kit migrate`

---

Desenvolvido com ❤️
