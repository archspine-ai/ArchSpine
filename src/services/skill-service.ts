import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';

const SKILL_DEFINITION_PATH = '../assets/skill-definition.md';
const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills', 'archspine');
const SKILL_FILE = path.join(SKILLS_DIR, 'SKILL.md');
const STATE_DIR = path.join(os.homedir(), '.archspine');
const STATE_FILE = path.join(STATE_DIR, 'skill-state.json');

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function installSkill(
  _rootDir: string,
): { success: true; skillFile: string; stateFile: string } | { success: false; message: string } {
  const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
  const skillDefinitionPath = path.resolve(__dirname, SKILL_DEFINITION_PATH);

  if (!fs.existsSync(skillDefinitionPath)) {
    return { success: false, message: 'Skill definition not found in distribution assets.' };
  }

  const skillContent = fs.readFileSync(skillDefinitionPath, 'utf-8');
  ensureDir(SKILLS_DIR);
  fs.writeFileSync(SKILL_FILE, skillContent, 'utf-8');

  ensureDir(STATE_DIR);
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ reminders: {} }, null, 2), 'utf-8');
  }

  return { success: true, skillFile: SKILL_FILE, stateFile: STATE_FILE };
}

export function uninstallSkill(): { removed: boolean; message: string } {
  let removed = false;
  if (fs.existsSync(SKILL_FILE)) {
    fs.unlinkSync(SKILL_FILE);
    removed = true;
  }

  if (fs.existsSync(SKILLS_DIR)) {
    const remaining = fs.readdirSync(SKILLS_DIR);
    if (remaining.length === 0) {
      fs.rmdirSync(SKILLS_DIR);
    }
  }

  if (!removed) {
    return { removed: false, message: 'ArchSpine skill is not installed.' };
  }

  return {
    removed: true,
    message: `To fully clean up, manually remove ${STATE_FILE} if you no longer need your reminder history.`,
  };
}
