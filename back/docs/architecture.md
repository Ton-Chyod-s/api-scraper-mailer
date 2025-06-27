#  Arquitetura do Projeto

Este projeto segue a arquitetura **Clean Architecture** para garantir um código modular, escalável e fácil de manter.  
A comunicação entre as camadas é feita de forma a permitir o desacoplamento e facilitar a realização de testes unitários e de integração.

---

## Estrutura do Projeto

A arquitetura é composta pelas seguintes camadas:

### 1. **Controllers**
- **Responsabilidade**: Lidar com as requisições HTTP (REST, por exemplo) e delegar a lógica para os **Usecases**.
- **Função**: Receber os dados da requisição, validar, e chamar os **Usecases** apropriados para executar a lógica de negócio.

### 2. **Usecases (Services)**
- **Responsabilidade**: Contém a lógica de negócio do sistema.
- **Função**: Coordenar as operações entre as camadas **Domain** e **Infrastructure**, manipulando as entidades de acordo com a regra de negócio do sistema.

### 3. **Domain**
- **Responsabilidade**: Contém as **entidades** e **interfaces de repositórios**.
- **Função**: Define as regras de negócio e abstrações para o acesso a dados, sem se preocupar com a implementação de armazenamento (banco de dados, APIs externas, etc.).

### 4. **Infrastructure**
- **Responsabilidade**: Lidar com a comunicação externa.
- **Função**: Implementa a comunicação com sistemas externos como APIs, banco de dados, envio de e-mails e outros serviços.

---

### Observações

- **Desacoplamento**: Cada camada tem uma responsabilidade bem definida, facilitando a manutenção e escalabilidade do sistema.
- **Testabilidade**: A separação clara entre camadas facilita a criação de testes automatizados para as diferentes partes do sistema.

