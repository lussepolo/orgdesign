# Pacote de Confirmação Finance — DRE Scenario Simulator

**Versão:** 15I.2C
**Data:** 2026-06-18
**Fase:** Phase 15I.2C — DRE Workbook Formula Parity and Finance Registry Correction
**Status do pacote:** Aberto para revisão Finance

---

## 1. Objetivo

Este pacote apresenta ao time de Finance as cinco decisões abertas que precisam ser
formalizadas antes que o simulador de cenários DRE possa ser encerrado como fonte
Finance e levado ao conselho para ratificação de cenário.

**Declaração de posição:**

O motor de cálculo DRE está implementado e calcula hoje (`CALCULATION_CAN_BEGIN = true`).
Os resultados foram tecnicamente validados em 108 cenários, sem falhas, sem NaN e sem
Infinity, com delta máximo de paridade EBITDA igual a zero. Os cinco itens abertos
listados neste pacote **não significam que a implementação do motor está incompleta** —
eles significam que fontes Finance que alimentam premissas específicas ainda não foram
formalmente confirmadas ou que reconciliações de cenário estão pendentes. Essas decisões
bloqueiam o encerramento da fonte Finance e a ratificação pelo conselho, mas **não
bloqueiam o cálculo**.

**Atualização Phase 15I.2C:** F02 (Descontos Método de Assinatura — base da fórmula)
foi resolvido como questão de engenharia. A fórmula do motor foi corrigida para usar
`receitas_com_ensino_regular` (C225) como base, conforme a planilha PnL
(`C230 = −C$13 × C225`). F02 não é mais uma questão Finance.

---

## 2. O que já está tecnicamente validado

| Item | Valor |
|------|-------|
| Estado do motor de cálculo | `engineering_ready` |
| Disponibilidade de cálculo | `available` |
| `CALCULATION_CAN_BEGIN` | `true` |
| Cenários validados | 108 cenários (0 falhas, 0 NaN, 0 Infinity) |
| Delta máximo de paridade EBITDA | 0 |
| Fixture canônica — alunos em 2028 | 228 (t1_g3 / intermediario / bp1_division_differentiated / balanced_experience) |
| Fixture canônica — primeiro ano EBITDA positivo | 2032 ou antes |
| Modelo de capacidade instrucional | Estabelecido — EM: 9 educadores, HS: 11 educadores, pool combinado: 20 (Phase 15H.2) |
| Modelo FOPAG de folha de pagamento | Implementado |
| F02 — fórmula Descontos Método | **Resolvido** — base corrigida para `receitas_com_ensino_regular` (Phase 15I.2C) |

---

## 3. O que ainda não está aprovado

| Item | Status |
|------|--------|
| Confirmação da fonte Finance | `pending_finance_confirmation` |
| Ratificação pelo conselho | `not_ratified` |
| `FINANCE_SOURCE_CLOSURE_COMPLETE` | `false` |
| `BOARD_RATIFICATION_READY` | `false` |

Esses valores **não mudarão** enquanto os cinco itens abaixo permanecerem abertos.

---

## 4. Resumo das decisões necessárias

| ID  | Chave | Status | Proprietário |
|-----|-------|--------|--------------|
| F01 | `outras_receitas_reajuste` | `provisional_source` | Finance |
| F03 | `tuition_source_provenance` | `provisional_source` | Finance |
| F04 | `discount_schedule_provenance` | `provisional_source` | Finance |
| F05 | `enrollment_baseline_parity` | `reconciliation_required` | Finance + Conselho |
| F06 | `instructional_capacity_payroll_sync` | `reconciliation_required` | Finance + Acadêmico |

Todos os cinco itens têm `blocksEngineCalculation: false` e `blocksBoardRatification: true`.

---

## 5. F01 — Outras Receitas: nome do índice e referência assinada de reajuste_despesas

### Comportamento atual do motor

O motor calcula Outras Receitas como:

```
outras_receitas = outrasReceitasRatio × numero_de_alunos
```

O fator de reajuste anual (`reajuste_despesas`) **não é aplicado**. O motor reporta isso
explicitamente via `outrasReceitasReajusteNote` em cada saída de ano.

### O que já é conhecido

A fórmula completa da planilha PnL de referência é:

```
C233 = ($Y233 / $Y$221) × (1 + C$9) × C$221
```

- **Estrutura da fórmula:** confirmada da planilha PnL (Phase 12I/12K).
- **Razão base:** Y233/Y221 = 2.571,87 por aluno (extraída e confirmada em
  `outras_receitas_base_per_learner_extraction.json`).
- **C$9:** linha 9 da planilha PnL (reajuste_despesas) — fator cumulativo de reajuste
  desde o ano de referência histórico.
- **Valores anuais linha 9:** não estão disponíveis como extração direta em nenhum
  arquivo de fonte comprometido. Branch B determinado na Phase 15I.2C.

