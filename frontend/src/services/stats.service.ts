import { apiFetch } from './api';
import { StatsOverview } from '../types';

export async function getStats() {
  return apiFetch<StatsOverview>('/stats');
}
