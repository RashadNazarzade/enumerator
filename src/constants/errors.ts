export class EnumeratorValueError extends Error {
  constructor(value: unknown, path?: string[]) {
    const pathInfo = path ? `\nPath: ${path.join(".")}` : "";

    super(
      `Invalid enum value format${pathInfo}\n` +
        `Received: ${JSON.stringify(value)}\n\n` +
        `Expected one of:\n` +
        `  - string: 'active'\n` +
        `  - number: 123\n` +
        `  - tuple: ['active', { description: '...' }]\n` +
        `  - nested: { KEY: 'value' }`,
    );
    this.name = "EnumeratorValueError";
  }
}

export class EnumeratorDepthError extends Error {
  constructor(depth: number, maxDepth: number, path?: string) {
    const pathInfo = path ? `\nPath: ${path}` : "";

    super(
      `Maximum nesting depth (${maxDepth}) exceeded at level ${depth}${pathInfo}.\n` +
        `\nSuggestions\n` +
        `- Use a flat object structure instead of nested dictionaries.\n` +
        `- Consider using a different approach to organize your enum values. Like split into multiple smaller enums \n`,
    );

    this.name = "EnumeratorDepthError";
  }
}