### O que Finance precisa confirmar (F01)

Finance deve confirmar **apenas**:

1. **Nome do índice:** qual índice econômico alimenta a linha 9 (reajuste_despesas)?
   (Ex.: IGPM, IPCA, índice interno Concept)
2. **Referência assinada:** indicar a planilha ou documento assinado que contém os
   valores anuais de reajuste_despesas para 2028–2047.

**Finance não precisa definir a metodologia** — a estrutura da fórmula já está confirmada
pela planilha PnL. Apenas o nome do índice e a referência de fonte são necessários.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Nome do índice confirmado | _A preencher pelo Finance_ |
| Valores anuais 2028–2047 | _A preencher pelo Finance_ |
| Referência de fonte assinada | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 6. F03 — Taxas de anuidade: proveniência da fonte

### Comportamento atual do motor

As taxas de anuidade utilizadas em todos os cálculos de receita são provenientes de
transcrição de captura de tela (`screenshot_transcription_based`, `tuitionSourceData.ts`,
2026-06-02). **Valores BP1 2028 utilizados atualmente:**

| Nível | Taxa anual (R$) |
|-------|----------------|
| Early Years (EY) | R$ 91.390 |
| Lower Secondary (LS) | R$ 111.670 |
| Middle School (MS) | R$ 122.419 |
| High School (HS) | R$ 141.469 |

### Proveniência da fonte

A fonte atual **não é uma planilha XLSX assinada pelo Finance**. É uma transcrição de
captura de tela, sem assinatura formal de Finance.

### Impacto no cálculo

Afeta todas as linhas de receita derivadas de anuidade: `receitas_com_ensino_regular`,
`receita_de_ensino_bruta`, `bolsa_de_estudos`, `receita_de_ensino_liquida`,
`descontos_metodo_de_assinatura`, e todas as linhas downstream, incluindo
`margem_de_contribuicao` e `ebitda`.

### Decisão necessária (F03)

Finance deve:

1. Confirmar que os valores transcritos correspondem aos valores aprovados pelo Finance.
2. Fornecer a planilha XLSX assinada como fonte oficial.
3. Confirmar a data de corte dos valores (referência 2028).

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Referência de fonte aprovada | _A preencher pelo Finance_ |
| Planilha XLSX assinada | _A preencher pelo Finance_ |
| Valores confirmados (EY/LS/MS/HS 2028) | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 7. F04 — Tabela de descontos: formalização da fonte

### Comportamento atual do motor

O motor utiliza a seguinte tabela de descontos:

| Período | Taxa de desconto |
|---------|-----------------|
| 2028–2030 | 20% |
| 2031 | 17% |
| 2032–2033 | 15% |
| 2034+ (terminal) | 12,5% |

### Proveniência da fonte

`Verbal/documented source: Head of Finance` (`discountScheduleSourceData.ts`) — a tabela
foi documentada com base em comunicação verbal/informal. **Não é uma planilha assinada
pelo Finance.**

### Impacto no cálculo

Afeta: `bolsa_de_estudos` e todas as linhas downstream.

### Decisão necessária (F04)

Finance deve:

1. Confirmar formalmente a tabela de descontos documentada.
2. Fornecer planilha ou documento assinado como fonte oficial.

Nenhuma alteração de fórmula ou valor é necessária — apenas a formalização da fonte.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Tabela de descontos aprovada | _A preencher pelo Finance_ |
| Referência de fonte aprovada | _A preencher pelo Finance_ |
| Documento assinado | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 8. F05 — Base de alunos 2028: mapeamento de cenário entre motor e planilha PnL

### Comportamento atual do motor

O motor produz **228 alunos em 2028** para a fixture canônica:
`t1_g3 / intermediario / bp1_division_differentiated / balanced_experience`

A planilha PnL de referência (Phase 13B — `PNL_FORMULA_PARITY_SOURCE_DATA`) documenta
**aproximadamente 246 alunos** como baseline de referência.

**Nenhum dos dois valores é declarado autorizado.** A diferença reflete configurações de
cenário distintas — não é um erro de fórmula. Os dois modelos são internamente
consistentes, mas o mapeamento de premissas equivalentes não foi estabelecido.

### Valores documentados

| Fonte | Alunos em 2028 | Configuração |
|-------|----------------|--------------|
| Motor (fixture canônica) | 228 | t1_g3 / intermediario / bp1_division_differentiated / balanced_experience |
| Planilha PnL (Phase 13B) | ~246 | Baseline original da planilha (configuração não mapeada para o motor) |

### Impacto no cálculo

Afeta todas as linhas de receita e EBITDA, além das projeções da Decisão de Capital.

### Decisão necessária (F05)

Finance e Conselho devem:

