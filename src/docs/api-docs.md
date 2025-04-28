# Documentação da API

Esta API permite gerenciar usuários do sistema.  
Todos os endpoints retornam respostas no formato `application/json`.

Base URL (exemplo):

https://api.seuprojeto.com


---

## Endpoints

---

## Criar Usuário

- **Método**: `POST`
- **Rota**: `/users`
- **Descrição**: Cria um novo usuário no sistema.

---

### Headers

| Nome          | Tipo    | Obrigatório | Descrição                    |
|:-------------:|:-------:|:-----------:|:----------------------------:|
| `Content-Type`| `string`| Sim         | Deve ser `application/json`  |

---

### Corpo da Requisição (JSON)

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

| Campo | Tipo   | Obrigatório | Descrição                        |
|:-----:|:------:|:-----------:|:---------------------------------:|
| name  | string | Sim         | Nome completo do usuário          |
| email | string | Sim         | E-mail do usuário (único)         |


## Resposta de Sucesso (HTTP 201 Created)

```bash
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

| Campo | Tipo     | Descrição                  |
|:-----:|:--------:|:---------------------------:|
| id    | integer  | ID único do usuário criado   |
| name  | string   | Nome completo do usuário     |
| email | string   | E-mail do usuário            |


## Respostas de Erro

| Código | Significado               | Possível Causa                          |
|:------:|:--------------------------:|:---------------------------------------:|
| 400    | Bad Request                 | Dados inválidos ou campos obrigatórios ausentes |
| 409    | Conflict                    | E-mail já cadastrado                   |
| 500    | Internal Server Error       | Erro interno inesperado                |

##
- Exemplo de resposta 400:
  ```bash
  {
    "error": "O campo 'email' é obrigatório."
  }
  ```
- Exemplo de resposta 409:

  ```bash
  {
    "error": "E-mail já cadastrado."
  }
  ```
## Observações

- Garanta que o e-mail enviado não tenha sido cadastrado anteriormente.
- Utilize HTTPS em produção para proteger as informações do usuário.

