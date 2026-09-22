<?php

namespace App\Domain\Calculators\Support;

/**
 * The life stages a calculator's underlying study population validates it for.
 * Every calculator must declare this explicitly (CalculatorInterface::lifeStages())
 * so the app never offers, say, an adult-only equation for a pediatric patient.
 */
enum LifeStage: string
{
    case Child = 'crianca';
    case Adult = 'adulto';
    case Elderly = 'idoso';
}
