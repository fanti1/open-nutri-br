<?php

namespace App\Domain\Calculators\Bioquimica\FuncaoRenal\CkdEpi2021;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Categorias de TFG da KDIGO (2012): G1 ≥ 90 · G2 60–89 · G3a 45–59 ·
 * G3b 30–44 · G4 15–29 · G5 < 15. G1 e G2 só caracterizam doença renal
 * crônica se houver marcador de lesão renal (ex.: albuminúria).
 */
final class CkdEpi2021Classifier implements ClassifierInterface
{
    public function classify(array $result, array $inputs): string
    {
        $egfr = $result['egfr_ml_min_173m2'];

        return match (true) {
            $egfr >= 90 => 'g1_normal_ou_elevada',
            $egfr >= 60 => 'g2_levemente_diminuida',
            $egfr >= 45 => 'g3a_leve_a_moderadamente_diminuida',
            $egfr >= 30 => 'g3b_moderada_a_gravemente_diminuida',
            $egfr >= 15 => 'g4_gravemente_diminuida',
            default => 'g5_falencia_renal',
        };
    }
}
