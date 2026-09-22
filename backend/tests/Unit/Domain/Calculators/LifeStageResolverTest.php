<?php

namespace Tests\Unit\Domain\Calculators;

use App\Domain\Calculators\Support\LifeStage;
use App\Domain\Calculators\Support\LifeStageResolver;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class LifeStageResolverTest extends TestCase
{
    #[DataProvider('ages')]
    public function test_resolves_the_expected_life_stage(int $age, LifeStage $expected): void
    {
        $this->assertSame($expected, LifeStageResolver::fromAge($age));
    }

    /**
     * @return array<string, array{0: int, 1: LifeStage}>
     */
    public static function ages(): array
    {
        return [
            'newborn' => [0, LifeStage::Child],
            'just under the adult cutoff' => [19, LifeStage::Child],
            'just at the adult cutoff' => [20, LifeStage::Adult],
            'mid adulthood' => [40, LifeStage::Adult],
            'just under the elderly cutoff' => [59, LifeStage::Adult],
            'just at the elderly cutoff (Estatuto do Idoso)' => [60, LifeStage::Elderly],
            'advanced age' => [90, LifeStage::Elderly],
        ];
    }
}
