<?php

namespace App\Domain\Growth;

use InvalidArgumentException;

/** A medida/idade informada está fora da faixa coberta pela curva de referência escolhida. */
final class OutOfReferenceRangeException extends InvalidArgumentException {}
