# Agenda — Sessão de Confirmação Finance / DRE Scenario Simulator

**Data:** A agendar
**Duração:** 60 minutos
**Formato:** Presencial ou videoconferência
**Pacote de referência:** `docs/finance/dre-finance-confirmation-packet.md` (Phase 15I.2)

---

## Participantes

| Papel | Nome | Presença |
|-------|------|----------|
| Diretor(a) Finance | | Obrigatório |
| Responsável pela planilha PnL | | Obrigatório |
| Representante Acadêmico | | Obrigatório para F06 |
| Arquiteto(a) de Modelo Técnico | | Obrigatório |

---

## Pré-requisito

Todos os participantes devem ter lido o pacote de confirmação Finance
(`dre-finance-confirmation-packet.md`) e o registro de decisões
(`dre-finance-confirmation-register.json`) antes da sessão.

---

## Agenda (60 minutos)

### 00–05 min — Abertura e objetivo da sessão

- Declaração de objetivo: confirmar ou rejeitar as seis premissas Finance abertas
- Declaração de governança: o motor calcula hoje (`CALCULATION_CAN_BEGIN = true`); os
  seis itens (F01–F06) bloqueiam o encerramento Finance e a ratificação pelo conselho,
  mas não bloqueiam o cálculo
- Revisão rápida do registro de decisões (`dre-finance-confirmation-register.json`)

---

### 05–15 min — F01: Outras Receitas — fator de reajuste anual

**Questão:** O fator de reajuste anual (`reajuste_despesas`) aplica-se a Outras Receitas?
Quais são os valores anuais para 2028–2047?

**Estado atual do motor:** `outras_receitas = outrasReceitasRatio × numero_de_alunos`
(fator de reajuste omitido; motor reporta via `outrasReceitasReajusteNote`)

**Resultados possíveis:**

- [ ] Finance confirma que o reajuste NÃO se aplica → F01 encerrado
- [ ] Finance fornece valores anuais do reajuste → F01 encerrado com premissa documentada
- [ ] Finance solicita informações adicionais → F01 permanece aberto com prazo definido

---

### 15–25 min — F02: Descontos Método de Assinatura — base da fórmula

**Questão:** A base da relação da fórmula é `receita_de_ensino_liquida` (comportamento
atual do motor)?

**Estado atual do motor:**
`descontos_metodo_de_assinatura = −desconto_metodo_rate × receita_de_ensino_liquida`
(relação assumida; motor reporta via `descontosMetodoFormulaNote`)

**Resultados possíveis:**

- [ ] Finance confirma a base → F02 encerrado
- [ ] Finance especifica base alternativa → F02 encerrado com fórmula documentada
- [ ] Finance solicita informações adicionais → F02 permanece aberto com prazo definido

---

### 25–35 min — F03 e F04: Proveniência das fontes

**F03 — Taxas de anuidade BP1 2028:**

Valores utilizados: EY R$91.390 / LS R$111.670 / MS R$122.419 / HS R$141.469
(transcrição de captura de tela, não planilha XLSX assinada pelo Finance)

**Questão F03:** Os valores transcritos correspondem aos valores Finance aprovados?

**Resultados possíveis:**

- [ ] Finance confirma os valores e fornece planilha XLSX assinada → F03 encerrado
- [ ] Finance identifica divergência → F03 permanece aberto com valores corrigidos

**F04 — Tabela de descontos:**

Tabela utilizada: 20% (2028–2030) / 17% (2031) / 15% (2032–2033) / 12,5% (2034+)
(fonte verbal/documentada: Head of Finance; não é documento assinado)

**Questão F04:** A tabela de descontos está formalmente aprovada?

**Resultados possíveis:**

- [ ] Finance confirma a tabela e fornece documento assinado → F04 encerrado
- [ ] Finance identifica ajuste → F04 permanece aberto com tabela corrigida

---

### 35–45 min — F05: Base de alunos 2028 — paridade motor / planilha

**Questão:** O motor produz 228 alunos (t1_g3/intermediario); a planilha PnL registra
~246 alunos (Phase 13B). Qual é o cenário de referência para ratificação pelo conselho?

**Estado atual:** Nenhum dos dois valores é declarado autorizado. A diferença reflete
configurações de cenário distintas — o motor é internamente consistente.

| Fonte | Alunos 2028 | Configuração |
|-------|-------------|--------------|
| Motor (fixture canônica) | 228 | t1_g3 / intermediario |
| Planilha PnL (Phase 13B) | ~246 | Baseline original (não mapeado) |

**Resultados possíveis:**

- [ ] Finance + Conselho confirmam o cenário correto → F05 encerrado com baseline
  documentada
- [ ] Finance solicita mapeamento técnico adicional → F05 permanece aberto com prazo

---

### 45–55 min — F06: Capacidade instrucional e sincronização FOPAG

**Questão:** Ambos os modelos estão implementados. A sincronização das premissas FOPAG
com o envelope instrucional (EM 9 / HS 11 / 20 combinados) pode ser escopada como fase
futura dedicada?

**Estado atual:** Modelo de capacidade instrucional: EM 9 / HS 11 / 20 combinados
(Phase 15H.2, estabelecido). Adaptador FOPAG: implementado com premissas próprias.
Ambos implementados; premissas ainda não formalmente reconciliadas.

**Resultados possíveis:**

- [ ] Finance confirma que a sincronização pode ser escopada futuramente → F06 encerrado
  (encerramento Finance)
- [ ] Finance identifica premissa FOPAG que precisa ser ajustada antes do encerramento
  → F06 permanece aberto com prazo definido

---

### 55–60 min — Próximos passos e encerramento

- Registrar as decisões tomadas no arquivo `dre-finance-confirmation-register.json`
- Definir prazo para os itens que permanecerem abertos
- Confirmar que `FINANCE_SOURCE_CLOSURE_COMPLETE` pode ser definido como `true` somente
  quando todos os seis itens estiverem resolvidos com decisões documentadas e assinadas
- Agendar sessão de ratificação pelo conselho (requer F01–F06 encerrados)

---

## Critério de saída da sessão

O encerramento Finance (`FINANCE_SOURCE_CLOSURE_COMPLETE = true`) requer que **todos**
os seis itens sejam encerrados com decisões documentadas e assinadas:

| ID  | Item | Encerrado? |
|-----|------|------------|
| F01 | Outras Receitas — reajuste_despesas | ☐ |
| F02 | Descontos Método — base da fórmula | ☐ |
| F03 | Taxas de anuidade — XLSX assinado | ☐ |
| F04 | Tabela de descontos — documento assinado | ☐ |
| F05 | Base de alunos 2028 — baseline confirmada | ☐ |
| F06 | Capacidade instrucional / FOPAG — escopo confirmado | ☐ |

Itens parcialmente encerrados **não** satisfazem o critério de saída.

---

## Referências

| Documento | Localização |
|-----------|-------------|
| Pacote de confirmação (detalhe completo) | `docs/finance/dre-finance-confirmation-packet.md` |
| Registro de decisões | `docs/finance/dre-finance-confirmation-register.json` |
| Governança DRE (fonte técnica) | `src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts` |
| Modelo de capacidade instrucional | `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityModel.ts` |
