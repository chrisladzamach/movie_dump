import { apiFetch } from './api';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

interface ProfileResponse {
  user: User;
  otherUsers: User[];
}

export async function register(username: string, email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return apiFetch<ProfileResponse>('/auth/profile');
}
