<?php

namespace App\Domain\Growth;

use App\Domain\Calculators\IncompleteInputsException;

/** A medida/idade informada está fora da faixa coberta pela curva de referência escolhida. */
final class OutOfReferenceRangeException extends IncompleteInputsException {}
