import fs from 'fs';
import path from 'path';

/**
 * Check if application setup is complete
 * This prevents access to API routes before setup
 */
export function isSetupComplete(): boolean {
  try {
    const setupMarkerPath = path.join(process.cwd(), '.setup-complete');
    return fs.existsSync(setupMarkerPath);
  } catch (error) {
    return false;
  }
}

/**
 * Security middleware for API routes
 * Returns error response if setup not complete
 */
export function requireSetup() {
  if (!isSetupComplete()) {
    return {
      error: 'Application not setup. Please complete setup first.',
      setupRequired: true
    };
  }
  return null;
}
