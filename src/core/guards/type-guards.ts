import type {
    EnumerateValue,
    EnumerateValueWithMeta,
    EnumerateValueMetadata,
    EnumerateNestedDict
} from "@/types/base";

export const isEnumerateValue = (value: unknown): value is EnumerateValue => {
    return typeof value === 'string' || typeof value === 'number';
}

export const isMetaData = (value: unknown): value is EnumerateValueMetadata => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isEnumerateValueWithMetadata = (value: unknown): value is EnumerateValueWithMeta => {
    return Array.isArray(value) && value.length === 2 && isEnumerateValue(value[0]) && isMetaData(value[1]);
}

export const isNestedDict = (value: unknown): value is EnumerateNestedDict => {
    if (!isMetaData(value)) return false;

    if (isEnumerateValueWithMetadata(value)) return false;
    
    if (isEnumerateValue(value)) return false;

    return true;
};


export const getEnumValueType = (value: unknown): "value" | "meta" | "nested" | "unknown" => {
    if (isEnumerateValue(value)) return 'value';
    if (isEnumerateValueWithMetadata(value)) return 'meta';
    if (isNestedDict(value)) return 'nested'

    return 'unknown';
}