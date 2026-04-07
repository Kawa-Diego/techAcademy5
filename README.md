# E-commerce Web (TypeScript full-stack)

Monorepo com **API REST em Node/Express (MVC + POO)**, **SPA em React** e **tipos compartilhados** em `@ecommerce/shared`.

## Estrutura de pastas

```text
ecommerce-web/
├── package.json             # Workspaces (shared + frontend); build único para Vercel
├── vercel.json              # Build e SPA na raiz (deploy Vercel)
├── shared/src/              # Tipos e contratos API (tipagem explícita; ver doc para ressalvas)
├── backend/
│   ├── prisma/              # Schema PostgreSQL + prisma db push / migrate
│   ├── src/
│   │   ├── models/          # Camada de dados (classes POO)
│   │   ├── services/        # Regras de negócio
│   │   ├── controllers/     # HTTP + respostas JSON (“View” da API)
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── mappers/
│   │   ├── utils/
│   │   └── ...
│   └── test/                # Vitest (unitário + integração supertest)
└── frontend/
    └── src/
        ├── components/ui/   # Componentes reutilizáveis
        ├── pages/           # Telas por rota (auth, categorias, produtos, pedidos)
        ├── context/         # AuthContext (usuário + token)
        ├── layout/
        └── services/        # Cliente HTTP tipado
```


## Pré-requisitos

- Node.js 20+
- npm


## Configuração do back-end

Banco: **PostgreSQL**. Configure `DATABASE_URL` no `.env`.

```bash
cd backend
cp .env
# Ajuste JWT_SECRET e DATABASE_URL (usuário, senha, host, banco)

npm install
cd ../shared && npm run build && cd ../backend
npx prisma generate
npx prisma migrate deploy
npm run dev
```


API padrão: `http://localhost:3333`

### Papéis (`User.role`)

- **USER**: vê/atualiza/remove apenas o próprio cadastro (`GET/PATCH/PUT/DELETE /users/me`). Pode **ler** categorias e produtos; **pedidos** com CRUD autenticado.

- **ADMIN**: além do acima, **lista e gerencia qualquer usuário** (`GET/PUT/DELETE /users`, `/users/:id`) e **cria/edita/remove** categorias e produtos.



Conta nova é sempre `USER`. Para o primeiro admin, após registrar, atualize no banco:  
`UPDATE "User" SET role = 'ADMIN' WHERE email = 'seu@email.com';`  
Depois faça **login de novo** para o JWT incluir `ADMIN`.

### Rotas principais



| Área                                             | Regra                                           |
| ------------------------------------------------ | ----------------------------------------------- |
| `/auth/register`, `/auth/login`                  | Públicas                                        |
| `/auth/status`, `/auth/password`, `/auth/logout` | JWT obrigatório                                 |
| `/users/me`                                      | JWT: próprio usuário                            |
| `/users`, `/users/:id`                           | JWT + **ADMIN**                                 |
| `/categories`, `/products`                       | JWT; **escrita** |(POST/PUT/DELETE) só **ADMIN**|
| `/orders`                                        | JWT (CRUD para usuário autenticado)             |



## Front-end

### Desenvolvimento local

Instale na **raiz do monorepo** (workspace `shared` + `frontend`):

```bash
cd ecommerce-web
npm install
npm run dev -w @ecommerce/frontend
```

Em desenvolvimento o Vite faz **proxy** de `/api` e `/uploads` → `http://localhost:3333` (veja `frontend/vite.config.ts`). Não é obrigatório definir `VITE_API_URL`.

Abra o servidor. 
Fluxo: **Cadastro** → **Login** → área logada com CRUDs e **edição de perfil** (e-mail somente leitura; CPF e senha revalidados).
