import { promptForExplicitConfirmation } from '../utils/confirm.js';

export interface RuntimeIO {
  info(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  confirm(message: string): Promise<boolean>;
}

/* eslint-disable no-console -- RuntimeIO is the designated console wrapper */
export const defaultRuntimeIO: RuntimeIO = {
  info(message?: unknown, ...optionalParams: unknown[]): void {
    console.log(message, ...optionalParams);
  },
  warn(message?: unknown, ...optionalParams: unknown[]): void {
    console.warn(message, ...optionalParams);
  },
  error(message?: unknown, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams);
  },
  async confirm(message: string): Promise<boolean> {
    return promptForExplicitConfirmation(message);
  },
};
