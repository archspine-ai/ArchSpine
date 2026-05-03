import type { User, ApiResponse } from '../types/index.js';
import { validateUser } from '../utils/validation.js';
const users: Map<string, User> = new Map();
export function createUser(data: Partial<User>): ApiResponse<User> {
  const errors = validateUser(data);
  if (errors.length > 0) return { data: null as never, error: errors.join(', ') };
  const user: User = { id: String(Date.now()), name: data.name!, email: data.email ?? '' };
  users.set(user.id, user);
  return { data: user };
}
export function getUser(id: string): ApiResponse<User> {
  const user = users.get(id);
  return user ? { data: user } : { data: null as never, error: 'not found' };
}
// NEW: Search users by name prefix
export function searchUsers(namePrefix: string): ApiResponse<User[]> {
  const results = Array.from(users.values()).filter((u) => u.name.startsWith(namePrefix));
  return { data: results };
}
// NEW: Delete a user by ID
export function deleteUser(id: string): ApiResponse<boolean> {
  const existed = users.has(id);
  users.delete(id);
  return { data: existed };
}
