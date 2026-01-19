# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **BREAKING:** Changed `equals()` method to use `Object.is()` instead of strict equality (`===`)
  - **Impact:** Better handling of edge cases
  - **Benefit:** More consistent and predictable behavior
  
  **What this means:**
  ```typescript
  // NaN handling (IMPROVED!)
  Status.NAN.equals(NaN)  // Now: true ✅ | Before: false
  
  // +0 vs -0 differentiation (NEW FEATURE!)
  Numbers.POSITIVE.equals(0)   // true ✅
  Numbers.POSITIVE.equals(-0)  // false ✅ (correctly different)
  
  // Everything else: unchanged
  Status.ACTIVE.equals('active')  // true (same as before)
  ```

### Why This Change?

`Object.is()` provides better edge case handling than `===`:

| Comparison | `===` | `Object.is()` | Better? |
|------------|-------|---------------|---------|
| `NaN` vs `NaN` | `false` ❌ | `true` ✅ | More intuitive |
| `+0` vs `-0` | `true` ❌ | `false` ✅ | More precise |
| All other cases | ✅ Same | ✅ Same | Unchanged |

### Migration Guide

**Most users:** No changes needed! This is an improvement.

**If you relied on NaN inequality:**
```typescript
// Before (worked because of ===)
if (!Status.NAN.equals(NaN)) {
  console.log('NaN is not equal to itself');
}

// After (use explicit check)
if (Number.isNaN(Status.NAN.value)) {
  console.log('This is NaN');
}
```

**If you need +0 vs -0 differentiation:**
```typescript
// Now supported! (was broken before)
const Numbers = enumerator({
  POSITIVE_ZERO: 0,
  NEGATIVE_ZERO: -0,
});

Numbers.POSITIVE_ZERO.equals(0)   // true ✅
Numbers.POSITIVE_ZERO.equals(-0)  // false ✅
```

## [0.1.0] - 2025-01-15

### Added
- Initial release
- Core enumerator functionality
- Type-safe enum generation
- Nested structure support
- Metadata support
- Depth limiting (default: 10 levels)
- Type guards (`equals`, `contains`, `containsOneOf`)
- Comprehensive test suite (140+ tests)
- Performance benchmarks (150+ benchmarks)

### Features
- ✅ Type-safe enums with TypeScript
- ✅ Nested dictionary support
- ✅ Metadata tuples
- ✅ Type guard methods
- ✅ Immutable values (Object.freeze)
- ✅ Lazy evaluation (asType getter)
- ✅ Performance optimizations
  - Pre-allocated arrays
  - Single-pass object processing
  - Cached computations

### Performance
- Small enums (< 100): < 0.1ms
- Large enums (< 1000): < 1ms
- Type guards: ~0.00004ms (23M ops/sec)
- 3.26x faster than alternatives (array allocation)
- 60x faster cached access

---

## Understanding Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backward compatible)
- **PATCH** version for bug fixes (backward compatible)

### What triggers a major version?

- Breaking changes to public API
- Changes that require code updates
- Removal of deprecated features

The `Object.is()` change is considered a **MAJOR** version bump because:
- It changes observable behavior (NaN equality)
- Users depending on old behavior need to update
- It's better, but still breaking
