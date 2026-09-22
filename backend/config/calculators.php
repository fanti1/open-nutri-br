<?php

use App\Domain\Calculators\Ambulatorio\Antropometria\CinturaQuadril\CinturaQuadrilCalculator;
use App\Domain\Calculators\Ambulatorio\Antropometria\GorduraCorporal\GorduraCorporalCalculator;
use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcCalculator;
use App\Domain\Calculators\Ambulatorio\Antropometria\PerdaDePeso\PerdaDePesoCalculator;
use App\Domain\Calculators\Ambulatorio\Antropometria\PesoIdeal\PesoIdealCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\DistribuicaoMacros\DistribuicaoMacrosCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\FormulaDeBolso\FormulaDeBolsoCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\HarrisBenedict\HarrisBenedictCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\IngestaoLiquidos\IngestaoLiquidosCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\MifflinStJeor\MifflinStJeorCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\NecessidadesProteicas\NecessidadesProteicasCalculator;
use App\Domain\Calculators\Ambulatorio\Metabolismo\ValorCaloricoTotal\ValorCaloricoTotalCalculator;
use App\Domain\Calculators\Bioquimica\FuncaoRenal\CkdEpi2021\CkdEpi2021Calculator;
use App\Domain\Calculators\Bioquimica\FuncaoRenal\CockcroftGault\CockcroftGaultCalculator;
use App\Domain\Calculators\Bioquimica\Glicemia\DiagnosticoGlicemico\DiagnosticoGlicemicoCalculator;
use App\Domain\Calculators\Bioquimica\Glicemia\HomaIr\HomaIrCalculator;
use App\Domain\Calculators\Bioquimica\Hematologia\AnemiaOms\AnemiaOmsCalculator;
use App\Domain\Calculators\Bioquimica\Hematologia\FerritinaOms\FerritinaOmsCalculator;
use App\Domain\Calculators\Bioquimica\PerfilLipidico\PerfilLipidico\PerfilLipidicoCalculator;
use App\Domain\Calculators\Hospitalar\SuporteNutricional\BalancoNitrogenado\BalancoNitrogenadoCalculator;
use App\Domain\Calculators\Hospitalar\SuporteNutricional\Curreri\CurreriCalculator;
use App\Domain\Calculators\Hospitalar\SuporteNutricional\DietaEnteral\DietaEnteralCalculator;
use App\Domain\Calculators\Hospitalar\SuporteNutricional\HollidaySegar\HollidaySegarCalculator;
use App\Domain\Calculators\Hospitalar\SuporteNutricional\NutricaoParenteral\NutricaoParenteralCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\AsgDetsky\AsgDetskyCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\Conut\ConutCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\Glim\GlimCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\MNutric\MNutricCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\MnaSf\MnaSfCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\Must\MustCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\Nrs2002\Nrs2002Calculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\PgSgaSf\PgSgaSfCalculator;
use App\Domain\Calculators\Hospitalar\TriagemRisco\Pni\PniCalculator;
use App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Gomez\GomezCalculator;
use App\Domain\Calculators\Pediatria\ClassificacaoNutricional\Waterlow\WaterlowCalculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\ComprimentoIdade0a5Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\EstaturaIdade5a19Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\ImcIdade0a5Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\ImcIdade5a19Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\PerimetroCefalico0a5Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\PesoComprimento0a5Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\PesoIdade0a5Calculator;
use App\Domain\Calculators\Pediatria\CurvasCrescimento\PesoIdade5a10Calculator;
use App\Domain\Calculators\Pediatria\GastoEnergetico\NecessidadeEnergeticaInfantil\NecessidadeEnergeticaInfantilCalculator;
use App\Domain\Calculators\Pediatria\GastoEnergetico\Schofield\SchofieldCalculator;

/**
 * Maps a calculator's slug (stable, used in the API and in calculation_results
 * rows) to the FQCN that implements it. This is the single source of truth the
 * CalculatorRegistry reads from — adding a calculator to a future module means
 * adding one line here, nothing else in this file changes.
 */
return [
    // Fase 1 — Ambulatório / Antropometria
    'imc' => ImcCalculator::class,
    'peso-ideal' => PesoIdealCalculator::class,
    'perda-de-peso' => PerdaDePesoCalculator::class,
    'cintura-quadril' => CinturaQuadrilCalculator::class,
    'gordura-corporal' => GorduraCorporalCalculator::class,

    // Fase 1 — Ambulatório / Metabolismo
    'harris-benedict' => HarrisBenedictCalculator::class,
    'mifflin-st-jeor' => MifflinStJeorCalculator::class,
    'formula-de-bolso' => FormulaDeBolsoCalculator::class,
    'valor-calorico-total' => ValorCaloricoTotalCalculator::class,
    'distribuicao-macros' => DistribuicaoMacrosCalculator::class,
    'necessidades-proteicas' => NecessidadesProteicasCalculator::class,
    'ingestao-liquidos' => IngestaoLiquidosCalculator::class,

    // Fase 2 — Hospitalar/UTI / Triagem e Diagnóstico
    'nrs-2002' => Nrs2002Calculator::class,
    'must' => MustCalculator::class,
    'mna-sf' => MnaSfCalculator::class,
    'asg-detsky' => AsgDetskyCalculator::class,
    'pg-sga-sf' => PgSgaSfCalculator::class,
    'glim' => GlimCalculator::class,
    'conut' => ConutCalculator::class,
    'pni' => PniCalculator::class,
    'mnutric' => MNutricCalculator::class,

    // Fase 2 — Hospitalar/UTI / Necessidades e Suporte Nutricional
    'curreri' => CurreriCalculator::class,
    'balanco-nitrogenado' => BalancoNitrogenadoCalculator::class,
    'holliday-segar' => HollidaySegarCalculator::class,
    'nutricao-parenteral' => NutricaoParenteralCalculator::class,
    'dieta-enteral' => DietaEnteralCalculator::class,

    // Fase 3 — Pediatria / Curvas de crescimento OMS (0–5: 2006; 5–19: 2007)
    'oms-peso-idade-0-5' => PesoIdade0a5Calculator::class,
    'oms-comprimento-idade-0-5' => ComprimentoIdade0a5Calculator::class,
    'oms-peso-comprimento-0-5' => PesoComprimento0a5Calculator::class,
    'oms-imc-idade-0-5' => ImcIdade0a5Calculator::class,
    'oms-perimetro-cefalico-0-5' => PerimetroCefalico0a5Calculator::class,
    'oms-imc-idade-5-19' => ImcIdade5a19Calculator::class,
    'oms-estatura-idade-5-19' => EstaturaIdade5a19Calculator::class,
    'oms-peso-idade-5-10' => PesoIdade5a10Calculator::class,

    // Fase 3 — Pediatria / Classificação nutricional e gasto energético
    'gomez' => GomezCalculator::class,
    'waterlow' => WaterlowCalculator::class,
    'schofield' => SchofieldCalculator::class,
    'necessidade-energetica-infantil' => NecessidadeEnergeticaInfantilCalculator::class,

    // Fase 4 — Hematologia e Bioquímica
    'anemia-oms' => AnemiaOmsCalculator::class,
    'ferritina-oms' => FerritinaOmsCalculator::class,
    'glicemia-diagnostico' => DiagnosticoGlicemicoCalculator::class,
    'homa-ir' => HomaIrCalculator::class,
    'perfil-lipidico' => PerfilLipidicoCalculator::class,
    'ckd-epi-2021' => CkdEpi2021Calculator::class,
    'cockcroft-gault' => CockcroftGaultCalculator::class,
];
