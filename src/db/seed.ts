/**
 * Dados de exemplo para desenvolvimento.
 *
 *   npm run db:seed             # só roda se o banco estiver vazio
 *   npm run db:seed -- --force  # APAGA todos os dados e repopula
 *
 * Tudo aqui é FICTÍCIO: os nomes levam "(exemplo)" e os telefones usam um
 * prefixo de celular não atribuído, para nunca apontarem para pessoas reais.
 */
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../lib/password";
import * as schema from "./schema";
import type { NewService } from "./schema";

const { categories, favorites, reviews, services, users } = schema;

const DEV_PASSWORD = "senha1234";

// O seed cria um ADMIN com senha conhecida e, com --force, apaga tudo: nunca em produção.
if (process.env.NODE_ENV === "production") {
  console.error("O seed é só para desenvolvimento e não roda com NODE_ENV=production.");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL não definida (use `npm run db:seed`).");
  process.exit(1);
}

/** Telefone/WhatsApp fictícios: (89) 90000-000N — o prefixo 90000 não é atribuído. */
function fakePhone(n: number) {
  const suffix = String(n).padStart(4, "0");
  return { phone: `(89) 90000-${suffix}`, whatsapp: `558990000${suffix}` };
}

/** Coordenadas perto do centro de Uruçuí, com pequeno deslocamento por local. */
function nearCenter(index: number) {
  return {
    latitude: (-7.2284 + (index % 5) * 0.0012).toFixed(7),
    longitude: (-44.5553 - Math.floor(index / 2) * 0.001).toFixed(7),
  };
}

const CATEGORIES = [
  { name: "Alimentação", icon: "Utensils" },
  { name: "Hospedagem", icon: "BedDouble" },
  { name: "Saúde", icon: "Stethoscope" },
  { name: "Farmácias", icon: "Pill" },
  { name: "Mercados", icon: "ShoppingCart" },
  { name: "Educação", icon: "GraduationCap" },
  { name: "Oficinas", icon: "Wrench" },
  { name: "Beleza", icon: "Scissors" },
  { name: "Bancos e Serviços", icon: "Landmark" },
  { name: "Lazer e Turismo", icon: "Compass" },
];

type SeedService = Omit<NewService, "categoryId" | "ownerId"> & {
  category: string;
  /** Pertence à usuária proprietária de exemplo? */
  owned?: boolean;
};

