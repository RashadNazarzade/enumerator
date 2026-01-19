export type ValueEquals<Val> = {
    equals(check: unknown): check is Val;
};