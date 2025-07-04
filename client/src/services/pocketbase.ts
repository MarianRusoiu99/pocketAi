// Legacy file - Use the new modular services instead
// Import from './index' for the new structure

export * from './index'

// For backwards compatibility, re-export the old ExampleUsage
export { default as ExampleUsage } from './example'

// Deprecated - use getServices() instead
console.warn('pocketbase.ts is deprecated. Use individual service files or import from ./index instead.')
