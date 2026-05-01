import type { User } from '../types/index.js';
export function validateEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
export function validateUser(user: Partial<User>): string[] {
  const errors: string[] = [];
  if (\!user.name) errors.push('name is required');
  if (user.email && \!validateEmail(user.email)) errors.push('email is invalid');
  return errors;
}
