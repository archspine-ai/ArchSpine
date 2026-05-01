const Database = require('better-sqlite3');
const db = new Database('.spine/cache.db');
try {
  db.exec('ALTER TABLE files ADD COLUMN mtime INTEGER;');
} catch (e) {}
try {
  db.exec('ALTER TABLE files ADD COLUMN size INTEGER;');
} catch (e) {}
console.log('Schema checked.');
