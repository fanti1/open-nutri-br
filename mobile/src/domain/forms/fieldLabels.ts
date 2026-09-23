import { formatNumber } from '../../lib/format';

/** Rótulos em português para os campos e opções dos formulários de calculadora. */
const FIELD_LABELS: Record<string, string> = {
  weight_kg: 'Peso (kg)',
  height_m: 'Altura (m)',
  height_cm: 'Estatura (cm)',
  length_cm: 'Comprimento/estatura (cm)',
  measurement_position: 'Posição da medida',
  head_circumference_cm: 'Perímetro cefálico (cm)',
  age_years: 'Idade (anos)',
  age_months: 'Idade (meses)',
  sex: 'Sexo',
  usual_weight_kg: 'Peso habitual (kg)',
  current_weight_kg: 'Peso atual (kg)',
  period_days: 'Período (dias)',
  waist_cm: 'Cintura (cm)',
  hip_cm: 'Quadril (cm)',
  bmr_kcal: 'TMB (kcal)',
  activity_level: 'Nível de atividade',
  total_kcal: 'Valor calórico total (kcal)',
  carb_percent: 'Carboidratos (%)',
  protein_percent: 'Proteínas (%)',
  fat_percent: 'Lipídios (%)',
  clinical_context: 'Contexto clínico',
  factor_kcal_per_kg: 'Fator (kcal/kg)',
  weight_loss_percent: 'Perda de peso (%)',
  weight_loss_period_months: 'Período da perda (meses)',
  acute_disease_effect: 'Doença aguda sem ingestão > 5 dias',
  bmi: 'IMC',
  reduced_muscle_mass: 'Redução de massa muscular',
  reduced_food_intake: 'Ingestão/absorção reduzida',
  disease_burden_inflammation: 'Doença/inflamação',
  albumin_g_dl: 'Albumina (g/dL)',
  total_cholesterol_mg_dl: 'Colesterol total (mg/dL)',
  lymphocytes_cells_mm3: 'Linfócitos totais (/mm³)',
  triceps_skinfold_mm: 'Prega cutânea tricipital (mm)',
  transferrin_mg_dl: 'Transferrina (mg/dL)',
  delayed_hypersensitivity: 'Hipersensibilidade cutânea tardia',
  burned_body_surface_percent: 'Superfície corporal queimada (%)',
  protein_intake_g: 'Proteína ingerida (g/dia)',
  urinary_urea_nitrogen_24h_g: 'Nitrogênio ureico urinário 24h (g)',
  non_protein_kcal: 'Calorias não proteicas (kcal)',
  protein_g: 'Proteína (g)',
  target_volume_ml: 'Volume-alvo (mL)',
  infusion_duration_hours: 'Duração da infusão (h)',
  nutritional_status_score: 'Estado nutricional (0–3)',
  severity_score: 'Gravidade da doença (0–3)',
  food_intake_score: 'A. Ingestão alimentar',
  weight_loss_score: 'B. Perda de peso (3 meses)',
  mobility_score: 'C. Mobilidade',
  psychological_stress_score: 'D. Estresse psicológico / doença aguda',
  neuropsychological_score: 'E. Problemas neuropsicológicos',
  bmi_score: 'F. IMC',
  weight_change_rating: 'Alteração de peso',
  dietary_intake_rating: 'Alteração da ingestão',
  gi_symptoms_rating: 'Sintomas gastrointestinais',
  functional_capacity_rating: 'Capacidade funcional',
  metabolic_demand_rating: 'Doença e demanda metabólica',
  physical_exam_rating: 'Exame físico',
  box1_weight_history_score: 'Box 1 — Histórico de peso',
  box2_food_intake_score: 'Box 2 — Ingestão alimentar',
  box3_symptoms_score: 'Box 3 — Sintomas',
  box4_activity_function_score: 'Box 4 — Atividade e função',
  apache_ii: 'APACHE II',
  sofa: 'SOFA',
  comorbidities_count: 'Nº de comorbidades',
  days_hospital_to_icu: 'Dias da internação até a UTI',
  pregnant: 'Gestante',
  inflammation: 'Infecção ou inflamação presente',
  hemoglobin_g_dl: 'Hemoglobina (g/dL)',
  ferritin_ng_ml: 'Ferritina (ng/mL)',
  fasting_glucose_mg_dl: 'Glicemia de jejum (mg/dL)',
  fasting_insulin_uui_ml: 'Insulina de jejum (µUI/mL)',
  hba1c_percent: 'Hemoglobina glicada — HbA1c (%)',
  ogtt_2h_mg_dl: 'Glicemia 2 h após 75 g — TOTG (mg/dL)',
  hdl_mg_dl: 'HDL-c (mg/dL)',
  triglycerides_mg_dl: 'Triglicerídeos (mg/dL)',
  fasting: 'Coleta em jejum',
  creatinine_mg_dl: 'Creatinina sérica (mg/dL)',
  skinfold_chest_mm: 'Dobra peitoral (mm)',
  skinfold_midaxillary_mm: 'Dobra axilar média (mm)',
  skinfold_triceps_mm: 'Dobra tricipital (mm)',
  skinfold_biceps_mm: 'Dobra bicipital (mm)',
  skinfold_subscapular_mm: 'Dobra subescapular (mm)',
  skinfold_abdominal_mm: 'Dobra abdominal (mm)',
  skinfold_suprailiac_mm: 'Dobra suprailíaca (mm)',
  skinfold_thigh_mm: 'Dobra da coxa (mm)',
  body_fat_percent: 'Gordura corporal (%)',
  minute_ventilation_l_min: 'Ventilação-minuto (L/min)',
  max_temperature_c: 'Temperatura máxima nas últimas 24 h (°C)',
  body_surface_area_m2: 'Superfície corporal (m²)',
  temperature_c: 'Temperatura (°C)',
  respiratory_rate: 'Frequência respiratória (irpm)',
  tidal_volume_l: 'Volume corrente (L)',
  caloric_intake_kcal: 'Ingestão calórica nas últimas 24 h (kcal)',
  harris_benedict_kcal: 'Gasto basal por Harris-Benedict (kcal/dia)',
  post_burn_day: 'Dias após a queimadura',

  // Campos de resultado
  value: 'Resultado',
  percentage: 'Percentual (%)',
  total_score: 'Pontuação total',
  z_score: 'Escore-Z',
  measure: 'Medida utilizada',
  reference_median: 'Mediana de referência (OMS)',
  percent_of_median: '% da mediana',
  weight_for_height_percent: 'Peso/estatura (% da mediana)',
  height_for_age_percent: 'Estatura/idade (% da mediana)',
  kcal_per_kg: 'kcal/kg/dia',
  kcal_per_day: 'kcal/dia',
  get_kcal: 'Gasto energético (kcal/dia)',
  vct_kcal: 'VCT (kcal/dia)',
  pni_percent: 'PNI (%)',
  ml_per_day: 'mL/dia',
  min_ml_per_day: 'Mínimo (mL/dia)',
  max_ml_per_day: 'Máximo (mL/dia)',
  rate_ml_per_hour: 'Taxa (mL/h)',
  balance_g_per_day: 'Balanço (g N/dia)',
  nitrogen_g: 'Nitrogênio (g)',
  kcal_per_gram_nitrogen: 'kcal não proteicas / g N',
  carbohydrate_g: 'Carboidratos (g)',
  fat_g: 'Lipídios (g)',
  protein_g_per_day: 'Proteína (g/dia)',
  anemia_cutoff_g_dl: 'Limite para anemia (g/dL)',
  ferritin_cutoff_ng_ml: 'Limite para deficiência (ng/mL)',
  homa_ir: 'HOMA-IR',
  ldl_mg_dl: 'LDL-c — Friedewald (mg/dL)',
  non_hdl_mg_dl: 'Não-HDL-c (mg/dL)',
  egfr_ml_min_173m2: 'TFG estimada (mL/min/1,73 m²)',
  crcl_ml_min: 'Clearance de creatinina (mL/min)',
  waist_height_ratio: 'Relação cintura/estatura',
  conicity_index: 'Índice de conicidade',
  body_density: 'Densidade corporal (g/mL)',
  sum_skinfolds_mm: 'Soma das dobras (mm)',
  lean_mass_kg: 'Massa magra (kg)',
  ree_kcal: 'Gasto energético de repouso (kcal/dia)',
  mifflin_kcal: 'Mifflin-St Jeor (kcal/dia)',
};

