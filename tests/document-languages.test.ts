import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_LANGUAGE_QUALITY_NOTE,
  getDocumentLanguageChoices,
  HIGH_CAPACITY_LANGUAGE_SEPARATOR,
  HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE,
} from '../src/cli/document-languages.js';

describe('document language choices', () => {
  it('keeps stable languages first, then inserts a disabled separator, then high-capacity languages', () => {
    const choices = getDocumentLanguageChoices();
    const separatorIndex = choices.findIndex(
      (choice) => choice.value === HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE,
    );

    expect(separatorIndex).toBe(6);
    expect(choices.slice(0, separatorIndex).map((choice) => choice.value)).toEqual([
      'English',
      'Simplified Chinese',
      'Traditional Chinese',
      'Japanese',
      'Korean',
      'Spanish',
    ]);
    expect(choices[separatorIndex]).toMatchObject({
      title: HIGH_CAPACITY_LANGUAGE_SEPARATOR,
      disabled: true,
    });
    expect(choices.slice(separatorIndex + 1).map((choice) => choice.value)).toEqual([
      'French',
      'German',
      'Portuguese (Brazil)',
      'Vietnamese',
      'Russian',
      'Italian',
      'Dutch',
      'Polish',
      'Turkish',
      'Indonesian',
    ]);
  });

  it('exposes a stable quality note for interactive prompts', () => {
    expect(HIGH_CAPACITY_LANGUAGE_SEPARATOR).toContain('stronger multilingual models');
    expect(DOCUMENT_LANGUAGE_QUALITY_NOTE).toBe('');
  });
});
