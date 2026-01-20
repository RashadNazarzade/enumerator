type DepthTuple<T extends 1[], N extends number> = T["length"] extends N
  ? T
  : DepthTuple<[...T, 1], N>;

export type IncrementDepth<T extends 1[]> = [1, ...T];

export type Depth<N extends number = 0> = N extends N
  ? number extends N
    ? []
    : DepthTuple<[], N>
  : never;

export type IsDepthExceeded<
  CurrentDepth extends 1[],
  MaxDepth extends number,
> = CurrentDepth["length"] extends MaxDepth ? true : false;