const OPTION_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  deitado: 'Deitado',
  em_pe: 'Em pé',
  leve: 'Leve',
  moderada: 'Moderada',
  intensa: 'Intensa',
  nenhuma: 'Nenhuma',
  leve_moderada: 'Leve/moderada',
  grave: 'Grave',
  anergico: 'Anérgico',
  menor_5mm: '< 5 mm',
  maior_igual_5mm: '≥ 5 mm',
};

const ASG_HINT = 'A = bem nutrido · B = moderadamente desnutrido/suspeita · C = gravemente desnutrido';
const PG_SGA_HINT = 'Pontuação do box conforme o formulário oficial PG-SGA.';

/** Escala oficial de cada item dos instrumentos de pontuação, exibida sob o campo. */
const FIELD_HINTS: Record<string, string> = {
  nutritional_status_score:
    '0 normal · 1 perda > 5% em 3 meses ou ingestão 50–75% · 2 perda > 5% em 2 meses, IMC 18,5–20,5 + estado geral comprometido ou ingestão 25–50% · 3 perda > 5% em 1 mês, IMC < 18,5 + estado geral comprometido ou ingestão 0–25%',
  severity_score:
    '0 necessidades normais · 1 fratura de quadril, doença crônica com complicação aguda (cirrose, DPOC, hemodiálise, diabetes, câncer) · 2 cirurgia abdominal maior, AVC, pneumonia grave, neoplasia hematológica · 3 TCE, transplante de medula, UTI (APACHE > 10)',
  food_intake_score: '0 diminuição grave · 1 diminuição moderada · 2 sem diminuição',
  weight_loss_score: '0 > 3 kg · 1 não sabe · 2 entre 1 e 3 kg · 3 sem perda',
  mobility_score: '0 restrito ao leito/cadeira · 1 deambula mas não sai de casa · 2 sai de casa',
  psychological_stress_score: 'Nos últimos 3 meses: 0 sim · 2 não',
  neuropsychological_score: '0 demência ou depressão graves · 1 demência leve · 2 sem problemas',
  bmi_score: '0 IMC < 19 · 1 19 a < 21 · 2 21 a < 23 · 3 ≥ 23',
  weight_change_rating: ASG_HINT,
  dietary_intake_rating: ASG_HINT,
  gi_symptoms_rating: ASG_HINT,
  functional_capacity_rating: ASG_HINT,
  metabolic_demand_rating: ASG_HINT,
  physical_exam_rating: ASG_HINT,
  box1_weight_history_score: PG_SGA_HINT,
  box2_food_intake_score: PG_SGA_HINT,
  box3_symptoms_score: PG_SGA_HINT,
  box4_activity_function_score: PG_SGA_HINT,
  age_months: 'Pode usar fração (ex.: 18,5 meses).',
  pregnant: 'Gestantes têm ponto de corte próprio na OMS.',
  inflammation: 'Ex.: PCR > 5 mg/L ou AGP > 1 g/L — a ferritina sobe na inflamação e o corte muda.',
  ferritin_ng_ml: 'ng/mL equivale a µg/L.',
  hba1c_percent: 'Os três exames são opcionais — preencha ao menos um.',
  triglycerides_mg_dl: 'Com TG ≥ 400 mg/dL o LDL por Friedewald não é calculado.',
  body_fat_percent: 'Use o resultado de uma equação de dobras (Jackson-Pollock, Durnin-Womersley) ou da bioimpedância.',
  skinfold_thigh_mm: 'Medidas do lado direito, com adipômetro, média de 2–3 leituras.',
  minute_ventilation_l_min: 'Do ventilador, no momento da avaliação. Para ≥ 60 anos com IMC ≥ 30 é usada a versão 2010.',
  tidal_volume_l: 'Em litros (ex.: 500 mL = 0,5).',
  body_surface_area_m2: 'Ex.: DuBois ou Mosteller.',
  harris_benedict_kcal: 'Use a calculadora Harris-Benedict com o peso do paciente.',
};

