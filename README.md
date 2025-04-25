# API Scraper Mailer

Este projeto é uma API responsável por realizar scraping de dados de diferentes fontes e enviar e-mails com as informações coletadas. Ele utiliza **Node.js** com **TypeScript** e **Prisma** para comunicação com o banco de dados.

## Funcionalidades

- Realiza scraping de dados de diversas fontes (Exército, Diário Oficial, etc.).
- Envia e-mails com os dados extraídos.
- Suporte para CRUD de usuários.
- Persiste dados em banco de dados serverless PostgreSQL.

## Tecnologias

- **Node.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Nodemailer** (para envio de e-mails)
- **Node Cron** (para agendamento de tarefas)
- **GitHub Actions** (para CI/CD)

## Arquitetura

O sistema é organizado de acordo com a **Clean Architecture**. Aqui estão as principais camadas do sistema:

- **Controllers**: Responsáveis por lidar com as requisições HTTP e delegar o processamento para os serviços.
- **Services (Usecases)**: Contêm a lógica de negócio, realizando as operações principais do sistema.
- **Domain**: Contém entidades e repositórios que abstraem a persistência de dados.
- **Infrastructure**: Responsável por integrar com tecnologias externas, como APIs, bancos de dados e envio de e-mails.

## Main - Ponto de Entrada da Aplicação

A camada **main** é responsável por:

- Inicializar o servidor e configurar as rotas.
- Definir os cron jobs agendados.
- Orquestrar a execução de componentes como a configuração do banco de dados, envio de e-mails, e scraping de dados.
  
## 🔧 Instalação

Para configurar o projeto localmente, siga os passos abaixo:

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/api-scraper-mailer.git
cd api-scraper-mailer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Certifique-se de ter o PostgreSQL instalado e configurado localmente ou use um serviço como o Neon Tech para banco de dados. Depois, crie um arquivo .env na raiz do projeto com as variáveis de ambiente necessárias.

Exemplo do .env:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

```

### 4. Execute as migrations do Prisma 
## Obs: se for localmente

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Rodando o servidor

```bash
npm run dev
```
Isso vai iniciar a aplicação em modo de desenvolvimento e o nodemon vai reiniciar o servidor sempre que você fizer alterações nos arquivos.

### 6. Rodando o cron job (agendador de tarefas)
O agendador de tarefas do projeto está configurado utilizando Node Cron. Ele pode ser executado separadamente ou como parte do servidor principal.

## Variáveis de Ambiente

O projeto depende das seguintes variáveis de ambiente:

DATABASE_URL: URL de conexão com o banco de dados PostgreSQL.

MAIL_HOST: Host do servidor de e-mail (ex: SMTP).

MAIL_PORT: Porta do servidor de e-mail.

MAIL_USER: Usuário para autenticação no servidor de e-mail.

MAIL_PASS: Senha para autenticação no servidor de e-mail.

**Exemplo .env:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=587
MAIL_USER="user"
MAIL_PASS="password"
PORT_SERVER=1000
```

### Contribuindo

```bash
Faça um fork deste repositório.

Crie uma branch (git checkout -b feature/nome-da-feature).

Faça suas alterações e commite (git commit -am 'Adiciona nova feature').

Envie para o repositório remoto (git push origin feature/nome-da-feature).

Abra um Pull Request.
```

## 📚 Documentação

Para mais detalhes sobre a arquitetura, API e outras configurações, consulte a documentação na pasta [documentacao](./src/docs).
