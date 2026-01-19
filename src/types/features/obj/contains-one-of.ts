import type { Simplify } from '@/types/utilities';

export type ObjectContainsOneOf<Obj, Val> = {
    containsOneOf<CheckWithIn extends Val>(check: unknown, checkWithin: CheckWithIn[]): check is Simplify<CheckWithIn>;
    containsOneOf<CheckWithIn extends Val>(check: unknown, ...checkWithin: CheckWithIn[]): check is Simplify<CheckWithIn>;
    containsOneOf<CheckWithIn extends Val>(check: unknown, checkWithinCallback: { (obj: Obj): CheckWithIn | CheckWithIn[] }): check is Simplify<CheckWithIn>;
};