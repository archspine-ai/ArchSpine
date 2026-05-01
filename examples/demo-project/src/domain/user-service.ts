/**
 * User Service - Domain Logic
 * This module handles user creation and retrieval.
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  private users: User[] = [];

  public createUser(name: string, email: string): User {
    const user: User = { id: Math.random().toString(36).substr(2, 9), name, email };
    this.users.push(user);
    return user;
  }

  public getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}
