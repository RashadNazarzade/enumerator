import type { Simplify } from '@/types/utilities';

export type ObjectContains<Values> = {
    contains(check: unknown): check is Simplify<Values>;
};