export function fieldHint(name: string): string | undefined {
  return FIELD_HINTS[name];
}

/** Resultados que precisam de mais de 2 casas decimais para ter sentido clínico. */
const FIELD_DECIMALS: Record<string, number> = {
  body_density: 4,
};

/** Valor de resultado formatado em pt-BR com as casas decimais adequadas ao campo. */
export function formatFieldValue(name: string, value: number): string {
  return formatNumber(value, FIELD_DECIMALS[name] ?? 2);
}

export function fieldLabel(name: string): string {
  return FIELD_LABELS[name] ?? name.replace(/_/g, ' ');
}

export function optionLabel(value: string): string {
  return OPTION_LABELS[value] ?? value.replace(/_/g, ' ');
}

/** Os códigos de classificação são ASCII; estas palavras recuperam a acentuação na tela. */
const ACCENTED_WORDS: Record<string, string> = {
  desnutricao: 'desnutrição',
  balanco: 'balanço',
  educacao: 'educação',
  intervencao: 'intervenção',
  critica: 'crítica',
  cronica: 'crônica',
  intermediario: 'intermediário',
  medio: 'médio',
  pre: 'pré',
  compativel: 'compatível',
  deficiencia: 'deficiência',
  resistencia: 'resistência',
  insulinica: 'insulínica',
  desejavel: 'desejável',
  diminuida: 'diminuída',
  falencia: 'falência',
  saudavel: 'saudável',
  equacao: 'equação',
};

/** Transforma um código de classificação (ex.: "risco_de_sobrepeso") em texto legível. */
export function classificationLabel(code: string): string {
  const text = code
    .split('_')
    .map((word) => ACCENTED_WORDS[word] ?? word)
    .join(' ');
  // "pré diabetes" → "pré-diabetes" (grafia da SBD).
  const hyphenated = text.replace(/\bpré (\p{L})/gu, 'pré-$1');
  return hyphenated.charAt(0).toUpperCase() + hyphenated.slice(1);
}
