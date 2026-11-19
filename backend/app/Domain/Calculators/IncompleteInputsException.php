<?php

namespace App\Domain\Calculators;

use InvalidArgumentException;

/**
 * Os campos isolados são válidos, mas a combinação não permite calcular (ex.:
 * nenhum exame informado, ou percentuais que não somam 100%). A API responde
 * 422 com a mensagem. Espelho de IncompleteInputsError no app.
 */
class IncompleteInputsException extends InvalidArgumentException {}
