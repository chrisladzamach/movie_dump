import { commentRepository } from '../repositories/comment.repository';
import { movieRepository } from '../repositories/movie.repository';
import { emitDataUpdate, emitNotification } from '../config/socket';

export class CommentService {
  async addComment(movieId: number, userId: number, username: string, content: string) {
    if (!content.trim()) throw new Error('El comentario no puede estar vacío');

    const movie = await movieRepository.findById(movieId);
    if (!movie) throw new Error('Película no encontrada');

    const id = await commentRepository.create(movieId, userId, content.trim());
    const comments = await commentRepository.findByMovieId(movieId);

    emitDataUpdate('comment_added', { movieId, commentId: id });
    emitNotification(
      {
        type: 'comment_added',
        movieId,
        movieTitle: movie.title,
        username,
        content: content.trim(),
      },
      userId
    );

    return comments;
  }

  async getComments(movieId: number) {
    return commentRepository.findByMovieId(movieId);
  }
}

export const commentService = new CommentService();
