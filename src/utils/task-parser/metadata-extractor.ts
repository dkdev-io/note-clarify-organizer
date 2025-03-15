
/**
 * Utilities for extracting task metadata like priority, assignee, status, etc.
 * This file now re-exports from the metadata submodules for backward compatibility.
 */

// Re-export all metadata extractors
export * from './metadata/index';

// Export the new duration extractor
export * from './metadata/duration-extractor';
