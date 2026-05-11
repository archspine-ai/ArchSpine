import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class FileSystemManager {
  /**
   * Safely writes content to a file by writing to a temporary file first,
   * then renaming it to the target file. This ensures atomic writes and
   * prevents corrupted files due to interrupted processes.
   */
  public static safeWriteFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tempFilePath = `${filePath}.tmp.${crypto.randomBytes(4).toString('hex')}`;

    try {
      // Step 1: Write to temporary file
      fs.writeFileSync(tempFilePath, content, 'utf-8');

      // Step 2: Atomic rename
      fs.renameSync(tempFilePath, filePath);
    } catch (error) {
      // Cleanup temp file on failure if it exists
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  /**
   * Creates a backup of the specified file if it exists.
   * Useful before modifying user configurations like Git hooks.
   */
  public static backupFile(filePath: string, backupExtension: string = '.spine.bak'): boolean {
    if (!fs.existsSync(filePath)) {
      return false; // Nothing to backup
    }

    const backupPath = `${filePath}${backupExtension}`;
    try {
      fs.copyFileSync(filePath, backupPath);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console -- Warn on backup failure
      console.warn(`[FileSystemManager] Failed to create backup for ${filePath}:`, error);
      return false;
    }
  }
}
