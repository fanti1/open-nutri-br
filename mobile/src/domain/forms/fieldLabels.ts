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
};

export function fieldHint(name: string): string | undefined {
  return FIELD_HINTS[name];
}

export function fieldLabel(name: string): string {
  return FIELD_LABELS[name] ?? name.replace(/_/g, ' ');
}

export function optionLabel(value: string): string {
  return OPTION_LABELS[value] ?? value.replace(/_/g, ' ');
}

/** Transforma um código de classificação (ex.: "risco_de_sobrepeso") em texto legível. */
export function classificationLabel(code: string): string {
  const text = code.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
