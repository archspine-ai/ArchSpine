export type SchemaVersion = `${number}.${number}.${number}`;

export const CURRENT_PACKAGE_VERSION = '1.0.0';
export const CURRENT_SCHEMA_VERSION: SchemaVersion = '1.0.0';
export const CURRENT_CONFIG_SCHEMA_VERSION: SchemaVersion = '1.0.0';
export const GENERATOR_VERSION = `archspine/${CURRENT_PACKAGE_VERSION}`;

export function isSupportedConfigSchemaVersion(value: unknown): value is SchemaVersion {
  return value === CURRENT_CONFIG_SCHEMA_VERSION;
}
