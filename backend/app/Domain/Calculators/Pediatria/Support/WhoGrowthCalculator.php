<?php

namespace App\Domain\Calculators\Pediatria\Support;

use App\Domain\Calculators\Support\AbstractCalculator;
use App\Domain\Calculators\Support\LifeStage;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;

/** Metadados comuns às calculadoras de curvas de crescimento da OMS. */
abstract class WhoGrowthCalculator extends AbstractCalculator
{
    public function __construct(
        protected readonly GrowthReferenceRepository $growthReference,
    ) {}

    public function module(): string
    {
        return 'pediatria';
    }

    public function category(): string
    {
        return 'curvas_crescimento';
    }

    public function version(): string
    {
        return 'v1';
    }

    /** Curvas de crescimento infantil — sem aplicação a adultos. */
    public function lifeStages(): array
    {
        return [LifeStage::Child];
    }
}