1. Identificar qual configuração de cenário do motor (pacote de abertura + ocupação)
   corresponde ao baseline da planilha PnL.
2. Confirmar o cenário de referência para ratificação pelo conselho.
3. Documentar as premissas equivalentes de forma que o motor e a planilha PnL sejam
   comparáveis.

**Nota:** Esta é uma questão de mapeamento de cenário, não de disputa de fórmula. Nenhuma
fórmula precisa ser alterada — apenas o cenário de referência precisa ser identificado.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Cenário de referência aprovado | _A preencher pelo Finance + Conselho_ |
| Número de alunos aprovado para 2028 | _A preencher pelo Finance + Conselho_ |
| Mapeamento de configurações documentado | _A preencher pelo Finance + Conselho_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 9. F06 — Capacidade instrucional e sincronização FOPAG

### Estado atual dos modelos

**Ambos os modelos estão implementados. Suas premissas ainda não foram formalmente
reconciliadas.**

- **Modelo de capacidade instrucional** (Phase 15H.2, estabelecido): EM: 9 educadores,
  HS: 11 educadores, pool combinado: 20 (`secondaryEducatorCapacityModel.ts`).
- **Adaptador de folha de pagamento FOPAG** (implementado): utiliza premissas próprias
  atuais (`fopagEngine.ts` + `orgDesignPayrollActivation.ts`).

A sincronização das premissas do adaptador FOPAG com o envelope instrucional de 9/11/20
será realizada em uma **fase futura dedicada**, a ser escopada após a confirmação formal
do Finance e da equipe Acadêmica sobre a relação entre os dois modelos.

### Decisão necessária (F06)

Finance **e a equipe Acadêmica** devem confirmar **conjuntamente**:

1. O entendimento da relação entre o modelo de capacidade instrucional (9/11/20) e o
   adaptador FOPAG.
2. A definição de headcount (HC) que alimenta ambos os modelos.
3. Se a sincronização pode ser escopada como fase futura ou se alguma premissa FOPAG
   precisa ser ajustada antes do encerramento Finance.

**Nota:** O Representante Acadêmico é co-proprietário desta decisão — a definição de HC
instrucional e a reconciliação FOPAG não podem ser confirmadas exclusivamente pelo
Finance.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Decisão de sincronização | _A preencher pelo Finance + Acadêmico_ |
| Definição de HC confirmada | _A preencher pelo Finance + Acadêmico_ |
| Escopo da fase futura confirmado | _A preencher pelo Finance + Acadêmico_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 10. Critérios para encerramento da fonte Finance

O encerramento da fonte Finance (`FINANCE_SOURCE_CLOSURE_COMPLETE = true`) requer que
**todas** as seguintes condições sejam satisfeitas:

- [ ] F01: Finance confirma o nome do índice e a referência assinada para reajuste_despesas
- [ ] F03: Finance confirma os valores de anuidade e fornece planilha XLSX assinada
- [ ] F04: Finance fornece documento assinado para a tabela de descontos
- [ ] F05: Finance + Conselho confirmam o cenário de baseline de alunos 2028
- [ ] F06: Finance + Acadêmico confirmam a abordagem de sincronização FOPAG / capacidade instrucional

**F02 encerrado:** A fórmula de Descontos Método de Assinatura foi corrigida para usar
`receitas_com_ensino_regular` como base (Phase 15I.2C). F02 não bloqueia o encerramento
Finance.

---

## 11. Declaração de governança

Esta declaração registra o estado de governança na Phase 15I.2C.

```
Prontidão de engenharia:           engineering_ready
Disponibilidade de cálculo:        available
CALCULATION_CAN_BEGIN:             true
Prontidão da fonte Finance:        pending_finance_confirmation
FINANCE_SOURCE_CLOSURE_COMPLETE:   false
Prontidão de ratificação:          not_ratified
BOARD_RATIFICATION_READY:          false
Status do modelo FOPAG:            implemented
Status de alinhamento FOPAG:       reconciliation_required
F02 (fórmula):                     resolved_engineering (Phase 15I.2C)
```

O motor de cálculo DRE produziu resultados determinísticos em 108 cenários. Os itens
abertos F01, F03–F06 bloqueiam o encerramento da fonte Finance e a ratificação pelo
conselho. **Não bloqueiam o cálculo**.

`WORKING_SCENARIO_RATIFICATION_STATUS` permanece `"technical_validation_fixture"`.

---

## 12. Aprovações

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| Diretor(a) Finance | | | |
| Responsável pela planilha PnL | | | |
| Representante Acadêmico (para F06) | | | |
| Arquiteto(a) de Modelo Técnico | | | |

_Este pacote não produz encerramento Finance. As aprovações acima tornam-se efetivas
somente quando todos os campos de decisão de F01, F03, F04, F05 e F06 forem preenchidos
e assinados._
