export class EnumeratorValueError extends Error {
    constructor(value: unknown) {
        super(`Invalid enum value format: ${JSON.stringify(value)}`);
        this.name = 'EnumeratorValueError';
    }
}


export class EnumeratorDepthError extends Error {
    constructor(depth: number, maxDepth: number, path?: string) {
        const pathInfo = path ? `\nPath: ${path}` : '';

        super(
            `Maximum nesting depth (${maxDepth}) exceeded at level ${depth}${pathInfo}.\n` + 
            `\nSuggestions\n` + 
            `- Use a flat object structure instead of nested dictionaries.\n` + 
            `- Consider using a different approach to organize your enum values. Like split into multiple smaller enums \n`
        );

        this.name = 'EnumeratorDepthError';
    }
}