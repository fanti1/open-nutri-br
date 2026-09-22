<?php

namespace App\Domain\Calculators;

use App\Domain\Calculators\Contracts\CalculatorInterface;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Container\BindingResolutionException;

/**
 * Resolves a calculator slug to its CalculatorInterface instance. This is the
 * single place that knows about the slug => class mapping (config/calculators.php);
 * everything else in the app talks to calculators only through this registry.
 */
final class CalculatorRegistry
{
    /** @var array<string, CalculatorInterface> */
    private array $instances = [];

    public function __construct(
        private readonly Container $container,
        private readonly array $map,
    ) {}

    /**
     * @throws CalculatorNotFoundException
     */
    public function get(string $slug): CalculatorInterface
    {
        if (isset($this->instances[$slug])) {
            return $this->instances[$slug];
        }

        $class = $this->map[$slug] ?? null;

        if ($class === null) {
            throw new CalculatorNotFoundException("No calculator registered for slug [{$slug}].");
        }

        try {
            /** @var CalculatorInterface $instance */
            $instance = $this->container->make($class);
        } catch (BindingResolutionException $e) {
            throw new CalculatorNotFoundException("Could not resolve calculator [{$slug}]: {$e->getMessage()}", previous: $e);
        }

        return $this->instances[$slug] = $instance;
    }

    public function has(string $slug): bool
    {
        return isset($this->map[$slug]);
    }

    /**
     * @return array<int, string>
     */
    public function slugs(): array
    {
        return array_keys($this->map);
    }

    /**
     * @return array<int, CalculatorInterface>
     */
    public function all(): array
    {
        return array_map(fn (string $slug) => $this->get($slug), $this->slugs());
    }
}
