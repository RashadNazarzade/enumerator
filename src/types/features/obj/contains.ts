export type ObjectContains<Values> = {
    contains(check: unknown): check is Values;
};