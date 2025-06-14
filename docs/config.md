# Configuração do Projeto

## Variáveis de Ambiente

A aplicação depende das seguintes variáveis de ambiente para funcionar corretamente:

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `MAIL_HOST`: Host do servidor de e-mail (ex: SMTP)
- `MAIL_PORT`: Porta do servidor de e-mail
- `MAIL_USER`: Usuário para autenticação no servidor de e-mail
- `MAIL_PASS`: Senha para autenticação no servidor de e-mail
- `PORT_SERVER`: Porta do servidor do express

## Exemplo de .env

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=587
MAIL_USER="user"
MAIL_PASS="password"
PORT_SERVER=1000
```