const SEED_SERVICES: SeedService[] = [
  {
    category: "Alimentação",
    name: "Restaurante Sabor do Cerrado (exemplo)",
    subcategory: "Restaurante",
    description:
      "Dado de exemplo. Almoço self-service com pratos regionais, carne de sol e baião de dois.",
    ...fakePhone(1),
    addressStreet: "Rua das Palmeiras",
    addressNumber: "120",
    addressNeighborhood: "Centro",
    referencePoint: "Próximo à praça da matriz",
    openTime: "11:00",
    closeTime: "15:00",
    owned: true,
  },
  {
    category: "Alimentação",
    name: "Pizzaria Forno de Barro (exemplo)",
    subcategory: "Pizzaria",
    description:
      "Dado de exemplo. Pizzas assadas em forno a lenha, com delivery na cidade.",
    ...fakePhone(2),
    addressStreet: "Avenida Brasil",
    addressNumber: "845",
    addressNeighborhood: "Centro",
    referencePoint: "Em frente ao ginásio",
    openTime: "18:00",
    closeTime: "23:30",
    owned: true,
  },
  {
    category: "Alimentação",
    name: "Lanchonete Pé de Serra (exemplo)",
    subcategory: "Lanchonete",
    description:
      "Dado de exemplo. Lanches, sucos naturais e tapioca no café da manhã.",
    ...fakePhone(3),
    addressStreet: "Rua Floriano Peixoto",
    addressNumber: "60",
    addressNeighborhood: "Vila Nova",
    openTime: "06:00",
    closeTime: "22:00",
  },
  {
    category: "Hospedagem",
    name: "Pousada Beira Rio (exemplo)",
    subcategory: "Pousada",
    description:
      "Dado de exemplo. Quartos com ar-condicionado, café da manhã incluso e estacionamento.",
    ...fakePhone(4),
    addressStreet: "Rua do Porto",
    addressNumber: "15",
    addressNeighborhood: "Beira Rio",
    referencePoint: "Perto do cais",
    isOpen24h: true,
    owned: true,
  },
  {
    category: "Saúde",
    name: "Clínica Vida (exemplo)",
    subcategory: "Clínica médica",
    description:
      "Dado de exemplo. Consultas clínicas, pediatria e exames laboratoriais com agendamento.",
    ...fakePhone(5),
    addressStreet: "Rua Dr. Almeida",
    addressNumber: "310",
    addressNeighborhood: "Centro",
    openTime: "07:00",
    closeTime: "18:00",
  },
  {
    category: "Saúde",
    name: "Pronto Atendimento Municipal (exemplo)",
    subcategory: "Urgência e emergência",
    description:
      "Dado de exemplo. Atendimento de urgência e emergência, todos os dias, 24 horas.",
    ...fakePhone(6),
    addressStreet: "Avenida da Saúde",
    addressNumber: "S/N",
    addressNeighborhood: "Bairro Novo",
    isOpen24h: true,
  },
  {
    category: "Farmácias",
    name: "Farmácia Central (exemplo)",
    subcategory: "Farmácia",
    description:
      "Dado de exemplo. Medicamentos, perfumaria e entrega em domicílio.",
    ...fakePhone(7),
    addressStreet: "Avenida Brasil",
    addressNumber: "402",
    addressNeighborhood: "Centro",
    openTime: "07:30",
    closeTime: "22:00",
    owned: true,
  },
  {
    category: "Farmácias",
    name: "Drogaria Plantão 24h (exemplo)",
    subcategory: "Drogaria",
    description: "Dado de exemplo. Drogaria de plantão, aberta 24 horas.",
    ...fakePhone(8),
    addressStreet: "Rua Floriano Peixoto",
    addressNumber: "500",
    addressNeighborhood: "Vila Nova",
    isOpen24h: true,
  },
  {
    category: "Mercados",
    name: "Supermercado Boa Compra (exemplo)",
    subcategory: "Supermercado",
    description:
      "Dado de exemplo. Hortifrúti, açougue, padaria e produtos de limpeza.",
    ...fakePhone(9),
    addressStreet: "Avenida Brasil",
    addressNumber: "1200",
    addressNeighborhood: "Bairro Novo",
    openTime: "07:00",
    closeTime: "21:00",
  },
  {
    category: "Educação",
    name: "Escola Aprender (exemplo)",
    subcategory: "Ensino fundamental",
    description:
      "Dado de exemplo. Educação infantil e ensino fundamental, em turno integral.",
    ...fakePhone(10),
    addressStreet: "Rua das Flores",
    addressNumber: "75",
    addressNeighborhood: "Vila Nova",
    openTime: "07:00",
    closeTime: "17:00",
  },
  {
    category: "Oficinas",
    name: "Mecânica Cerrado Motors (exemplo)",
    subcategory: "Mecânica geral",
    description:
      "Dado de exemplo. Mecânica geral, elétrica, alinhamento e balanceamento.",
    ...fakePhone(11),
    addressStreet: "Rodovia BR-135",
    addressNumber: "Km 3",
    addressNeighborhood: "Distrito Industrial",
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    category: "Beleza",
    name: "Studio Bela Vista (exemplo)",
    subcategory: "Salão de beleza",
    description:
      "Dado de exemplo. Cabelo, unhas e estética, com horário marcado pelo WhatsApp.",
    ...fakePhone(12),
    addressStreet: "Rua das Palmeiras",
    addressNumber: "33",
    addressNeighborhood: "Centro",
    openTime: "08:00",
    closeTime: "19:00",
  },
  {
    category: "Lazer e Turismo",
    name: "Balneário do Rio (exemplo)",
    subcategory: "Balneário",
    description:
      "Dado de exemplo. Área de banho no rio, quiosques e espaço para eventos.",
    ...fakePhone(13),
    addressStreet: "Estrada do Balneário",
    addressNumber: "S/N",
    addressNeighborhood: "Zona Rural",
    referencePoint: "A 4 km do centro",
    openTime: "08:00",
    closeTime: "18:00",
  },
];

type Reviewer = "demo" | "joao" | "ana";

