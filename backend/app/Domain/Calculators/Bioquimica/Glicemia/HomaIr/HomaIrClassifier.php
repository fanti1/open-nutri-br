<?php

namespace App\Domain\Calculators\Bioquimica\Glicemia\HomaIr;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Ponto de corte validado para a população brasileira: HOMA-IR > 2,71.
 * Reference: Geloneze B et al., Brazilian Metabolic Syndrome Study (BRAMS),
 * Diabetes Res Clin Pract, 2006.
 */
final class HomaIrClassifier implements ClassifierInterface
{
    public const CUTOFF = 2.71;

    public function classify(array $result, array $inputs): string
    {
        return $result['homa_ir'] > self::CUTOFF ? 'resistencia_insulinica' : 'sem_resistencia_insulinica';
    }
}
