<?php

namespace App\Domain\Growth\Contracts;

use App\Domain\Growth\LmsParameters;

/**
 * Fonte dos parâmetros LMS das curvas de referência. As calculadoras dependem
 * só desta interface, então podem ser testadas com uma tabela falsa e a origem
 * dos dados (arquivo, banco) pode mudar sem tocar no cálculo.
 */
interface GrowthReferenceRepository
{
    /** Linha exata da tabela (ex.: idade em dias arredondada). */
    public function exact(string $table, int $sex, int $key): ?LmsParameters;

    /**
     * LMS no ponto $x, interpolando linearmente entre os pontos tabelados
     * vizinhos quando $x cai entre eles. $keyScale converte $x para a chave
     * inteira da tabela (1 para meses, 10 para comprimento em passos de 0,1 cm).
     */
    public function interpolated(string $table, int $sex, float $x, int $keyScale): ?LmsParameters;
}
