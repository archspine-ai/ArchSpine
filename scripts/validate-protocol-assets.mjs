import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const SCHEMA_DIR = path.join(repoRoot, 'schemas');
const EXAMPLES_DIR = path.join(repoRoot, 'schemas', 'examples');

const ajv = new Ajv({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
addFormats(ajv);

// Load all schemas
const schemas = fs
  .readdirSync(SCHEMA_DIR)
  .filter((f) => f.endsWith('.schema.json'))
  .map((f) => {
    const content = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), 'utf-8'));
    ajv.addSchema(content);
    return { name: f, schema: content };
  });

console.log(`Loaded ${schemas.length} schemas.`);

// Example to Schema mapping
const mapping = {
  'spine-unit.example.json': 'spine-unit.schema.json',
  'spine-folder-unit.example.json': 'spine-folder-unit.schema.json',
  'spine-project-unit.example.json': 'spine-project-unit.schema.json',
  'spine-manifest.example.json': 'spine-manifest.schema.json',
  'spine-rule-document.example.json': 'spine-rules.schema.json',
};

let failureCount = 0;

function validate(data, schemaId, fileName) {
  const validateFn = ajv.getSchema(schemaId);
  if (!validateFn) {
    console.error(`❌ Schema not found: ${schemaId}`);
    failureCount++;
    return;
  }

  const valid = validateFn(data);
  if (!valid) {
    console.error(`❌ Validation failed for ${fileName}:`);
    console.error(validateFn.errors);
    failureCount++;
  } else {
    console.log(`✅ ${fileName} is valid.`);
  }
}

// Validate JSON examples
for (const [exampleFile, schemaFile] of Object.entries(mapping)) {
  const examplePath = path.join(EXAMPLES_DIR, exampleFile);
  if (!fs.existsSync(examplePath)) {
    console.warn(`⚠️ Example file not found: ${exampleFile}`);
    continue;
  }
  const exampleData = JSON.parse(fs.readFileSync(examplePath, 'utf-8'));
  const schemaId = schemas.find((s) => s.name === schemaFile).schema.$id;
  validate(exampleData, schemaId, exampleFile);
}

// Special case for .md rules
const mdRulePath = path.join(EXAMPLES_DIR, 'spine-rule.example.md');
if (fs.existsSync(mdRulePath)) {
  const rawContent = fs.readFileSync(mdRulePath, 'utf-8');
  const parsed = matter(rawContent);
  const ruleDocument = {
    ...parsed.data,
    bodyMarkdown: parsed.content.trim(),
  };
  const schemaId = schemas.find((s) => s.name === 'spine-rules.schema.json').schema.$id;
  validate(ruleDocument, schemaId, 'spine-rule.example.md');
}

if (failureCount > 0) {
  console.error(`\nValidation finished with ${failureCount} errors.`);
  process.exit(1);
} else {
  console.log(`\nAll protocol assets are valid.`);
  process.exit(0);
}
