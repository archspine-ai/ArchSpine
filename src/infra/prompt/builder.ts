import {
  renderContextBlock,
  renderEnvironmentalContextBlock,
  renderGitIntentBlock,
  renderIdentityBlock,
  renderInstructionsBlock,
  renderJSONSchemaBlock,
  renderRuleViolationCheckBlock,
  renderSourceContentBlock,
} from '../../assets/templates/prompts/index.js';

export class PromptBuilder {
  private parts: string[] = [];

  public setIdentity(role: string, target: string): this {
    this.parts.push(renderIdentityBlock(role, target));
    return this;
  }

  public addInstructions(instructions: string[]): this {
    this.parts.push(renderInstructionsBlock(instructions));
    return this;
  }

  public addExamples(examples: string): this {
    if (examples) {
      this.parts.push(examples);
    }
    return this;
  }

  public addContext(title: string, contextData: string): this {
    if (contextData) {
      this.parts.push(renderContextBlock(title, contextData));
    }
    return this;
  }

  public addEnvironmentalContext(branch: string, status: string): this {
    const block = renderEnvironmentalContextBlock(branch, status);
    if (block) {
      this.parts.push(block);
    }
    return this;
  }

  public addRuleViolationCheck(ruleData: string): this {
    const block = renderRuleViolationCheckBlock(ruleData);
    if (block) {
      this.parts.push(block);
    }
    return this;
  }

  public addGitIntent(gitIntent: string): this {
    const block = renderGitIntentBlock(gitIntent);
    if (block) {
      this.parts.push(block);
    }
    return this;
  }

  public addJSONSchema(schema: string): this {
    this.parts.push(renderJSONSchemaBlock(schema));
    return this;
  }

  public addSourceContent(label: string, content: string): this {
    const block = renderSourceContentBlock(label, content);
    if (block) {
      this.parts.push(block);
    }
    return this;
  }

  public build(): string {
    return this.parts.join('\n\n');
  }
}
