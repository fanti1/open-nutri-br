# Tabelas de referência de crescimento da OMS

Parâmetros LMS (L = Box-Cox, M = mediana, S = coeficiente de variação) usados
para calcular escores-Z antropométricos pediátricos.

| Arquivo | Indicador | Faixa | Eixo |
|---|---|---|---|
| `weianthro.txt` | Peso-para-idade | 0–5 anos | idade em dias (0–1826) |
| `lenanthro.txt` | Comprimento/estatura-para-idade | 0–5 anos | idade em dias |
| `bmianthro.txt` | IMC-para-idade | 0–5 anos | idade em dias |
| `hcanthro.txt` | Perímetro cefálico-para-idade | 0–5 anos | idade em dias |
| `wflanthro.txt` | Peso-para-comprimento | 45–110 cm (deitado) | comprimento, passo de 0,1 cm |
| `wfhanthro.txt` | Peso-para-estatura | 65–120 cm (em pé) | estatura, passo de 0,1 cm |
| `wfawho2007.txt` | Peso-para-idade | 5–10 anos | idade em meses (60–121) |
| `hfawho2007.txt` | Estatura-para-idade | 5–19 anos | idade em meses (60–229) |
| `bfawho2007.txt` | IMC-para-idade | 5–19 anos | idade em meses (60–229) |

Coluna `sex`: 1 = masculino, 2 = feminino.

## Procedência
- 0–5 anos: WHO Child Growth Standards (2006), copiados sem alteração do pacote
  oficial da OMS `anthro` (github.com/WorldHealthOrganization/anthro, `data-raw/growthstandards`).
- 5–19 anos: WHO Growth Reference (2007), copiados sem alteração do pacote
  oficial da OMS `anthroplus` (github.com/WorldHealthOrganization/anthroplus, `data-raw/growthstandards`).

O algoritmo de escore-Z em `app/Domain/Growth` replica o código-fonte desses
mesmos pacotes (z-score restrito acima de ±3 DP para indicadores de peso,
ajuste de ±0,7 cm entre comprimento e estatura, interpolação linear para a
referência 2007 e para peso-para-comprimento/estatura). Os testes usam saídas
calculadas pela própria OMS como gabarito.

Não editar estes arquivos manualmente — se a OMS publicar revisão, substituir
pelo arquivo oficial e rodar `php artisan test`.
