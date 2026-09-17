import { endpoints } from './endpoints';
import { api as browserApi } from './browser';
import type { Car } from '@/types/car';

export type ToggleFavoriteResponse = {
  success: boolean;
  isFavorite: boolean;
  favoritesCount: number;
  message: string;
};

export async function setFavoriteBrowser(carId: string, saved: boolean) {
  return browserApi<ToggleFavoriteResponse>(`/favorites/${encodeURIComponent(carId)}`, { method: saved ? 'PUT' : 'DELETE' });
}

export type MyFavoritesResponse = {
  success: boolean;
  data: Car[];
};

export async function toggleFavoriteBrowser(carId: string) {
  return browserApi<ToggleFavoriteResponse>(endpoints.favorites.toggle(carId), {
    method: 'POST',
  });
}
