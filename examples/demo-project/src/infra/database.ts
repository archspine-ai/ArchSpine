/**
 * Database Infrastructure
 * Handles direct SQLite or PostGres connections.
 */

export class Database {
  private connected: boolean = false;

  public connect(): void {
    console.log('Connecting to database...');
    this.connected = true;
  }

  public query(sql: string): any[] {
    if (!this.connected) throw new Error('Database not connected');
    return [];
  }
}
