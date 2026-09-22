import { apiRequest } from './client';
import type { Food, Paginated } from './types';

export function searchFoods(filters: { search?: string; group?: string; source?: string } = {}): Promise<
  Paginated<Food>
> {
  return apiRequest('/foods', { query: filters });
}

export function getFood(id: number): Promise<Food> {
  return apiRequest(`/foods/${id}`);
}
