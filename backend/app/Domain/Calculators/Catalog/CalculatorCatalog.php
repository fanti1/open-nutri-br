<?php

namespace App\Domain\Calculators\Catalog;

use App\Domain\Calculators\CalculatorRegistry;
use RuntimeException;

/**
 * Monta o catálogo de calculadoras exibido no app. Fatos científicos (módulo,
 * categoria, referência, faixas etárias, schema de entrada) vêm do
 * CalculatorRegistry; aqui ficam só os metadados de apresentação (nome,
 * descrição, ícone, ordem). Usado pelo seeder (banco) e pelo comando
 * catalog:export (arquivo embarcado no app, para funcionar offline).
 */
final class CalculatorCatalog
{
    /**
     * @var array<string, array{short_description: string, icon_key: string, sort_order: int}>
     */
    private const PRESENTATION = [
        'imc' => ['short_description' => 'Índice de Massa Corporal', 'icon_key' => 'scale', 'sort_order' => 10],
        'peso-ideal' => ['short_description' => 'Peso ideal pelo IMC (Devine)', 'icon_key' => 'target', 'sort_order' => 20],
        'perda-de-peso' => ['short_description' => '% de perda de peso e significância clínica', 'icon_key' => 'trend-down', 'sort_order' => 30],
        'cintura-quadril' => ['short_description' => 'Relação cintura-quadril (RCQ)', 'icon_key' => 'circle', 'sort_order' => 40],
        'gordura-corporal' => ['short_description' => '% de gordura corporal (Deurenberg)', 'icon_key' => 'pie-chart', 'sort_order' => 50],
        'harris-benedict' => ['short_description' => 'Cálculo de gasto energético (TMB)', 'icon_key' => 'flame', 'sort_order' => 60],
        'mifflin-st-jeor' => ['short_description' => 'Cálculo de gasto energético (TMB)', 'icon_key' => 'activity', 'sort_order' => 70],
        'formula-de-bolso' => ['short_description' => 'Estimativa rápida de GET (kcal/kg)', 'icon_key' => 'zap', 'sort_order' => 80],
        'valor-calorico-total' => ['short_description' => 'Valor Calórico Total (VCT)', 'icon_key' => 'calculator', 'sort_order' => 90],
        'distribuicao-macros' => ['short_description' => 'Distribuição de macronutrientes', 'icon_key' => 'pie-chart', 'sort_order' => 100],
        'necessidades-proteicas' => ['short_description' => 'Necessidade proteica diária', 'icon_key' => 'drumstick', 'sort_order' => 110],
        'ingestao-liquidos' => ['short_description' => 'Necessidade hídrica diária', 'icon_key' => 'droplet', 'sort_order' => 120],

        'nrs-2002' => ['short_description' => 'Triagem de risco nutricional', 'icon_key' => 'clipboard-check', 'sort_order' => 200],
        'must' => ['short_description' => 'Triagem universal de desnutrição', 'icon_key' => 'shield-alert', 'sort_order' => 210],
        'mna-sf' => ['short_description' => 'Mini Avaliação Nutricional (idoso)', 'icon_key' => 'user-check', 'sort_order' => 220],
        'asg-detsky' => ['short_description' => 'Avaliação Subjetiva Global', 'icon_key' => 'clipboard-list', 'sort_order' => 230],
        'pg-sga-sf' => ['short_description' => 'PG-SGA — forma resumida', 'icon_key' => 'clipboard-list', 'sort_order' => 240],
        'glim' => ['short_description' => 'Critérios diagnósticos de desnutrição', 'icon_key' => 'stethoscope', 'sort_order' => 250],
        'conut' => ['short_description' => 'Estado nutricional por exames laboratoriais', 'icon_key' => 'flask', 'sort_order' => 260],
        'pni' => ['short_description' => 'Índice de Prognóstico Nutricional', 'icon_key' => 'trending-up', 'sort_order' => 270],
        'mnutric' => ['short_description' => 'Risco nutricional em UTI', 'icon_key' => 'heart-pulse', 'sort_order' => 280],

        'curreri' => ['short_description' => 'Necessidade calórica em queimados', 'icon_key' => 'flame', 'sort_order' => 290],
        'balanco-nitrogenado' => ['short_description' => 'Balanço nitrogenado', 'icon_key' => 'scale', 'sort_order' => 300],
        'holliday-segar' => ['short_description' => 'Necessidade hídrica (Holliday-Segar)', 'icon_key' => 'droplet', 'sort_order' => 310],
        'nutricao-parenteral' => ['short_description' => 'Relação kcal não-proteica : nitrogênio', 'icon_key' => 'droplets', 'sort_order' => 320],
        'dieta-enteral' => ['short_description' => 'Taxa de infusão enteral', 'icon_key' => 'droplets', 'sort_order' => 330],

        'oms-peso-idade-0-5' => ['short_description' => 'Escore-Z e classificação SISVAN (0–5 anos)', 'icon_key' => 'scale', 'sort_order' => 400],
        'oms-comprimento-idade-0-5' => ['short_description' => 'Escore-Z e classificação SISVAN (0–5 anos)', 'icon_key' => 'ruler', 'sort_order' => 410],
        'oms-peso-comprimento-0-5' => ['short_description' => 'Escore-Z e classificação SISVAN (0–5 anos)', 'icon_key' => 'scale', 'sort_order' => 420],
        'oms-imc-idade-0-5' => ['short_description' => 'Escore-Z e classificação SISVAN (0–5 anos)', 'icon_key' => 'activity', 'sort_order' => 430],
        'oms-perimetro-cefalico-0-5' => ['short_description' => 'Escore-Z (0–5 anos)', 'icon_key' => 'circle', 'sort_order' => 440],
        'oms-imc-idade-5-19' => ['short_description' => 'Escore-Z e classificação SISVAN (5–19 anos)', 'icon_key' => 'activity', 'sort_order' => 450],
        'oms-estatura-idade-5-19' => ['short_description' => 'Escore-Z e classificação SISVAN (5–19 anos)', 'icon_key' => 'ruler', 'sort_order' => 460],
        'oms-peso-idade-5-10' => ['short_description' => 'Escore-Z e classificação SISVAN (5–10 anos)', 'icon_key' => 'scale', 'sort_order' => 470],
        'gomez' => ['short_description' => '% de adequação peso/idade', 'icon_key' => 'percent', 'sort_order' => 480],
        'waterlow' => ['short_description' => 'Desnutrição atual × crônica', 'icon_key' => 'layers', 'sort_order' => 490],
        'schofield' => ['short_description' => 'Taxa metabólica basal (todas as idades)', 'icon_key' => 'flame', 'sort_order' => 500],
        'necessidade-energetica-infantil' => ['short_description' => 'kcal/dia por idade e atividade (FAO/OMS)', 'icon_key' => 'zap', 'sort_order' => 510],
    ];

