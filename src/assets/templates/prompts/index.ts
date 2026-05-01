import {
  sourceFileSchema,
  documentSchema,
  configSchema,
  folderSchema,
  projectSchema,
} from './schemas.js';

import {
  renderIdentityBlock,
  renderInstructionsBlock,
  renderContextBlock,
  renderEnvironmentalContextBlock,
  renderRuleViolationCheckBlock,
  renderGitIntentBlock,
  renderJSONSchemaBlock,
  renderSourceContentBlock,
} from './blocks.js';

import { sourceRoleExamples } from './examples.js';

export {
  // Schemas
  sourceFileSchema,
  documentSchema,
  configSchema,
  folderSchema,
  projectSchema,

  // Blocks
  renderIdentityBlock,
  renderInstructionsBlock,
  renderContextBlock,
  renderEnvironmentalContextBlock,
  renderRuleViolationCheckBlock,
  renderGitIntentBlock,
  renderJSONSchemaBlock,
  renderSourceContentBlock,
  sourceRoleExamples,
};
