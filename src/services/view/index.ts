/**
 * Public facade for the view subsystem.
 * Keep callers importing from this file so view-specific runtime and rendering
 * details can evolve inside `src/services/view/**` without broad churn.
 */
export * from './arch-diagram-renderer.js';
export * from './architecture-diagram-view.js';
export * from './common.js';
export * from './index-loader.js';
export * from './public-surface-view.js';
export * from './risk-hotspots-view.js';
export * from './types.js';
export * from './view-registry.js';
export * from './view-renderer.js';
export * from './view-runtime.js';
