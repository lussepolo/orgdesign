# Pacote de Confirmação Finance — DRE Scenario Simulator

**Versão:** 15I.2
**Data:** 2026-06-17
**Fase:** Phase 15I.2 — Preparação do Pacote de Confirmação Finance
**Status do pacote:** Aberto para revisão Finance

---

## 1. Objetivo

Este pacote apresenta ao time de Finance as seis decisões abertas que precisam ser
formalizadas antes que o simulador de cenários DRE possa ser encerrado como fonte
Finance e levado ao conselho para ratificação de cenário.

**Declaração de posição:**

O motor de cálculo DRE está implementado e calcula hoje (`CALCULATION_CAN_BEGIN = true`).
Os resultados foram tecnicamente validados em 108 cenários, sem falhas, sem NaN e sem
Infinity, com delta máximo de paridade EBITDA igual a zero. Os seis itens abertos
listados neste pacote **não significam que a implementação do motor está incompleta** —
eles significam que as fontes Finance que alimentam premissas específicas ainda não foram
formalmente confirmadas. Essas decisões bloqueiam o encerramento da fonte Finance e a
ratificação pelo conselho, mas **não bloqueiam o cálculo**.

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

---

## 3. O que ainda não está aprovado

| Item | Status |
|------|--------|
| Confirmação da fonte Finance | `pending_finance_confirmation` |
| Ratificação pelo conselho | `not_ratified` |
| `FINANCE_SOURCE_CLOSURE_COMPLETE` | `false` |
| `BOARD_RATIFICATION_READY` | `false` |

Esses valores **não mudarão** enquanto as seis decisões abaixo permanecerem abertas.
Nenhuma fórmula DRE, valor de fonte ou cálculo de Decisão de Capital foi alterado nesta
fase.

---

## 4. Resumo das decisões necessárias

| ID  | Chave | Status | Proprietário |
|-----|-------|--------|--------------|
| F01 | `outras_receitas_reajuste` | `pending_finance_confirmation` | Finance |
| F02 | `descontos_metodo_formula_base` | `pending_finance_confirmation` | Finance |
| F03 | `tuition_source_provenance` | `provisional_source` | Finance |
| F04 | `discount_schedule_provenance` | `provisional_source` | Finance |
| F05 | `enrollment_baseline_parity` | `reconciliation_required` | Finance + Conselho |
| F06 | `instructional_capacity_payroll_sync` | `reconciliation_required` | Finance |

Todos os seis itens têm `blocksEngineCalculation: false` e `blocksBoardRatification: true`.

---

## 5. F01 — Outras Receitas: fator de reajuste anual (reajuste_despesas)

### Comportamento atual do motor

O motor calcula Outras Receitas como:

```
outras_receitas = outrasReceitasRatio × numero_de_alunos
```

O fator de reajuste anual (`reajuste_despesas`) **não é aplicado**. O motor reporta isso
explicitamente via `outrasReceitasReajusteNote` em cada saída de ano.

### Referência da planilha PnL

A fórmula completa da planilha PnL de referência é:

```
C233 = ($Y233 / $Y$221) × (1 + C$9) × C$221
```

O termo `(1 + C$9)` corresponde ao fator de reajuste anual omitido pelo motor.

### Proveniência da fonte

`annualValuesStatus: not_available_pending_finance_source` — os valores anuais de
`reajuste_despesas` não estão disponíveis e dependem de confirmação Finance.

### Impacto no cálculo

Afeta diretamente: `outras_receitas`, `receita_operacional_antes_das_deducoes`,
`receita_operacional_liquida`, `margem_de_contribuicao`, `ebitda`.

A magnitude do impacto não pode ser calculada até que Finance forneça os valores anuais
do fator de reajuste.

### Decisão necessária (F01)

Finance deve confirmar:

1. O fator de reajuste anual (`reajuste_despesas`) aplica-se a Outras Receitas?
2. Caso sim, quais são os valores anuais para 2028–2047?
3. A fonte aprovada é o mesmo fator de inflação utilizado em outras linhas, ou um índice
   específico para Outras Receitas?

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Fórmula aprovada | _A preencher pelo Finance_ |
| Valores anuais aprovados | _A preencher pelo Finance_ |
| Referência de fonte aprovada | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 6. F02 — Descontos Método de Assinatura: base da relação da fórmula

### Comportamento atual do motor

O motor calcula o desconto do método de assinatura como:

```
descontos_metodo_de_assinatura = −desconto_metodo_rate × receita_de_ensino_liquida
```

Esta é uma relação **assumida** — a base exata da fórmula ainda não foi confirmada pelo
Finance. O motor reporta isso via `descontosMetodoFormulaNote` em cada saída de ano.

### Proveniência da fonte

`sourceType: pending_finance_source_confirmation` (`dreLineItemMap.ts`) — a relação de
base da fórmula está pendente de confirmação Finance.

### Tabela de descontos aplicada

| Período | Taxa de desconto |
|---------|-----------------|
| 2028–2030 | 20% |
| 2031 | 17% |
| 2032–2033 | 15% |
| 2034+ (terminal) | 12,5% |

### Impacto no cálculo

Afeta: `descontos_metodo_de_assinatura`, receita líquida pós-desconto,
`margem_de_contribuicao`, `ebitda`. O impacto depende de qual base o Finance confirmar.

### Decisão necessária (F02)

Finance deve confirmar:

1. A base da fórmula é `receita_de_ensino_liquida` (comportamento atual do motor)?
2. Caso contrário, qual é a base correta?

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Fórmula aprovada | _A preencher pelo Finance_ |
| Base confirmada | _A preencher pelo Finance_ |
| Referência de fonte aprovada | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 7. F03 — Taxas de anuidade: proveniência da fonte

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

