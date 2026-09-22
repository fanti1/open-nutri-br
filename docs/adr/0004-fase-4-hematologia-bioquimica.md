# ADR 0004 — Fase 4 (Hematologia e Bioquímica)

## Status
Implementado (7 calculadoras, módulo `bioquimica`). Três itens do catálogo
original deferidos (ver abaixo).

## Calculadoras

| Slug | Método | Referência | Fases da vida |
|---|---|---|---|
| `anemia-oms` | Hb por idade/sexo/gestação → sem anemia, leve, moderada, grave | OMS, WHO/NMH/NHD/MNM/11.1, 2011 (Tabela 1) | criança (≥ 6 meses), adulto, idoso |
| `ferritina-oms` | Ferritina < 12 µg/L (< 5 anos) ou < 15 µg/L (≥ 5 anos); com inflamação < 30 / < 70 | OMS, guideline on ferritin concentrations, 2020 | criança, adulto, idoso |
| `glicemia-diagnostico` | Glicemia de jejum 100/126, HbA1c 5,7/6,5 %, TOTG 2 h 140/200 mg/dL; vale o exame mais alterado | SBD, Diretriz Oficial 2023 (= ADA) | adulto, idoso |
| `homa-ir` | Glicemia (mg/dL) × insulina (µUI/mL) / 405; corte > 2,71 | Matthews et al., 1985; corte brasileiro: Geloneze et al. (BRAMS), 2006 | adulto, idoso |
| `perfil-lipidico` | LDL-c (Friedewald) só com TG < 400; não-HDL-c; desejáveis CT < 190, HDL-c > 40, TG < 150 (jejum) / < 175 | SBC, Atualização da Diretriz de Dislipidemias 2017; Friedewald et al., 1972 | adulto, idoso |
| `ckd-epi-2021` | TFGe por creatinina, sem raça; categorias G1–G5 | Inker et al., NEJM 2021; KDIGO 2012 | adulto, idoso |
| `cockcroft-gault` | (140 − idade) × peso / (72 × Scr) × 0,85 (mulher) | Cockcroft & Gault, Nephron, 1976 | adulto, idoso |

Os valores esperados dos vetores em `shared/calculators-spec/` foram
calculados por um script independente das duas implementações (PHP e TS) e
conferidos à mão (ex.: CKD-EPI, homem 50 anos, Scr 1,0 → 91,7).

## Decisões

### Diagnóstico, não rótulo definitivo
- Um único exame glicêmico na faixa de diabetes, sem sintomas, precisa de
  confirmação (SBD/ADA) — a classificação é "compatível com diabetes".
- G1 e G2 da KDIGO só caracterizam doença renal crônica com marcador de lesão
  renal (ex.: albuminúria); isso está documentado no classificador.
- Metas de LDL-c e não-HDL-c dependem da categoria de risco cardiovascular, que
  o app não estratifica — a classificação usa só os valores referenciais
  desejáveis e o resultado mostra LDL-c e não-HDL-c para o profissional
  comparar com a meta do paciente.

### Entradas opcionais
`glicemia-diagnostico` aceita qualquer combinação dos três exames
(`required_without_all` no backend). No app, a combinação vazia lança
`IncompleteInputsError`, cuja mensagem aparece na tela.

### Idade fracionada
A anemia da OMS começa em 6 meses, então `age_years` aceita fração. O
auto-preenchimento pela ficha passa a enviar anos com decimais para campos de
idade não inteiros (ex.: bebê de 9 meses → 0,75).

### Acentuação das classificações
Os códigos de classificação são ASCII (estáveis no banco). O app recupera a
acentuação na exibição (`classificationLabel`) — corrige também rótulos antigos
como "Desnutrição" e "Balanço".

## Deferidos
- **Martin-Hopkins** (LDL-c preferido pela SBC 2017): depende de uma tabela de
  180 fatores que não foi transcrita e conferida com a fonte primária.
- **Pontos de corte de hemoglobina da OMS 2024** (atualização da diretriz de
  2011, com mudanças em 6–23 meses e por trimestre gestacional): não adotados
  até conferir a tabela e os cortes de gravidade no documento original.
- **Proteínas viscerais (albumina, pré-albumina, transferrina com PCR)**: não há
  pontos de corte consensuais únicos; o CONUT e o PNI (Fase 2) já cobrem o uso
  prognóstico.
- Conferir se há diretriz brasileira de dislipidemia posterior a 2017 antes de
  uso clínico amplo.
