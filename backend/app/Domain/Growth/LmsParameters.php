<?php

namespace App\Domain\Growth;

/** Parâmetros LMS de uma linha da tabela de referência (L = Box-Cox, M = mediana, S = coef. de variação). */
final class LmsParameters
{
    public function __construct(
        public readonly float $l,
        public readonly float $m,
        public readonly float $s,
    ) {}

    /** Interpolação linear entre dois pontos da tabela, como fazem os pacotes oficiais da OMS. */
    public function interpolateTowards(self $upper, float $fraction): self
    {
        return new self(
            $this->l + $fraction * ($upper->l - $this->l),
            $this->m + $fraction * ($upper->m - $this->m),
            $this->s + $fraction * ($upper->s - $this->s),
        );
    }
}
