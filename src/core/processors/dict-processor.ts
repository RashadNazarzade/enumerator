import type { EnumerateNestedDict, EnumerateValue, ProcessorOptions } from '@/types/base';

import { EnumeratorDepthError, EnumeratorValueError } from '@/constants/errors';
import { DEFAULT_MAX_DEPTH } from '@/constants/config';

import { isNestedDict, isEnumerateValue, isEnumerateValueWithMetadata } from '../guards'

import { createObjectFeature } from './obj-features';
import { createValueFeature, createMetadataValueFeature } from './value-features';

export const processDictionary = <const Dict extends EnumerateNestedDict>(
    dict: Dict,
    options: ProcessorOptions = {}
) => {
    const { maxDepth = DEFAULT_MAX_DEPTH, currentDepth = 0, pathStack = [] } = options;

    if (currentDepth >= maxDepth) {
        const path = pathStack?.length > 0 ? pathStack.join('.') : '<root>';

        throw new EnumeratorDepthError(currentDepth, maxDepth, path);
    }

    const entries = Object.entries(dict);

    const processedEnum = Object.create(null);

    // Pre allocate array for direct values
    let directValuesIndex = 0;
    const directValues: EnumerateValue[] = new Array(entries.length);


    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i] as [string, EnumerateNestedDict | EnumerateValue];

        if (isEnumerateValue(value)) {
            directValues[directValuesIndex++] = value;

            processedEnum[key] = createValueFeature(value);

            continue;
        }

        if (isEnumerateValueWithMetadata(value)) {
            const [enumerateValue] = value;

            processedEnum[key] = createMetadataValueFeature(value);

            directValues[directValuesIndex++] = enumerateValue;
            
            continue;
        }


        if (isNestedDict(value)) {
            const nestedDict = processDictionary(value, { maxDepth, pathStack: [...pathStack, key], currentDepth: currentDepth + 1 });

            processedEnum[key] = nestedDict;

            continue;
        }


        throw new EnumeratorValueError(value, pathStack);
    }

    //  Trim the array to the actual length
    directValues.length = directValuesIndex;
    

    if(directValues.length){
        Object.assign(processedEnum, createObjectFeature(dict, directValues));
    }


    return processedEnum;

}