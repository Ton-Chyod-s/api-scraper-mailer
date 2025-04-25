# Arquitetura do Projeto

## Visão Geral

Este projeto segue a arquitetura **Clean Architecture** para garantir um código modular e fácil de manter. A comunicação entre as camadas é feita de forma a permitir o desacoplamento e facilitar a realização de testes.

## Estrutura

- **Controllers**: Responsáveis por lidar com as requisições HTTP e delegar a lógica para os **Usecases**.
- **Usecases (Services)**: Contêm a lógica de negócio do sistema e são responsáveis por coordenar as operações entre as camadas de **Domain** e **Infrastructure**.
- **Domain**: Contém as entidades do sistema e os repositórios para abstração do acesso a dados.
- **Infrastructure**: Lida com a comunicação externa, como APIs, banco de dados, e envio de e-mails.

## Diagrama de Arquitetura

(Adicione aqui um diagrama visual, se necessário, para ilustrar a comunicação entre as camadas)
