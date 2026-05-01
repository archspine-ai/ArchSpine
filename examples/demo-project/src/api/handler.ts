import { UserService } from '../domain/user-service.js';
import { Database } from '../infra/database.js'; // ❌ ARCHITECTURAL VIOLATION

/**
 * API Handler - Entry Point
 * This module should only interact with Domain services,
 * but it's directly importing the Database infrastructure.
 */
export class CreateUserHandler {
  private userService: UserService;
  private db: Database;

  constructor() {
    this.userService = new UserService();
    this.db = new Database(); // ❌ Should be abstracted through domain/repository
  }

  public async handle(req: any): Promise<any> {
    this.db.connect();
    return this.userService.createUser(req.name, req.email);
  }
}
