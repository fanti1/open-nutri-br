<?php

namespace Tests\Unit\Domain\Calculators\Ambulatorio\Antropometria;

use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcClassifier;
use App\Domain\Calculators\Ambulatorio\Antropometria\Imc\ImcFormula;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Extends PHPUnit's own TestCase (not Laravel's) on purpose: Formula and
 * Classifier are plain PHP with no framework dependency, so they run instantly
 * with no application bootstrap — the payoff of keeping them single-purpose.
 */
class ImcPureUnitTest extends TestCase
{
    public function test_formula_computes_bmi(): void
    {
        $result = (new ImcFormula)->compute(['weight_kg' => 70, 'height_m' => 1.75]);

        $this->assertEqualsWithDelta(22.86, $result['value'], 0.01);
    }

    #[DataProvider('classificationBoundaries')]
    public function test_classifier_boundaries(float $bmi, string $expected): void
    {
        $classification = (new ImcClassifier)->classify(['value' => $bmi], []);

        $this->assertSame($expected, $classification);
    }

    /**
     * @return array<string, array{0: float, 1: string}>
     */
    public static function classificationBoundaries(): array
    {
        return [
            'just under 18.5 is baixo_peso' => [18.49, 'baixo_peso'],
            'exactly 18.5 is eutrofia' => [18.5, 'eutrofia'],
            'just under 25 is eutrofia' => [24.99, 'eutrofia'],
            'exactly 25 is sobrepeso' => [25.0, 'sobrepeso'],
            'just under 30 is sobrepeso' => [29.99, 'sobrepeso'],
            'exactly 30 is obesidade' => [30.0, 'obesidade'],
        ];
    }
}
