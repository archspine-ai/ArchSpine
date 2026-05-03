import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface CredentialBackend {
  readonly name: string;
  isAvailable(): boolean;
  get(secretName: string, account: string): string | undefined;
  set(secretName: string, account: string, secret: string): void;
  delete(secretName: string, account: string): void;
}

export class MacOSKeychainBackend implements CredentialBackend {
  readonly name = 'keychain';

  public isAvailable(): boolean {
    if (process.platform !== 'darwin') {
      return false;
    }

    try {
      execFileSync('security', ['help'], { stdio: 'ignore' });
      // We also need swift to perform 'set' operations via the stdin script.
      execFileSync('swift', ['--version'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public get(secretName: string, account: string): string | undefined {
    try {
      const output = execFileSync(
        'security',
        ['find-generic-password', '-s', secretName, '-a', account, '-w'],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
      const trimmed = output.trim();
      return trimmed === '' ? undefined : trimmed;
    } catch {
      return undefined;
    }
  }

  public set(secretName: string, account: string, secret: string): void {
    this.delete(secretName, account);
    // The secret is passed via an environment variable, NOT as a CLI argument.
    // CLI arguments are visible to `ps aux`; env vars of a process are not.
    // The Swift script reads the env var and calls SecItemAdd via the native
    // Security framework so the plaintext never appears in the process arg table.
    const swiftScript = [
      'import Foundation',
      'import Security',
      'let env = ProcessInfo.processInfo.environment',
      'guard let serviceName = env["ARCHSPINE_SECRET_NAME"],',
      '      let accountName = env["ARCHSPINE_SECRET_ACCOUNT"],',
      '      let secretStr  = env["ARCHSPINE_KEYCHAIN_SECRET"],',
      '      let secretData = secretStr.data(using: .utf8) else { exit(1) }',
      'let query: [String: Any] = [',
      '  kSecClass as String: kSecClassGenericPassword,',
      '  kSecAttrService as String: serviceName,',
      '  kSecAttrAccount as String: accountName,',
      '  kSecValueData as String: secretData,',
      '  kSecAttrLabel as String: "ArchSpine",',
      ']',
      'let status = SecItemAdd(query as CFDictionary, nil)',
      'if status != errSecSuccess && status != errSecDuplicateItem { exit(1) }',
    ].join('\n');

    execFileSync('swift', ['-'], {
      input: swiftScript,
      encoding: 'utf-8',
      stdio: ['pipe', 'ignore', 'ignore'],
      env: {
        ...process.env,
        ARCHSPINE_SECRET_NAME: secretName,
        ARCHSPINE_SECRET_ACCOUNT: account,
        ARCHSPINE_KEYCHAIN_SECRET: secret,
      },
    });
  }

  public delete(secretName: string, account: string): void {
    try {
      execFileSync('security', ['delete-generic-password', '-s', secretName, '-a', account], {
        stdio: ['ignore', 'ignore', 'ignore'],
      });
    } catch {
      // Treat missing entries as already cleared.
    }
  }
}

export class LinuxSecretToolBackend implements CredentialBackend {
  readonly name = 'secret-tool';

  public isAvailable(): boolean {
    if (process.platform !== 'linux') {
      return false;
    }
    try {
      execFileSync('which', ['secret-tool'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public get(secretName: string, account: string): string | undefined {
    try {
      const output = execFileSync(
        'secret-tool',
        ['lookup', 'service', secretName, 'account', account],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
      const trimmed = output.trim();
      return trimmed === '' ? undefined : trimmed;
    } catch {
      return undefined;
    }
  }

  public set(secretName: string, account: string, secret: string): void {
    try {
      execFileSync(
        'secret-tool',
        ['store', '--label=ArchSpine', 'service', secretName, 'account', account],
        { input: secret, encoding: 'utf-8', stdio: ['pipe', 'ignore', 'ignore'] },
      );
    } catch {
      // Ignore or log error
    }
  }

  public delete(secretName: string, account: string): void {
    try {
      execFileSync('secret-tool', ['clear', 'service', secretName, 'account', account], {
        stdio: ['ignore', 'ignore', 'ignore'],
      });
    } catch {
      // Treat missing entries as already cleared.
    }
  }
}

export class WindowsDPAPIBackend implements CredentialBackend {
  readonly name = 'dpapi';
  private static readonly readPlaintextScript = `
    $ErrorActionPreference = "Stop"
    $encrypted = [Console]::In.ReadToEnd().Trim()
    if ([string]::IsNullOrWhiteSpace($encrypted)) {
      return
    }
    $secureString = ConvertTo-SecureString -String $encrypted
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    try {
      [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
    } finally {
      [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
  `;
  private static readonly writeCiphertextScript = `
    $ErrorActionPreference = "Stop"
    $plainText = [Console]::In.ReadToEnd()
    $secureString = ConvertTo-SecureString -String $plainText -AsPlainText -Force
    ConvertFrom-SecureString -SecureString $secureString
  `;

  private getStoragePath(secretName: string, account: string): string {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const key = `${secretName}:${account}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    return path.join(localAppData, 'ArchSpine', 'Credentials', `${keyHash}.enc`);
  }

  public isAvailable(): boolean {
    if (process.platform !== 'win32') {
      return false;
    }
    try {
      execFileSync('powershell', ['-NoProfile', '-Command', 'echo 1'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public get(secretName: string, account: string): string | undefined {
    const filePath = this.getStoragePath(secretName, account);
    if (!fs.existsSync(filePath)) {
      return undefined;
    }
    try {
      const encryptedContent = fs.readFileSync(filePath, 'utf-8').trim();
      if (!encryptedContent) {
        return undefined;
      }

      const output = execFileSync(
        'powershell',
        ['-NoProfile', '-Command', WindowsDPAPIBackend.readPlaintextScript],
        {
          input: encryptedContent,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
        },
      );
      const trimmed = output.trim();
      return trimmed === '' ? undefined : trimmed;
    } catch {
      return undefined;
    }
  }

  public set(secretName: string, account: string, secret: string): void {
    const filePath = this.getStoragePath(secretName, account);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    try {
      const output = execFileSync(
        'powershell',
        ['-NoProfile', '-Command', WindowsDPAPIBackend.writeCiphertextScript],
        {
          input: secret,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
        },
      );
      const encrypted = output.trim();
      if (encrypted) {
        fs.writeFileSync(filePath, encrypted, 'utf-8');
      }
    } catch {
      // Handle error
    }
  }

  public delete(secretName: string, account: string): void {
    const filePath = this.getStoragePath(secretName, account);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore
      }
    }
  }
}

export class MemoryCredentialBackend implements CredentialBackend {
  readonly name = 'memory';
  private secrets = new Map<string, string>();

  public isAvailable(): boolean {
    return true;
  }

  public get(secretName: string, account: string): string | undefined {
    return this.secrets.get(`${secretName}:${account}`);
  }

  public set(secretName: string, account: string, secret: string): void {
    this.secrets.set(`${secretName}:${account}`, secret);
  }

  public delete(secretName: string, account: string): void {
    this.secrets.delete(`${secretName}:${account}`);
  }
}

export function createDefaultCredentialBackend(): CredentialBackend | undefined {
  if (process.platform === 'darwin') {
    const mac = new MacOSKeychainBackend();
    return mac.isAvailable() ? mac : undefined;
  }
  if (process.platform === 'linux') {
    const linux = new LinuxSecretToolBackend();
    return linux.isAvailable() ? linux : undefined;
  }
  if (process.platform === 'win32') {
    const win = new WindowsDPAPIBackend();
    return win.isAvailable() ? win : undefined;
  }
  return undefined;
}
