# Sistema de Autenticação

Este projeto é um sistema de autenticação moderno, seguro e escalável, desenvolvido em Node.js com TypeScript. Ele implementa autenticação baseada em JWT, refresh tokens opacos, confirmação de email e segue boas práticas de segurança.

## Tecnologias e Frameworks Utilizados

- **Node.js**: Ambiente de execução JavaScript no backend.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Express**: Framework web minimalista para Node.js.
- **Prisma ORM**: Mapeamento objeto-relacional para bancos de dados SQL (PostgreSQL).
- **PostgreSQL**: Banco de dados relacional robusto e open source.
- **JWT (JSON Web Token)**: Para autenticação e autorização.
- **argon2**: Algoritmo moderno e seguro para hash de senhas.
- **Swagger (OpenAPI)**: Documentação automática da API.
- **Jest**: Testes automatizados.

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd nodejs-autenticacao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example` e preencha com suas configurações:

```
cp env.example .env
```

Edite o arquivo `.env` conforme necessário (banco de dados, JWT_SECRET, etc).

### 4. Execute as migrações do banco de dados

```bash
npx prisma migrate dev
```

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

### 6. Acesse a documentação da API

Acesse `http://localhost:3000/docs` para visualizar a documentação interativa (Swagger UI).

## Scripts úteis

- `npm run dev`: Inicia o servidor em modo desenvolvimento com hot reload.
- `npm run build`: Compila o projeto para produção.
- `npm start`: Inicia o servidor em modo produção.
- `npm test`: Executa os testes automatizados.

## Testes

Para rodar os testes:

```bash
npm test
```
