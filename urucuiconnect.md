Atue como um desenvolvedor Full Stack Sênior especializado em Next.js (App Router), TypeScript, Tailwind CSS, Drizzle ORM e PostgreSQL. 

Você irá construir um aplicativo guia de serviços para a cidade de Uruçuí (PI). O desenvolvimento deve ser feito de forma estritamente sequencial, do Passo 1 ao Passo 4. 

REGRAS DE EXECUÇÃO:
- Execute APENAS um passo por vez.
- Ao concluir cada passo, faça a verificação/compilação do código gerado para garantir que não existem erros de TypeScript ou de sintaxe.
- Pare e peça a minha confirmação antes de avançar para o próximo passo.

---

### PASSO 1: Inicialização do Projeto e Configuração do Banco
1. Crie um novo projeto Next.js (App Router, Tailwind CSS, TypeScript) na pasta atual.
2. Instale as dependências: `drizzle-orm`, `postgres`, `zod`, `lucide-react`.
3. Instale as dependências de desenvolvimento: `drizzle-kit`, `dotenv`, `tsx`, `@types/node`.
4. Configure a conexão com o PostgreSQL em `src/db/index.ts`.
5. Crie o arquivo de configuração `drizzle.config.ts`.
6. Crie o arquivo `.env.local` com a variável `DATABASE_URL`.
*(Ao finalizar o Passo 1, valide se os arquivos foram criados sem erros e aguarde minha autorização para o Passo 2).*

---

### PASSO 2: Schema do Banco de Dados e Validações Zod
1. Em `src/db/schema.ts`, crie as tabelas Drizzle com a seguinte estrutura:
   - `users`: id (serial, PK), name (varchar), email (varchar, unique), passwordHash (varchar), phone (varchar), role (enum: 'CLIENTE', 'PROPRIETARIO', 'ADMIN'), createdAt (timestamp).
   - `categories`: id (serial, PK), name (varchar), icon (varchar).
   - `services`: id (serial, PK), categoryId (integer, FK -> categories), ownerId (integer, FK -> users, opcional), name (text), description (text), phone (varchar), whatsapp (varchar), subcategory (varchar), addressStreet (varchar), addressNeighborhood (varchar), addressNumber (varchar), referencePoint (text), latitude (decimal), longitude (decimal), openTime (varchar), closeTime (varchar), isOpen24h (boolean), coverImage (text), isActive (boolean, default true), createdAt (timestamp).
   - `reviews`: id (serial, PK), userId (integer, FK -> users), serviceId (integer, FK -> services), rating (integer de 1 a 5), comment (text), createdAt (timestamp).
   - `favorites`: id (serial, PK), userId (integer, FK -> users), serviceId (integer, FK -> services), createdAt (timestamp).
2. Em `src/schemas/`, crie os schemas Zod correspondentes para validação de criação/edição de usuários, serviços e avaliações.
*(Ao finalizar o Passo 2, execute o typecheck e aguarde minha autorização para o Passo 3).*

---

### PASSO 3: Server Actions e Regras de Negócio
1. Em `src/actions/services.ts`:
   - Implemente função para listar serviços (com filtros por categoria e busca textual).
   - Implemente função para buscar detalhes de um serviço por ID.
   - Implemente a Server Action para cadastrar um novo serviço validando a entrada com Zod.
2. Em `src/actions/categories.ts`:
   - Implemente a função de listagem de todas as categorias.
3. Em `src/actions/favorites.ts`:
   - Implemente funções para favoritar/desfavoritar e listar favoritos.
*(Ao finalizar o Passo 3, valide se o TypeScript não aponta erros nas Server Actions e aguarde minha autorização para o Passo 4).*

---

### PASSO 4: Interface do Usuário (Páginas e Componentes)
Crie as telas com Tailwind CSS e ícones do `lucide-react`:
1. `src/app/page.tsx` (Home):
   - Header com busca rápida.
   - Grade de categorias (Alimentação, Hospedagem, Saúde, Farmácias, etc.).
   - Seção "Serviços em Destaque em Uruçuí" exibindo os cards dos locais.
2. `src/app/servicos/[id]/page.tsx` (Detalhes):
   - Exibição completa das informações do local, botão com link direto para o WhatsApp (`https://wa.me/...`), endereço, horários e botão de favoritar.
   - Seção de avaliações e formulário para enviar nota/comentário.
3. `src/app/cadastrar-servico/page.tsx` (Formulário):
   - Formulário completo para cadastro de novos serviços/estabelecimentos integrado à Server Action com validação Zod.

Por favor, confirme que entendeu o plano de execução e inicie pelo **PASSO 1**.