/** [índice em SEED_SERVICES, avaliador, nota, comentário] */
const SEED_REVIEWS: [number, Reviewer, number, string | null][] = [
  [0, "demo", 5, "Comida caseira e muito bem servida. Voltarei!"],
  [0, "joao", 4, "Ótimo almoço, só fica cheio ao meio-dia."],
  [0, "ana", 5, null],
  [1, "demo", 4, "Massa fina e crocante. A entrega demorou um pouco."],
  [1, "joao", 5, "A melhor pizza da cidade."],
  [3, "demo", 5, "Quartos limpos e café da manhã excelente."],
  [3, "ana", 4, "Boa localização, perto do rio."],
  [5, "joao", 5, "Atendimento rápido e humano numa madrugada difícil."],
  [6, "demo", 4, "Atendem bem e entregam em casa."],
  [8, "ana", 3, "Preços justos, mas poucos caixas nos horários de pico."],
  [11, "joao", 5, "Atendimento ótimo e pontual."],
];

async function main() {
  const force = process.argv.includes("--force");
  const client = postgres(databaseUrl!, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const [{ categoryCount, userCount }] = await client<
      { categoryCount: number; userCount: number }[]
    >`select (select count(*)::int from categories) as "categoryCount",
             (select count(*)::int from users) as "userCount"`;

    if ((categoryCount > 0 || userCount > 0) && !force) {
      console.log(
        `O banco já tem dados (${categoryCount} categorias, ${userCount} usuários). Nada foi alterado.\n` +
          "Use `npm run db:seed -- --force` para APAGAR tudo e repopular.",
      );
      return;
    }

    await db.transaction(async (tx) => {
      if (force) {
        await tx.execute(
          sql`TRUNCATE TABLE favorites, reviews, services, categories, users RESTART IDENTITY CASCADE`,
        );
      }

      const passwordHash = await hashPassword(DEV_PASSWORD);
      const [, demo, owner, joao, ana] = await tx
        .insert(users)
        .values([
          { name: "Administrador", email: "admin@urucuiconnect.dev", passwordHash, phone: "(89) 90000-0099", role: "ADMIN" },
          { name: "Usuário Demo", email: "demo@urucuiconnect.dev", passwordHash, phone: "(89) 90000-0100", role: "USUARIO" },
          { name: "Maria Proprietária", email: "maria@urucuiconnect.dev", passwordHash, phone: "(89) 90000-0101", role: "USUARIO" },
          { name: "João Cliente", email: "joao@urucuiconnect.dev", passwordHash, role: "USUARIO" },
          { name: "Ana Souza Lima", email: "ana@urucuiconnect.dev", passwordHash, role: "USUARIO" },
        ])
        .returning({ id: users.id });
      const reviewerId: Record<Reviewer, number> = {
        demo: demo.id,
        joao: joao.id,
        ana: ana.id,
      };

      const insertedCategories = await tx
        .insert(categories)
        .values(CATEGORIES)
        .returning({ id: categories.id, name: categories.name });
      const categoryId = new Map(insertedCategories.map((c) => [c.name, c.id]));

      const insertedServices = await tx
        .insert(services)
        .values(
          SEED_SERVICES.map(({ category, owned, ...service }, index) => ({
            ...nearCenter(index),
            ...service,
            categoryId: categoryId.get(category)!,
            ownerId: owned ? owner.id : null,
          })),
        )
        .returning({ id: services.id });

      await tx.insert(reviews).values(
        SEED_REVIEWS.map(([serviceIndex, reviewer, rating, comment]) => ({
          serviceId: insertedServices[serviceIndex].id,
          userId: reviewerId[reviewer],
          rating,
          comment,
        })),
      );

      await tx.insert(favorites).values([
        { userId: demo.id, serviceId: insertedServices[0].id },
        { userId: demo.id, serviceId: insertedServices[5].id },
      ]);
    });

    console.log(
      `Seed concluído: ${CATEGORIES.length} categorias, ${SEED_SERVICES.length} serviços, 5 usuários.\n` +
        `Senha de todos os usuários de desenvolvimento: ${DEV_PASSWORD}\n` +
        "  ADMIN:   admin@urucuiconnect.dev\n" +
        "  USUARIO: demo@urucuiconnect.dev (e maria/joao/ana@urucuiconnect.dev)",
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Falha no seed:", error);
  process.exit(1);
});
