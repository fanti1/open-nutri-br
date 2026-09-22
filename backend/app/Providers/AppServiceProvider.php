<?php

namespace App\Providers;

use App\Domain\Calculators\CalculatorRegistry;
use App\Domain\Growth\Contracts\GrowthReferenceRepository;
use App\Domain\Growth\WhoTableFileRepository;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CalculatorRegistry::class, function (Container $app) {
            return new CalculatorRegistry($app, config('calculators', []));
        });

        $this->app->singleton(GrowthReferenceRepository::class, function () {
            return new WhoTableFileRepository(database_path('data/who'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // A mobile client has no use for the extra {"data": ...} envelope Laravel
        // wraps single resources in by default; paginated collections still get
        // their own data/links/meta shape regardless of this setting.
        JsonResource::withoutWrapping();
    }
}
