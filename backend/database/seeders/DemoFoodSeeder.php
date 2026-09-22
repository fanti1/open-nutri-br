<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * A small set of common Brazilian foods with approximate composition values,
 * so the Alimentos module has something to search/browse in development
 * before the official TACO spreadsheet is imported (see docs/data/taco-import.md).
 *
 * These values are NOT sourced from an automated import of the official table
 * and must never be relied on for real clinical/nutritional decisions — run
 * `php artisan foods:import-taco` with the real TACO file for production data.
 */
class DemoFoodSeeder extends Seeder
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private const FOODS = [
        ['code' => 'DEMO-001', 'name' => 'Arroz, integral, cozido', 'group' => 'Cereais e derivados', 'kcal' => 124, 'protein' => 2.6, 'carb' => 25.8, 'lipid' => 1.0, 'fiber' => 2.7],
        ['code' => 'DEMO-002', 'name' => 'Arroz, branco, cozido', 'group' => 'Cereais e derivados', 'kcal' => 128, 'protein' => 2.5, 'carb' => 28.1, 'lipid' => 0.2, 'fiber' => 1.6],
        ['code' => 'DEMO-003', 'name' => 'Feijão, carioca, cozido', 'group' => 'Leguminosas e derivados', 'kcal' => 76, 'protein' => 4.8, 'carb' => 13.6, 'lipid' => 0.5, 'fiber' => 8.5],
        ['code' => 'DEMO-004', 'name' => 'Frango, peito, sem pele, grelhado', 'group' => 'Carnes e derivados', 'kcal' => 159, 'protein' => 32.0, 'carb' => 0.0, 'lipid' => 2.5, 'fiber' => 0.0],
        ['code' => 'DEMO-005', 'name' => 'Ovo, de galinha, inteiro, cozido', 'group' => 'Ovos e derivados', 'kcal' => 146, 'protein' => 13.3, 'carb' => 0.6, 'lipid' => 9.5, 'fiber' => 0.0],
        ['code' => 'DEMO-006', 'name' => 'Banana, prata, crua', 'group' => 'Frutas e derivados', 'kcal' => 98, 'protein' => 1.3, 'carb' => 26.0, 'lipid' => 0.1, 'fiber' => 2.0],
        ['code' => 'DEMO-007', 'name' => 'Batata, inglesa, cozida', 'group' => 'Vegetais, tubérculos e raízes', 'kcal' => 52, 'protein' => 1.2, 'carb' => 11.9, 'lipid' => 0.0, 'fiber' => 1.3],
        ['code' => 'DEMO-008', 'name' => 'Alface, crespa, crua', 'group' => 'Vegetais, tubérculos e raízes', 'kcal' => 11, 'protein' => 1.3, 'carb' => 1.7, 'lipid' => 0.2, 'fiber' => 1.8],
        ['code' => 'DEMO-009', 'name' => 'Tomate, salada, cru', 'group' => 'Vegetais, tubérculos e raízes', 'kcal' => 15, 'protein' => 1.1, 'carb' => 3.1, 'lipid' => 0.2, 'fiber' => 1.2],
        ['code' => 'DEMO-010', 'name' => 'Leite, de vaca, integral', 'group' => 'Leite e derivados', 'kcal' => 61, 'protein' => 2.9, 'carb' => 4.3, 'lipid' => 3.2, 'fiber' => 0.0],
        ['code' => 'DEMO-011', 'name' => 'Pão, francês', 'group' => 'Cereais e derivados', 'kcal' => 300, 'protein' => 8.0, 'carb' => 58.6, 'lipid' => 3.1, 'fiber' => 2.3],
        ['code' => 'DEMO-012', 'name' => 'Maçã, com casca, crua', 'group' => 'Frutas e derivados', 'kcal' => 56, 'protein' => 0.3, 'carb' => 15.2, 'lipid' => 0.0, 'fiber' => 1.3],
        ['code' => 'DEMO-013', 'name' => 'Carne, bovina, patinho, grelhado', 'group' => 'Carnes e derivados', 'kcal' => 219, 'protein' => 35.9, 'carb' => 0.0, 'lipid' => 7.3, 'fiber' => 0.0],
        ['code' => 'DEMO-014', 'name' => 'Aveia, flocos, crua', 'group' => 'Cereais e derivados', 'kcal' => 394, 'protein' => 13.9, 'carb' => 66.6, 'lipid' => 8.5, 'fiber' => 9.1],
        ['code' => 'DEMO-015', 'name' => 'Brócolis, cozido', 'group' => 'Vegetais, tubérculos e raízes', 'kcal' => 25, 'protein' => 2.1, 'carb' => 4.4, 'lipid' => 0.5, 'fiber' => 3.4],
    ];

    public function run(): void
    {
        foreach (self::FOODS as $food) {
            Food::updateOrCreate(
                ['source' => 'demo', 'source_code' => $food['code']],
                [
                    'name' => $food['name'],
                    'name_search' => Str::of($food['name'])->ascii()->lower()->toString(),
                    'food_group' => $food['group'],
                    'energy_kcal' => $food['kcal'],
                    'protein_g' => $food['protein'],
                    'carbohydrate_g' => $food['carb'],
                    'lipid_g' => $food['lipid'],
                    'fiber_g' => $food['fiber'],
                ],
            );
        }
    }
}
