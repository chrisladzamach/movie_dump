import { pool } from '../config/database';
import { User } from '../models/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = :email LIMIT 1',
      { email }
    );
    return (rows[0] as User) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = :username LIMIT 1',
      { username }
    );
    return (rows[0] as User) || null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, created_at FROM users WHERE id = :id LIMIT 1',
      { id }
    );
    return (rows[0] as User) || null;
  }

  async findAllExcept(userId: number): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, created_at FROM users WHERE id != :userId',
      { userId }
    );
    return rows as User[];
  }

  async create(username: string, email: string, passwordHash: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :passwordHash)',
      { username, email, passwordHash }
    );
    return result.insertId;
  }
}

export const userRepository = new UserRepository();
