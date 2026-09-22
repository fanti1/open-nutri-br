<?php

namespace App\Domain\Calculators\Ambulatorio\Antropometria\PerdaDePeso;

use App\Domain\Calculators\Contracts\ClassifierInterface;

/**
 * Significance thresholds by time window, per Blackburn GL et al., JPEN, 1977.
 * Each row is [max period in days this row covers, significant %, severe %];
 * the 1-week row is the only one with a distinct significant/severe range —
 * the others use a single published cutoff for both (Blackburn's table gives
 * one number per longer window, e.g. "5% in 1 month").
 */
final class PerdaDePesoClassifier implements ClassifierInterface
{
    private const THRESHOLDS = [
        ['max_days' => 7, 'significant' => 1.0, 'severe' => 2.0],
        ['max_days' => 30, 'significant' => 5.0, 'severe' => 5.0],
        ['max_days' => 90, 'significant' => 7.5, 'severe' => 7.5],
        ['max_days' => 180, 'significant' => 10.0, 'severe' => 10.0],
    ];

    public function classify(array $result, array $inputs): string
    {
        $percentage = $result['percentage'];
        $periodDays = (float) $inputs['period_days'];

        $bucket = collect(self::THRESHOLDS)->first(fn (array $row) => $periodDays <= $row['max_days'])
            ?? self::THRESHOLDS[count(self::THRESHOLDS) - 1];

        return match (true) {
            $percentage < $bucket['significant'] => 'sem_perda_significativa',
            $percentage < $bucket['severe'] => 'perda_significativa',
            default => 'perda_severa',
        };
    }
}
