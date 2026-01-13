# To-do técnico do projeto (o que precisa arrumar)

## P0 (crítico, fazer primeiro)

### 1) Proteger ou desabilitar as rotas de debug em produção
**Problema:** `debugRoutes` está montado sempre, inclusive em produção. Isso expõe `/api/debug-sentry` e pode gerar spam de eventos no Sentry e superfície desnecessária.  
**Onde:** `src/interfaces/http/routes/index.ts`  
**Ajuste:**
- Voltar o gate por ambiente e flag:
  - habilitar somente quando `NODE_ENV=development` e `DEBUG_ROUTES_ENABLED=true`
- Ideal: exigir autenticação (ADMIN) mesmo em development.

Checklist:
- [ ] Reativar condição de debug routes.
- [ ] (Opcional) Proteger com `authMiddleware` + role ADMIN.
- [ ] Adicionar teste garantindo que debug routes não existem em produção.

---

### 2) Corrigir parsing de data do Diogrande no fluxo municipal
**Problema:** o Diogrande retorna `dia` em formato BR `DD/MM/AAAA`, mas o preparo do e-mail usa parser ISO e isso pode quebrar o job.  
**Onde:** `src/usecases/prepare-send-email/fetch-municipality-for-user.ts`  
**Ajuste:**
- Trocar `parseIsoDateToUTC(item.dia)` por `parseBrDateToUTC(item.dia)` (ou normalizar para ISO antes).
- Tratar retorno `null` do parser (skip do item ou erro claro).

Checklist:
- [ ] Trocar parser para BR.
- [ ] Garantir que item inválido não derruba o job inteiro.
- [ ] Criar teste para `dia: "01/01/2023"` não lançar erro.

---

### 3) Evitar “envio fantasma” em produção sem SMTP
**Problema:** quando `SMTP_HOST` não está definido, o factory usa `ConsoleMailerService`. Em produção esse service pode não enviar nem logar, e mesmo assim o fluxo pode registrar `TaskLog`, marcando como “enviado” sem enviar.  
**Onde:** 
- `src/interfaces/http/factories/jobs/send-daily-email-factory.ts`
- `src/infrastructure/services/console-mailer-service.ts`  
**Ajuste:**
- Em produção, sem SMTP configurado: falhar explicitamente (startup ou no envio).
- Alternativa: não registrar `TaskLog` quando o mailer não enviou de fato.

Checklist:
- [ ] Em `NODE_ENV=production`, exigir SMTP (ou lançar erro).
- [ ] Garantir que não cria `TaskLog` se não enviou e-mail.
- [ ] Adicionar teste para esse cenário.

---

## P1 (alto, robustez do scheduler e idempotência)

### 4) Usar o executor com lock diário no scheduler (evitar duplicação entre instâncias)
**Problema:** existe `runOncePerDay` com advisory lock no repo, mas o scheduler chama o use case direto, o que pode duplicar execução em múltiplas instâncias.  
**Onde:** `src/main/jobs/scheduler.ts` e factory do executor  
**Ajuste:**
- Fazer o scheduler chamar um `ExecuteScheduledTaskUseCase` que usa `TaskLogRepository.runOncePerDay(...)`.

Checklist:
- [ ] Scheduler chamar executor “run once per day”.
- [ ] Logar claramente quando a execução for pulada por lock.
- [ ] Teste com mock do repo confirmando o comportamento.

---

### 5) Mitigar duplicação por usuário em concorrência
**Problema:** a regra “já enviou hoje” é read-then-write, duas instâncias podem passar no check e enviar duas vezes para o mesmo usuário.  
**Onde:** `src/infrastructure/repositories/prisma-task-log-repository.ts` e model Prisma `TaskLog`  
**Ajuste sugerido (escolher uma):**
- Opção A: adicionar campo `executedDay` e unique `(taskName, userId, executedDay)` e usar upsert.
- Opção B: advisory lock por `(taskName, userId, day)` durante o envio por usuário.

Checklist:
- [ ] Implementar proteção contra corrida (unique/upsert ou lock).
- [ ] Ajustar testes de duplicidade concorrente (simulação).

---

### 6) Ajustar “execução imediata ao subir” para respeitar janela
**Problema:** ao subir o serviço, se já passou de 08:00, executa imediato, mesmo fora da janela 08:00–17:00.  
**Onde:** `src/main/jobs/scheduler.ts`  
**Ajuste:**
- Executar imediato somente se `agora` estiver dentro da janela do cron.

Checklist:
- [ ] Condicionar execução imediata ao horário local dentro da janela.
- [ ] Teste unitário para horários (antes, dentro, depois da janela).

---

## P2 (médio, consistência e manutenção)

### 7) Remover acoplamento do domínio com Prisma
**Problema:** interfaces do domínio e alguns use cases importam tipos do Prisma, reduz isolamento de camadas.  
**Onde:** 
- `src/domain/repositories/*`
- alguns arquivos em `src/usecases/*`  
**Ajuste:**
- Criar tipos de domínio próprios e deixar Prisma restrito a `src/infrastructure`.

Checklist:
- [ ] Substituir imports de `@prisma/client` na camada de domínio por tipos próprios.
- [ ] Ajustar repos Prisma para mapear para tipos de domínio.

---

### 8) Corrigir respostas semânticas dos controllers de diários
**Problema:** quando não há conteúdo, controllers usam erro de “USER_NOT_FOUND”, semântica incorreta.  
**Onde:**
- `src/interfaces/http/controllers/official-journals/*`  
**Ajuste:**
- Retornar `200` com lista vazia, ou erro específico “NO_PUBLICATIONS_FOUND”.

Checklist:
- [ ] Ajustar status e código de erro.
- [ ] Atualizar testes (se existirem) e docs.

---

### 9) Revisar custo de consultas anuais no fluxo diário
**Problema:** no fluxo municipal, buscar dados do ano pode ser custo alto para o e-mail diário que precisa do dia.  
**Onde:** `src/usecases/prepare-send-email/fetch-municipality-for-user.ts`  
**Ajuste:**
- Buscar apenas o dia alvo no fluxo diário.
- Reservar busca anual para endpoints específicos.

Checklist:
- [ ] Reduzir query do fluxo diário para janela mínima.
- [ ] Medir impacto (tempo de execução do job).

---

## P3 (observabilidade e DX)

### 10) Padronizar logs e métricas do job
**Problema:** logs com `console.*` dispersos, pouca visibilidade de quantos usuários falharam, quantos enviaram, quantos vazios.  
**Ajuste:**
- Logger estruturado (ex: pino) ou padronizar logs atuais.
- Logar contadores do job (processados, enviados, vazios, falhas).

Checklist:
- [ ] Implementar logger estruturado ou padronizar.
- [ ] Incluir métricas do job no final da execução.
- [ ] Registrar erros por usuário sem derrubar o job inteiro.

---

## Comandos de validação antes do merge
- [ ] `npm run check`
- [ ] `npm test`
- [ ] (Se tiver migração) `npx prisma migrate dev` e revisar schema/migrations
- [ ] Testar job em staging com SMTP real e confirmar criação de `TaskLog`
