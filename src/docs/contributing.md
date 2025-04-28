# Contribuindo

Obrigado por considerar contribuir para este projeto! Siga as etapas abaixo para garantir que seu processo de contribuição seja tranquilo.

---

## Passos para Contribuir

1. **Fork** este repositório.
2. **Clone** seu fork localmente:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

3. **Crie uma branch** para sua feature ou correção:
```bash
git checkout -b feature/nome-da-feature
```

4. **Implemente** suas alterações, adicione testes.
5. **Confirme** suas alterações:
   
```bash
git add .
git commit -m "feat: descrição breve da feature"
```

6. **Atualize** seu fork (opcional, para evitar conflitos):
   
```bash
git pull origin main
```

7. **Submeta um Pull Request (PR)** para a branch principal (main ou develop).

## Requisitos Antes de Submeter um PR

- [ ] O código está seguindo os padrões definidos no projeto.
- [ ] Foram adicionados ou atualizados testes, se aplicável.
- [ ] Todos os testes passam localmente.
- [ ] A documentação foi atualizada (se necessário).

---

## Padrões de Código

- Seguir a arquitetura e organização existente do projeto.
- Preferir nomes de variáveis, funções e commits claros e descritivos.
- Utilizar convenções de commit:

| Tipo     | Quando usar                             |
|:--------:|:---------------------------------------:|
| `feat`   | Nova feature                            |
| `fix`    | Correção de bug                         |
| `chore`  | Tarefas internas (build, configs, etc.) |
| `docs`   | Alterações na documentação              |
| `refactor` | Refatoração sem mudança de comportamento |


## Licença

Ao enviar um Pull Request, você concorda que sua contribuição será licenciada sob a mesma licença deste projeto.