Afeta todas as linhas de receita derivadas de anuidade: `receita_bruta_de_ensino`,
`receita_de_ensino_liquida`, e todas as linhas downstream, incluindo
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

## 8. F04 — Tabela de descontos: formalização da fonte

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

Afeta: `descontos_metodo_de_assinatura`, receita líquida pós-desconto, e todas as linhas
downstream.

### Decisão necessária (F04)

Finance deve:

1. Confirmar formalmente a tabela de descontos documentada.
2. Fornecer planilha ou documento assinado como fonte oficial.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Tabela de descontos aprovada | _A preencher pelo Finance_ |
| Referência de fonte aprovada | _A preencher pelo Finance_ |
| Documento assinado | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 9. F05 — Base de alunos 2028: paridade entre motor e planilha PnL

### Comportamento atual do motor

O motor produz **228 alunos em 2028** para a fixture canônica:
`t1_g3 / intermediario / bp1_division_differentiated / balanced_experience`

A planilha PnL de referência (Phase 13B — `PNL_FORMULA_PARITY_SOURCE_DATA`) documenta
**aproximadamente 246 alunos** como baseline de referência.

**Nenhum dos dois valores é declarado autorizado.** A diferença reflete configurações de
cenário distintas (pacote de abertura, taxa de ocupação, escopo) — os dois modelos são
internamente consistentes, mas a equivalência de premissas não foi estabelecida.

### Valores documentados

| Fonte | Alunos em 2028 | Configuração |
|-------|----------------|--------------|
| Motor (fixture canônica) | 228 | t1_g3 / intermediario / bp1_division_differentiated / balanced_experience |
| Planilha PnL (Phase 13B) | ~246 | Baseline original da planilha (configuração não mapeada para o motor) |

### Impacto no cálculo

Afeta todas as linhas de receita e EBITDA, além das projeções da Decisão de Capital. A
diferença de 18 alunos em 2028 propaga-se ao longo de todos os 20 anos de projeção.

### Decisão necessária (F05)

Finance e Conselho devem:

1. Identificar qual configuração de cenário do motor corresponde ao baseline da planilha
   PnL.
2. Confirmar se o cenário de referência para ratificação pelo conselho é
   `t1_g3 / intermediario` (228 alunos) ou um cenário de maior ocupação (~246 alunos).
3. Documentar as premissas equivalentes de forma que o motor e a planilha PnL sejam
   comparáveis.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Cenário de referência aprovado | _A preencher pelo Finance + Conselho_ |
| Número de alunos aprovado para 2028 | _A preencher pelo Finance + Conselho_ |
| Mapeamento de configurações documentado | _A preencher pelo Finance + Conselho_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 10. F06 — Capacidade instrucional e sincronização FOPAG

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

### Impacto no cálculo

Afeta: linhas FOPAG na DRE, `ebitda`. O impacto final dependerá do resultado da
reconciliação.

### Decisão necessária (F06)

Finance deve:

1. Confirmar o entendimento da relação entre o modelo de capacidade instrucional
   (9/11/20) e o adaptador FOPAG.
2. Confirmar se a sincronização pode ser escopada como fase futura ou se alguma premissa
   FOPAG precisa ser ajustada antes do encerramento Finance.

### Referência aprovada

| Campo | Valor |
|-------|-------|
| Decisão de sincronização | _A preencher pelo Finance_ |
| Escopo da fase futura confirmado | _A preencher pelo Finance_ |
| Responsável | _A preencher_ |
| Data de decisão | _A preencher_ |

---

## 11. Critérios para encerramento da fonte Finance

O encerramento da fonte Finance (`FINANCE_SOURCE_CLOSURE_COMPLETE = true`) requer que
**todas** as seguintes condições sejam satisfeitas:

- [ ] F01: Finance confirma a fórmula de reajuste de Outras Receitas (ou ausência dela)
- [ ] F02: Finance confirma a base da fórmula de Descontos Método de Assinatura
- [ ] F03: Finance fornece planilha XLSX assinada para as taxas de anuidade
- [ ] F04: Finance fornece documento assinado para a tabela de descontos
- [ ] F05: Finance + Conselho confirmam o cenário de baseline de alunos 2028
- [ ] F06: Finance confirma a abordagem de sincronização FOPAG / capacidade instrucional

Enquanto qualquer um desses itens permanecer aberto, `FINANCE_SOURCE_CLOSURE_COMPLETE`
permanece `false` e a ratificação pelo conselho não está disponível.

---

## 12. Declaração de governança

Esta declaração registra o estado de governança no momento da preparação deste pacote.
**Nenhum valor foi alterado.**

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
```

O motor de cálculo DRE produziu resultados determinísticos em 108 cenários. Os itens
abertos F01–F06 bloqueiam o encerramento da fonte Finance e a ratificação pelo conselho.
Eles **não bloqueiam o cálculo**.

Nenhuma fórmula DRE, valor de fonte ou cálculo de Decisão de Capital foi alterado.
`WORKING_SCENARIO_RATIFICATION_STATUS` permanece `"technical_validation_fixture"`.

---

## 13. Aprovações

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| Diretor(a) Finance | | | |
| Responsável pela planilha PnL | | | |
| Representante Acadêmico (para F06) | | | |
| Arquiteto(a) de Modelo Técnico | | | |

_Este pacote não produz encerramento Finance. As aprovações acima tornam-se efetivas
somente quando todos os campos de decisão de F01 a F06 forem preenchidos e assinados._
