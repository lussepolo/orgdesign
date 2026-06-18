# Agenda — Sessão de Confirmação Finance / DRE Scenario Simulator

**Data:** A agendar
**Duração:** 60 minutos
**Formato:** Presencial ou videoconferência
**Pacote de referência:** `docs/finance/dre-finance-confirmation-packet.md` (Phase 15I.2C)

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

**Atualização Phase 15I.2C:** F02 (Descontos Método de Assinatura) foi resolvido como
questão de engenharia e **não consta mais desta agenda**.

---

## Agenda (60 minutos)

### 00–05 min — Abertura e objetivo da sessão

- Declaração de objetivo: confirmar ou rejeitar as cinco premissas Finance abertas
- Declaração de governança: o motor calcula hoje (`CALCULATION_CAN_BEGIN = true`); os
  cinco itens (F01, F03–F06) bloqueiam o encerramento Finance e a ratificação pelo
  conselho, mas não bloqueiam o cálculo
- Revisão rápida do registro de decisões (`dre-finance-confirmation-register.json`)
- Nota: F02 foi encerrado como questão de engenharia (Phase 15I.2C)

---

### 05–15 min — F01: Outras Receitas — nome do índice reajuste_despesas

**Questão:** Qual é o nome do índice econômico que alimenta a linha 9 da planilha PnL
(`reajuste_despesas`, C$9)?

**Estado atual do motor:** `outras_receitas = outrasReceitasRatio × numero_de_alunos`
(fator de reajuste omitido; motor reporta via `outrasReceitasReajusteNote`)

**O que já é conhecido:** A estrutura da fórmula está confirmada
(`C233 = ($Y233/$Y$221)*(1+C$9)*C$221`). Finance precisa confirmar apenas o nome do
índice e fornecer uma referência assinada para os valores anuais 2028–2047.

**Resultados possíveis:**

- [ ] Finance confirma o nome do índice e fornece referência assinada → F01 encerrado
- [ ] Finance confirma que o reajuste NÃO se aplica → F01 encerrado (motor sem alteração)
- [ ] Finance solicita informações adicionais → F01 permanece aberto com prazo definido

---

### 15–30 min — F03 e F04: Proveniência das fontes

**F03 — Taxas de anuidade BP1 2028:**

Valores utilizados: EY R$91.390 / LS R$111.670 / MS R$122.419 / HS R$141.469
(transcrição de captura de tela, não planilha XLSX assinada pelo Finance)

**Questão F03:** Os valores transcritos correspondem aos valores Finance aprovados?
Finance deve confirmar e fornecer planilha XLSX assinada.

**Resultados possíveis:**

- [ ] Finance confirma os valores e fornece planilha XLSX assinada → F03 encerrado
- [ ] Finance identifica divergência → F03 permanece aberto com valores corrigidos

**F04 — Tabela de descontos:**

Tabela utilizada: 20% (2028–2030) / 17% (2031) / 15% (2032–2033) / 12,5% (2034+)
(fonte verbal/documentada: Head of Finance; não é documento assinado)

**Questão F04:** Finance deve fornecer documento assinado confirmando a tabela existente.
Nenhuma alteração de valor é necessária.

**Resultados possíveis:**

- [ ] Finance confirma a tabela e fornece documento assinado → F04 encerrado
- [ ] Finance identifica ajuste → F04 permanece aberto com tabela corrigida

---

### 30–45 min — F05: Base de alunos 2028 — mapeamento de cenário

**Questão:** O motor produz 228 alunos (t1_g3/intermediario); a planilha PnL registra
~246 alunos (Phase 13B). Qual cenário do motor corresponde ao baseline da planilha?

**Nota:** Esta é uma questão de mapeamento de cenário — não de disputa de fórmula.

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

### 45–57 min — F06: Capacidade instrucional e sincronização FOPAG

**Questão:** Ambos os modelos estão implementados. Finance e Acadêmico devem confirmar
conjuntamente: (1) a definição de HC instrucional que alimenta ambos os modelos; (2) se
a sincronização FOPAG/instrucional pode ser escopada como fase futura dedicada.

**Estado atual:** Modelo de capacidade instrucional: EM 9 / HS 11 / 20 combinados
(Phase 15H.2, estabelecido). Adaptador FOPAG: implementado com premissas próprias.

**Proprietários:** Finance + Acadêmico (decisão conjunta — HC instrucional e FOPAG não
podem ser confirmados exclusivamente pelo Finance).

**Resultados possíveis:**

- [ ] Finance + Acadêmico confirmam definição de HC e escopo futuro → F06 encerrado
- [ ] Finance + Acadêmico identificam premissa que precisa ser ajustada antes do
  encerramento → F06 permanece aberto com prazo definido

---

### 57–60 min — Próximos passos e encerramento

- Registrar as decisões tomadas no arquivo `dre-finance-confirmation-register.json`
- Definir prazo para os itens que permanecerem abertos
- Confirmar que `FINANCE_SOURCE_CLOSURE_COMPLETE` pode ser definido como `true` somente
  quando todos os cinco itens estiverem resolvidos com decisões documentadas e assinadas
- Agendar sessão de ratificação pelo conselho (requer F01, F03–F06 encerrados)

---

## Critério de saída da sessão

O encerramento Finance (`FINANCE_SOURCE_CLOSURE_COMPLETE = true`) requer que **todos**
os cinco itens sejam encerrados com decisões documentadas e assinadas:

| ID  | Item | Encerrado? |
|-----|------|------------|
| F01 | Outras Receitas — nome do índice reajuste_despesas | ☐ |
| F03 | Taxas de anuidade — XLSX assinado | ☐ |
| F04 | Tabela de descontos — documento assinado | ☐ |
| F05 | Base de alunos 2028 — cenário mapeado | ☐ |
| F06 | Capacidade instrucional / FOPAG — escopo confirmado | ☐ |
| ~~F02~~ | ~~Descontos Método — base da fórmula~~ | ~~Resolvido (Phase 15I.2C)~~ |

Itens parcialmente encerrados **não** satisfazem o critério de saída.

---

## Referências

| Documento | Localização |
|-----------|-------------|
| Pacote de confirmação (detalhe completo) | `docs/finance/dre-finance-confirmation-packet.md` |
| Registro de decisões | `docs/finance/dre-finance-confirmation-register.json` |
| Governança DRE (fonte técnica) | `src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts` |
| Modelo de capacidade instrucional | `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityModel.ts` |
| Relatório de impacto Phase 15I.2C | `/tmp/phase15i2c-impact-report.md` |
