import { cinturaQuadrilCalculator } from './ambulatorio/antropometria/cinturaQuadril';
import { durninWomersleyCalculator } from './ambulatorio/antropometria/durninWomersley';
import { indiceConicidadeCalculator } from './ambulatorio/antropometria/indiceConicidade';
import { jacksonPollock3Calculator } from './ambulatorio/antropometria/jacksonPollock3';
import { jacksonPollock7Calculator } from './ambulatorio/antropometria/jacksonPollock7';
import { relacaoCinturaEstaturaCalculator } from './ambulatorio/antropometria/relacaoCinturaEstatura';
import { cunninghamCalculator } from './ambulatorio/metabolismo/cunningham';
import { gorduraCorporalCalculator } from './ambulatorio/antropometria/gorduraCorporal';
import { imcCalculator } from './ambulatorio/antropometria/imc';
import { perdaDePesoCalculator } from './ambulatorio/antropometria/perdaDePeso';
import { pesoIdealCalculator } from './ambulatorio/antropometria/pesoIdeal';
import { distribuicaoMacrosCalculator } from './ambulatorio/metabolismo/distribuicaoMacros';
import { formulaDeBolsoCalculator } from './ambulatorio/metabolismo/formulaDeBolso';
import { harrisBenedictCalculator } from './ambulatorio/metabolismo/harrisBenedict';
import { ingestaoLiquidosCalculator } from './ambulatorio/metabolismo/ingestaoLiquidos';
import { mifflinStJeorCalculator } from './ambulatorio/metabolismo/mifflinStJeor';
import { necessidadesProteicasCalculator } from './ambulatorio/metabolismo/necessidadesProteicas';
import { valorCaloricoTotalCalculator } from './ambulatorio/metabolismo/valorCaloricoTotal';
import { ckdEpi2021Calculator } from './bioquimica/funcaoRenal/ckdEpi2021';
import { cockcroftGaultCalculator } from './bioquimica/funcaoRenal/cockcroftGault';
import { diagnosticoGlicemicoCalculator } from './bioquimica/glicemia/diagnosticoGlicemico';
import { homaIrCalculator } from './bioquimica/glicemia/homaIr';
import { anemiaOmsCalculator } from './bioquimica/hematologia/anemiaOms';
import { ferritinaOmsCalculator } from './bioquimica/hematologia/ferritinaOms';
import { perfilLipidicoCalculator } from './bioquimica/perfilLipidico/perfilLipidico';
import { pennStateCalculator } from './hospitalar/gastoEnergetico/pennState';
import { swinamerCalculator } from './hospitalar/gastoEnergetico/swinamer';
import { torontoCalculator } from './hospitalar/gastoEnergetico/toronto';
import { balancoNitrogenadoCalculator } from './hospitalar/suporteNutricional/balancoNitrogenado';
import { curreriCalculator } from './hospitalar/suporteNutricional/curreri';
import { dietaEnteralCalculator } from './hospitalar/suporteNutricional/dietaEnteral';
import { hollidaySegarCalculator } from './hospitalar/suporteNutricional/hollidaySegar';
import { nutricaoParenteralCalculator } from './hospitalar/suporteNutricional/nutricaoParenteral';
import { asgDetskyCalculator } from './hospitalar/triagemRisco/asgDetsky';
import { conutCalculator } from './hospitalar/triagemRisco/conut';
import { glimCalculator } from './hospitalar/triagemRisco/glim';
import { mNutricCalculator } from './hospitalar/triagemRisco/mNutric';
import { mnaSfCalculator } from './hospitalar/triagemRisco/mnaSf';
import { mustCalculator } from './hospitalar/triagemRisco/must';
import { nrs2002Calculator } from './hospitalar/triagemRisco/nrs2002';
import { pgSgaSfCalculator } from './hospitalar/triagemRisco/pgSgaSf';
import { pniCalculator } from './hospitalar/triagemRisco/pni';
import { necessidadeEnergeticaInfantilCalculator } from './pediatria/gastoEnergetico/necessidadeEnergeticaInfantil';
import { schofieldCalculator } from './pediatria/gastoEnergetico/schofield';
import type { Calculator } from './types';

/**
 * Mirrors backend config/calculators.php — the single place mapping a slug to
 * its local implementation, used for the instant-preview calculation. Slugs
 * missing here are computed by the server (POST /calculators/{slug}/calculate).
 */
export const CALCULATOR_REGISTRY: Record<string, Calculator<any>> = {
  imc: imcCalculator,
  'peso-ideal': pesoIdealCalculator,
  'perda-de-peso': perdaDePesoCalculator,
  'cintura-quadril': cinturaQuadrilCalculator,
  'gordura-corporal': gorduraCorporalCalculator,
  'harris-benedict': harrisBenedictCalculator,
  'mifflin-st-jeor': mifflinStJeorCalculator,
  'formula-de-bolso': formulaDeBolsoCalculator,
  'valor-calorico-total': valorCaloricoTotalCalculator,
  'distribuicao-macros': distribuicaoMacrosCalculator,
  'necessidades-proteicas': necessidadesProteicasCalculator,
  'ingestao-liquidos': ingestaoLiquidosCalculator,

  'nrs-2002': nrs2002Calculator,
  must: mustCalculator,
  'mna-sf': mnaSfCalculator,
  'asg-detsky': asgDetskyCalculator,
  'pg-sga-sf': pgSgaSfCalculator,
  glim: glimCalculator,
  conut: conutCalculator,
  pni: pniCalculator,
  mnutric: mNutricCalculator,

  curreri: curreriCalculator,
  'balanco-nitrogenado': balancoNitrogenadoCalculator,
  'holliday-segar': hollidaySegarCalculator,
  'nutricao-parenteral': nutricaoParenteralCalculator,
  'dieta-enteral': dietaEnteralCalculator,
  'penn-state': pennStateCalculator,
  swinamer: swinamerCalculator,
  toronto: torontoCalculator,

  schofield: schofieldCalculator,
  'necessidade-energetica-infantil': necessidadeEnergeticaInfantilCalculator,
  // As curvas OMS (oms-*, gomez, waterlow) dependem de ~18 mil linhas de
  // tabela e são calculadas só no servidor — ver spec "server_only".

  'anemia-oms': anemiaOmsCalculator,
  'ferritina-oms': ferritinaOmsCalculator,
  'glicemia-diagnostico': diagnosticoGlicemicoCalculator,
  'homa-ir': homaIrCalculator,
  'perfil-lipidico': perfilLipidicoCalculator,
  'ckd-epi-2021': ckdEpi2021Calculator,
  'cockcroft-gault': cockcroftGaultCalculator,

  'relacao-cintura-estatura': relacaoCinturaEstaturaCalculator,
  'indice-conicidade': indiceConicidadeCalculator,
  'jackson-pollock-3': jacksonPollock3Calculator,
  'jackson-pollock-7': jacksonPollock7Calculator,
  'durnin-womersley': durninWomersleyCalculator,
  cunningham: cunninghamCalculator,
};

export function getCalculator(slug: string): Calculator<any> | undefined {
  return CALCULATOR_REGISTRY[slug];
}
