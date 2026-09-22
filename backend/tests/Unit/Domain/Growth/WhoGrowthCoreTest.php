<?php

namespace Tests\Unit\Domain\Growth;

use App\Domain\Growth\LmsParameters;
use App\Domain\Growth\WhoMeasurements;
use App\Domain\Growth\WhoZScore;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/** Núcleo puro (sem Laravel) do cálculo de escore-Z da OMS. */
class WhoGrowthCoreTest extends TestCase
{
    public function test_a_measure_equal_to_the_median_has_z_zero(): void
    {
        $lms = new LmsParameters(0.3487, 3.3464, 0.14602);

        $this->assertEqualsWithDelta(0.0, WhoZScore::compute(3.3464, $lms), 1e-9);
        $this->assertEqualsWithDelta(0.0, WhoZScore::computeAdjusted(3.3464, $lms), 1e-9);
    }

    public function test_value_at_z_is_the_inverse_of_the_z_score(): void
    {
        $lms = new LmsParameters(-0.3053, 13.4069, 0.0956);

        foreach ([-2.0, -1.0, 1.0, 2.0] as $z) {
            $this->assertEqualsWithDelta($z, WhoZScore::compute(WhoZScore::valueAtZ($z, $lms), $lms), 1e-9);
        }
    }

    public function test_restricted_z_score_uses_the_2_to_3_sd_distance_beyond_plus_3(): void
    {
        $lms = new LmsParameters(-0.3053, 13.4069, 0.0956);
        $sd3 = WhoZScore::valueAtZ(3, $lms);
        $sd23 = $sd3 - WhoZScore::valueAtZ(2, $lms);

        // Exatamente um intervalo (2→3 DP) acima de +3 DP deve dar z = 4.
        $this->assertEqualsWithDelta(4.0, WhoZScore::computeAdjusted($sd3 + $sd23, $lms), 1e-9);
        // Sem a restrição, a cauda Box-Cox daria outro valor — o ajuste importa.
        $this->assertGreaterThan(0.001, abs(WhoZScore::compute($sd3 + $sd23, $lms) - 4.0));
    }

    public function test_restricted_z_score_uses_the_2_to_3_sd_distance_below_minus_3(): void
    {
        $lms = new LmsParameters(0.3487, 3.3464, 0.14602);
        $sd3neg = WhoZScore::valueAtZ(-3, $lms);
        $sd23neg = WhoZScore::valueAtZ(-2, $lms) - $sd3neg;

        $this->assertEqualsWithDelta(-4.0, WhoZScore::computeAdjusted($sd3neg - $sd23neg, $lms), 1e-9);
    }

    /**
     * Mesmos casos do teste oficial do pacote anthro ("adds adjusted lenhei"):
     * 730 dias em pé → +0,7; 800 dias em pé → sem ajuste; 730 deitado → sem
     * ajuste; 800 deitado → −0,7.
     */
    #[DataProvider('lengthAdjustmentCases')]
    public function test_standardizes_length_like_the_official_who_package(float $ageDays, string $position, float $expected): void
    {
        $ageMonths = $ageDays / WhoMeasurements::DAYS_PER_MONTH;

        $this->assertEqualsWithDelta($expected, WhoMeasurements::standardizedLength(100, $position, $ageMonths), 1e-9);
    }

    /** @return array<string, array{0: float, 1: string, 2: float}> */
    public static function lengthAdjustmentCases(): array
    {
        return [
            '730 dias medido em pé' => [730, WhoMeasurements::POSITION_STANDING, 100.7],
            '800 dias medido em pé' => [800, WhoMeasurements::POSITION_STANDING, 100.0],
            '730 dias medido deitado' => [730, WhoMeasurements::POSITION_LYING, 100.0],
            '800 dias medido deitado' => [800, WhoMeasurements::POSITION_LYING, 99.3],
        ];
    }

    public function test_age_in_days_rounds_half_up_like_the_official_who_package(): void
    {
        $this->assertSame(365, WhoMeasurements::ageInDays(12));     // 365,25
        $this->assertSame(731, WhoMeasurements::ageInDays(24));     // 730,5 → sobe
        $this->assertSame(1096, WhoMeasurements::ageInDays(36));    // 1095,75
    }
}
