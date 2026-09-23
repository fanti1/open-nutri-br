# ADR 0005 — Fase 6 (Extensões de Consultório)

## Status
Implementado (6 calculadoras no módulo `ambulatorio`). A Fase 5 (Atendimento
Domiciliar) não tem calculadoras próprias — reaproveita triagens e suporte
nutricional das Fases 2 e 4 — e segue pendente como recorte de produto.

## Calculadoras

| Slug | Método | Referência (conferida) | Fases da vida |
|---|---|---|---|
| `relacao-cintura-estatura` | cintura / estatura; < 0,5 saudável · 0,5–0,59 aumentada · ≥ 0,6 alta | NICE NG246 (2025); Ashwell et al., Obes Rev 2012 | adulto, idoso |
| `indice-conicidade` | CC(m) / (0,109 × √(peso/estatura(m))); risco coronariano ≥ 1,25 H / ≥ 1,18 M | Valdez, 1991; Pitanga & Lessa, Rev Bras Epidemiol 2004 (30–74 anos) | adulto, idoso |
| `jackson-pollock-3` | H: peitoral+abdominal+coxa (1978); M: tríceps+suprailíaca+coxa (1980); Siri | Jackson & Pollock 1978; Jackson, Pollock & Ward 1980 | adulto (18–61 H / 18–55 M) |
| `jackson-pollock-7` | 7 dobras, equações de 1978/1980; Siri | idem | adulto |
| `durnin-womersley` | D = c − m·log10(Σ bíceps+tríceps+subescapular+suprailíaca), c/m por sexo e faixa etária; Siri | Durnin & Womersley, Br J Nutr 1974 (16–72 anos) | adulto, idoso |
| `cunningham` | TMB = 500 + 22 × massa magra; massa magra = peso × (1 − %G) | Cunningham, Am J Clin Nutr 1980 | adulto |

### Conferência das fontes
Nenhuma constante foi escrita só de memória:
- Cortes do índice de conicidade: resumo do artigo original (SciELO).
- Faixas da relação cintura-estatura: texto da NICE NG246.
- Tabela c/m de Durnin-Womersley: duas reproduções independentes, idênticas
  entre si e com os valores esperados.
- Coeficientes de Jackson-Pollock 3 e 7 dobras e a equação de Cunningham
  (resumo do artigo, "BMR = 500 + 22 (LBM)").

Os vetores em `shared/calculators-spec/` foram calculados por um script
separado das duas implementações.

## Decisões

### Campos condicionais (`required_if`)
As 3 dobras de Jackson-Pollock dependem do sexo. Em vez de duas calculadoras,
o schema usa `required_if:sex,male` / `required_if:sex,female`. O app lê essa
regra (`FieldDescriptor.requiredIf`): o campo só aparece e só é obrigatório
quando a condição vale, e valores digitados num campo que deixou de valer não
são enviados. Qualquer calculadora futura ganha isso de graça.

### Sem classificação de % de gordura
As tabelas de classificação de % de gordura mais citadas (ex.: Lohman) variam
entre edições e fontes secundárias; o resultado mostra % de gordura, densidade
e soma das dobras, sem rótulo. O profissional pode levar o % para o
Cunningham.

### Casas decimais por campo
A densidade corporal (g/mL) é exibida com 4 casas (`formatFieldValue`); com 2
casas todos os valores virariam "1,05".

## Deferidos
- Classificação de % de gordura corporal (ver acima).
- Jackson-Pollock 3 dobras alternativo masculino (peitoral, tríceps,
  subescapular — 1985).
- Cunningham 1991 (370 + 21,6 × MLG), frequentemente confundido com
  Katch-McArdle — não implementado para não duplicar o de 1980 sem critério
  clínico de escolha.
