import type { EnumerateNestedDict, EnumerateValue } from '@/types/base';
import type { EnumerateGenerator } from '@/types/enumerator';

import { EnumeratorDepthError } from '@/constants/errors';
import { DEFAULT_MAX_DEPTH } from '@/constants/config';

import { getEnumValueType, isNestedDict } from '../guards'

import { createObjectFeature } from './obj-features';
import { createValueFeature } from './value-features';


type ProcessorOptions = {
    maxDepth?: number;
    currentDepth?: number;  
    pathStack?: string[];
}


export const processDictionary = <const Dict extends EnumerateNestedDict>(
    dict: Dict,
    options: 
) => {

}