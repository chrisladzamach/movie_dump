import { apiFetch } from './api';
import { Comment } from '../types';

export async function getComments(movieId: number) {
  return apiFetch<Comment[]>(`/comments/${movieId}`);
}

export async function addComment(movieId: number, content: string) {
  return apiFetch<Comment[]>(`/comments/${movieId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
