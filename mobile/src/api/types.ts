export interface Food {
  id: number;
  source: string;
  name: string;
  food_group: string | null;
  energy_kcal: string | null;
  protein_g: string | null;
  carbohydrate_g: string | null;
  lipid_g: string | null;
  fiber_g: string | null;
  saturated_fat_g?: string | null;
  cholesterol_mg?: string | null;
  calcium_mg?: string | null;
  iron_mg?: string | null;
  sodium_mg?: string | null;
  potassium_mg?: string | null;
  vitamin_a_mcg?: string | null;
  vitamin_c_mg?: string | null;
  household_portion: string | null;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}
