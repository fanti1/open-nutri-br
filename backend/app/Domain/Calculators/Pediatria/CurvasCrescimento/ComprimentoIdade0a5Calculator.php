<?php

namespace App\Domain\Calculators\Pediatria\CurvasCrescimento;

use App\Domain\Calculators\Contracts\ClassifierInterface;
use App\Domain\Calculators\Contracts\FormulaInterface;
use App\Domain\Calculators\Pediatria\Classifiers\HeightForAgeClassifier;
use App\Domain\Calculators\Pediatria\Support\PediatricInputs;
use App\Domain\Calculators\Pediatria\Support\WhoAgeIndicatorFormula;
use App\Domain\Calculators\Pediatria\Support\WhoGrowthCalculator;
use App\Domain\Calculators\Support\CalculatorReference;

final class ComprimentoIdade0a5Calculator extends WhoGrowthCalculator
{
    public function slug(): string
    {
        return 'oms-comprimento-idade-0-5';
    }

    public function inputsSchema(): array
    {
        return [
            ...PediatricInputs::ageSexSchema(59.99),
            ...PediatricInputs::lengthSchema(),
        ];
    }

    public function reference(): CalculatorReference
    {
        return new CalculatorReference(
            method: 'Comprimento/estatura-para-idade (escore-Z, Padrões OMS 2006)',
            citation: 'WHO Multicentre Growth Reference Study Group, WHO Child Growth Standards, 2006; classificação: Ministério da Saúde, Norma Técnica do SISVAN, 2011.',
        );
    }

    protected function formula(): FormulaInterface
    {
        return new WhoAgeIndicatorFormula($this->growthReference, 'lenanthro', false, fn (array $i) => PediatricInputs::standardizedLength($i));
    }

    protected function classifier(): ?ClassifierInterface
    {
        return new HeightForAgeClassifier;
    }
}
