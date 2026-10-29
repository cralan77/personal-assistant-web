# Personal Assistant Web (`personal-assistant-web`)

Aplicação web moderna, responsiva e integrada com inteligência artificial (**Aurora Personal Assistant**) para o ecossistema **Personal Assistant (Habitus)**, disponibilizando os recursos de Saúde, Treinos, Composição Corporal, Finanças e IA para desktop, tablet e navegadores mobile.

---

## 🚀 Tecnologias Utilizadas

- **Frontend Core:** [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização & Design System:** [Tailwind CSS](https://tailwindcss.com/) + Design System Dark Glassmorphism
- **Gerenciamento de Estado & Requisições:** [TanStack Query v5 (React Query)](https://tanstack.com/query) + [Zustand](https://github.com/pmndrs/zustand) com persistência local e cookies (`middleware.ts`)
- **Formulários & Validação:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Ícones & Gráficos:** [Lucide React](https://lucide.dev/) + [Recharts](https://recharts.org/)
- **Testes Unitários:** [Vitest](https://vitest.dev/)

---

## 🔗 Integração com Microsserviços e Proxy BFF (`src/app/api/proxy/[...path]/route.ts`)

O Next.js inclui um Route Handler BFF dinâmico que encaminha requisições do navegador para os microsserviços sem restrições de CORS e repassa automaticamente `Authorization: Bearer <token>` e `X-User-Id`:

| Serviço | Porta Padrão | Rota do Proxy | Finalidade |
| :--- | :--- | :--- | :--- |
| **`auth_service`** | `:8082` | `/api/proxy/auth/*` | Autenticação JWT, login, registro e perfil de usuário |
| **`financial_service`** | `:8080` | `/api/proxy/financial-entries`, `/bills`, `/incomes`, `/wallets`, `/categories`, `/sub-categories`, `/credit-cards` | Gestão completa de receitas, despesas, carteiras, categorias e saldo |
| **`health_service`** | `:8081` | `/api/proxy/health/*` | Telemetria de treinos, batimentos cardíacos, medidas corporais (CRUD) e metas de saúde |
| **`bot_gateway`** | `:8081` | `/api/proxy/assistant/*` | Morning Briefing, análise de treinos com IA, chat contextualizado (`ALL`, `HEALTH`, `FINANCE`) e histórico |

---

## 🧠 Modelos e Regras de Negócio Implementadas

1. **Composição Corporal (`src/lib/calculations/body-composition.ts`):**
   - Protocolo Jackson & Pollock (3 dobras cutâneas com adipômetro para homens e mulheres + Equação de Siri).
   - Método U.S. Navy (Circunferencial de pescoço, cintura/abdômen e quadril).
   - Equação de Deurenberg (Estimativa baseada em IMC, sexo e idade).
   - Cálculo em tempo real de IMC, RCQ, Massa Magra (kg) e Massa Gorda (kg).
2. **Distribuição em 5 Zonas Cardíacas (`src/lib/calculations/heart-rate-zones.ts`):**
   - Z1 (50-60%), Z2 (60-70%), Z3 (70-80%), Z4 (80-90%) e Z5 (90-100%).
3. **Carga de Treino TRIMP (`src/lib/calculations/trimp.ts`):**
   - Modelo exponencial de Banister baseado em duração, FC média e FC de reserva (`LIGHT`, `MODERATE`, `HARD`, `VERY_HARD`).

---

## 📚 Documentação Completa para IA e Desenvolvedores

- **[Documentação Detalhada do Projeto (`docs/PROJECT_DOCUMENTATION.md`)](docs/PROJECT_DOCUMENTATION.md)**: Arquitetura completa, árvore de arquivos e componentes, funcionamento do Proxy BFF e Middleware de autenticação, fluxos de estado React Query/Zustand e guia para implementação de novas features por IA.
- **[Resumo para LLMs (`llms.txt`)](llms.txt)**: Índice rápido de contexto para agentes de IA.

---

## 💻 Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Executar testes unitários (Vitest)
npm test

# Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# Build de produção
npm run build && npm run start
```
