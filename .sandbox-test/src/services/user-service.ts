import type { User, ApiResponse } from '../types/index.js';
import { validateUser } from '../utils/validation.js';
const users: Map<string, User> = new Map();
export function createUser(data: Partial<User>): ApiResponse<User> {
  const errors = validateUser(data);
  if (errors.length > 0) return { data: null as never, error: errors.join(', ') };
  const user: User = { id: String(Date.now()), name: data.name\!, email: data.email ?? '' };
  users.set(user.id, user);
  return { data: user };
}
export function getUser(id: string): ApiResponse<User> {
  const user = users.get(id);
  return user ? { data: user } : { data: null as never, error: 'not found' };
}
