<?php

namespace App\Domain\Calculators\Support;

/**
 * Immutable value object citing the scientific method/paper behind a calculator.
 * Every calculator must carry one — no formula ships without a traceable source.
 */
final class CalculatorReference
{
    public function __construct(
        public readonly string $method,
        public readonly string $citation,
    ) {}

    /**
     * @return array{method: string, citation: string}
     */
    public function toArray(): array
    {
        return [
            'method' => $this->method,
            'citation' => $this->citation,
        ];
    }
}
