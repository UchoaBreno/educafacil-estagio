# EducaFácil - Sistema de Gestão Escolar

Sistema completo de gestão escolar desenvolvido para facilitar a administração de instituições de ensino.

## 🚀 Funcionalidades

### 📊 Painel (Dashboard)
- Visualização de estatísticas gerais (alunos, turmas, eventos, média de notas)
- Gráfico de frequência semanal
- Lista de próximos eventos
- Atividades recentes

### 👨‍🎓 Alunos
- Cadastro completo de alunos com dados pessoais, familiares e escolares
- Busca por nome ou matrícula
- Edição e exclusão de registros
- Upload de foto do aluno

### 👨‍🏫 Professores
- Cadastro de professores com informações profissionais
- Gerenciamento de disciplinas e séries
- Controle de status funcional (efetivo, contratado, etc.)

### 🏫 Turmas
- Criação e gerenciamento de turmas
- Associação de professores às turmas
- Definição de capacidade e turno

### 📚 Diário Digital
- **Frequência**: Registro diário de presença dos alunos
- **Notas**: Lançamento de notas por bimestre
- **Objetos de Conhecimento**: Planejamento pedagógico
- **Avaliações**: Gerenciamento de avaliações

### 📅 Calendário
- Visualização de eventos em calendário mensal
- Cadastro de eventos com data, horário e local
- Tipos de evento: Reunião, Feriado, Evento Escolar, Prova, Outro

### ⏰ Horário
- Configuração de grade horária por turma
- Definição de horários de início e fim das aulas

### 👥 Equipe Gestora
- Cadastro de membros da equipe gestora
- Perfil completo com formações e biografia

### 📊 Relatórios
- Geração de relatórios diversos
- Exportação de dados

### ⚙️ Configurações
- Informações da escola
- Configurações de instalações
- Preferências do sistema
- Edição de perfil do usuário

## 🔐 Autenticação

O sistema possui autenticação segura com:
- Login com email e senha
- Cadastro de novos usuários
- Controle de acesso por perfil (admin, gestor, professor, aluno)

## 📱 Como Usar

### 1. Primeiro Acesso
1. Acesse a página de login
2. Clique em "Criar conta" para se cadastrar
3. Preencha nome, email e senha
4. Faça login com as credenciais criadas

### 2. Navegação
- Use o menu lateral para navegar entre as funcionalidades
- O painel inicial mostra um resumo geral do sistema
- Clique nos cards de estatísticas para acessar as respectivas páginas

### 3. Cadastro de Alunos
1. Acesse "Alunos" no menu lateral
2. Clique em "Novo Aluno"
3. Preencha os dados obrigatórios: nome, matrícula, ano
4. Complete as informações adicionais conforme necessário
5. Clique em "Salvar"

### 4. Gerenciamento de Turmas
1. Acesse "Turmas" no menu lateral
2. Clique em "Nova Turma"
3. Defina nome, série, turno e capacidade
4. Associe os professores responsáveis
5. Salve a turma

### 5. Registro de Frequência
1. Acesse "Diário Digital" no menu lateral
2. Selecione o professor e a turma
3. Clique em "Frequência"
4. Selecione a data desejada
5. Marque a presença/ausência de cada aluno
6. Salve o registro

### 6. Lançamento de Notas
1. Acesse "Diário Digital" no menu lateral
2. Selecione o professor e a turma
3. Clique em "Notas"
4. Selecione a disciplina e o bimestre
5. Lance as notas de cada aluno
6. Salve as alterações

### 7. Cadastro de Eventos
1. Acesse "Calendário" no menu lateral
2. Preencha o formulário com os dados do evento
3. Clique em "Adicionar Evento"
4. O evento aparecerá no calendário

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL

## 📦 Instalação Local

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Navegue até o diretório
cd <NOME_DO_PROJETO>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🌐 Deploy

O sistema pode ser publicado diretamente pelo Lovable:
1. Clique no botão "Publish" no canto superior direito
2. Aguarde a publicação
3. Acesse a URL gerada

## 📄 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Componentes de layout (Sidebar, Header)
│   └── ui/              # Componentes de interface (Button, Card, etc.)
├── contexts/            # Contextos React (Auth)
├── hooks/               # Hooks customizados
├── integrations/        # Integrações (Supabase)
├── lib/                 # Utilitários
└── pages/               # Páginas da aplicação
```

## 🤝 Suporte

Para dúvidas ou problemas, entre em contato através do sistema de suporte.

---

Desenvolvido com ❤️ usando [Lovable](https://lovable.dev)
