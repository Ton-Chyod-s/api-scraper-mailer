# Documentação da API

## Endpoints

### 1. Criar Usuário

- **Método**: `POST`
- **URL**: `/users`
- **Corpo da Requisição**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }

- **Resposta da Requisição**:
    ```json
    {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
    }
    