export type DefaultMaxDepth = 10;

export type EnumerateValType = string | number;

export type EnumerateValueMetadata = { 
    [key: string]: any;
};

export type EnumerateValueWithMeta = readonly [enumerateValue: EnumerateValType, enumerateMeta: EnumerateValueMetadata];

export type EnumerateValue = EnumerateValType | EnumerateValueWithMeta;

export type EnumerateFlatObject = {
    [key: string]: EnumerateValue;
};

export type EnumerateNestedDict = {
    [key: string]: EnumerateValue | EnumerateNestedDict;
};


export type ProcessorOptions = {
    maxDepth?: number;
    currentDepth?: number;
    pathStack?: string[];
}

export type EnumerateOptions = Pick<ProcessorOptions, 'maxDepth'>;