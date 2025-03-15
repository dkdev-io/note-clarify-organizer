
/**
 * Types for name matching utilities
 */

// User object with minimal required properties
export interface NameMatchUser {
  id: string;
  name: string;
  email?: string;
  [key: string]: any; // Allow additional properties
}
