// Converte a planilha oficial da TACO 4ª edição (NEPA-UNICAMP, 2011) em JSON
// embarcado no app, para a Tabela Nutricional funcionar 100% offline.
//
// Fonte: https://nepa.unicamp.br/publicacoes/tabela-taco-excel/ (Taco-4a-Edicao.xlsx)
// Uso:   npm i --no-save xlsx && node scripts/build-taco.mjs caminho/Taco-4a-Edicao.xlsx
//
// A planilha traz médias sem arredondamento; aqui os valores são arredondados
// com a precisão da tabela publicada (ex.: 123,53 kcal → 124 kcal). Marcações
// da legenda oficial preservadas: "NA" (não aplicável), "Tr" (traço — também
// quando o valor arredondado cai entre 0 e a menor casa exibida) e "*"
// (análises sendo reavaliadas). Célula vazia = análise não solicitada (null).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const source = process.argv[2];
if (!source) throw new Error('Informe o caminho da planilha Taco-4a-Edicao.xlsx');

const TARGET = join(dirname(fileURLToPath(import.meta.url)), '../src/data/taco.json');

/** [chave no app, coluna na aba "CMVCol taco3", casas decimais]. */
const MAIN_COLUMNS = [
  ['moisture_pct', 2, 1],
  ['energy_kcal', 3, 0],
  ['protein_g', 5, 1],
  ['lipid_g', 6, 1],
  ['cholesterol_mg', 7, 0],
  ['carbohydrate_g', 8, 1],
  ['fiber_g', 9, 1],
  ['ash_g', 10, 1],
  ['calcium_mg', 11, 0],
  ['magnesium_mg', 12, 0],
  ['manganese_mg', 14, 2],
  ['phosphorus_mg', 15, 0],
  ['iron_mg', 16, 1],
  ['sodium_mg', 17, 0],
  ['potassium_mg', 18, 0],
  ['copper_mg', 19, 2],
  ['zinc_mg', 20, 1],
  ['retinol_mcg', 21, 0],
  ['vitamin_a_rae_mcg', 23, 0],
  ['thiamine_mg', 24, 2],
  ['riboflavin_mg', 25, 2],
  ['pyridoxine_mg', 26, 2],
  ['niacin_mg', 27, 2],
  ['vitamin_c_mg', 28, 1],
];

/** Aba "AGtaco3": ácidos graxos saturados, mono e poli-insaturados (g). */
const FAT_COLUMNS = [
  ['saturated_fat_g', 2, 1],
  ['monounsaturated_fat_g', 3, 1],
  ['polyunsaturated_fat_g', 4, 1],
];

function value(raw, decimals) {
  if (raw === '' || raw === undefined || raw === null) return null;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text === 'Tr' || text === 'NA' || text === '*') return text;
    if (text === '') return null;
    const parsed = Number(text.replace(',', '.'));
    if (!Number.isFinite(parsed)) return null;
    raw = parsed;
  }
  const factor = 10 ** decimals;
  const rounded = Math.round(raw * factor) / factor;
  // Regra de "traço" da legenda: presente, mas abaixo da menor casa exibida.
  return rounded === 0 && raw > 0 ? 'Tr' : rounded;
}

const HEADER_LABELS = /^(Número do|Alimento|Legenda)$/;

const workbook = XLSX.readFile(source);
const rowsOf = (sheet) => XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: '' });

const fats = new Map();
for (const row of rowsOf('AGtaco3')) {
  if (typeof row[0] !== 'number') continue;
  fats.set(row[0], Object.fromEntries(FAT_COLUMNS.map(([key, col, dec]) => [key, value(row[col], dec)])));
}

const foods = [];
let group = null;
for (const row of rowsOf('CMVCol taco3')) {
  if (typeof row[0] === 'string' && row[0].trim() === 'Legenda') break;
  if (typeof row[0] === 'string' && row[0].trim() && !String(row[1]).trim() && !HEADER_LABELS.test(row[0].trim())) {
    group = row[0].trim(); // linha de grupo (ex.: "Cereais e derivados")
    continue;
  }
  if (typeof row[0] !== 'number' || !String(row[1]).trim()) continue;

  foods.push({
    id: row[0],
    name: String(row[1]).trim().replace(/\s+/g, ' '),
    group,
    ...Object.fromEntries(MAIN_COLUMNS.map(([key, col, dec]) => [key, value(row[col], dec)])),
    ...(fats.get(row[0]) ?? {}),
  });
}

writeFileSync(TARGET, JSON.stringify(foods));
console.log(`${foods.length} alimentos em ${new Set(foods.map((f) => f.group)).size} grupos → ${TARGET}`);
