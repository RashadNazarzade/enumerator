import type { WhenNever } from '@/types/utilities';

export type ValueBase<Val, Description> = {
   value: Val;
} & WhenNever<Description, {}, { meta: Description }>;