    /**
     * @var array<string, string>
     */
    private const DISPLAY_NAMES = [
        'imc' => 'IMC',
        'peso-ideal' => 'Peso Ideal',
        'perda-de-peso' => 'Perda de Peso %',
        'cintura-quadril' => 'Cintura-Quadril',
        'gordura-corporal' => 'Gordura Corporal %',
        'harris-benedict' => 'Harris-Benedict',
        'mifflin-st-jeor' => 'Mifflin-St Jeor',
        'formula-de-bolso' => 'Fórmula de Bolso',
        'valor-calorico-total' => 'Valor Calórico Total',
        'distribuicao-macros' => 'Distribuição de Macros',
        'necessidades-proteicas' => 'Necessidades Proteicas',
        'ingestao-liquidos' => 'Ingestão de Líquidos',

        'nrs-2002' => 'NRS-2002',
        'must' => 'MUST',
        'mna-sf' => 'MNA-SF',
        'asg-detsky' => 'ASG (Detsky)',
        'pg-sga-sf' => 'PG-SGA SF',
        'glim' => 'GLIM',
        'conut' => 'CONUT',
        'pni' => 'PNI',
        'mnutric' => 'mNUTRIC',

        'curreri' => 'Curreri (Queimados)',
        'balanco-nitrogenado' => 'Balanço Nitrogenado',
        'holliday-segar' => 'Holliday-Segar',
        'nutricao-parenteral' => 'Nutrição Parenteral',
        'dieta-enteral' => 'Dieta Enteral',

        'oms-peso-idade-0-5' => 'Peso/Idade (OMS)',
        'oms-comprimento-idade-0-5' => 'Comprimento/Idade (OMS)',
        'oms-peso-comprimento-0-5' => 'Peso/Comprimento (OMS)',
        'oms-imc-idade-0-5' => 'IMC/Idade (OMS 0–5)',
        'oms-perimetro-cefalico-0-5' => 'Perímetro Cefálico (OMS)',
        'oms-imc-idade-5-19' => 'IMC/Idade (OMS 5–19)',
        'oms-estatura-idade-5-19' => 'Estatura/Idade (OMS 5–19)',
        'oms-peso-idade-5-10' => 'Peso/Idade (OMS 5–10)',
        'gomez' => 'Gomez',
        'waterlow' => 'Waterlow',
        'schofield' => 'Schofield',
        'necessidade-energetica-infantil' => 'Necessidade Energética Infantil',
    ];

    public function __construct(
        private readonly CalculatorRegistry $registry,
    ) {}

    /**
     * @return list<array{slug: string, module: string, category: string, name: string, short_description: string, icon_key: string, formula_reference: string, input_schema: array<string, mixed>, life_stages: list<string>, sort_order: int}>
     */
    public function entries(): array
    {
        $entries = [];

        foreach ($this->registry->all() as $engine) {
            $slug = $engine->slug();
            $presentation = self::PRESENTATION[$slug]
                ?? throw new RuntimeException("Sem metadados de apresentação para a calculadora [{$slug}].");

            $entries[] = [
                'slug' => $slug,
                'module' => $engine->module(),
                'category' => $engine->category(),
                'name' => self::DISPLAY_NAMES[$slug],
                'short_description' => $presentation['short_description'],
                'icon_key' => $presentation['icon_key'],
                'formula_reference' => $engine->reference()->citation,
                'input_schema' => $engine->inputsSchema(),
                'life_stages' => array_map(fn ($stage) => $stage->value, $engine->lifeStages()),
                'sort_order' => $presentation['sort_order'],
            ];
        }

        usort($entries, fn (array $a, array $b) => $a['sort_order'] <=> $b['sort_order']);

        return $entries;
    }
}
