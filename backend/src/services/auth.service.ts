import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export class AuthService {
  async register(username: string, email: string, password: string) {
    if (!username || !email || !password) {
      throw new Error('Todos los campos son obligatorios');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) throw new Error('El email ya está registrado');

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) throw new Error('El nombre de usuario ya existe');

    const passwordHash = await hashPassword(password);
    const userId = await userRepository.create(username, email, passwordHash);
    const token = signToken({ userId, username });

    return { token, user: { id: userId, username, email } };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = signToken({ userId: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }

  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    const others = await userRepository.findAllExcept(userId);
    return { user: { id: user.id, username: user.username, email: user.email }, otherUsers: others };
  }
}

export const authService = new AuthService();
