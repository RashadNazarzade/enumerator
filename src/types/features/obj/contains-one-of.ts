export type ObjectContainsOneOf<Obj, Val> = {
    containsOneOf<CheckWithIn extends Val>(check: unknown, checkWithin: CheckWithIn[]): check is CheckWithIn;
    containsOneOf<CheckWithIn extends Val>(check: unknown, ...checkWithin: CheckWithIn[]): check is CheckWithIn;
    containsOneOf<CheckWithIn extends Val>(check: unknown, checkWithinCallback: { (obj: Obj): CheckWithIn | CheckWithIn[] }): check is CheckWithIn;
};