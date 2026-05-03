export interface DocumentLanguageChoice {
  title: string;
  value: string;
  selected?: boolean;
  disabled?: boolean;
}

export const HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE = '__separator_high_capacity_languages__';

const DEFAULT_LANGUAGE_VALUES = [
  'English',
  'Simplified Chinese',
  'Traditional Chinese',
  'Japanese',
  'Korean',
  'Spanish',
] as const;

const HIGH_CAPACITY_LANGUAGE_VALUES = [
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
] as const;

const LANGUAGE_TITLES: Record<string, string> = {
  English: 'English',
  'Simplified Chinese': 'Simplified Chinese (简体中文)',
  'Traditional Chinese': 'Traditional Chinese (繁體中文)',
  Japanese: 'Japanese (日本語)',
  Korean: 'Korean (한국어)',
  Spanish: 'Spanish (Español)',
  French: 'French (Français)',
  German: 'German (Deutsch)',
  'Portuguese (Brazil)': 'Portuguese (Brazil) (Português do Brasil)',
  Vietnamese: 'Vietnamese (Tiếng Việt)',
  Russian: 'Russian (Русский)',
  Italian: 'Italian (Italiano)',
  Dutch: 'Dutch (Nederlands)',
  Polish: 'Polish (Polski)',
  Turkish: 'Turkish (Türkçe)',
  Indonesian: 'Indonesian (Bahasa Indonesia)',
};

export const HIGH_CAPACITY_LANGUAGE_SEPARATOR =
  'Below languages typically require stronger multilingual models for stable quality';

export const DOCUMENT_LANGUAGE_QUALITY_NOTE = '';

function buildChoice(value: string, selectedLanguages: Set<string>): DocumentLanguageChoice {
  return {
    title: LANGUAGE_TITLES[value] || value,
    value,
    selected: selectedLanguages.has(value),
  };
}

export function getDocumentLanguageChoices(
  selectedLanguages: string[] = [],
): DocumentLanguageChoice[] {
  const selected = new Set(selectedLanguages);

  return [
    ...DEFAULT_LANGUAGE_VALUES.map((value) => buildChoice(value, selected)),
    {
      title: HIGH_CAPACITY_LANGUAGE_SEPARATOR,
      value: HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE,
      disabled: true,
    },
    ...HIGH_CAPACITY_LANGUAGE_VALUES.map((value) => buildChoice(value, selected)),
  ];
}
